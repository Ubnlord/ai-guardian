import { i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { a as authMiddleware, c as extractIdentifiers, d as seatLimit, i as asPlan, l as isWatchCategory, o as canUse, s as checksLimit, u as resolveIdentifier } from "./watch-CyReOAKX.mjs";
import { r as getSql } from "./db-CqqljK96.mjs";
import { a as scoreMessage, i as scoreInvestment, o as scoreNumber, r as isProtectedDomain, s as scoreUrl, t as band } from "./heuristics-Dj61ag1q.mjs";
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/api-8GSS_vp5.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var ARTICLES = [
	{
		slug: "lost-phone",
		title: "“I lost my phone. Send money.”",
		category: "Impersonation",
		minutes: 3,
		body: `This is one of the oldest tricks, and it still works because it borrows someone you love.

The message sounds personal. They use a family name. They are stranded, in trouble, or at a hospital. They need airtime, a transfer, or a few hundred thousand naira right now. They tell you not to call the old number, because that number would reach the real person.

Slow down there. A real emergency can survive a two-minute check. A scam cannot.

Call or text the person on the number already saved in your phone. Not the number in the new message. If you have a family verification phrase, ask for it. Someone who is actually your child will know it. A stranger with a copied profile photo will stall, get angry, or invent a reason the phrase does not apply.

Do not send money to a new account to “unlock” them. Police in Nigeria do not settle cases by Opay transfer from a relative. If you already sent money, contact your bank at once and report the account.

The feeling of panic is the product they are selling. You do not have to buy it.`
	},
	{
		slug: "otp-bvn",
		title: "Nobody real needs your OTP or BVN",
		category: "Money",
		minutes: 3,
		body: `Your bank, fintech app, or network will not ask you to read out a one-time password. They will not ask you to type your BVN, NIN, card PIN, or card number into a chat because your account is “about to be blocked.”

An OTP is a key. Whoever receives it can move money, reset a password, or approve a transfer while you are still staring at the message. The countdown — “expires in 5 minutes”, “account suspended today” — is there so you stop thinking.

Rules that hold up:

Never share an OTP, PIN, BVN, or NIN with a caller or a chat, even if they already know your name and the last four digits of your account. Scammers buy that kind of data.

Open the bank’s app yourself by tapping the icon you installed. Do not use the link in the SMS. If something is actually wrong, it will be waiting inside the real app.

Hang up on anyone who says they are from the fraud desk and then asks you to confirm a code. Call the number printed on the back of your card.

If you typed a code into a fake page, change your password from the real app and call the bank before you do anything else.`
	},
	{
		slug: "cloned-sites",
		title: "The link is the costume",
		category: "Links",
		minutes: 4,
		body: `A cloned site does not need to hack you. It only needs you to type the password yourself.

Look at the address before the page design. Scammers copy logos perfectly. They are worse at copying the real domain. Watch for a letter swapped with a number, an extra word like “secure” or “login”, a strange ending such as .xyz or .top, or a long chain of subdomains.

bit.ly and other shorteners hide the real destination. There is almost never a good reason for your bank to use one.

Guardian can flag lookalike addresses and known tricks in the text of a link. It does not load the page, and it cannot promise that a clean-looking address is the company you think it is. That last step is yours: type the official address yourself, or use the app you already installed.

Before you enter a password, card, or OTP, ask one question. Did I choose this site, or did a message choose it for me?

If a page asks for payment to release a parcel, a job kit, or a “customs fee”, close it. Delivery companies do not collect clearance fees through a surprise link.`
	},
	{
		slug: "fake-investments",
		title: "Guaranteed profit is the warning",
		category: "Investments",
		minutes: 4,
		body: `Fake investment platforms, crypto groups, and forex signals tend to share a shape.

The return is specific and fast. Double your money. Daily ROI. A celebrity or a pastor is supposedly behind it. You hear about it on WhatsApp, Telegram, or an ad, not from a licensed company you looked up yourself. The dashboard shows profits that you cannot withdraw. Then a new fee appears: tax, gas, verification, AML, a larger “VIP” deposit. Each payment is framed as the last one.

Real investments can lose money. Anyone who says they cannot is lying about the only part that matters.

Check the company outside the chat that recruited you. Search the exact name plus the words scam and withdrawal. Look for a regulator you can confirm on that regulator’s own site, not a certificate image inside the app. Cloned platforms copy the name of a real broker and change a letter.

Do not send “a little test” to see if withdrawal works. The small withdrawal is the bait. The large deposit is the business.

If a friend sent you the link, your friend may be a victim too, or their account may have been taken over. Talk to them on a saved number before you copy their trade.`
	},
	{
		slug: "task-scams",
		title: "The job that pays you to tap",
		category: "Jobs",
		minutes: 3,
		body: `Task scams offer simple online work. Rate hotels. Like videos. “Optimize” products. The first tasks pay a tiny amount so you trust the group. Then a task fails unless you deposit your own money to “upgrade the order” or “release the balance.”

There is no employer. The group chat is the set. Screenshots of other people’s payouts are easy to fake.

A real job does not ask you to pay to start, to pay to withdraw your wages, or to recruit two friends before your salary is unlocked. It does not hire you in a WhatsApp group with no interview and no company you can visit or call.

If you already deposited, stop. More payments will not unlock the last one. Tell your bank the account you paid, and warn anyone else in the group who might still believe the balance is real.

Treat “work from your phone, earn in dollars today” the way you would treat a stranger offering you a sack of cash. Ask what they get out of it. If the answer is your deposit, you have the whole business model.`
	},
	{
		slug: "voice-and-phrase",
		title: "A familiar voice is not proof",
		category: "Deepfakes",
		minutes: 3,
		body: `Copied voices and face videos are good enough now to panic a parent. A short clip from social media is enough for a scammer to imitate a son or a daughter asking for help. The call may sound close. The video may blink and nod. None of that is identification.

What still works is a secret you chose, not something the internet already has.

Pick a family verification phrase that is not a birthday, not a pet’s name from Facebook, and not a proverb everyone knows. A nonsense sentence is better. Store it in Guardian. Do not put it in a chat, and do not say it on a call until you asked for it.

When a scary call comes in, hang up and call back on the saved number. If you stay on the line, ask for the phrase before you discuss money. A cloned voice can cry. It cannot guess a sentence it has never heard.

Guardian’s image check looks for signs a picture may be generated or manipulated. It will tell you when it is unsure. That honesty matters: no tool can promise a photo is real. Use the phrase, the saved number, and a second family member. Three checks beat one convincing voice.`
	}
];
var MODEL = "grok-4.5";
var SYSTEM = `You are AI Guardian, a scam and impersonation analyst for ordinary people. You pay extra attention to patterns common in Nigeria and West Africa: urgent naira transfers, "I lost my phone", BVN/NIN/OTP harvesting, cloned bank and fintech sites, fake forex and crypto platforms, task scams, fake customs fees, and AI voice or photo impersonation.

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
	return (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
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
		shareHighRisk: bool(row.share_high_risk)
	};
}
function stamp() {
	return (/* @__PURE__ */ new Date()).toISOString();
}
async function ensureProfile(userId) {
	const sql = await getSql();
	const existing = await sql`
    select user_id, display_name, role, plan, checks_used, checks_period, store_history, share_high_risk
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
		share_high_risk: false
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
async function askModel(prompt, image) {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return null;
	const images = (Array.isArray(image) ? image : image ? [image] : []).filter((item) => item.startsWith("data:image/"));
	const content = images.length ? [{
		type: "text",
		text: prompt
	}, ...images.map((url) => ({
		type: "image_url",
		image_url: { url }
	}))] : prompt;
	try {
		const res = await fetch("https://api.x.ai/v1/chat/completions", {
			method: "POST",
			signal: AbortSignal.timeout(images.length > 1 ? 45e3 : 28e3),
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
	const seen = /* @__PURE__ */ new Set();
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
var getMe_createServerFn_handler = createServerRpc({
	id: "694984d327e0b3e9c6a97c2b1e0d45dd7897e69dc98a70cdfb7be239145af711",
	name: "getMe",
	filename: "src/lib/guardian/api.ts"
}, (opts) => getMe.__executeServer(opts));
var getMe = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getMe_createServerFn_handler, async ({ context }) => {
	return toMe(await ensureProfile(context.userId));
});
var getDashboard_createServerFn_handler = createServerRpc({
	id: "a50b300821af58acc53ecb5fdf39b895f84fcb794fcd305d0636dbbfede9bc4f",
	name: "getDashboard",
	filename: "src/lib/guardian/api.ts"
}, (opts) => getDashboard.__executeServer(opts));
var getDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getDashboard_createServerFn_handler, async ({ context }) => {
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
var analyzeMessage_createServerFn_handler = createServerRpc({
	id: "4dd5bef2768c486a7e291c406f61c228afbe0356bc28ee8731dbfad7b520eb89",
	name: "analyzeMessage",
	filename: "src/lib/guardian/api.ts"
}, (opts) => analyzeMessage.__executeServer(opts));
var analyzeMessage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const text = textField(data.text, 8e3);
	if (text.length < 8) throw new Error("Paste a bit more of the message.");
	return {
		text,
		mode: data.mode === "invoice" ? "invoice" : "message",
		channel: textField(data.channel, 40)
	};
}).handler(analyzeMessage_createServerFn_handler, async ({ context, data }) => {
	const feature = data.mode === "invoice" ? "invoice" : "message";
	const gate = await gateCheck(context.userId, feature);
	if (!gate.ok) return gate;
	const rules = scoreMessage(data.text, data.mode);
	const ai = await askModel(`Review this ${data.mode === "invoice" ? "supplier invoice or payment request" : "message"} for scam, phishing, or impersonation risk.
Channel: ${data.channel || "unspecified"}
Pattern pre-check score ${rules.score}/100. Signals: ${rules.signals.join(", ") || "none"}.
Content:
${data.text}`);
	const merged = await withWatch(data.text, merge(ai, rules, "AI review was unavailable, so this score uses pattern rules only. It is a warning, not a final answer."));
	return finishCheck({
		userId: context.userId,
		profile: gate.profile,
		kind: "message",
		excerpt: data.text,
		merged
	});
});
var analyzeUrl_createServerFn_handler = createServerRpc({
	id: "2c2246b172ade0d9ca6d237a6a218e004adf521eeaa25c47f2382830863c5378",
	name: "analyzeUrl",
	filename: "src/lib/guardian/api.ts"
}, (opts) => analyzeUrl.__executeServer(opts));
var analyzeUrl = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const url = textField(data.url, 2e3);
	if (url.length < 4) throw new Error("Paste the full link.");
	return {
		url,
		note: textField(data.note, 500)
	};
}).handler(analyzeUrl_createServerFn_handler, async ({ context, data }) => {
	const gate = await gateCheck(context.userId, "url");
	if (!gate.ok) return gate;
	const watched = asPlan(gate.profile.plan) === "business" ? await watchedFor(context.userId) : [];
	const rules = scoreUrl(data.url, watched);
	const ai = await askModel(`Review this web address for impersonation, phishing, or scam signals. Do not claim you opened it. You did not.
Address: ${data.url}
What they asked the user to do: ${data.note || "not specified"}
Watched brand domains: ${watched.join(", ") || "none"}
Pattern pre-check score ${rules.score}/100. Reasons: ${rules.reasons.join(" | ")}`);
	const merged = await withWatch(`${data.url}\n${data.note}`, merge(ai, rules, "AI review was unavailable. This score only reads the address text. It did not open the page."));
	return finishCheck({
		userId: context.userId,
		profile: gate.profile,
		kind: "url",
		excerpt: data.url,
		merged
	});
});
var analyzeInvestment_createServerFn_handler = createServerRpc({
	id: "95637742fcbdc2d1b9490830b242c9d1429b573d624fd60d14218ccc468a0405",
	name: "analyzeInvestment",
	filename: "src/lib/guardian/api.ts"
}, (opts) => analyzeInvestment.__executeServer(opts));
var analyzeInvestment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
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
}).handler(analyzeInvestment_createServerFn_handler, async ({ context, data }) => {
	const gate = await gateCheck(context.userId, "investment");
	if (!gate.ok) return gate;
	const blob = `Platform: ${data.platform || "unnamed"}\nHow they made contact: ${data.contact || "unspecified"}\nLink: ${data.url || "none"}\nOffer:\n${data.promise}`;
	const rules = scoreInvestment(blob);
	const merged = await withWatch(blob, merge(await askModel(`Review this investment, crypto, forex, or "double your money" offer for scam risk.\n${blob}\nPattern pre-check score ${rules.score}/100. Reasons: ${rules.reasons.join(" | ")}`), rules, "AI review was unavailable, so this score uses investment-scam patterns only."));
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
var analyzeImage_createServerFn_handler = createServerRpc({
	id: "54fba98133350ca23ab381150a16a9643ab07b2eff8f1c6b1990ba796f34d06e",
	name: "analyzeImage",
	filename: "src/lib/guardian/api.ts"
}, (opts) => analyzeImage.__executeServer(opts));
var analyzeImage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
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
}).handler(analyzeImage_createServerFn_handler, async ({ context, data }) => {
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
Return the JSON object only.`, data.frames);
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
var listHistory_createServerFn_handler = createServerRpc({
	id: "18a795821a49a286b898da7d6edc3ab7723cecc8a5a45525b04682fb0f2982a7",
	name: "listHistory",
	filename: "src/lib/guardian/api.ts"
}, (opts) => listHistory.__executeServer(opts));
var listHistory = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listHistory_createServerFn_handler, async ({ context }) => {
	await ensureProfile(context.userId);
	return (await (await getSql())`
      select id, kind, verdict, score, title, summary, reasons, actions, uncertainty, source, excerpt,
        to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at
      from checks where user_id = ${context.userId}
      order by created_at desc
      limit 100
    `).map(mapAnalysis);
});
var deleteCheck_createServerFn_handler = createServerRpc({
	id: "cf852de55b9090eaf0b600f5c2d229260d2c84a4f56c25e072e93bc8e5fd5b93",
	name: "deleteCheck",
	filename: "src/lib/guardian/api.ts"
}, (opts) => deleteCheck.__executeServer(opts));
var deleteCheck = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const id = textField(input?.id, 80);
	if (!id) throw new Error("Missing check.");
	return { id };
}).handler(deleteCheck_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`delete from checks where id = ${data.id} and user_id = ${context.userId}`;
	return { ok: true };
});
var clearHistory_createServerFn_handler = createServerRpc({
	id: "74673f1dd9f9b3f19811cb27d770c291d721dd53e61b404047aefc9c14bf7746",
	name: "clearHistory",
	filename: "src/lib/guardian/api.ts"
}, (opts) => clearHistory.__executeServer(opts));
var clearHistory = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(clearHistory_createServerFn_handler, async ({ context }) => {
	await (await getSql())`delete from checks where user_id = ${context.userId}`;
	return { ok: true };
});
var updateSettings_createServerFn_handler = createServerRpc({
	id: "92b5d1d1ede84d19451b629eac93eeddff8b1d24b2bafce1dfcf9cf59248dfe8",
	name: "updateSettings",
	filename: "src/lib/guardian/api.ts"
}, (opts) => updateSettings.__executeServer(opts));
var updateSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	return {
		displayName: textField(data.displayName, 40),
		storeHistory: typeof data.storeHistory === "boolean" ? data.storeHistory : void 0,
		shareHighRisk: typeof data.shareHighRisk === "boolean" ? data.shareHighRisk : void 0
	};
}).handler(updateSettings_createServerFn_handler, async ({ context, data }) => {
	const profile = await ensureProfile(context.userId);
	const sql = await getSql();
	const name = data.displayName || profile.display_name;
	const store = data.storeHistory ?? bool(profile.store_history);
	const share = data.shareHighRisk ?? bool(profile.share_high_risk);
	await sql`
      update profiles
      set display_name = ${name}, store_history = ${store}, share_high_risk = ${share}, updated_at = now()
      where user_id = ${context.userId}
    `;
	profile.display_name = name;
	profile.store_history = store;
	profile.share_high_risk = share;
	return toMe(profile);
});
var setPlan_createServerFn_handler = createServerRpc({
	id: "ca8c84b3d4fa1a535a819af1f5980e4ecabbff6043ac31de5f3560444dd6b308",
	name: "setPlan",
	filename: "src/lib/guardian/api.ts"
}, (opts) => setPlan.__executeServer(opts));
var setPlan = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	return { plan: asPlan(textField(input?.plan, 20)) };
}).handler(setPlan_createServerFn_handler, async ({ context, data }) => {
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
var getFamily_createServerFn_handler = createServerRpc({
	id: "61108076ab044014c555297e27a7bf2d9d4468c4eba1f967f6a635d39dfb473c",
	name: "getFamily",
	filename: "src/lib/guardian/api.ts"
}, (opts) => getFamily.__executeServer(opts));
var getFamily = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getFamily_createServerFn_handler, async ({ context }) => {
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
var createFamily_createServerFn_handler = createServerRpc({
	id: "d8cd62c1456ba215c4f8667dcc43e98b83b286ce4bc43a8587282c5ebd850d36",
	name: "createFamily",
	filename: "src/lib/guardian/api.ts"
}, (opts) => createFamily.__executeServer(opts));
var createFamily = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const name = textField(input?.name, 40);
	if (name.length < 2) throw new Error("Name the circle.");
	return { name };
}).handler(createFamily_createServerFn_handler, async ({ context, data }) => {
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
var joinFamily_createServerFn_handler = createServerRpc({
	id: "d2c7cd9863869e8d26c22b38dbc895d08f955fbf434057a54cbfea61a17b4c20",
	name: "joinFamily",
	filename: "src/lib/guardian/api.ts"
}, (opts) => joinFamily.__executeServer(opts));
var joinFamily = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const code = textField(input?.code, 12).toUpperCase().replace(/[^A-Z0-9]/g, "");
	if (code.length < 6) throw new Error("Enter the invite code.");
	return { code };
}).handler(joinFamily_createServerFn_handler, async ({ context, data }) => {
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
var leaveFamily_createServerFn_handler = createServerRpc({
	id: "524b1dbb4c33a1d3ef73308325ad8916c830076f6f090f759e5d71a2eec250a8",
	name: "leaveFamily",
	filename: "src/lib/guardian/api.ts"
}, (opts) => leaveFamily.__executeServer(opts));
var leaveFamily = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(leaveFamily_createServerFn_handler, async ({ context }) => {
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
var deleteFamily_createServerFn_handler = createServerRpc({
	id: "1ce2bfd5111dc9f934aa71b788b2a74bda2c95d0a05de787449d08644017a5ef",
	name: "deleteFamily",
	filename: "src/lib/guardian/api.ts"
}, (opts) => deleteFamily.__executeServer(opts));
var deleteFamily = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(deleteFamily_createServerFn_handler, async ({ context }) => {
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
var setMemberLabel_createServerFn_handler = createServerRpc({
	id: "d03da582f1a1eb81e093b45ddf4721ee2201d46be7682ef4d06a317f4345bb7b",
	name: "setMemberLabel",
	filename: "src/lib/guardian/api.ts"
}, (opts) => setMemberLabel.__executeServer(opts));
var setMemberLabel = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const label = textField(input?.label, 32);
	if (!label) throw new Error("Add a short label, like Mum or Dad.");
	return { label };
}).handler(setMemberLabel_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`update family_members set label = ${data.label} where user_id = ${context.userId}`;
	return { ok: true };
});
var setPhrase_createServerFn_handler = createServerRpc({
	id: "6e691818b8c90b95399265dea7860df4a5c7dc935e1c79d8d828ff7050e2dea2",
	name: "setPhrase",
	filename: "src/lib/guardian/api.ts"
}, (opts) => setPhrase.__executeServer(opts));
var setPhrase = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const phrase = textField(input?.phrase, 80);
	if (phrase.length < 8) throw new Error("Use at least 8 characters. A nonsense sentence is best.");
	return { phrase };
}).handler(setPhrase_createServerFn_handler, async ({ context, data }) => {
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
var verifyPhrase_createServerFn_handler = createServerRpc({
	id: "fa7b3bfd8583b64445635e241ae40811a413b2ab7d14d906a52cc727675a57a1",
	name: "verifyPhrase",
	filename: "src/lib/guardian/api.ts"
}, (opts) => verifyPhrase.__executeServer(opts));
var verifyPhrase = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const phrase = textField(input?.phrase, 80);
	if (!phrase) throw new Error("Type the phrase they gave you.");
	return { phrase };
}).handler(verifyPhrase_createServerFn_handler, async ({ context, data }) => {
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
var listDomains_createServerFn_handler = createServerRpc({
	id: "147f6d671ad80760a311bf2fc1219a5ce83882fde86171c289bba59728e207e6",
	name: "listDomains",
	filename: "src/lib/guardian/api.ts"
}, (opts) => listDomains.__executeServer(opts));
var listDomains = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listDomains_createServerFn_handler, async ({ context }) => {
	await ensureProfile(context.userId);
	return watchedFor(context.userId);
});
function normalizeDomain(input) {
	let s = input.trim().toLowerCase().replace(/^https?:\/\//, "");
	s = (s.split("/")[0] ?? "").split("?")[0]?.replace(/\.$/, "") ?? "";
	if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(s)) return null;
	return s.replace(/^www\./, "");
}
var addDomain_createServerFn_handler = createServerRpc({
	id: "39fc7cc5e1dc12284019e8665aef9b7551e4e42fd9ecd2ea1de1e0bebd97d637",
	name: "addDomain",
	filename: "src/lib/guardian/api.ts"
}, (opts) => addDomain.__executeServer(opts));
var addDomain = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ domain: textField(input?.domain, 120) })).handler(addDomain_createServerFn_handler, async ({ context, data }) => {
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
var removeDomain_createServerFn_handler = createServerRpc({
	id: "cc7496d0da376885258af31814c371c1f70c535c7b6cba053bf8bea157964c77",
	name: "removeDomain",
	filename: "src/lib/guardian/api.ts"
}, (opts) => removeDomain.__executeServer(opts));
var removeDomain = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ domain: textField(input?.domain, 120) })).handler(removeDomain_createServerFn_handler, async ({ context, data }) => {
	await (await getSql())`delete from watched_domains where user_id = ${context.userId} and domain = ${data.domain}`;
	return { ok: true };
});
var listArticles_createServerFn_handler = createServerRpc({
	id: "1d8da4920b626f22d74c11b4dde90215a4b2f42af765d6de72fb0c79efa494ab",
	name: "listArticles",
	filename: "src/lib/guardian/api.ts"
}, (opts) => listArticles.__executeServer(opts));
var listArticles = createServerFn({ method: "GET" }).handler(listArticles_createServerFn_handler, async () => {
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
var getAdmin_createServerFn_handler = createServerRpc({
	id: "63cf7deb9534f5055043b54ad3dbbabcf7df2b3fb16b120d7797129cefc91a1f",
	name: "getAdmin",
	filename: "src/lib/guardian/api.ts"
}, (opts) => getAdmin.__executeServer(opts));
var getAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getAdmin_createServerFn_handler, async ({ context }) => {
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
var adminSetRole_createServerFn_handler = createServerRpc({
	id: "04e3821fdcc874be2d3a0be100482cbbc1e1e38502ca1c8c5b5bfd77ec8d543c",
	name: "adminSetRole",
	filename: "src/lib/guardian/api.ts"
}, (opts) => adminSetRole.__executeServer(opts));
var adminSetRole = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const userId = textField(data.userId, 80);
	const role = data.role === "admin" ? "admin" : "member";
	if (!userId) throw new Error("Missing person.");
	return {
		userId,
		role
	};
}).handler(adminSetRole_createServerFn_handler, async ({ context, data }) => {
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
var adminSetPlan_createServerFn_handler = createServerRpc({
	id: "8472f683175ae7e6b494c8da31347197d1e9326c86c64989753f24c077d9c62e",
	name: "adminSetPlan",
	filename: "src/lib/guardian/api.ts"
}, (opts) => adminSetPlan.__executeServer(opts));
var adminSetPlan = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	return {
		userId: textField(data.userId, 80),
		plan: asPlan(textField(data.plan, 20))
	};
}).handler(adminSetPlan_createServerFn_handler, async ({ context, data }) => {
	await requireAdmin(context.userId);
	if (!data.userId) throw new Error("Missing person.");
	await (await getSql())`update profiles set plan = ${data.plan}, updated_at = now() where user_id = ${data.userId}`;
	return { ok: true };
});
var adminSaveArticle_createServerFn_handler = createServerRpc({
	id: "b17f6457f519d700a9f62a9f8ed23e0a8757fe1234a015734e610066cac3e491",
	name: "adminSaveArticle",
	filename: "src/lib/guardian/api.ts"
}, (opts) => adminSaveArticle.__executeServer(opts));
var adminSaveArticle = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const slug = textField(data.slug, 80);
	const title = textField(data.title, 120);
	const body = textField(data.body, 8e3);
	if (!slug || !title || body.length < 20) throw new Error("Title and lesson text are required.");
	return {
		slug,
		title,
		body,
		published: data.published !== false
	};
}).handler(adminSaveArticle_createServerFn_handler, async ({ context, data }) => {
	await requireAdmin(context.userId);
	await (await getSql())`
      update education_articles
      set title = ${data.title}, body = ${data.body}, published = ${data.published}, updated_at = now()
      where slug = ${data.slug}
    `;
	return { ok: true };
});
var WATCH_KINDS = /* @__PURE__ */ new Set([
	"phone",
	"account",
	"domain"
]);
function asWatchKind(value) {
	return WATCH_KINDS.has(value) ? value : null;
}
var analyzeNumber_createServerFn_handler = createServerRpc({
	id: "9b7fc7d792c189d59f81eac3f66a1fade0100e9d911c80e930d5d6b3ca91aa18",
	name: "analyzeNumber",
	filename: "src/lib/guardian/api.ts"
}, (opts) => analyzeNumber.__executeServer(opts));
var analyzeNumber = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const kind = asWatchKind(textField(data.kind, 20));
	const value = textField(data.value, 80);
	const context = textField(data.context, 4e3);
	if (kind !== "phone" && kind !== "account") throw new Error("Choose a phone or an account number.");
	const id = resolveIdentifier(kind, value);
	if (!id) throw new Error(kind === "phone" ? "Use a Nigerian mobile number, like 0803 000 0000." : "Use the 10-digit account number, with no account name.");
	return {
		kind,
		id,
		context
	};
}).handler(analyzeNumber_createServerFn_handler, async ({ context, data }) => {
	const gate = await gateCheck(context.userId, "number");
	if (!gate.ok) return gate;
	const rules = scoreNumber(data.kind, data.id.display, data.context);
	const ai = await askModel(`Review this ${data.kind === "phone" ? "phone number" : "bank or fintech account number"} for scam risk. You cannot prove who owns it.
${data.kind === "phone" ? "Phone" : "Account"}: ${data.id.display}
What the sender said:
${data.context || "The user did not paste a message."}
Pattern pre-check score ${rules.score}/100. Reasons: ${rules.reasons.join(" | ")}`);
	const merged = await withWatch(`${data.id.display}\n${data.context}`, merge(ai, rules, "AI review was unavailable, so this score uses pattern rules only. A number alone is not proof of who owns it."), [data.id]);
	return finishCheck({
		userId: context.userId,
		profile: gate.profile,
		kind: "number",
		excerpt: data.context || data.id.display,
		merged
	});
});
var listWatch_createServerFn_handler = createServerRpc({
	id: "5297eb7f0ea8447eb9fcf8aca6fdce72d08a8d745321bdf305d9e4e647b0e38a",
	name: "listWatch",
	filename: "src/lib/guardian/api.ts"
}, (opts) => listWatch.__executeServer(opts));
var listWatch = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listWatch_createServerFn_handler, async ({ context }) => {
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
var lookupWatch_createServerFn_handler = createServerRpc({
	id: "af6f058905364ddf698fdba667a7427a66dcc85cfdb29eb8740cdbb85846f4e8",
	name: "lookupWatch",
	filename: "src/lib/guardian/api.ts"
}, (opts) => lookupWatch.__executeServer(opts));
var lookupWatch = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const kind = asWatchKind(textField(data.kind, 20));
	const value = textField(data.value, 160);
	if (!kind) throw new Error("Choose phone, account, or domain.");
	const id = resolveIdentifier(kind, value);
	if (!id) throw new Error(kind === "phone" ? "That doesn't look like a Nigerian mobile number." : kind === "account" ? "Account numbers here are 10 digits." : "Paste a domain, like brand-secure.xyz.");
	return { id };
}).handler(lookupWatch_createServerFn_handler, async ({ context, data }) => {
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
var reportScam_createServerFn_handler = createServerRpc({
	id: "4639cdc1afe391402cd2f2225f9a1eecfc83f32a8653745ae82756809010e96d",
	name: "reportScam",
	filename: "src/lib/guardian/api.ts"
}, (opts) => reportScam.__executeServer(opts));
var reportScam = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
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
}).handler(reportScam_createServerFn_handler, async ({ context, data }) => {
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
//#endregion
export { addDomain_createServerFn_handler, adminSaveArticle_createServerFn_handler, adminSetPlan_createServerFn_handler, adminSetRole_createServerFn_handler, analyzeImage_createServerFn_handler, analyzeInvestment_createServerFn_handler, analyzeMessage_createServerFn_handler, analyzeNumber_createServerFn_handler, analyzeUrl_createServerFn_handler, clearHistory_createServerFn_handler, createFamily_createServerFn_handler, deleteCheck_createServerFn_handler, deleteFamily_createServerFn_handler, getAdmin_createServerFn_handler, getDashboard_createServerFn_handler, getFamily_createServerFn_handler, getMe_createServerFn_handler, joinFamily_createServerFn_handler, leaveFamily_createServerFn_handler, listArticles_createServerFn_handler, listDomains_createServerFn_handler, listHistory_createServerFn_handler, listWatch_createServerFn_handler, lookupWatch_createServerFn_handler, removeDomain_createServerFn_handler, reportScam_createServerFn_handler, setMemberLabel_createServerFn_handler, setPhrase_createServerFn_handler, setPlan_createServerFn_handler, updateSettings_createServerFn_handler, verifyPhrase_createServerFn_handler };
