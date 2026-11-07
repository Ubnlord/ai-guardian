import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as WATCH_CATEGORIES } from "./watch-CyReOAKX.mjs";
import { a as Panel, d as when, i as PageIntro, n as Field, r as Notice, s as TextInput, t as Button } from "./ui-CPX071CA.mjs";
import { D as reportScam, T as lookupWatch, t as Authed, w as listWatch } from "./frame-Cqg4edXm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/watch-BHd5xtf0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function WatchRoute() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Authed, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WatchPage, {}) });
}
var KINDS = [
	{
		id: "phone",
		label: "Phone"
	},
	{
		id: "account",
		label: "Account"
	},
	{
		id: "domain",
		label: "Domain"
	}
];
function WatchPage() {
	const [kind, setKind] = (0, import_react.useState)("phone");
	const [value, setValue] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("payment");
	const [lookup, setLookup] = (0, import_react.useState)(null);
	const [entries, setEntries] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [note, setNote] = (0, import_react.useState)(null);
	const [pending, setPending] = (0, import_react.useState)(null);
	function reload() {
		listWatch().then(setEntries).catch((err) => setError(err instanceof Error ? err.message : "Watch did not load."));
	}
	(0, import_react.useEffect)(() => {
		reload();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			kicker: "WATCH",
			title: "Numbers other people already flagged",
			body: "Your name stays off the list. A report is the number, the account, or the domain, plus what they tried. The next check that contains it will say so."
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
				tone: "danger",
				children: error
			})
		}) : null,
		note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
				tone: "ok",
				children: note
			})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-semibold",
				children: "Look it up"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: "This does not use one of your monthly checks."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 space-y-3",
				onSubmit: (event) => {
					event.preventDefault();
					setError(null);
					setNote(null);
					setPending("lookup");
					lookupWatch({ data: {
						kind,
						value
					} }).then((result) => {
						setLookup(result);
						if (!result.ok) setError(result.error);
					}).catch((err) => {
						setLookup(null);
						setError(err instanceof Error ? err.message : "That lookup did not finish.");
					}).finally(() => setPending(null));
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KindChips, {
						kind,
						onChange: setKind
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: kind === "phone" ? "Phone" : kind === "account" ? "Account" : "Domain",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							value,
							onChange: (event) => setValue(event.target.value),
							placeholder: kind === "phone" ? "0803 000 0000" : kind === "account" ? "0123456789" : "brand-login.xyz",
							autoCapitalize: "none",
							inputMode: kind === "domain" ? "url" : "numeric"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						disabled: pending !== null || value.trim().length < 4,
						children: pending === "lookup" ? "Looking…" : "Check Watch"
					})
				]
			}),
			lookup?.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-primary",
						children: lookup.display
					}),
					lookup.reports === 0 ? " has no reports yet." : ` has ${lookup.reports} report${lookup.reports === 1 ? "" : "s"}.`,
					lookup.alreadyReported ? " You already added this one." : ""
				]
			}) : null
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Report it"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Eight a day. One report per number. Don't write a story — pick the category. Real brand domains, like gtbank.com, are refused."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-4 space-y-3",
					onSubmit: (event) => {
						event.preventDefault();
						setError(null);
						setNote(null);
						setPending("report");
						reportScam({ data: {
							kind,
							value,
							category
						} }).then((result) => {
							if (!result.ok) {
								setError(result.error ?? "That report did not save.");
								return;
							}
							setNote("Reported. The next check that contains it will mention Watch.");
							setLookup(null);
							reload();
						}).catch((err) => setError(err instanceof Error ? err.message : "That report did not save.")).finally(() => setPending(null));
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: WATCH_CATEGORIES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setCategory(item.id),
							className: `chip ${category === item.id ? "chip-on" : ""}`,
							children: item.label
						}, item.id))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "quiet",
						disabled: pending !== null || value.trim().length < 4,
						children: pending === "report" ? "Saving…" : "Report this"
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Recently reported"
				}),
				!entries ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 h-16 animate-pulse rounded-md bg-bg" }) : null,
				entries && entries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "Nothing yet. If a number asked you for money, put it here. The lost-phone example uses 0803 445 2211 — report it, then check that message."
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 divide-y divide-line",
					children: (entries ?? []).map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3 py-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-mono",
								children: entry.display
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-faint",
								children: [
									entry.kind,
									" · ",
									when(entry.lastAt)
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "shrink-0 text-muted",
							children: [
								entry.reports,
								" report",
								entry.reports === 1 ? "" : "s"
							]
						})]
					}, `${entry.kind}-${entry.display}`))
				})
			]
		})
	] });
}
function KindChips({ kind, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-wrap gap-2",
		children: KINDS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onChange(item.id),
			className: `chip ${kind === item.id ? "chip-on" : ""}`,
			children: item.label
		}, item.id))
	});
}
//#endregion
export { WatchRoute as component };
