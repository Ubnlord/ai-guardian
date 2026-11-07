import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, b as Link, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as PLAN_ORDER } from "./watch-CyReOAKX.mjs";
import { a as Panel, d as when, i as PageIntro, l as useCurrentUser, o as TextArea, r as Notice, s as TextInput, t as Button } from "./ui-CPX071CA.mjs";
import { M as useGuardian, a as adminSetPlan, g as getAdmin, i as adminSaveArticle, o as adminSetRole, t as Authed } from "./frame-Cqg4edXm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-DZJPdkkZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminRoute() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Authed, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPage, {}) });
}
function AdminPage() {
	const user = useCurrentUser();
	const me = useGuardian((s) => s.me);
	const [data, setData] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [tab, setTab] = (0, import_react.useState)("overview");
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [title, setTitle] = (0, import_react.useState)("");
	const [body, setBody] = (0, import_react.useState)("");
	function reload() {
		getAdmin().then(setData).catch((err) => setError(err instanceof Error ? err.message : "Admin data is not available."));
	}
	(0, import_react.useEffect)(() => {
		if (!user?.id || me?.role !== "admin") return;
		reload();
	}, [user?.id, me?.role]);
	if (me && me.role !== "admin") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
		title: "Admin",
		body: "This account is not an admin."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/home",
		className: "text-sm font-semibold text-primary",
		children: "Back to the dashboard"
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			kicker: "ADMIN",
			title: "The whole system, lightly",
			body: "Counts and headlines. Not the full text of anyone's messages."
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
				tone: "danger",
				children: error
			})
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4 flex gap-2",
			children: [
				"overview",
				"people",
				"lessons"
			].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setTab(item),
				className: `min-h-11 rounded-md px-3 text-sm capitalize ${tab === item ? "bg-primary-soft text-primary" : "bg-surface text-muted"}`,
				children: item
			}, item))
		}),
		!data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-28 animate-pulse rounded-lg bg-surface" }) : null,
		data && tab === "overview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "People",
						value: data.users
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Checks",
						value: data.checks
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "High risk",
						value: data.highRisk
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-faint",
				children: ["Plans: ", data.plans.map((row) => `${row.plan} ${row.n}`).join(" · ") || "none yet"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[32rem] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-xs text-faint",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "When"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "Who"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "Kind"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "Score"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-2 font-medium",
								children: "Headline"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: data.recent.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-line",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2 pr-3 text-faint",
								children: when(row.createdAt)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2 pr-3",
								children: row.displayName
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2 pr-3",
								children: row.kind
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2 pr-3 font-mono tabular-nums",
								children: row.score
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-2",
								children: row.title
							})
						]
					}, row.id)) })]
				})
			})
		] }) : null,
		data && tab === "people" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[36rem] text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-xs text-faint",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 font-medium",
							children: "Name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 font-medium",
							children: "Plan"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 font-medium",
							children: "Role"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "py-2 font-medium",
							children: "Used"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: data.people.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-line",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "py-3 pr-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: person.displayName }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-faint",
								children: person.email
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-3 pr-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								className: "min-h-11 rounded-md border border-line bg-bg px-2",
								value: person.plan,
								onChange: (event) => {
									const plan = event.target.value;
									adminSetPlan({ data: {
										userId: person.userId,
										plan
									} }).then(reload);
								},
								children: PLAN_ORDER.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: id,
									children: id
								}, id))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-3 pr-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "quiet",
								onClick: () => {
									adminSetRole({ data: {
										userId: person.userId,
										role: person.role === "admin" ? "member" : "admin"
									} }).then((result) => {
										if (!result.ok) setError(result.error ?? "Could not change the role.");
										else reload();
									});
								},
								children: person.role === "admin" ? "Make member" : "Make admin"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-3 font-mono tabular-nums",
							children: person.checksUsed
						})
					]
				}, person.userId)) })]
			})
		}) : null,
		data && tab === "lessons" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: data.articles.map((article) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "min-h-11 text-left font-semibold",
					onClick: () => {
						setEditing(article.slug);
						setTitle(article.title);
						setBody(article.body);
					},
					children: article.title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-faint",
					children: article.category
				}),
				editing === article.slug ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-3 space-y-3",
					onSubmit: (event) => {
						event.preventDefault();
						adminSaveArticle({ data: {
							slug: article.slug,
							title,
							body,
							published: true
						} }).then(() => {
							setEditing(null);
							reload();
						});
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							value: title,
							onChange: (event) => setTitle(event.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
							value: body,
							onChange: (event) => setBody(event.target.value),
							className: "min-h-48"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: "Save lesson"
						})
					]
				}) : null
			] }, article.slug))
		}) : null
	] });
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-line bg-surface px-3 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-faint",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-2xl font-semibold tabular-nums",
			children: value
		})]
	});
}
//#endregion
export { AdminRoute as component };
