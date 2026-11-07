import { o as __toESM } from "../_runtime.mjs";
import { S as useNavigate, Z as require_react, b as Link, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Panel, d as when, l as useCurrentUser, o as TextArea, r as Notice, t as Button } from "./ui-CPX071CA.mjs";
import { M as useGuardian, _ as getDashboard, t as Authed } from "./frame-Cqg4edXm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/home-DSzWRAhM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HomeRoute() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Authed, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dashboard, {}) });
}
function Dashboard() {
	const user = useCurrentUser();
	const setMe = useGuardian((s) => s.setMe);
	const [data, setData] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [draft, setDraft] = (0, import_react.useState)("");
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (!user?.id) return;
		let cancel = false;
		getDashboard().then((next) => {
			if (cancel) return;
			setData(next);
			setMe(user.id, next.me);
		}).catch((err) => {
			if (!cancel) setError(err instanceof Error ? err.message : "Could not load your dashboard.");
		});
		return () => {
			cancel = true;
		};
	}, [user?.id, setMe]);
	const hour = (/* @__PURE__ */ new Date()).getHours();
	const hello = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
	const name = data?.me.displayName || user?.displayName || "there";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-xs tracking-widest text-primary",
			children: "DASHBOARD"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
			className: "mt-1 text-2xl font-semibold tracking-tight md:text-3xl",
			children: [
				hello,
				", ",
				name.split(" ")[0]
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 max-w-xl text-sm text-muted",
			children: "Paste the thing that made you hesitate. Check it before you answer."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mt-6",
			onSubmit: (event) => {
				event.preventDefault();
				sessionStorage.setItem("guardian-draft", draft);
				navigate({ to: "/check/message" });
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextArea, {
				value: draft,
				onChange: (event) => setDraft(event.target.value),
				placeholder: "Paste a message here…",
				className: "min-h-28"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					disabled: draft.trim().length < 8,
					children: "Check this message"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/check",
					className: "inline-flex min-h-11 items-center rounded-md bg-surface-2 px-4 text-sm font-semibold",
					children: "Other checks"
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-3 sm:grid-cols-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quick, {
					to: "/check/number",
					title: "Number",
					body: "Phone or account before you transfer."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quick, {
					to: "/check/image",
					title: "Scan",
					body: "Photo, ID, passport, or a short video."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quick, {
					to: "/watch",
					title: "Watch",
					body: "See if others already flagged it."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quick, {
					to: "/playbooks",
					title: "Playbook",
					body: "Walk the moment before you pay."
				})
			]
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
				tone: "danger",
				children: error
			})
		}) : null,
		!data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-6 h-24 animate-pulse rounded-lg bg-surface" }) : null,
		data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 grid grid-cols-2 gap-3 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Checks",
						value: data.counts.total
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "High risk",
						value: data.counts.high_risk
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Suspicious",
						value: data.counts.suspicious
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Safe",
						value: data.counts.safe
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quota, {
				used: data.me.checksUsed,
				limit: data.me.checksLimit
			}),
			data.watch.hot.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "On Watch"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/watch",
						className: "text-sm font-semibold text-primary",
						children: [data.watch.week, " this week"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: data.watch.hot.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate font-mono",
							children: item.display
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "shrink-0 text-faint",
							children: [
								item.reports,
								" report",
								item.reports === 1 ? "" : "s"
							]
						})]
					}, `${item.kind}-${item.display}`))
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-sm text-muted",
				children: [
					"Watch is empty this week. If a number asked you for money,",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/watch",
						className: "font-semibold text-primary",
						children: "report it"
					}),
					"."
				]
			}),
			data.alerts[0] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Notice, {
					tone: "danger",
					children: [
						data.alerts[0].label,
						" flagged a high-risk check: ",
						data.alerts[0].headline
					]
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold",
						children: "Recent"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/history",
						className: "text-sm font-semibold text-primary",
						children: "History"
					})]
				}), data.recent.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: "No checks yet. The first one is the message you almost replied to."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 divide-y divide-line",
					children: data.recent.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3 py-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sm font-medium",
								children: item.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-faint",
								children: [
									item.kind,
									" · ",
									when(item.createdAt)
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-sm tabular-nums",
							children: item.score
						})]
					}, item.id))
				})]
			})
		] }) : null
	] });
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-faint",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 font-mono text-2xl font-semibold tabular-nums",
			children: value
		})]
	});
}
function Quick({ to, title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: "panel card-link px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-semibold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-muted",
			children: body
		})]
	});
}
function Quota({ used, limit }) {
	const pct = Math.min(100, Math.round(used / Math.max(1, limit) * 100));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex justify-between text-xs text-faint",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				used,
				" of ",
				limit,
				" checks this month"
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/plans",
				className: "font-semibold text-primary",
				children: "Plans"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "quota-track mt-2",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "quota-fill",
				style: { width: `${pct}%` }
			})
		})]
	});
}
//#endregion
export { HomeRoute as component };
