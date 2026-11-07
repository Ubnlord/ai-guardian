// @ts-nocheck
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { ARTICLES } from "./articles";
import { extractIdentifiers, resolveIdentifier } from "./identifiers";
import { band, isProtectedDomain, scoreInvestment, scoreMessage, scoreNumber, scoreUrl } from "./heuristics";
import { HOUR_CAP, asPlan, canUse, checksLimit, seatLimit } from "./plans";
import { isLocale, LOCALE_NAMES } from "../i18n";
import { isWatchCategory } from "./watch";

var MODEL = "grok-4.5";
var SYSTEM = `You are AI Guardian, a scam and impersonation analyst for ordinary people anywhere. Watch for patterns that travel: urgent money requests, one-time codes, cloned banks and shops, fake jobs, parcel and customs fees, romance-investment pitches, crypto and forex, family or official impersonation, and AI-generated photos or voices. When the text shows a place, use that place's cues — naira and BVN in Nigeria, UPI in India, Pix in Brazil, Zelle or the IRS in the United States, Bizum in Spain — and ignore them when it does not.

Return ONLY a JSON object with this shape:
{"verdict":"safe"|"suspicious"|"high_risk","score":0-100,"title":"short headline","summary":"2 or 3 plain sentences","reasons":["specific reason"],"actions":["concrete step"],"uncertainty":"what you cannot know"}

Rules:
- 100 is most dangerous. Money plus urgency plus an identity you cannot verify is high_risk.
- Never tell the user to pay, click, share an OTP, or send money.
- Do not claim a website is officially owned by a brand. You only see the address string, not the live page.
- For images, you cannot prove a deepfake. Say what you notice and how unsure you are. If the picture looks ordinary, say so.
- A normal personal message with no ask is safe and scores under 25.
- Do not invent facts that are not in the content.
- Write like a calm, sharp friend. No corporate filler. No emoji.
- reasons: 3 to 5 items. actions: 3 to 5 items.`;

