import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as when } from "./ui-CPX071CA.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/verdict-D5NhtWvN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function safeReply(analysis) {
	if (analysis.verdict === "safe") return null;
	const blob = `${analysis.title} ${analysis.summary} ${analysis.reasons.join(" ")}`.toLowerCase();
	if (/otp|pin|bvn|nin|password|secret/.test(blob)) return "I won't share a code, PIN, BVN, or password here. I'll open the official app myself.";
	if (/money|pay|transfer|account|naira|invoice|watch/.test(blob) || analysis.verdict === "high_risk") return "I can't send money or codes from this chat. I'll reach you on the number I already have.";
	return "I need to confirm this on a channel I already trust. I won't tap a link or share a code here.";
}
function circleWarning(analysis) {
	if (analysis.verdict === "safe") return null;
	return `Guardian marked a check as ${analysis.verdict === "high_risk" ? "high risk" : "suspicious"}: ${analysis.title}. Don't send money until we talk on a number we already saved.`;
}
var TONE = {
	safe: {
		label: "SAFE",
		ring: "var(--color-primary)",
		text: "text-primary",
		soft: "bg-primary-soft"
	},
	suspicious: {
		label: "SUSPICIOUS",
		ring: "var(--color-warn)",
		text: "text-warn",
		soft: "bg-warn-soft"
	},
	high_risk: {
		label: "HIGH RISK",
		ring: "var(--color-danger)",
		text: "text-danger",
		soft: "bg-danger-soft"
	}
};
function ScoreMark({ score, verdict, size = "md", live = false }) {
	const tone = TONE[verdict];
	const shown = useSweepNumber(score, live);
	const box = size === "sm" ? "size-16" : "size-28";
	const type = size === "sm" ? "text-lg" : "text-3xl";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `relative grid ${box} shrink-0 place-items-center`,
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `score-ring absolute inset-0 rounded-full ${live ? "score-draw" : ""}`,
			style: {
				["--ring"]: tone.ring,
				["--score"]: String(score)
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `relative font-mono font-semibold tabular-nums ${type}`,
			children: shown
		})]
	});
}
function useSweepNumber(target, live) {
	const [value, setValue] = (0, import_react.useState)(live ? 0 : target);
	(0, import_react.useEffect)(() => {
		if (!live) {
			setValue(target);
			return;
		}
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setValue(target);
			return;
		}
		const start = performance.now();
		let frame = 0;
		const tick = (now) => {
			const t = Math.min(1, (now - start) / 900);
			const eased = 1 - (1 - t) ** 3;
			setValue(Math.round(eased * target));
			if (t < 1) frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [target, live]);
	return value;
}
function VerdictCard({ analysis, compact = false, reply = true, live = false }) {
	const tone = TONE[analysis.verdict];
	const say = !compact && reply ? safeReply(analysis) : null;
	const warn = !compact && reply ? circleWarning(analysis) : null;
	const rise = live ? "reveal" : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreMark, {
					score: analysis.score,
					verdict: analysis.verdict,
					size: compact ? "sm" : "md",
					live
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `min-w-0 flex-1 ${rise}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `font-mono text-xs tracking-widest ${tone.text}`,
							children: tone.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-1 text-lg font-semibold tracking-tight md:text-xl",
							children: analysis.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: analysis.summary
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-2 text-xs text-faint",
							children: [
								analysis.source === "ai" ? "Reviewed with AI" : "Pattern rules only",
								" · ",
								when(analysis.createdAt)
							]
						})
					]
				})]
			}),
			compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-4 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: rise,
					style: live ? { animationDelay: "120ms" } : void 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-semibold",
						children: "Why"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "reason-list mt-3",
						style: { ["--mark"]: tone.ring },
						children: analysis.reasons.map((reason, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: rise,
							style: live ? { animationDelay: `${180 + index * 70}ms` } : void 0,
							children: reason
						}, reason))
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `rounded-lg p-4 ${tone.soft} ${rise}`,
					style: live ? { animationDelay: "220ms" } : void 0,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "text-sm font-semibold",
						children: "What to do"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-2",
						children: analysis.actions.map((action) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-sm",
							children: action
						}, action))
					})]
				})]
			}),
			say ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBlock, {
				label: "Reply you can send",
				text: say,
				className: rise,
				delay: live ? "320ms" : void 0
			}) : null,
			warn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyBlock, {
				label: "Text for your circle",
				text: warn,
				className: rise,
				delay: live ? "400ms" : void 0
			}) : null,
			analysis.uncertainty ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `mt-4 text-xs text-faint ${rise}`,
				style: live ? { animationDelay: "460ms" } : void 0,
				children: analysis.uncertainty
			}) : null
		]
	});
}
function CopyBlock({ label, text, className = "", delay }) {
	const [state, setState] = (0, import_react.useState)("idle");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `mt-4 rounded-lg bg-bg p-4 ${className}`,
		style: delay ? { animationDelay: delay } : void 0,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-semibold",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 shrink-0 rounded-md bg-surface-2 px-3 text-sm font-semibold",
					onClick: () => {
						navigator.clipboard.writeText(text).then(() => {
							setState("copied");
							window.setTimeout(() => setState("idle"), 1600);
						}).catch(() => setState("failed"));
					},
					children: state === "copied" ? "Copied" : "Copy"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: text
			}),
			state === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-faint",
				children: "Select the text and copy it yourself."
			}) : null
		]
	});
}
function StaticExample() {
	const analysis = {
		id: "example",
		kind: "message",
		verdict: "high_risk",
		score: 92,
		title: "Possible impersonation",
		summary: "This reads like a relative in trouble who does not want you to use the number you already have. The money request is the point of the message.",
		reasons: [
			"Urgent request for ₦200,000",
			"Tells you not to call the saved number",
			"New sender claiming to be your son",
			"Payment destination you cannot verify"
		],
		actions: [
			"Don't send the money",
			"Call your son on the number already in your phone",
			"Ask for the family phrase if you have one"
		],
		uncertainty: "The words alone cannot prove who typed them.",
		source: "rules",
		excerpt: "",
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerdictCard, {
		analysis,
		reply: false,
		live: true
	});
}
//#endregion
export { StaticExample as n, VerdictCard as r, ScoreMark as t };
