import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, b as Link, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Panel, d as when, i as PageIntro, l as useCurrentUser, n as Field, r as Notice, s as TextInput, t as Button } from "./ui-CPX071CA.mjs";
import { M as useGuardian, N as verifyPhrase, O as setMemberLabel, b as leaveFamily, h as deleteFamily, k as setPhrase, p as createFamily, t as Authed, v as getFamily, y as joinFamily } from "./frame-Cqg4edXm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/family-Qv0EN8MD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FamilyRoute() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Authed, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FamilyPage, {}) });
}
function FamilyPage() {
	const user = useCurrentUser();
	const me = useGuardian((s) => s.me);
	const [view, setView] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [name, setName] = (0, import_react.useState)("Our family");
	const [code, setCode] = (0, import_react.useState)("");
	const [label, setLabel] = (0, import_react.useState)("");
	const [phrase, setPhraseText] = (0, import_react.useState)("");
	const [guess, setGuess] = (0, import_react.useState)("");
	const [match, setMatch] = (0, import_react.useState)(null);
	function reload() {
		if (!user?.id) return;
		getFamily().then(setView).catch((err) => setError(err instanceof Error ? err.message : "Could not load the circle."));
	}
	(0, import_react.useEffect)(() => {
		reload();
	}, [user?.id]);
	async function act(work) {
		setError(null);
		setMatch(null);
		const result = await work();
		if (!result.ok) setError(result.error ?? "That did not work.");
		else reload();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			kicker: "FAMILY",
			title: "A circle and a phrase",
			body: "When someone claims to be family and asks for money, you already know what to ask them."
		}),
		error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
				tone: "danger",
				children: error
			})
		}) : null,
		!view ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-28 animate-pulse rounded-lg bg-surface" }) : null,
		view && !view.family ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-4 md:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Start a circle"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: me && me.plan === "free" ? "Creating a circle starts on Guardian Plus. You can still join one with a code." : "Plus holds 2 people. Family holds 6. Business holds 15."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-4 space-y-3",
					onSubmit: (event) => {
						event.preventDefault();
						act(() => createFamily({ data: { name } }));
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Circle name",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							value: name,
							onChange: (event) => setName(event.target.value)
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Create circle"
					})]
				}),
				me?.plan === "free" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/plans",
					className: "mt-3 inline-block text-sm font-semibold text-primary",
					children: "See plans"
				}) : null
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-semibold",
				children: "Join with a code"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-4 space-y-3",
				onSubmit: (event) => {
					event.preventDefault();
					act(() => joinFamily({ data: { code } }));
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Invite code",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: code,
						onChange: (event) => setCode(event.target.value.toUpperCase()),
						autoCapitalize: "characters"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					variant: "quiet",
					children: "Join"
				})]
			})] })]
		}) : null,
		view?.family ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-xl font-semibold",
							children: view.family.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								view.family.seats,
								" of ",
								view.family.seatLimit,
								" seats",
								view.family.hasPhrase ? " · phrase is set" : " · no phrase yet"
							]
						})] }), view.family.inviteCode ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-md bg-bg px-3 py-2 font-mono text-lg tracking-widest text-primary",
							children: view.family.inviteCode
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: "Ask the owner for the invite code."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 divide-y divide-line",
						children: view.members.map((member) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-center justify-between py-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [member.label, member.isYou ? " · you" : ""] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-faint",
								children: member.role
							})]
						}, member.userId))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-4 flex flex-col gap-2 sm:flex-row",
						onSubmit: (event) => {
							event.preventDefault();
							act(() => setMemberLabel({ data: { label } }));
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							value: label,
							onChange: (event) => setLabel(event.target.value),
							placeholder: "Your label, like Mum"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							variant: "quiet",
							children: "Save label"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: view.family.isOwner ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "danger",
							onClick: () => {
								if (!window.confirm("Delete this circle for everyone?")) return;
								act(() => deleteFamily());
							},
							children: "Delete circle"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "quiet",
							onClick: () => void act(() => leaveFamily()),
							children: "Leave circle"
						})
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: "Verification phrase"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "A nonsense sentence. After you save it, nobody can read it back — including you. Reset by saving a new one."
						}),
						view.family.isOwner ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-3 space-y-3",
							onSubmit: (event) => {
								event.preventDefault();
								act(async () => {
									const result = await setPhrase({ data: { phrase } });
									if (result.ok) setPhraseText("");
									return result;
								});
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: view.family.hasPhrase ? "Replace the phrase" : "Set the phrase",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									value: phrase,
									onChange: (event) => setPhraseText(event.target.value),
									autoComplete: "off",
									placeholder: "The green kettle sings at dawn"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Save phrase"
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: "Only the owner can set or replace the phrase."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: "Verify the person"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: "Ask them for the phrase. Type what they say. Do not read the phrase out first."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-3 space-y-3",
							onSubmit: (event) => {
								event.preventDefault();
								setError(null);
								verifyPhrase({ data: { phrase: guess } }).then((result) => {
									if (!result.ok) setError(result.error ?? "Could not check that.");
									else setMatch(result.match);
								});
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "What they said",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
									value: guess,
									onChange: (event) => setGuess(event.target.value),
									autoComplete: "off"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								variant: "quiet",
								children: "Check phrase"
							})]
						}),
						match === true ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
								tone: "ok",
								children: "That matches the family phrase. You can still call them on the saved number."
							})
						}) : null,
						match === false ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
								tone: "danger",
								children: "That does not match. Do not send money. Call them on the number already in your phone."
							})
						}) : null
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: "Alerts"
				}), view.alerts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "No shared alerts. A high-risk check is shared only when that person turns it on in Settings."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-3",
					children: view.alerts.map((alert) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "border-t border-line pt-3 first:border-0 first:pt-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: alert.headline
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: alert.detail
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-faint",
								children: [
									alert.label,
									" · ",
									when(alert.createdAt)
								]
							})
						]
					}, alert.id))
				})] })
			]
		}) : null
	] });
}
//#endregion
export { FamilyRoute as component };
