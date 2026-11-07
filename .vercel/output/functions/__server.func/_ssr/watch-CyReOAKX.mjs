import { n as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/watch-CyReOAKX.js
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-1vAx-gM_.mjs").then((n) => n.n).then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-DmGDp2X5.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
var BANK_NEAR = /(account|acct|nuban|opay|palmpay|kuda|gtbank|\bgtb\b|zenith|access|uba|moniepoint|first\s?bank|fidelity|sterling|wema|polaris|send to|transfer to|pay into)/i;
var PHONE_RE = /(?:\+\s*234|234|0)[\s.-]*[789](?:[\s.-]*\d){9}\b/gi;
var DOMAIN_RE = /\b(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,24}\b/gi;
function normalizePhone(raw) {
	let digits = raw.replace(/\D/g, "");
	if (digits.startsWith("234") && digits.length === 14 && digits.charAt(3) === "0") digits = digits.slice(4);
	else if (digits.startsWith("234") && digits.length === 13) digits = digits.slice(3);
	if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
	if (!/^[789]\d{9}$/.test(digits)) return null;
	return digits;
}
function formatPhone(national) {
	return `0${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
}
function normalizeDomain(raw) {
	const trimmed = raw.trim().toLowerCase();
	if (!trimmed || /\s/.test(trimmed)) return null;
	const assumed = !/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed);
	try {
		const host = new URL(assumed ? `https://${trimmed}` : trimmed).hostname.replace(/^www\./, "");
		if (!host.includes(".") || host.length > 120) return null;
		if (!/^[a-z0-9.-]+$/.test(host)) return null;
		if (host.startsWith(".") || host.endsWith(".")) return null;
		return host;
	} catch {
		return null;
	}
}
function resolveIdentifier(kind, raw) {
	if (kind === "phone") {
		const normalized = normalizePhone(raw);
		if (!normalized) return null;
		return {
			kind: "phone",
			normalized,
			display: formatPhone(normalized)
		};
	}
	if (kind === "account") {
		const digits = raw.replace(/\D/g, "");
		if (!/^\d{10}$/.test(digits)) return null;
		return {
			kind: "account",
			normalized: digits,
			display: digits
		};
	}
	if (kind === "domain") {
		const normalized = normalizeDomain(raw);
		if (!normalized) return null;
		return {
			kind: "domain",
			normalized,
			display: normalized
		};
	}
	return null;
}
function add(found, seen, item) {
	const key = `${item.kind}:${item.normalized}`;
	if (seen.has(key)) return;
	seen.add(key);
	found.push(item);
}
function nearBank(text, index) {
	const start = Math.max(0, index - 42);
	const end = Math.min(text.length, index + 28);
	return BANK_NEAR.test(text.slice(start, end));
}
function extractIdentifiers(text) {
	const found = [];
	const seen = /* @__PURE__ */ new Set();
	for (const match of text.matchAll(PHONE_RE)) {
		const normalized = normalizePhone(match[0]);
		if (!normalized) continue;
		const index = match.index ?? 0;
		add(found, seen, {
			kind: "phone",
			normalized,
			display: formatPhone(normalized)
		});
		if (nearBank(text, index)) add(found, seen, {
			kind: "account",
			normalized,
			display: normalized
		});
	}
	for (const match of text.matchAll(/\b(\d{3,4})[\s.-](\d{3,4})[\s.-](\d{3,4})\b/g)) {
		const digits = `${match[1] ?? ""}${match[2] ?? ""}${match[3] ?? ""}`;
		if (digits.length !== 10 && digits.length !== 11) continue;
		const index = match.index ?? 0;
		const phone = normalizePhone(digits);
		const bank = nearBank(text, index);
		if (phone && (digits.startsWith("0") || digits.startsWith("234") || bank)) add(found, seen, {
			kind: "phone",
			normalized: phone,
			display: formatPhone(phone)
		});
		if (bank) {
			const account = phone ?? (digits.length === 10 ? digits : null);
			if (account) add(found, seen, {
				kind: "account",
				normalized: account,
				display: account
			});
		}
	}
	for (const match of text.matchAll(/\b(\d{10})\b/g)) {
		const digits = match[1] ?? "";
		if (!nearBank(text, match.index ?? 0)) continue;
		add(found, seen, {
			kind: "account",
			normalized: digits,
			display: digits
		});
		const asPhone = normalizePhone(digits);
		if (asPhone) add(found, seen, {
			kind: "phone",
			normalized: asPhone,
			display: formatPhone(asPhone)
		});
	}
	for (const match of text.matchAll(DOMAIN_RE)) {
		const normalized = normalizeDomain(match[0] ?? "");
		if (!normalized) continue;
		if (normalized.endsWith(".png") || normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) continue;
		add(found, seen, {
			kind: "domain",
			normalized,
			display: normalized
		});
	}
	return found.slice(0, 8);
}
var PLAN_ORDER = [
	"free",
	"plus",
	"family",
	"business"
];
var PLANS = {
	free: {
		id: "free",
		name: "Free",
		price: "$0",
		cadence: "forever",
		checks: 5,
		seats: 0,
		blurb: "Enough to check the message that made your stomach drop.",
		features: [
			"5 AI checks each month",
			"Messages, links, and numbers",
			"Guardian Watch",
			"A reply you can copy",
			"Lessons and playbooks"
		]
	},
	plus: {
		id: "plus",
		name: "Guardian Plus",
		price: "$4.99",
		cadence: "per month",
		checks: 150,
		seats: 2,
		highlight: true,
		blurb: "The safety layer for one person who is tired of guessing.",
		features: [
			"150 checks each month",
			"Messages, links, images, ID and passport scans, documents, short video, investments",
			"Personal risk history",
			"A circle of 2 with a private phrase"
		]
	},
	family: {
		id: "family",
		name: "Family",
		price: "$9.99",
		cadence: "per month",
		checks: 400,
		seats: 6,
		blurb: "One phrase. Up to six people. Nobody sends money on a stranger's word.",
		features: [
			"400 checks each month",
			"Everything in Plus",
			"Up to 6 people in the circle",
			"Shared high-risk alerts"
		]
	},
	business: {
		id: "business",
		name: "Business",
		price: "$19",
		cadence: "per month",
		checks: 800,
		seats: 15,
		blurb: "For a small team that gets fake invoices and lookalike domains.",
		features: [
			"800 checks each month",
			"Invoice review mode",
			"Up to 15 people",
			"Brand domain watch"
		]
	}
};
function asPlan(value) {
	if (value === "plus" || value === "family" || value === "business") return value;
	return "free";
}
function checksLimit(plan) {
	return PLANS[plan].checks;
}
function seatLimit(plan) {
	return PLANS[plan].seats;
}
function canUse(plan, kind) {
	if (kind === "message" || kind === "url" || kind === "number") return true;
	if (kind === "image" || kind === "investment" || kind === "circle") return plan !== "free";
	if (kind === "invoice" || kind === "domains") return plan === "business";
	return false;
}
var WATCH_CATEGORIES = [
	{
		id: "impersonation",
		label: "Impersonation"
	},
	{
		id: "otp",
		label: "OTP or secret"
	},
	{
		id: "payment",
		label: "Asked for money"
	},
	{
		id: "investment",
		label: "Investment scam"
	},
	{
		id: "invoice",
		label: "Fake invoice"
	},
	{
		id: "other",
		label: "Other"
	}
];
function isWatchCategory(value) {
	return WATCH_CATEGORIES.some((item) => item.id === value);
}
//#endregion
export { authMiddleware as a, extractIdentifiers as c, seatLimit as d, asPlan as i, isWatchCategory as l, PLAN_ORDER as n, canUse as o, WATCH_CATEGORIES as r, checksLimit as s, PLANS as t, resolveIdentifier as u };
