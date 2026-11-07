import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, b as Link, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as PageIntro, u as useCurrentUserState } from "./ui-CPX071CA.mjs";
import { n as MarketingBar, t as Authed, x as listArticles } from "./frame-Cqg4edXm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/learn.index-DtfHSdqg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LearnRoute() {
	const { user, isPending } = useCurrentUserState();
	const page = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LearnIndex, {});
	if (isPending || !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketingBar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto w-full max-w-3xl px-4 py-8",
			children: page
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Authed, { children: page });
}
function LearnIndex() {
	const [articles, setArticles] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let cancel = false;
		listArticles().then((rows) => {
			if (!cancel) setArticles(rows);
		}).catch((err) => {
			if (!cancel) setError(err instanceof Error ? err.message : "Lessons did not load.");
		});
		return () => {
			cancel = true;
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			kicker: "LESSONS",
			title: "The tricks, in plain language",
			body: "Read these before you need them. None of them ask you to sign in."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to: "/playbooks",
			className: "panel card-link mb-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-primary",
					children: "REHEARSAL"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 font-semibold",
					children: "Walk a situation before it happens"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Four playbooks. Family voice, a bank threat, a trading group, a changed account."
				})
			]
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-danger",
			children: error
		}) : null,
		!articles ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-24 animate-pulse rounded-lg bg-surface" }) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "space-y-3",
			children: (articles ?? []).map((article) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/learn/$slug",
				params: { slug: article.slug },
				className: "panel card-link",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-primary",
						children: article.category
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-1 font-semibold",
						children: article.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-faint",
						children: [article.minutes, " min"]
					})
				]
			}) }, article.slug))
		})
	] });
}
//#endregion
export { LearnRoute as component };
