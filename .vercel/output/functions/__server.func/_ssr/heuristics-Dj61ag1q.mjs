//#region node_modules/.nitro/vite/services/ssr/assets/heuristics-Dj61ag1q.js
var OFFICIAL = [
	"paypal.com",
	"binance.com",
	"coinbase.com",
	"gtbank.com",
	"accessbankplc.com",
	"zenithbank.com",
	"ubagroup.com",
	"kuda.com",
	"opayweb.com",
	"palmpay.com",
	"flutterwave.com",
	"piggyvest.com",
	"cowrywise.com",
	"whatsapp.com",
	"microsoft.com",
	"apple.com",
	"amazon.com",
	"instagram.com",
	"facebook.com",
	"google.com",
	"firstbanknigeria.com",
	"fidelitybank.ng"
];
var BRAND_TOKENS = [
	"paypal",
	"binance",
	"coinbase",
	"gtbank",
	"accessbank",
	"zenith",
	"kuda",
	"opay",
	"palmpay",
	"flutterwave",
	"piggyvest",
	"whatsapp",
	"microsoft",
	"apple",
	"amazon",
	"instagram",
	"facebook",
	"google"
];
var SHORTENERS = /* @__PURE__ */ new Set([
	"bit.ly",
	"tinyurl.com",
	"t.co",
	"cutt.ly",
	"rb.gy",
	"is.gd",
	"shorturl.at",
	"tiny.cc",
	"ow.ly",
	"rebrand.ly"
]);
var BAD_TLDS = /* @__PURE__ */ new Set([
	"xyz",
	"top",
	"click",
	"loan",
	"gq",
	"tk",
	"ml",
	"cf",
	"buzz",
	"icu",
	"rest",
	"monster",
	"cfd"
]);
var SAFE_ACTIONS = ["No payment or secret was requested. You can treat this as ordinary.", "If money shows up later in the thread, check it again before you act."];
var DEFAULT_ACTIONS = [
	"Don't send money, gift cards, airtime, or crypto.",
	"Don't tap the link, and don't reply with an OTP, PIN, BVN, or NIN.",
	"Contact the person or company using a number or app you already saved."
];
function clamp(n) {
	return Math.max(0, Math.min(98, Math.round(n)));
}
function band(score) {
	if (score >= 70) return "high_risk";
	if (score >= 35) return "suspicious";
	return "safe";
}
function push(reasons, signals, points, amount, reason, signal) {
	points.n += amount;
	if (!signals.includes(signal)) {
		signals.push(signal);
		reasons.push(reason);
	}
}
function scoreMessage(text, mode = "message") {
	const reasons = [];
	const signals = [];
	const points = { n: 8 };
	const t = text.toLowerCase();
	if (/\b(urgent|urgently|immediately|right now|asap|act now|last chance|within \d+ (minute|hour))/.test(t)) push(reasons, signals, points, 16, "It pushes you to act immediately.", "urgency");
	if (/\b(emergency|accident|hospital|arrested|police|kidnapped|stranded|customs)\b/.test(t)) push(reasons, signals, points, 14, "It uses an emergency to make you panic.", "panic");
	if (/lost my phone|new (phone )?number|don'?t call|do not call (me|my)|this is your (son|daughter|mum|mom|dad|brother|sister)|i'?m your (son|daughter)/.test(t)) push(reasons, signals, points, 26, "It claims a new identity and tells you not to use the number you already trust.", "impersonation");
	if (/\b(otp|one[- ]time|password|pin|bvn|nin|cvv|verification code|auth(entication)? code)\b/.test(t)) push(reasons, signals, points, 28, "It asks for a secret: OTP, PIN, BVN, NIN, or a password.", "secret");
	if (/(₦|naira|\bngn\b|\$|\busd\b|\busdt\b|\bbtc\b|bitcoin|gift ?card|airtime|account number|opay|palmpay)/.test(t) && /(send|transfer|pay|deposit|wire|credit)/.test(t)) push(reasons, signals, points, 22, "It asks you to move money or airtime.", "money");
	else if (/(₦|\bnaira\b|\busdt\b|bitcoin|gift ?card)/.test(t)) push(reasons, signals, points, 10, "Money is part of the message.", "money-mention");
	if (/account (has been|will be|is) (suspended|blocked|limited|restricted)|click (here|the link)|verify your (account|identity|bvn)/.test(t)) push(reasons, signals, points, 18, "It threatens the account and points you at a link.", "bank-threat");
	if (/guaranteed|double your money|risk[- ]free|100%|daily roi|passive income|profit every/.test(t)) push(reasons, signals, points, 20, "It promises profit that cannot lose.", "guarantee");
	if (/bit\.ly|tinyurl|cutt\.ly|rb\.gy|is\.gd|t\.co\//.test(t)) push(reasons, signals, points, 12, "A shortened link hides the real address.", "short");
	if (/whatsapp (job|task)|rate (hotels|videos)|no experience|earn(ing)? (daily|\$|₦)|task (app|group)/.test(t)) push(reasons, signals, points, 16, "It looks like a paid-task or too-easy job offer.", "task");
	if (mode === "invoice") {
		if (/past due|overdue|wire to|new bank details|updated account|pay immediately|supplier/.test(t)) push(reasons, signals, points, 16, "The invoice pushes a new or urgent payment destination.", "invoice");
		if (!/invoice|amount due|vat|total/.test(t)) push(reasons, signals, points, 8, "This does not read like a normal supplier invoice.", "not-invoice");
	}
	if (signals.length >= 3) points.n += 10;
	const score = clamp(points.n);
	const actions = score < 35 ? SAFE_ACTIONS : signals.includes("impersonation") ? [
		"Don't send money.",
		"Call them on the number already saved in your phone — not the one in this message.",
		"Ask for your family verification phrase before you believe who it is."
	] : signals.includes("secret") ? [
		"Don't share the OTP, PIN, BVN, or password.",
		"Open the bank or app yourself. Don't use the link in the message.",
		"If you already shared a code, call your bank from the number on your card."
	] : DEFAULT_ACTIONS;
	if (reasons.length === 0) reasons.push("No classic scam pattern stood out in the wording.");
	return {
		score,
		reasons: reasons.slice(0, 5),
		actions,
		signals
	};
}
function levenshtein(a, b) {
	if (Math.abs(a.length - b.length) > 2) return 9;
	const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
	for (let i = 0; i <= a.length; i++) dp[i][0] = i;
	for (let j = 0; j <= b.length; j++) dp[0][j] = j;
	for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
		const cost = a[i - 1] === b[j - 1] ? 0 : 1;
		dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
	}
	return dp[a.length][b.length];
}
function hostOf(raw) {
	const trimmed = raw.trim();
	const assumed = !/^[a-z]+:\/\//i.test(trimmed);
	try {
		const url = new URL(assumed ? `https://${trimmed}` : trimmed);
		if (!url.hostname.includes(".")) return null;
		return {
			host: url.hostname.toLowerCase(),
			protocol: url.protocol,
			assumed
		};
	} catch {
		return null;
	}
}
function bareHost(host) {
	return host.replace(/^www\./, "");
}
function isOfficial(host) {
	const bare = bareHost(host);
	return OFFICIAL.some((domain) => bare === domain || bare.endsWith(`.${domain}`));
}
function isProtectedDomain(host) {
	return isOfficial(host);
}
function lookalike(host) {
	if (isOfficial(host)) return null;
	const label = bareHost(host).split(".")[0] ?? "";
	const squished = label.replace(/0/g, "o").replace(/1/g, "l").replace(/3/g, "e").replace(/5/g, "s").replace(/\$/g, "s");
	for (const brand of BRAND_TOKENS) {
		if (label === brand) return brand;
		if (squished.includes(brand) && label !== brand) return brand;
		if (levenshtein(label, brand) === 1) return brand;
	}
	return null;
}
function scoreUrl(raw, watched = []) {
	const reasons = [];
	const signals = [];
	const points = { n: 6 };
	const parsed = hostOf(raw);
	if (!parsed) return {
		score: 42,
		reasons: ["This does not look like a complete web address."],
		actions: ["Don't open it until you can read a full address you recognize."],
		signals: ["invalid"]
	};
	const bare = bareHost(parsed.host);
	const tld = bare.split(".").pop() ?? "";
	if (parsed.assumed) push(reasons, signals, points, 4, "The message left off http or https, so the destination is only a guess.", "assumed");
	if (parsed.protocol === "http:") push(reasons, signals, points, 16, "The address is not using a secure https connection.", "http");
	if (/^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.host)) push(reasons, signals, points, 30, "The address is a raw IP, not a company name.", "ip");
	if (parsed.host.startsWith("xn--") || bare.includes("xn--")) push(reasons, signals, points, 28, "The address uses punycode, which can disguise lookalike letters.", "puny");
	if (raw.includes("@")) push(reasons, signals, points, 26, "An @ in the address can hide the real destination.", "at");
	if (SHORTENERS.has(bare)) push(reasons, signals, points, 22, "This is a shortened link. The real site is hidden.", "short");
	if (BAD_TLDS.has(tld)) push(reasons, signals, points, 14, `The ending “.${tld}” is a common costume for throwaway scam sites.`, "tld");
	const labels = bare.split(".");
	if ((labels[0]?.match(/-/g) ?? []).length >= 3) push(reasons, signals, points, 10, "The name is packed with hyphens, which lookalike sites often do.", "hyphen");
	if (labels.length >= 4) push(reasons, signals, points, 8, "The address stacks many subdomains to look official.", "depth");
	const brand = lookalike(parsed.host);
	if (brand) push(reasons, signals, points, 34, `The name imitates ${brand}, but it is not that company's usual domain.`, "lookalike");
	for (const domain of watched) if (bare === domain) {
		points.n = Math.min(points.n, 12);
		reasons.unshift(`This matches ${domain}, a domain your business is watching.`);
		signals.push("watched-exact");
	} else if (levenshtein(bare, domain) > 0 && levenshtein(bare, domain) <= 2) push(reasons, signals, points, 36, `This is close to ${domain}, a domain your business is watching, but it is not the same.`, "watched-near");
	let score = clamp(points.n);
	if (isOfficial(parsed.host) && !signals.includes("watched-near")) {
		score = Math.min(score, 18);
		reasons.unshift("The address matches a widely used public domain. That still does not prove this message is allowed to send you there.");
	}
	if (reasons.length === 0) reasons.push("Nothing in the address text itself looks like a classic fake.");
	const actions = score >= 35 ? [
		"Don't enter a password, card, or OTP on this page.",
		"If you meant a real company, type their address yourself or open the app you installed.",
		"Don't pay a fee you were not already expecting."
	] : ["We only read the address. We did not open the page.", "Before you sign in, confirm you chose this site yourself."];
	return {
		score,
		reasons: reasons.slice(0, 5),
		actions,
		signals
	};
}
function scoreInvestment(text) {
	const base = scoreMessage(text);
	const reasons = [...base.reasons];
	const signals = [...base.signals];
	const points = { n: base.score };
	const t = text.toLowerCase();
	if (/withdraw(al)? (is )?locked|tax to withdraw|gas fee|upgrade (the )?account|minimum deposit|vip (slot|group)/.test(t)) push(reasons, signals, points, 18, "Withdrawal is blocked until you pay something else. That is a classic trap.", "locked");
	if (/telegram|whatsapp/.test(t) && /(signal|account manager|mentor|trader)/.test(t)) push(reasons, signals, points, 12, "A stranger in chat is acting as your account manager.", "manager");
	if (/celebrity|influencer|pastor|guaranteed/.test(t)) push(reasons, signals, points, 8, "Fame or certainty is being used as proof.", "fame");
	if (/forex|crypto|bitcoin|usdt|roi|binary/.test(t) && points.n < 30) push(reasons, signals, points, 8, "High-return trading language with no way to check a licence from here.", "trading");
	const score = clamp(points.n);
	const actions = score < 35 ? ["If they later ask for a deposit, a tax, or a “verification” fee, stop and check again.", "Look the company up outside the chat that introduced it."] : [
		"Don't deposit, and don't pay a fee to unlock a withdrawal.",
		"The profit on the dashboard is not your money until a real bank shows it.",
		"Search the platform name plus “scam” and “withdrawal” before you trust a screenshot."
	];
	return {
		score,
		reasons: reasons.slice(0, 5),
		actions,
		signals
	};
}
function hintLines(report) {
	if (report.score < 20) return ["No strong scam pattern yet. The Guardian score still needs a full check."];
	return report.reasons.slice(0, 3);
}
function scoreNumber(kind, value, context) {
	const label = kind === "phone" ? `Phone number ${value}` : `Account number ${value}`;
	const blob = context.trim() ? `${label}\n${context.trim()}` : label;
	const base = scoreMessage(blob);
	const reasons = [...base.reasons];
	const signals = [...base.signals];
	const points = { n: base.score };
	if (kind === "account" && /(send|transfer|pay|deposit|credit)/i.test(blob)) push(reasons, signals, points, 12, "A payment is being steered to an account that arrived in chat.", "steered-account");
	if (kind === "phone" && /new (phone )?number|don'?t call|do not call/.test(blob.toLowerCase())) push(reasons, signals, points, 8, "The number is asking to replace one you already trust.", "new-number");
	if (context.trim().length < 8 && signals.length === 0) {
		reasons.length = 0;
		reasons.push(kind === "phone" ? "A phone number alone is not proof of a scam. The risk is who claims to own it." : "An account number in a chat is not a receipt. Confirm it on a channel you already trust.");
		points.n = Math.max(points.n, 18);
	}
	const score = clamp(points.n);
	const actions = score < 35 ? ["If they later ask for money or a code, check the whole message before you act.", kind === "phone" ? "Call back only from a number you saved before today." : "Match this account against the last payment you actually made, not against this chat."] : kind === "account" ? [
		"Don't transfer to this account from the message alone.",
		"Confirm it by calling a number you already had on file.",
		"If you already paid, contact your bank today."
	] : [
		"Don't send money or a code to this number.",
		"Call the person on the number already in your phone.",
		"If they claim to be your bank, use the number on your card."
	];
	return {
		score,
		reasons: reasons.slice(0, 5),
		actions,
		signals
	};
}
//#endregion
export { scoreMessage as a, scoreInvestment as i, hintLines as n, scoreNumber as o, isProtectedDomain as r, scoreUrl as s, band as t };
