import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, b as Link, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { u as useCurrentUserState } from "./ui-CPX071CA.mjs";
import { n as MarketingBar, t as Authed, x as listArticles } from "./frame-Cqg4edXm.mjs";
import { n as Route$1 } from "./router-Ba-1Fh50.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/learn._slug-DkDCKFJe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ArticleRoute() {
	const { user, isPending } = useCurrentUserState();
	const page = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArticlePage, {});
	if (isPending || !user) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketingBar, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto w-full max-w-3xl px-4 py-8",
			children: page
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Authed, { children: page });
}
function ArticlePage() {
	const { slug } = Route$1.useParams();
	const [article, setArticle] = (0, import_react.useState)(void 0);
	(0, import_react.useEffect)(() => {
		let cancel = false;
		listArticles().then((rows) => {
			if (cancel) return;
			setArticle(rows.find((row) => row.slug === slug) ?? null);
		}).catch(() => {
			if (!cancel) setArticle(null);
		});
		return () => {
			cancel = true;
		};
	}, [slug]);
	if (article === void 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-32 animate-pulse rounded-lg bg-surface" });
	if (!article) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
		className: "text-2xl font-semibold",
		children: "That lesson is not here"
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/learn",
		className: "mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-primary",
		children: "All lessons"
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/learn",
			className: "text-sm font-semibold text-primary",
			children: "All lessons"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 font-mono text-xs tracking-widest text-primary",
			children: article.category
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mt-2 text-3xl font-semibold tracking-tight",
			children: article.title
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-1 text-xs text-faint",
			children: [article.minutes, " min read"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 space-y-4",
			children: article.body.split(/\n\n+/).map((paragraph) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-base leading-relaxed text-fg",
				children: paragraph
			}, paragraph.slice(0, 24)))
		})
	] });
}
//#endregion
export { ArticleRoute as component };
