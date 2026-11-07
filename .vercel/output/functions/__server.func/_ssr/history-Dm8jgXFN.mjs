import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { d as when, i as PageIntro, l as useCurrentUser, t as Button } from "./ui-CPX071CA.mjs";
import { C as listHistory, f as clearHistory, m as deleteCheck, t as Authed } from "./frame-Cqg4edXm.mjs";
import { r as VerdictCard } from "./verdict-D5NhtWvN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/history-Dm8jgXFN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HistoryRoute() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Authed, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HistoryPage, {}) });
}
function HistoryPage() {
	const user = useCurrentUser();
	const [rows, setRows] = (0, import_react.useState)(null);
	const [kind, setKind] = (0, import_react.useState)("all");
	const [verdict, setVerdict] = (0, import_react.useState)("all");
	const [open, setOpen] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!user?.id) return;
		let cancel = false;
		listHistory().then((next) => {
			if (!cancel) setRows(next);
		}).catch((err) => {
			if (!cancel) setError(err instanceof Error ? err.message : "Could not load history.");
		});
		return () => {
			cancel = true;
		};
	}, [user?.id]);
	const visible = (rows ?? []).filter((row) => (kind === "all" || row.kind === kind) && (verdict === "all" || row.verdict === verdict));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			kicker: "HISTORY",
			title: "Your risk record",
			body: "Scores stay here unless you turn off history or delete them."
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-4 text-sm text-danger",
			children: error
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex flex-wrap gap-2",
			children: [
				"all",
				"message",
				"number",
				"url",
				"image",
				"investment"
			].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Filter, {
				on: kind === item,
				label: item,
				onClick: () => setKind(item)
			}, item))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 flex flex-wrap gap-2",
			children: [
				"all",
				"safe",
				"suspicious",
				"high_risk"
			].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Filter, {
				on: verdict === item,
				label: item === "high_risk" ? "high risk" : item,
				onClick: () => setVerdict(item)
			}, item))
		}),
		!rows ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-6 h-24 animate-pulse rounded-lg bg-surface" }) : null,
		rows && visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 text-sm text-muted",
			children: "Nothing in this filter yet."
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 space-y-3",
			children: visible.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "w-full text-left",
				onClick: () => setOpen(open === row.id ? null : row.id),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 shadow-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-medium",
							children: row.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-faint",
							children: [
								row.kind,
								" · ",
								when(row.createdAt)
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono tabular-nums",
						children: row.score
					})]
				})
			}), open === row.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VerdictCard, { analysis: row }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "danger",
					onClick: () => {
						deleteCheck({ data: { id: row.id } }).then(() => {
							setRows((current) => current?.filter((item) => item.id !== row.id) ?? null);
						});
					},
					children: "Delete this check"
				})]
			}) : null] }, row.id))
		}),
		rows && rows.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			className: "mt-6",
			onClick: () => {
				if (!window.confirm("Delete every saved check on this account?")) return;
				clearHistory().then(() => setRows([]));
			},
			children: "Clear all history"
		}) : null
	] });
}
function Filter({ on, label, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: `chip capitalize ${on ? "chip-on" : ""}`,
		children: label
	});
}
//#endregion
export { HistoryRoute as component };
