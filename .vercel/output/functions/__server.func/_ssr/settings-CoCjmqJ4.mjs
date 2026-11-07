import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, b as Link, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Panel, i as PageIntro, l as useCurrentUser, n as Field, r as Notice, s as TextInput, t as Button } from "./ui-CPX071CA.mjs";
import { E as removeDomain, M as useGuardian, S as listDomains, f as clearHistory, j as updateSettings, r as addDomain, t as Authed } from "./frame-Cqg4edXm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-CoCjmqJ4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SettingsRoute() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Authed, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsPage, {}) });
}
function SettingsPage() {
	const user = useCurrentUser();
	const me = useGuardian((s) => s.me);
	const setMe = useGuardian((s) => s.setMe);
	const [name, setName] = (0, import_react.useState)("");
	const [storeHistory, setStoreHistory] = (0, import_react.useState)(true);
	const [share, setShare] = (0, import_react.useState)(false);
	const [domains, setDomains] = (0, import_react.useState)([]);
	const [domain, setDomain] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (!me) return;
		setName(me.displayName);
		setStoreHistory(me.storeHistory);
		setShare(me.shareHighRisk);
	}, [me]);
	(0, import_react.useEffect)(() => {
		if (!user?.id || me?.plan !== "business") return;
		listDomains().then(setDomains).catch(() => void 0);
	}, [user?.id, me?.plan]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			kicker: "SETTINGS",
			title: "Privacy and your name",
			body: "History is on by default. Family alerts are off until you opt in."
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
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "space-y-4",
			onSubmit: (event) => {
				event.preventDefault();
				if (!user?.id) return;
				setError(null);
				updateSettings({ data: {
					displayName: name,
					storeHistory,
					shareHighRisk: share
				} }).then((next) => {
					setMe(user.id, next);
					setNote("Saved.");
				}).catch((err) => setError(err instanceof Error ? err.message : "Could not save."));
			},
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Display name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: name,
						onChange: (event) => setName(event.target.value)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					on: storeHistory,
					label: "Save check history",
					hint: "Turn this off to keep the score in the moment, without storing the text.",
					onClick: () => setStoreHistory((value) => !value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					on: share,
					label: "Share high-risk checks with my circle",
					hint: "They see the headline and summary, not the full message. Off unless you switch it on.",
					onClick: () => setShare((value) => !value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: "Save settings"
				})
			]
		}) }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Watched domains"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "Business plan. Link checks warn when an address is close to a domain you list — your brand, your bank, your store."
				}),
				me?.plan === "business" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-3 flex flex-col gap-2 sm:flex-row",
					onSubmit: (event) => {
						event.preventDefault();
						addDomain({ data: { domain } }).then((result) => {
							if (!result.ok) setError(result.error ?? "Could not add that domain.");
							else {
								setDomain("");
								setError(null);
								listDomains().then(setDomains);
							}
						});
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: domain,
						onChange: (event) => setDomain(event.target.value),
						placeholder: "yourbrand.com",
						autoCapitalize: "none"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						variant: "quiet",
						children: "Watch"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: domains.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono",
							children: item
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 px-2 text-danger",
							onClick: () => {
								removeDomain({ data: { domain: item } }).then(() => {
									setDomains((current) => current.filter((row) => row !== item));
								});
							},
							children: "Remove"
						})]
					}, item))
				})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/plans",
					className: "mt-3 inline-block text-sm font-semibold text-primary",
					children: "Domain watch is on the Business plan"
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
			className: "mt-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Delete saved checks"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: "This removes your history. It does not delete your account or your circle."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "danger",
					className: "mt-3",
					onClick: () => {
						if (!window.confirm("Delete every saved check?")) return;
						clearHistory().then(() => setNote("History cleared."));
					},
					children: "Clear history"
				})
			]
		})
	] });
}
function Toggle({ on, label, hint, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-faint",
			children: hint
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			role: "switch",
			"aria-checked": on,
			onClick,
			className: `relative h-7 w-12 shrink-0 rounded-full ${on ? "bg-primary" : "bg-surface-2"}`,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `absolute top-0.5 size-6 rounded-full bg-fg transition ${on ? "left-5" : "left-0.5"}` })
		})]
	});
}
//#endregion
export { SettingsRoute as component };