function periodNow() {
	return (new Date()).toISOString().slice(0, 7);
}
function num(value) {
	const n = typeof value === "number" ? value : Number(value);
	return Number.isFinite(n) ? n : 0;
}
function bool(value) {
	return value === true || value === "t" || value === "true" || value === 1;
}
function asArray(value) {
	if (Array.isArray(value)) return value.filter((item) => typeof item === "string").slice(0, 6);
	if (typeof value === "string") try {
		return asArray(JSON.parse(value));
	} catch {
		return [];
	}
	return [];
}
function toMe(row) {
	const plan = asPlan(row.plan);
	return {
		displayName: row.display_name || "Guardian",
		role: row.role === "admin" ? "admin" : "member",
		plan,
		checksUsed: num(row.checks_used),
		checksLimit: checksLimit(plan),
		storeHistory: bool(row.store_history),
		shareHighRisk: bool(row.share_high_risk),
		avatar: typeof row.avatar === "string" ? row.avatar : "",
		country: typeof row.country === "string" ? row.country : "",
		locale: isLocale(row.locale) ? row.locale : "en"
	};
}
function stamp() {
	return (new Date()).toISOString();
}
async function ensureProfile(userId) {
	const sql = await getSql();
	const existing = await sql`
    select user_id, display_name, role, plan, checks_used, checks_period, store_history, share_high_risk, avatar, country, locale
    from profiles where user_id = ${userId}
  `;
	const period = periodNow();
	if (existing[0]) {
		if (existing[0].checks_period !== period) {
			await sql`
        update profiles set checks_used = 0, checks_period = ${period}, updated_at = now()
        where user_id = ${userId}
      `;
			existing[0].checks_used = 0;
			existing[0].checks_period = period;
		}
		return existing[0];
	}
	const display = ((await sql`select "name" as name from "user" where "id" = ${userId}`)[0]?.name || "Guardian").slice(0, 40);
	const role = num((await sql`select count(*)::int as n from profiles where role = 'admin'`)[0]?.n) === 0 ? "admin" : "member";
	await sql`
    insert into profiles (user_id, display_name, role, plan, checks_used, checks_period)
    values (${userId}, ${display}, ${role}, 'free', 0, ${period})
  `;
	return {
		user_id: userId,
		display_name: display,
		role,
		plan: "free",
		checks_used: 0,
		checks_period: period,
		store_history: true,
		share_high_risk: false,
		avatar: "",
		country: "",
		locale: "en"
	};
}
async function ensureArticles() {
	const sql = await getSql();
	for (const article of ARTICLES) await sql`
      insert into education_articles (slug, title, category, body, minutes)
      values (${article.slug}, ${article.title}, ${article.category}, ${article.body}, ${article.minutes})
      on conflict (slug) do nothing
    `;
}
function mapAnalysis(row) {
	const verdict = row.verdict === "high_risk" || row.verdict === "suspicious" || row.verdict === "safe" ? row.verdict : "suspicious";
	const kind = row.kind === "url" || row.kind === "image" || row.kind === "investment" || row.kind === "number" ? row.kind : "message";
	return {
		id: row.id,
		kind,
		verdict,
		score: num(row.score),
		title: row.title,
		summary: row.summary,
		reasons: asArray(row.reasons),
		actions: asArray(row.actions),
		uncertainty: row.uncertainty ?? "",
		source: row.source === "ai" ? "ai" : "rules",
		excerpt: row.excerpt ?? "",
		createdAt: String(row.created_at)
	};
}
async function hourUsed(userId) {
	return num((await (await getSql())`
    select count(*)::int as n from checks
    where user_id = ${userId} and created_at > now() - interval '1 hour'
  `)[0]?.n);
}
function parseAi(raw) {
	const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
	try {
		const obj = JSON.parse(cleaned);
		const score = Math.max(0, Math.min(100, Math.round(num(obj.score))));
		const verdict = band(score);
		const title = typeof obj.title === "string" ? obj.title.slice(0, 120) : "";
		const summary = typeof obj.summary === "string" ? obj.summary.slice(0, 600) : "";
		if (!title || !summary) return null;
		return {
			verdict,
			score,
			title,
			summary,
			reasons: asArray(obj.reasons).map((r) => r.slice(0, 220)).slice(0, 5),
			actions: asArray(obj.actions).map((r) => r.slice(0, 220)).slice(0, 5),
			uncertainty: typeof obj.uncertainty === "string" ? obj.uncertainty.slice(0, 280) : ""
		};
	} catch {
		return null;
	}
}
async function askModel(prompt, image, profile) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return null;
	const locale = isLocale(profile?.locale) ? profile.locale : "en";
	const place = profile?.country ? ` They say they are in ${profile.country}.` : "";
	const full = `${prompt}\nWrite all JSON string values in ${LOCALE_NAMES[locale]}.${place} Do not assume a country unless the content shows it.`;
	const images = (Array.isArray(image) ? image : image ? [image] : []).filter((item) => item.startsWith("data:image/"));
	const content = images.length ? [{
		type: "text",
		text: full
	}, ...images.map((url) => ({
		type: "image_url",
		image_url: { url }
	}))] : full;
	try {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			signal: AbortSignal.timeout(images.length > 1 ? 45000 : 28000),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				model: MODEL,
				temperature: .2,
				max_tokens: 700,
				response_format: { type: "json_object" },
				messages: [{
					role: "system",
					content: SYSTEM
				}, {
					role: "user",
					content
				}]
			})
		});
		if (!res.ok) return null;
		return parseAi((await res.json()).choices?.[0]?.message?.content ?? "");
	} catch {
		return null;
	}
}
function merge(ai, rules, rulesNote) {
	if (!ai) {
		const score = rules.score;
		return {
			verdict: band(score),
			score,
			title: score >= 70 ? "This matches a known scam pattern" : score >= 35 ? "Something here deserves a pause" : "No strong scam pattern",
			summary: score >= 35 ? "Pattern rules flagged this before a model review could finish. Treat the warning as real until you verify it yourself." : "Pattern rules did not see a classic scam. That is not a promise the message is harmless.",
			reasons: rules.reasons,
			actions: rules.actions,
			uncertainty: rulesNote,
			source: "rules"
		};
	}
	let score = Math.round(ai.score * .7 + rules.score * .3);
	if (rules.score >= 80) score = Math.max(score, 74);
	score = Math.max(0, Math.min(100, score));
	const reasons = [...ai.reasons];
	for (const reason of rules.reasons) {
		if (reasons.length >= 5) break;
		if (!reasons.some((item) => item.toLowerCase() === reason.toLowerCase())) reasons.push(reason);
	}
	const actions = ai.actions.length > 0 ? ai.actions : rules.actions;
	return {
		verdict: band(score),
		score,
		title: ai.title,
		summary: ai.summary,
		reasons: reasons.slice(0, 5),
		actions: actions.slice(0, 5),
		uncertainty: ai.uncertainty || "This is a judgment from the text, not proof of who sent it.",
		source: "ai"
	};
}
function dedupeIds(items) {
	const seen = new Set();
	const out = [];
	for (const item of items) {
		if (item.kind === "domain" && isProtectedDomain(item.normalized)) continue;
		const key = `${item.kind}:${item.normalized}`;
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(item);
	}
	return out.slice(0, 8);
}
async function watchHits(text, extra = []) {
	const ids = dedupeIds([...extra, ...extractIdentifiers(text)]);
	if (ids.length === 0) return [];
	const sql = await getSql();
	const hits = [];
	for (const id of ids) {
		const reports = num((await sql`
      select count(*)::int as n from scam_reports
      where kind = ${id.kind} and normalized = ${id.normalized}
    `)[0]?.n);
		if (reports > 0) hits.push({
			kind: id.kind,
			display: id.display,
			reports
		});
	}
	return hits;
}
function foldWatch(merged, hits) {
	const real = hits.filter((hit) => hit.reports > 0);
	if (real.length === 0) return merged;
	let bump = 0;
	const reasons = [...merged.reasons];
	for (const hit of real) {
		bump = Math.max(bump, Math.min(28, 14 + (hit.reports - 1) * 5));
		const line = hit.reports === 1 ? `${hit.display} was reported once on Guardian Watch.` : `${hit.display} was reported ${hit.reports} times on Guardian Watch.`;
		reasons.unshift(line);
	}
	let score = Math.min(100, merged.score + Math.min(36, bump));
	if (real.some((hit) => hit.reports >= 3)) score = Math.max(score, 74);
	const actions = [...merged.actions];
	const watchAction = "Don't pay this number or account. Other people already flagged it.";
	if (!actions.includes(watchAction)) actions.unshift(watchAction);
	let title = merged.title;
	let summary = merged.summary;
	if (merged.score < 35 && score >= 35) {
		title = score >= 70 ? "Reported on Guardian Watch" : "This is on Guardian Watch";
		summary = `${real[0]?.display ?? "This"} is on Guardian Watch. ${merged.summary}`.slice(0, 600);
	}
	const uncertainty = `${merged.uncertainty} Watch reports are from other users, not a police record.`.trim().slice(0, 400);
	return {
		...merged,
		score,
		verdict: band(score),
		title,
		summary,
		reasons: reasons.slice(0, 5),
		actions: actions.slice(0, 5),
		uncertainty
	};
}
async function withWatch(text, merged, extra = []) {
	return foldWatch(merged, await watchHits(text, extra));
}
async function watchedFor(userId) {
	return (await (await getSql())`select domain from watched_domains where user_id = ${userId}`).map((row) => row.domain);
}
async function finishCheck(opts) {
	const sql = await getSql();
	const id = randomUUID();
	const createdAt = stamp();
	const excerpt = bool(opts.profile.store_history) ? opts.excerpt.slice(0, 180) : "";
	const me = toMe(opts.profile);
	await sql`
    insert into checks (
      id, user_id, kind, verdict, score, title, summary, reasons, actions, uncertainty, source, excerpt
    ) values (
      ${id},
      ${opts.userId},
      ${opts.kind},
      ${opts.merged.verdict},
      ${opts.merged.score},
      ${opts.merged.title},
      ${opts.merged.summary},
      ${JSON.stringify(opts.merged.reasons)},
      ${JSON.stringify(opts.merged.actions)},
      ${opts.merged.uncertainty},
      ${opts.merged.source},
      ${excerpt}
    )
  `;
	const used = num(opts.profile.checks_used) + 1;
	await sql`
    update profiles set checks_used = ${used}, updated_at = now() where user_id = ${opts.userId}
  `;
	if (opts.merged.verdict === "high_risk" && bool(opts.profile.share_high_risk)) {
		const familyId = (await sql`
      select family_id from family_members where user_id = ${opts.userId}
    `)[0]?.family_id;
		if (familyId) await sql`
        insert into family_alerts (id, family_id, user_id, check_id, headline, detail)
        values (
          ${randomUUID()},
          ${familyId},
          ${opts.userId},
          ${id},
          ${opts.merged.title.slice(0, 140)},
          ${opts.merged.summary.slice(0, 280)}
        )
      `;
	}
	return {
		ok: true,
		used,
		limit: me.checksLimit,
		analysis: {
			id,
			kind: opts.kind,
			excerpt,
			createdAt,
			...opts.merged
		}
	};
}
async function gateCheck(userId, feature) {
	const profile = await ensureProfile(userId);
	const plan = asPlan(profile.plan);
	if (!canUse(plan, feature)) return {
		ok: false,
		upgrade: true,
		error: "That check is on Guardian Plus. Your free plan covers messages, links, and numbers."
	};
	if (num(profile.checks_used) >= checksLimit(plan)) return {
		ok: false,
		upgrade: true,
		error: `You've used ${checksLimit(plan)} checks this month. Upgrade for a higher allowance, or wait until next month.`
	};
	if (await hourUsed(userId) >= 20) return {
		ok: false,
		error: "Too many checks in the last hour. Wait a bit so the review stays available."
	};
	return {
		ok: true,
		profile
	};
}
function textField(value, max) {
	return typeof value === "string" ? value.trim().slice(0, max) : "";
}
export const getMe = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
	return toMe(await ensureProfile(context.userId));
});
export const getDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
	const profile = await ensureProfile(context.userId);
	const sql = await getSql();
	const counts = await sql`
      select verdict, count(*)::int as n from checks where user_id = ${context.userId} group by verdict
    `;
	const rows = await sql`
      select id, kind, verdict, score, title, summary, reasons, actions, uncertainty, source, excerpt,
        to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at
      from checks where user_id = ${context.userId}
      order by created_at desc
      limit 8
    `;
	const alerts = await listMyAlerts(context.userId);
	const tally = {
		total: 0,
		safe: 0,
		suspicious: 0,
		high_risk: 0
	};
	for (const row of counts) {
		const n = num(row.n);
		tally.total += n;
		if (row.verdict === "safe" || row.verdict === "suspicious" || row.verdict === "high_risk") tally[row.verdict] += n;
	}
	const weekRows = await sql`
      select count(*)::int as n from scam_reports where created_at > now() - interval '7 days'
    `;
	const hotRows = await sql`
      select kind, max(display) as display, count(*)::int as reports
      from scam_reports
      where created_at > now() - interval '14 days'
      group by kind, normalized
      order by count(*) desc, max(created_at) desc
      limit 4
    `;
	return {
		me: toMe(profile),
		counts: tally,
		recent: rows.map(mapAnalysis),
		alerts,
		watch: {
			week: num(weekRows[0]?.n),
			hot: hotRows.map((row) => ({
				kind: row.kind,
				display: row.display,
				reports: num(row.reports)
			}))
		}
	};
});
async function listMyAlerts(userId) {
	return (await (await getSql())`
    select a.id, a.headline, a.detail,
      to_char(a.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
      coalesce(nullif(m.label, ''), p.display_name, 'Someone') as label,
      coalesce(p.display_name, '') as display_name
    from family_alerts a
    join family_members mine on mine.family_id = a.family_id and mine.user_id = ${userId}
    left join family_members m on m.family_id = a.family_id and m.user_id = a.user_id
    left join profiles p on p.user_id = a.user_id
    order by a.created_at desc
    limit 12
  `).map((row) => ({
		id: row.id,
		headline: row.headline,
		detail: row.detail,
		createdAt: String(row.created_at),
		label: row.label || row.display_name || "Someone"
	}));
}
export const analyzeMessage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const text = textField(data.text, 8000);
	if (text.length < 8) throw new Error("Paste a bit more of the message.");
	return {
		text,
		mode: data.mode === "invoice" ? "invoice" : "message",
		channel: textField(data.channel, 40)
	};
}).handler(async ({ context, data }) => {
	const feature = data.mode === "invoice" ? "invoice" : "message";
	const gate = await gateCheck(context.userId, feature);
	if (!gate.ok) return gate;
	const rules = scoreMessage(data.text, data.mode);
	const ai = await askModel(`Review this ${data.mode === "invoice" ? "supplier invoice or payment request" : "message"} for scam, phishing, or impersonation risk.
Channel: ${data.channel || "unspecified"}
Pattern pre-check score ${rules.score}/100. Signals: ${rules.signals.join(", ") || "none"}.
Content:
${data.text}`, void 0, gate.profile);
	const merged = await withWatch(data.text, merge(ai, rules, "AI review was unavailable, so this score uses pattern rules only. It is a warning, not a final answer."));
	return finishCheck({
		userId: context.userId,
		profile: gate.profile,
		kind: "message",
		excerpt: data.text,
		merged
	});
});
export const analyzeUrl = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const url = textField(data.url, 2e3);
	if (url.length < 4) throw new Error("Paste the full link.");
	return {
		url,
		note: textField(data.note, 500)
	};
}).handler(async ({ context, data }) => {
	const gate = await gateCheck(context.userId, "url");
	if (!gate.ok) return gate;
	const watched = asPlan(gate.profile.plan) === "business" ? await watchedFor(context.userId) : [];
	const rules = scoreUrl(data.url, watched);
	const ai = await askModel(`Review this web address for impersonation, phishing, or scam signals. Do not claim you opened it. You did not.
Address: ${data.url}
What they asked the user to do: ${data.note || "not specified"}
Watched brand domains: ${watched.join(", ") || "none"}
Pattern pre-check score ${rules.score}/100. Reasons: ${rules.reasons.join(" | ")}`, void 0, gate.profile);
	const merged = await withWatch(`${data.url}\n${data.note}`, merge(ai, rules, "AI review was unavailable. This score only reads the address text. It did not open the page."));
	return finishCheck({
		userId: context.userId,
		profile: gate.profile,
		kind: "url",
		excerpt: data.url,
		merged
	});
});
export const analyzeInvestment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const platform = textField(data.platform, 120);
	const promise = textField(data.promise, 4e3);
	const contact = textField(data.contact, 200);
	const url = textField(data.url, 500);
	if (promise.length < 8 && platform.length < 2) throw new Error("Describe the offer, or name the platform.");
	return {
		platform,
		promise,
		contact,
		url
	};
}).handler(async ({ context, data }) => {
	const gate = await gateCheck(context.userId, "investment");
	if (!gate.ok) return gate;
	const blob = `Platform: ${data.platform || "unnamed"}\nHow they made contact: ${data.contact || "unspecified"}\nLink: ${data.url || "none"}\nOffer:\n${data.promise}`;
	const rules = scoreInvestment(blob);
	const merged = await withWatch(blob, merge(await askModel(`Review this investment, crypto, forex, or "double your money" offer for scam risk.\n${blob}\nPattern pre-check score ${rules.score}/100. Reasons: ${rules.reasons.join(" | ")}`, void 0, gate.profile), rules, "AI review was unavailable, so this score uses investment-scam patterns only."));
	return finishCheck({
		userId: context.userId,
		profile: gate.profile,
		kind: "investment",
		excerpt: data.platform || data.promise,
		merged
	});
});
var SCAN_PROMPTS = {
	photo: `Look at this image for signs it may be AI-generated, manipulated, or used as scam bait (fake payment screenshot, fake celebrity endorsement, fake profile, doctored chat).
Be explicit about uncertainty. You cannot prove a deepfake. If it looks like an ordinary photo, say so and score it low.`,
	id: `This picture is meant to be an identity document: a national ID, NIN slip, driver's licence, voter card, or similar.
Read only what is visibly printed. Say the document type if you can tell, and whether a face photo, name, number, and expiry look readable. Note edits, crooked crops, mismatched fonts, or a photo that looks pasted on.
Do not say the person is verified. Do not say any number is real. You have no government database.
Score the risk of trusting this picture as proof of identity. A clear photo of an ordinary card, with no scam pressure in the note, scores under 35 and says it looks like a photograph of a document, not that it is genuine.`,
	passport: `This picture is meant to be a passport data page.
Read only what is visible: whether it looks like a passport page, whether the portrait, name, number, expiry, and the machine-readable lines are present and consistent with each other. Note blur, glare, cropped-off edges, or signs the portrait or text was edited.
Do not say the passport is genuine. Do not say the holder is verified. You have no immigration database.
Score the risk of trusting this picture as proof of identity. A clear, ordinary data-page photo with no scam pressure in the note scores under 35.`,
	document: `This picture is a document: an invoice, receipt, offer letter, bank alert, or similar page.
Read the visible amount, names, dates, and account or payment instructions. Look for edited figures, a letterhead that does not match the payment details, urgency, and any ask to pay a fee or send a code.
Score the risk of paying or trusting the page. An ordinary receipt with no payment pressure scores low. Say what you could and could not read.`,
	video: `These frames are from one short video, in time order. It may be a person on a call, a screen recording, someone holding a document, or a clip sent to pressure a payment.
Judge the clip as one thing. Note what stays consistent and what changes between frames: face, background, document, on-screen text, or a payment ask.
You cannot prove a deepfake from a few frames. If it looks like an ordinary clip with no ask, say so and score it low. If it is being used as proof of identity or of a payment, score the risk of trusting it, not whether a government record matches.`
};
export const analyzeImage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const frames = (Array.isArray(data.frames) ? data.frames : data.dataUrl ? [data.dataUrl] : []).filter((item) => typeof item === "string" && item.startsWith("data:image/")).slice(0, 3);
	if (frames.length === 0) throw new Error("Choose an image or a short video.");
	if (frames.some((frame) => frame.length > 12e5)) throw new Error("A frame is too large. Try a shorter clip.");
	if (frames.reduce((total, frame) => total + frame.length, 0) > 28e5) throw new Error("That clip is too large to review.");
	const mode = data.mode === "id" || data.mode === "passport" || data.mode === "document" || data.mode === "video" || data.mode === "photo" ? data.mode : "photo";
	return {
		frames,
		note: textField(data.note, 500),
		mode
	};
}).handler(async ({ context, data }) => {
	const gate = await gateCheck(context.userId, "image");
	if (!gate.ok) return gate;
	if (!process.env.XAI_API_KEY) return {
		ok: false,
		error: "Image review needs AI, and it is not available in this environment."
	};
	const clip = data.frames.length > 1 ? `You are looking at ${data.frames.length} frames from one short video, in time order. Treat them as one clip.` : "You are looking at one still image.";
	const ai = await askModel(`${SCAN_PROMPTS[data.mode]}
${clip}
Context from the user: ${data.note || "none"}
Return the JSON object only.`, data.frames, gate.profile);
	if (!ai) return {
		ok: false,
		error: "The image review didn't come back. Nothing was saved. Don't treat the picture as cleared."
	};
	const merged = merge(ai, {
		score: ai.score,
		reasons: ai.reasons,
		actions: ai.actions,
		signals: []
	}, ai.uncertainty);
	const limit = data.mode === "id" || data.mode === "passport" ? "This is not a check against NIMC, immigration, or any government register." : data.frames.length > 1 ? "Only a few frames were reviewed, not every moment of the clip." : "Image clues are not proof. A real photo can be stolen, and a generated one can look ordinary.";
	merged.uncertainty = `${ai.uncertainty || limit} ${limit}`.trim().slice(0, 400);
	merged.source = "ai";
	const label = data.mode === "id" ? "ID" : data.mode === "passport" ? "Passport" : data.mode === "document" ? "Document" : data.mode === "video" ? "Video" : "Photo";
	return finishCheck({
		userId: context.userId,
		profile: gate.profile,
		kind: "image",
		excerpt: `${label}${data.note ? `: ${data.note}` : ""}`.slice(0, 180),
		merged
	});
});
export const listHistory = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
	await ensureProfile(context.userId);
	return (await (await getSql())`
      select id, kind, verdict, score, title, summary, reasons, actions, uncertainty, source, excerpt,
        to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at
      from checks where user_id = ${context.userId}
      order by created_at desc
      limit 100
    `).map(mapAnalysis);
});
export const deleteCheck = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const id = textField(input?.id, 80);
	if (!id) throw new Error("Missing check.");
	return { id };
}).handler(async ({ context, data }) => {
	await (await getSql())`delete from checks where id = ${data.id} and user_id = ${context.userId}`;
	return { ok: true };
});
export const clearHistory = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(async ({ context }) => {
	await (await getSql())`delete from checks where user_id = ${context.userId}`;
	return { ok: true };
});
export const updateSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	return {
		displayName: textField(data.displayName, 40),
		storeHistory: typeof data.storeHistory === "boolean" ? data.storeHistory : void 0,
		shareHighRisk: typeof data.shareHighRisk === "boolean" ? data.shareHighRisk : void 0,
		country: typeof data.country === "string" ? textField(data.country, 40) : void 0,
		locale: isLocale(data.locale) ? data.locale : void 0,
		avatar: data.avatar === "" ? "" : typeof data.avatar === "string" ? data.avatar.trim() : void 0
	};
}).handler(async ({ context, data }) => {
	if (data.avatar && (!data.avatar.startsWith("data:image/jpeg") || data.avatar.length > 180000)) {
		throw new Error("Use a smaller photo.");
	}
	const profile = await ensureProfile(context.userId);
	const sql = await getSql();
	const name = data.displayName || profile.display_name;
	const store = data.storeHistory ?? bool(profile.store_history);
	const share = data.shareHighRisk ?? bool(profile.share_high_risk);
	const country = data.country ?? profile.country ?? "";
	const locale = data.locale ?? (isLocale(profile.locale) ? profile.locale : "en");
	const avatar = data.avatar ?? profile.avatar ?? "";
	await sql`
      update profiles
      set display_name = ${name}, store_history = ${store}, share_high_risk = ${share},
        country = ${country}, locale = ${locale}, avatar = ${avatar}, updated_at = now()
      where user_id = ${context.userId}
    `;
	profile.display_name = name;
	profile.store_history = store;
	profile.share_high_risk = share;
	profile.country = country;
	profile.locale = locale;
	profile.avatar = avatar;
	return toMe(profile);
});
export const setPlan = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	return { plan: asPlan(textField(input?.plan, 20)) };
}).handler(async ({ context, data }) => {
	const profile = await ensureProfile(context.userId);
	await (await getSql())`update profiles set plan = ${data.plan}, updated_at = now() where user_id = ${context.userId}`;
	profile.plan = data.plan;
	return toMe(profile);
});
function hashPhrase(familyId, phrase) {
	const normalized = phrase.trim().toLowerCase().replace(/\s+/g, " ");
	return createHash("sha256").update(`${familyId}\n${normalized}`).digest("hex");
}
function inviteCode() {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	const bytes = randomBytes(8);
	let out = "";
	for (let i = 0; i < 8; i++) out += alphabet[bytes[i] % 32];
	return out;
}
export const getFamily = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
	await ensureProfile(context.userId);
	const sql = await getSql();
	const mine = await sql`
      select m.family_id, m.role, f.name, f.owner_id, f.invite_code, f.verification_phrase_hash
      from family_members m
      join families f on f.id = m.family_id
      where m.user_id = ${context.userId}
    `;
	if (!mine[0]) return {
		family: null,
		members: [],
		alerts: []
	};
	const row = mine[0];
	const members = await sql`
      select m.user_id, m.label, m.role, coalesce(p.display_name, '') as display_name
      from family_members m
      left join profiles p on p.user_id = m.user_id
      where m.family_id = ${row.family_id}
      order by m.joined_at asc
    `;
	const owner = await sql`select plan from profiles where user_id = ${row.owner_id}`;
	const isOwner = row.role === "owner" || row.owner_id === context.userId;
	return {
		family: {
			id: row.family_id,
			name: row.name,
			inviteCode: isOwner ? row.invite_code : null,
			isOwner,
			hasPhrase: Boolean(row.verification_phrase_hash),
			seats: members.length,
			seatLimit: seatLimit(asPlan(owner[0]?.plan))
		},
		members: members.map((member) => ({
			userId: member.user_id,
			label: member.label || member.display_name || "Member",
			role: member.role,
			isYou: member.user_id === context.userId
		})),
		alerts: await listMyAlerts(context.userId)
	};
});
export const createFamily = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const name = textField(input?.name, 40);
	if (name.length < 2) throw new Error("Name the circle.");
	return { name };
}).handler(async ({ context, data }) => {
	const profile = await ensureProfile(context.userId);
	if (!canUse(asPlan(profile.plan), "circle")) return {
		ok: false,
		error: "Creating a circle starts on Guardian Plus.",
		upgrade: true
	};
	const sql = await getSql();
	if ((await sql`select family_id from family_members where user_id = ${context.userId}`)[0]) return {
		ok: false,
		error: "You are already in a circle."
	};
	const id = randomUUID();
	const code = inviteCode();
	await sql`
      insert into families (id, name, owner_id, invite_code) values (${id}, ${data.name}, ${context.userId}, ${code})
    `;
	await sql`
      insert into family_members (family_id, user_id, role, label)
      values (${id}, ${context.userId}, 'owner', ${profile.display_name})
    `;
	return { ok: true };
});
export const joinFamily = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const code = textField(input?.code, 12).toUpperCase().replace(/[^A-Z0-9]/g, "");
	if (code.length < 6) throw new Error("Enter the invite code.");
	return { code };
}).handler(async ({ context, data }) => {
	const profile = await ensureProfile(context.userId);
	const sql = await getSql();
	if ((await sql`select family_id from family_members where user_id = ${context.userId}`)[0]) return {
		ok: false,
		error: "Leave your current circle first."
	};
	const family = await sql`
      select id, owner_id from families where invite_code = ${data.code}
    `;
	if (!family[0]) return {
		ok: false,
		error: "That code doesn't match a circle."
	};
	const owner = await sql`select plan from profiles where user_id = ${family[0].owner_id}`;
	if (num((await sql`
      select count(*)::int as n from family_members where family_id = ${family[0].id}
    `)[0]?.n) >= seatLimit(asPlan(owner[0]?.plan))) return {
		ok: false,
		error: "That circle is full."
	};
	await sql`
      insert into family_members (family_id, user_id, role, label)
      values (${family[0].id}, ${context.userId}, 'member', ${profile.display_name})
    `;
	return { ok: true };
});
export const leaveFamily = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(async ({ context }) => {
	const sql = await getSql();
	const mine = await sql`
      select role, family_id from family_members where user_id = ${context.userId}
    `;
	if (!mine[0]) return { ok: true };
	if (mine[0].role === "owner") return {
		ok: false,
		error: "Owners delete the circle instead of leaving it."
	};
	await sql`delete from family_members where user_id = ${context.userId}`;
	return { ok: true };
});
export const deleteFamily = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(async ({ context }) => {
	const sql = await getSql();
	const mine = await sql`
      select family_id, role from family_members where user_id = ${context.userId}
    `;
	if (!mine[0] || mine[0].role !== "owner") return {
		ok: false,
		error: "Only the owner can delete the circle."
	};
	await sql`delete from families where id = ${mine[0].family_id}`;
	return { ok: true };
});
export const setMemberLabel = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const label = textField(input?.label, 32);
	if (!label) throw new Error("Add a short label, like Mum or Dad.");
	return { label };
}).handler(async ({ context, data }) => {
	await (await getSql())`update family_members set label = ${data.label} where user_id = ${context.userId}`;
	return { ok: true };
});
export const setPhrase = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const phrase = textField(input?.phrase, 80);
	if (phrase.length < 8) throw new Error("Use at least 8 characters. A nonsense sentence is best.");
	return { phrase };
}).handler(async ({ context, data }) => {
	const sql = await getSql();
	const mine = await sql`
      select family_id, role from family_members where user_id = ${context.userId}
    `;
	if (!mine[0] || mine[0].role !== "owner") return {
		ok: false,
		error: "Only the circle owner can set the phrase."
	};
	await sql`update families set verification_phrase_hash = ${hashPhrase(mine[0].family_id, data.phrase)} where id = ${mine[0].family_id}`;
	return { ok: true };
});
export const verifyPhrase = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const phrase = textField(input?.phrase, 80);
	if (!phrase) throw new Error("Type the phrase they gave you.");
	return { phrase };
}).handler(async ({ context, data }) => {
	const mine = await (await getSql())`
      select m.family_id, f.verification_phrase_hash
      from family_members m
      join families f on f.id = m.family_id
      where m.user_id = ${context.userId}
    `;
	if (!mine[0]) return {
		ok: false,
		error: "Join a family circle first."
	};
	const expected = mine[0].verification_phrase_hash;
	if (!expected) return {
		ok: false,
		error: "This circle has not set a phrase yet."
	};
	const actual = hashPhrase(mine[0].family_id, data.phrase);
	return {
		ok: true,
		match: expected.length === actual.length && timingSafeEqual(Buffer.from(expected), Buffer.from(actual))
	};
});
export const listDomains = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
	await ensureProfile(context.userId);
	return watchedFor(context.userId);
});
function normalizeDomain(input) {
	let s = input.trim().toLowerCase().replace(/^https?:\/\//, "");
	s = (s.split("/")[0] ?? "").split("?")[0]?.replace(/\.$/, "") ?? "";
	if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(s)) return null;
	return s.replace(/^www\./, "");
}
export const addDomain = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ domain: textField(input?.domain, 120) })).handler(async ({ context, data }) => {
	const profile = await ensureProfile(context.userId);
	if (!canUse(asPlan(profile.plan), "domains")) return {
		ok: false,
		error: "Domain watch is part of the Business plan.",
		upgrade: true
	};
	const domain = normalizeDomain(data.domain);
	if (!domain) return {
		ok: false,
		error: "Enter a domain like yourbank.com."
	};
	const sql = await getSql();
	if (num((await sql`select count(*)::int as n from watched_domains where user_id = ${context.userId}`)[0]?.n) >= 20) return {
		ok: false,
		error: "You can watch up to 20 domains."
	};
	await sql`
      insert into watched_domains (id, user_id, domain) values (${randomUUID()}, ${context.userId}, ${domain})
      on conflict (user_id, domain) do nothing
    `;
	return { ok: true };
});
export const removeDomain = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ domain: textField(input?.domain, 120) })).handler(async ({ context, data }) => {
	await (await getSql())`delete from watched_domains where user_id = ${context.userId} and domain = ${data.domain}`;
	return { ok: true };
});
export const listArticles = createServerFn({ method: "GET" }).handler(async () => {
	await ensureArticles();
	return (await (await getSql())`
    select slug, title, category, body, minutes, published
    from education_articles
    where published = true
    order by title asc
  `).map((row) => ({
		slug: row.slug,
		title: row.title,
		category: row.category,
		body: row.body,
		minutes: num(row.minutes)
	}));
});
async function requireAdmin(userId) {
	if ((await ensureProfile(userId)).role !== "admin") throw new Error("Admin only.");
}
export const getAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
	await requireAdmin(context.userId);
	await ensureArticles();
	const sql = await getSql();
	const users = await sql`select count(*)::int as n from profiles`;
	const checks = await sql`select count(*)::int as n from checks`;
	const high = await sql`select count(*)::int as n from checks where verdict = 'high_risk'`;
	const plans = await sql`select plan, count(*)::int as n from profiles group by plan`;
	const recent = await sql`
      select c.id, c.kind, c.verdict, c.score, c.title,
        to_char(c.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
        coalesce(p.display_name, 'Member') as display_name
      from checks c
      left join profiles p on p.user_id = c.user_id
      order by c.created_at desc
      limit 30
    `;
	const people = await sql`
      select p.user_id, p.display_name, coalesce(u."email", '') as email, p.role, p.plan, p.checks_used
      from profiles p
      left join "user" u on u."id" = p.user_id
      order by p.created_at desc
      limit 100
    `;
	const articles = await sql`
      select slug, title, category, body, minutes from education_articles order by title asc
    `;
	return {
		users: num(users[0]?.n),
		checks: num(checks[0]?.n),
		highRisk: num(high[0]?.n),
		plans: plans.map((row) => ({
			plan: row.plan,
			n: num(row.n)
		})),
		recent: recent.map((row) => ({
			id: row.id,
			kind: row.kind,
			verdict: row.verdict,
			score: num(row.score),
			title: row.title,
			createdAt: String(row.created_at),
			displayName: row.display_name
		})),
		people: people.map((row) => ({
			userId: row.user_id,
			displayName: row.display_name,
			email: row.email,
			role: row.role,
			plan: row.plan,
			checksUsed: num(row.checks_used)
		})),
		articles: articles.map((row) => ({
			...row,
			minutes: num(row.minutes)
		}))
	};
});
export const adminSetRole = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const userId = textField(data.userId, 80);
	const role = data.role === "admin" ? "admin" : "member";
	if (!userId) throw new Error("Missing person.");
	return {
		userId,
		role
	};
}).handler(async ({ context, data }) => {
	await requireAdmin(context.userId);
	const sql = await getSql();
	if (data.role !== "admin") {
		const admins = await sql`select count(*)::int as n from profiles where role = 'admin'`;
		if ((await sql`select role from profiles where user_id = ${data.userId}`)[0]?.role === "admin" && num(admins[0]?.n) <= 1) return {
			ok: false,
			error: "Keep at least one admin."
		};
	}
	await sql`update profiles set role = ${data.role}, updated_at = now() where user_id = ${data.userId}`;
	return { ok: true };
});
export const adminSetPlan = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	return {
		userId: textField(data.userId, 80),
		plan: asPlan(textField(data.plan, 20))
	};
}).handler(async ({ context, data }) => {
	await requireAdmin(context.userId);
	if (!data.userId) throw new Error("Missing person.");
	await (await getSql())`update profiles set plan = ${data.plan}, updated_at = now() where user_id = ${data.userId}`;
	return { ok: true };
});
export const adminSaveArticle = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const slug = textField(data.slug, 80);
	const title = textField(data.title, 120);
	const body = textField(data.body, 8000);
	if (!slug || !title || body.length < 20) throw new Error("Title and lesson text are required.");
	return {
		slug,
		title,
		body,
		published: data.published !== false
	};
}).handler(async ({ context, data }) => {
	await requireAdmin(context.userId);
	await (await getSql())`
      update education_articles
      set title = ${data.title}, body = ${data.body}, published = ${data.published}, updated_at = now()
      where slug = ${data.slug}
    `;
	return { ok: true };
});
var WATCH_KINDS = new Set([
	"phone",
	"account",
	"domain"
]);
function asWatchKind(value) {
	return WATCH_KINDS.has(value) ? value : null;
}
export const analyzeNumber = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const kind = asWatchKind(textField(data.kind, 20));
	const value = textField(data.value, 80);
	const context = textField(data.context, 4e3);
	if (kind !== "phone" && kind !== "account") throw new Error("Choose a phone or an account number.");
	const id = resolveIdentifier(kind, value);
	if (!id) throw new Error(kind === "phone" ? "Use a phone number. Add a country code if it is not Nigerian, like +44 7700 900000." : "Use the account number digits. This check does not see the bank name.");
	return {
		kind,
		id,
		context
	};
}).handler(async ({ context, data }) => {
	const gate = await gateCheck(context.userId, "number");
	if (!gate.ok) return gate;
	const rules = scoreNumber(data.kind, data.id.display, data.context);
	const ai = await askModel(`Review this ${data.kind === "phone" ? "phone number" : "bank or fintech account number"} for scam risk. You cannot prove who owns it.
${data.kind === "phone" ? "Phone" : "Account"}: ${data.id.display}
What the sender said:
${data.context || "The user did not paste a message."}
Pattern pre-check score ${rules.score}/100. Reasons: ${rules.reasons.join(" | ")}`, void 0, gate.profile);
	const merged = await withWatch(`${data.id.display}\n${data.context}`, merge(ai, rules, "AI review was unavailable, so this score uses pattern rules only. A number alone is not proof of who owns it."), [data.id]);
	return finishCheck({
		userId: context.userId,
		profile: gate.profile,
		kind: "number",
		excerpt: data.context || data.id.display,
		merged
	});
});
export const listWatch = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(async ({ context }) => {
	await ensureProfile(context.userId);
	return (await (await getSql())`
      select kind, max(display) as display, count(*)::int as reports,
        to_char(max(created_at) at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as last_at
      from scam_reports
      group by kind, normalized
      order by max(created_at) desc
      limit 20
    `).map((row) => ({
		kind: row.kind === "account" || row.kind === "domain" ? row.kind : "phone",
		display: row.display,
		reports: num(row.reports),
		lastAt: String(row.last_at)
	}));
});
export const lookupWatch = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const kind = asWatchKind(textField(data.kind, 20));
	const value = textField(data.value, 160);
	if (!kind) throw new Error("Choose phone, account, or domain.");
	const id = resolveIdentifier(kind, value);
	if (!id) throw new Error(kind === "phone" ? "That doesn't look like a phone number." : kind === "account" ? "Use the account number digits." : "Paste a domain, like brand-secure.xyz.");
	return { id };
}).handler(async ({ context, data }) => {
	await ensureProfile(context.userId);
	if (data.id.kind === "domain" && isProtectedDomain(data.id.normalized)) return {
		ok: false,
		error: "That is a widely used public domain. Watch is for lookalikes and unknowns, not the real brand."
	};
	const sql = await getSql();
	const rows = await sql`
      select count(*)::int as n from scam_reports
      where kind = ${data.id.kind} and normalized = ${data.id.normalized}
    `;
	const mine = await sql`
      select count(*)::int as n from scam_reports
      where user_id = ${context.userId} and kind = ${data.id.kind} and normalized = ${data.id.normalized}
    `;
	return {
		ok: true,
		kind: data.id.kind,
		display: data.id.display,
		reports: num(rows[0]?.n),
		alreadyReported: num(mine[0]?.n) > 0
	};
});
export const reportScam = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const kind = asWatchKind(textField(data.kind, 20));
	const value = textField(data.value, 160);
	const category = textField(data.category, 40);
	if (!kind) throw new Error("Choose phone, account, or domain.");
	if (!isWatchCategory(category)) throw new Error("Pick what they tried to do.");
	const id = resolveIdentifier(kind, value);
	if (!id) throw new Error("That number or domain is not in a form Guardian can store.");
	return {
		id,
		category
	};
}).handler(async ({ context, data }) => {
	await ensureProfile(context.userId);
	if (data.id.kind === "domain" && isProtectedDomain(data.id.normalized)) return {
		ok: false,
		error: "Don't report the real brand domain. Report the lookalike."
	};
	const sql = await getSql();
	if (num((await sql`
      select count(*)::int as n from scam_reports
      where user_id = ${context.userId} and created_at > now() - interval '1 day'
    `)[0]?.n) >= 8) return {
		ok: false,
		error: "Eight reports in a day is the limit. It keeps the list hard to spam."
	};
	if ((await sql`
      select id from scam_reports
      where user_id = ${context.userId} and kind = ${data.id.kind} and normalized = ${data.id.normalized}
    `)[0]) return {
		ok: false,
		error: "You already reported this."
	};
	await sql`
      insert into scam_reports (id, user_id, kind, normalized, display, category)
      values (
        ${randomUUID()},
        ${context.userId},
        ${data.id.kind},
        ${data.id.normalized},
        ${data.id.display},
        ${data.category}
      )
    `;
	return { ok: true };
});

