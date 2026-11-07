import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as PLAN_ORDER, t as PLANS } from "./watch-CyReOAKX.mjs";
import { i as PageIntro, l as useCurrentUser, r as Notice, t as Button } from "./ui-CPX071CA.mjs";
import { A as setPlan, M as useGuardian, t as Authed } from "./frame-Cqg4edXm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/plans-rqZQ3Plg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PlansRoute() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Authed, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlansPage, {}) });
}
function PlansPage() {
	const user = useCurrentUser();
	const me = useGuardian((s) => s.me);
	const setMe = useGuardian((s) => s.setMe);
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			kicker: "PLANS",
			title: "Pick the allowance you need",
			body: "Payments are not connected. Choosing a plan updates your account so the limits work. Nothing is charged."
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
				tone: "danger",
				children: error
			})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid gap-4 md:grid-cols-2",
			children: PLAN_ORDER.map((id) => {
				const plan = PLANS[id];
				const current = me?.plan === id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: `panel flex flex-col ${plan.highlight ? "shadow-card-hover" : ""}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold",
								children: plan.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xl tabular-nums",
								children: plan.price
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-faint",
							children: plan.cadence
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: plan.blurb
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-1 text-sm",
							children: plan.features.map((feature) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: feature }, feature))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4",
							variant: current ? "quiet" : "primary",
							disabled: current || busy !== null,
							onClick: () => {
								if (!user?.id) return;
								setBusy(id);
								setError(null);
								setPlan({ data: { plan: id } }).then((next) => setMe(user.id, next)).catch((err) => setError(err instanceof Error ? err.message : "Could not change plan.")).finally(() => setBusy(null));
							},
							children: current ? "Current plan" : busy === id ? "Saving…" : "Use this plan"
						})
					]
				}, id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 text-xs text-faint",
			children: "Voice and deepfake audio checks are next. Image review is already here, and it will tell you when it is unsure. A hard hourly cap keeps one account from draining the AI budget."
		})
	] });
}
//#endregion
export { PlansRoute as component };
