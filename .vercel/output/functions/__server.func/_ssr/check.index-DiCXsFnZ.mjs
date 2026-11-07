import { b as Link, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as Link2, l as Phone, m as Image, p as Landmark, u as MessageSquareWarning } from "../_libs/lucide-react.mjs";
import { i as PageIntro } from "./ui-CPX071CA.mjs";
import { t as Authed } from "./frame-Cqg4edXm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/check.index-DiCXsFnZ.js
var import_jsx_runtime = require_jsx_runtime();
var ITEMS = [
	{
		to: "/check/message",
		title: "Message",
		body: "SMS, WhatsApp, email, DM.",
		icon: MessageSquareWarning
	},
	{
		to: "/check/number",
		title: "Number",
		body: "A phone or account before you transfer.",
		icon: Phone
	},
	{
		to: "/check/url",
		title: "Link",
		body: "Before you type a password.",
		icon: Link2
	},
	{
		to: "/check/image",
		title: "Scan",
		body: "Photo, ID, passport, document, or a short video.",
		icon: Image
	},
	{
		to: "/check/investment",
		title: "Investment",
		body: "Crypto, forex, and guaranteed profit.",
		icon: Landmark
	}
];
function CheckHubRoute() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Authed, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
		kicker: "CHECK",
		title: "What do you want to test?",
		body: "One question. Pick the shape it arrived in."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-3 sm:grid-cols-2",
		children: ITEMS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: item.to,
			className: "panel card-link",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "icon-well",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
						className: "size-5",
						strokeWidth: 1.75,
						"aria-hidden": "true"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 font-semibold",
					children: item.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: item.body
				})
			]
		}, item.to))
	})] });
}
//#endregion
export { CheckHubRoute as component };