/**
 * One-call check for the browser extension (`POST /api/check`).
 *
 * The extension cannot carry a session cookie, so this entry point takes a
 * verified `userId` (resolved from an API key in the route handler) instead of
 * `context.userId`, and returns the same `Analysis` shape the web app renders.
 *
 * What it checks, in order:
 *   1. the selected text, when there is one — that is what the person pointed at
 *   2. otherwise the page title plus its address, which is what a cloned shop,
 *      a fake bank login, or a "your parcel is held" page is made of
 *
 * The URL is always included, because the address is the tell on a phishing page
 * even when the visible copy is stolen from the real thing.
 */
export async function runApiCheck(userId, input) {
const url = textField(input?.url, 2e3);
const title = textField(input?.title, 300);
const selection = textField(input?.selection, 4e3);
if (url.length < 4 && selection.length < 8) throw new Error("Send the page address, or the text you selected.");
const gate = await gateCheck(userId, "url");
if (!gate.ok) return gate;
const watched = asPlan(gate.profile.plan) === "business" ? await watchedFor(userId) : [];
const rules = scoreUrl(url, watched);
const reported = selection
? `They selected this text on the page and asked Guardian about it:\n${selection}`
: `The page headline reads: ${title || "no title"}`;
const ai = await askModel(`A person is looking at a live web page and pressed the Guardian button. Review the address for impersonation, phishing, or scam signals, using the page text as context. Do not claim you opened the page. You did not.
Address: ${url}
${reported}
Watched brand domains: ${watched.join(", ") || "none"}
Pattern pre-check score ${rules.score}/100. Reasons: ${rules.reasons.join(" | ")}`, void 0, gate.profile);
const merged = await withWatch(`${url}\n${title}\n${selection}`, merge(ai, rules, "AI review was unavailable. This score only reads the address text and the page wording. It did not open the page."));
const saved = await finishCheck({
userId,
profile: gate.profile,
kind: "url",
excerpt: url,
merged
});
return saved;
}
