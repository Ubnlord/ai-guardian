import { b as Link, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as PLAN_ORDER, t as PLANS } from "./watch-CyReOAKX.mjs";
import { d as Link2, m as Image, p as Landmark, u as MessageSquareWarning } from "../_libs/lucide-react.mjs";
import { u as useCurrentUserState } from "./ui-CPX071CA.mjs";
import { n as MarketingBar } from "./frame-Cqg4edXm.mjs";
import { n as StaticExample } from "./verdict-D5NhtWvN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Bmq7GhyH.js
var import_jsx_runtime = require_jsx_runtime();
var CHECKS = [
	{
		icon: MessageSquareWarning,
		title: "Messages",
		body: "SMS, WhatsApp, email, DMs. The “I lost my phone” text. The OTP that wants your BVN."
	},
	{
		icon: Link2,
		title: "Links",
		body: "Lookalike banks, shortened URLs, and addresses that dress up as a brand you trust."
	},
	{
		icon: Image,
		title: "Scans",
		body: "Photos, IDs, passports, documents, and a short video. A live scan reads a few frames. It does not call a government register."
	},
	{
		icon: Landmark,
		title: "Investments",
		body: "Crypto, forex, giveaways, and anyone who can double your money by tonight."
	}
];
function Landing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MarketingBar, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-14 md:grid-cols-2 md:py-24",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow",
							children: "BEFORE YOU CLICK, PAY, OR REPLY"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "display mt-5",
							children: "Is this safe?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-5 max-w-md text-base text-muted md:text-lg",
							children: "AI Guardian is the safety layer between you and the internet. Paste the message, the link, the photo, or the offer. Get a straight answer and the next move."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex flex-wrap gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrimaryCta, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								href: "#how",
								className: "btn inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm font-semibold text-fg",
								children: "How a score works"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-5 max-w-sm text-sm text-faint",
							children: "Built for the scams people actually get — cloned banks, fake forex, and a voice that sounds like family."
						})
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-3 font-mono text-xs tracking-widest text-faint",
						children: "SAMPLE VERDICT"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StaticExample, {})] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "border-t border-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto grid w-full max-w-6xl gap-4 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4",
						children: CHECKS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "panel",
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
									className: "mt-2 text-sm text-muted",
									children: item.body
								})
							]
						}, item.title))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "border-t border-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 md:grid-cols-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "md:col-span-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs tracking-widest text-primary",
								children: "BEFORE THE TRANSFER"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 text-2xl font-semibold tracking-tight",
								children: "Three things a score by itself doesn't do"
							})]
						}), [
							["Check the number", "Paste the phone or the 10-digit account with what they said. The ask is the evidence, not the digits."],
							["Guardian Watch", "Report a number that tried you. The next person who pastes it sees that someone already did. Your name stays off it."],
							["Playbooks", "Family voice, a bank countdown, a task group, a new supplier account. A few questions, then the next move."]
						].map(([title, body]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-semibold",
							children: title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: body
						})] }, title))]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					id: "how",
					className: "border-t border-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 md:grid-cols-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-xs tracking-widest text-primary",
							children: "THE SCORE"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-2 text-2xl font-semibold",
							children: "One number. A reason. A next step."
						})] }), [
							[
								"Safe",
								"var(--color-primary)",
								"Nothing in it is asking for money, secrets, or a rush. Still yours to judge."
							],
							[
								"Suspicious",
								"var(--color-warn)",
								"Something is off. Pause. Verify on a channel you already trust."
							],
							[
								"High risk",
								"var(--color-danger)",
								"Don't pay. Don't tap. Don't send the code. Call the saved number."
							]
						].map(([title, band, body]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "band",
							style: { ["--band"]: band },
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold",
								children: title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted",
								children: body
							})]
						}, title))]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "border-t border-line bg-surface",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 md:grid-cols-2 md:items-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-xs tracking-widest text-primary",
								children: "FAMILY GUARDIAN"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 text-3xl font-semibold tracking-tight",
								children: "A private phrase beats a familiar voice."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-muted",
								children: "Mom, Dad, the children, grandparents. When someone says “I’m your son, send ₦200,000, don’t call this number,” the circle already knows what to ask. The phrase is stored as a hash. Guardian never shows it back."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "space-y-3",
							children: [
								"Create a circle and share the invite code.",
								"Set a nonsense sentence only your people know.",
								"If a high-risk check should warn the others, you turn that on. It stays off until you do."
							].map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex gap-3 rounded-lg bg-bg p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-sm text-primary",
									children: ["0", index + 1]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm",
									children: step
								})]
							}, step))
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					id: "pricing",
					className: "border-t border-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto w-full max-w-6xl px-4 py-14",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-3xl font-semibold tracking-tight",
								children: "Plans"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 max-w-xl text-sm text-muted",
								children: "Card checkout is not connected yet. Choosing a plan stores it on your account so the limits are real. Nothing is charged in this preview."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4",
								children: PLAN_ORDER.map((id) => {
									const plan = PLANS[id];
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
										className: `panel flex flex-col ${plan.highlight ? "shadow-card-hover" : ""}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "font-semibold",
												children: plan.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-2 font-mono text-2xl tabular-nums",
												children: [plan.price, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "ml-1 font-sans text-xs text-muted",
													children: plan.cadence
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 text-sm text-muted",
												children: plan.blurb
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
												className: "mt-4 flex-1 space-y-2 text-sm",
												children: plan.features.map((feature) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: feature }, feature))
											})
										]
									}, id);
								})
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					id: "privacy",
					className: "border-t border-line",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto w-full max-w-6xl px-4 py-14",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl font-semibold",
							children: "What we keep"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 max-w-2xl text-sm text-muted",
							children: "A check sends the text — or the image, for that one review — to the model. Images are not stored. You can turn off saved history, delete a check, or wipe the list. High-risk alerts reach your family only if you switch that on. Guardian is not your bank, and a low score is not permission to send money."
						})]
					})
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-line px-4 py-6 text-center text-xs text-faint",
				children: "AI Guardian · a second look, not a guarantee"
			})
		]
	});
}
function PrimaryCta() {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-flex h-11 w-36 animate-pulse rounded-md bg-surface-2" });
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/home",
		className: "btn inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-ink",
		children: "Open Guardian"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/login",
		className: "btn inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-ink",
		children: "Check something"
	});
}
//#endregion
export { Landing as component };
