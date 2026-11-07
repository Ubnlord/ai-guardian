import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, b as Link, p as useRouterState, w as require_jsx_runtime, x as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { a as authMiddleware, i as asPlan, l as isWatchCategory, t as PLANS, u as resolveIdentifier } from "./watch-CyReOAKX.mjs";
import { i as signOut } from "./client-1vAx-gM_.mjs";
import { _ as BookOpen, a as ShieldAlert, c as Radar, f as LayoutDashboard, g as History, h as House, n as Users, o as Settings, p as Landmark, s as ScanSearch, t as WalletCards } from "../_libs/lucide-react.mjs";
import { c as Wordmark, l as useCurrentUser, u as useCurrentUserState } from "./ui-CPX071CA.mjs";
import { a as hasGateSessionMarker } from "./server-Cv1FyK93.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/frame-Cqg4edXm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Auth state components — plain wrappers around `useCurrentUserState()`.
*
* With auth on, visitors are signed out until they authenticate — in the sandbox
* live preview too, which does real sign-in. The shared dev user appears only
* when auth is disabled (`VITE_AUTH_ENABLED=false`, the shipped default).
* While the session is still resolving, gates that care about signed-out state
* render nothing so there's no signed-out flash on hard reload.
*/
/** Where `RedirectToSignIn` sends signed-out visitors. Create this route. */
var SIGN_IN_PATH = "/login";
/**
* Client-side redirect to the sign-in route (TanStack `<Navigate>` — NOT a full
* `window.location` reload). A hard navigation re-bootstraps the SPA and re-runs
* session loading, which feels like a second "Loading…" on /login.
*
* Guard routes by waiting out `isPending` first (see `use-current-user`), then
* render this.
*/
function RedirectToSignIn({ to = SIGN_IN_PATH }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to });
}
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function textField(value, max) {
	return typeof value === "string" ? value.trim().slice(0, max) : "";
}
var getMe = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("694984d327e0b3e9c6a97c2b1e0d45dd7897e69dc98a70cdfb7be239145af711"));
var getDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("a50b300821af58acc53ecb5fdf39b895f84fcb794fcd305d0636dbbfede9bc4f"));
var analyzeMessage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const text = textField(data.text, 8e3);
	if (text.length < 8) throw new Error("Paste a bit more of the message.");
	return {
		text,
		mode: data.mode === "invoice" ? "invoice" : "message",
		channel: textField(data.channel, 40)
	};
}).handler(createSsrRpc("4dd5bef2768c486a7e291c406f61c228afbe0356bc28ee8731dbfad7b520eb89"));
var analyzeUrl = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const url = textField(data.url, 2e3);
	if (url.length < 4) throw new Error("Paste the full link.");
	return {
		url,
		note: textField(data.note, 500)
	};
}).handler(createSsrRpc("2c2246b172ade0d9ca6d237a6a218e004adf521eeaa25c47f2382830863c5378"));
var analyzeInvestment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const platform = textField(data.platform, 120);
	const promise = textField(data.promise, 4e3);
	const contact = textField(data.contact, 200);
	const url = textField(data.url, 500);
	if (promise.length < 8 && platform.length < 2) throw new Error("Describe the offer, or name the platform.");
	return {
		platform,
		promise,
		contact,
		url
	};
}).handler(createSsrRpc("95637742fcbdc2d1b9490830b242c9d1429b573d624fd60d14218ccc468a0405"));
var analyzeImage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const frames = (Array.isArray(data.frames) ? data.frames : data.dataUrl ? [data.dataUrl] : []).filter((item) => typeof item === "string" && item.startsWith("data:image/")).slice(0, 3);
	if (frames.length === 0) throw new Error("Choose an image or a short video.");
	if (frames.some((frame) => frame.length > 12e5)) throw new Error("A frame is too large. Try a shorter clip.");
	if (frames.reduce((total, frame) => total + frame.length, 0) > 28e5) throw new Error("That clip is too large to review.");
	const mode = data.mode === "id" || data.mode === "passport" || data.mode === "document" || data.mode === "video" || data.mode === "photo" ? data.mode : "photo";
	return {
		frames,
		note: textField(data.note, 500),
		mode
	};
}).handler(createSsrRpc("54fba98133350ca23ab381150a16a9643ab07b2eff8f1c6b1990ba796f34d06e"));
var listHistory = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("18a795821a49a286b898da7d6edc3ab7723cecc8a5a45525b04682fb0f2982a7"));
var deleteCheck = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const id = textField(input?.id, 80);
	if (!id) throw new Error("Missing check.");
	return { id };
}).handler(createSsrRpc("cf852de55b9090eaf0b600f5c2d229260d2c84a4f56c25e072e93bc8e5fd5b93"));
var clearHistory = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("74673f1dd9f9b3f19811cb27d770c291d721dd53e61b404047aefc9c14bf7746"));
var updateSettings = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	return {
		displayName: textField(data.displayName, 40),
		storeHistory: typeof data.storeHistory === "boolean" ? data.storeHistory : void 0,
		shareHighRisk: typeof data.shareHighRisk === "boolean" ? data.shareHighRisk : void 0
	};
}).handler(createSsrRpc("92b5d1d1ede84d19451b629eac93eeddff8b1d24b2bafce1dfcf9cf59248dfe8"));
var setPlan = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	return { plan: asPlan(textField(input?.plan, 20)) };
}).handler(createSsrRpc("ca8c84b3d4fa1a535a819af1f5980e4ecabbff6043ac31de5f3560444dd6b308"));
var getFamily = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("61108076ab044014c555297e27a7bf2d9d4468c4eba1f967f6a635d39dfb473c"));
var createFamily = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const name = textField(input?.name, 40);
	if (name.length < 2) throw new Error("Name the circle.");
	return { name };
}).handler(createSsrRpc("d8cd62c1456ba215c4f8667dcc43e98b83b286ce4bc43a8587282c5ebd850d36"));
var joinFamily = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const code = textField(input?.code, 12).toUpperCase().replace(/[^A-Z0-9]/g, "");
	if (code.length < 6) throw new Error("Enter the invite code.");
	return { code };
}).handler(createSsrRpc("d2c7cd9863869e8d26c22b38dbc895d08f955fbf434057a54cbfea61a17b4c20"));
var leaveFamily = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("524b1dbb4c33a1d3ef73308325ad8916c830076f6f090f759e5d71a2eec250a8"));
var deleteFamily = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("1ce2bfd5111dc9f934aa71b788b2a74bda2c95d0a05de787449d08644017a5ef"));
var setMemberLabel = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const label = textField(input?.label, 32);
	if (!label) throw new Error("Add a short label, like Mum or Dad.");
	return { label };
}).handler(createSsrRpc("d03da582f1a1eb81e093b45ddf4721ee2201d46be7682ef4d06a317f4345bb7b"));
var setPhrase = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const phrase = textField(input?.phrase, 80);
	if (phrase.length < 8) throw new Error("Use at least 8 characters. A nonsense sentence is best.");
	return { phrase };
}).handler(createSsrRpc("6e691818b8c90b95399265dea7860df4a5c7dc935e1c79d8d828ff7050e2dea2"));
var verifyPhrase = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const phrase = textField(input?.phrase, 80);
	if (!phrase) throw new Error("Type the phrase they gave you.");
	return { phrase };
}).handler(createSsrRpc("fa7b3bfd8583b64445635e241ae40811a413b2ab7d14d906a52cc727675a57a1"));
var listDomains = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("147f6d671ad80760a311bf2fc1219a5ce83882fde86171c289bba59728e207e6"));
var addDomain = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ domain: textField(input?.domain, 120) })).handler(createSsrRpc("39fc7cc5e1dc12284019e8665aef9b7551e4e42fd9ecd2ea1de1e0bebd97d637"));
var removeDomain = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({ domain: textField(input?.domain, 120) })).handler(createSsrRpc("cc7496d0da376885258af31814c371c1f70c535c7b6cba053bf8bea157964c77"));
var listArticles = createServerFn({ method: "GET" }).handler(createSsrRpc("1d8da4920b626f22d74c11b4dde90215a4b2f42af765d6de72fb0c79efa494ab"));
var getAdmin = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("63cf7deb9534f5055043b54ad3dbbabcf7df2b3fb16b120d7797129cefc91a1f"));
var adminSetRole = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const userId = textField(data.userId, 80);
	const role = data.role === "admin" ? "admin" : "member";
	if (!userId) throw new Error("Missing person.");
	return {
		userId,
		role
	};
}).handler(createSsrRpc("04e3821fdcc874be2d3a0be100482cbbc1e1e38502ca1c8c5b5bfd77ec8d543c"));
var adminSetPlan = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	return {
		userId: textField(data.userId, 80),
		plan: asPlan(textField(data.plan, 20))
	};
}).handler(createSsrRpc("8472f683175ae7e6b494c8da31347197d1e9326c86c64989753f24c077d9c62e"));
var adminSaveArticle = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const slug = textField(data.slug, 80);
	const title = textField(data.title, 120);
	const body = textField(data.body, 8e3);
	if (!slug || !title || body.length < 20) throw new Error("Title and lesson text are required.");
	return {
		slug,
		title,
		body,
		published: data.published !== false
	};
}).handler(createSsrRpc("b17f6457f519d700a9f62a9f8ed23e0a8757fe1234a015734e610066cac3e491"));
var WATCH_KINDS = /* @__PURE__ */ new Set([
	"phone",
	"account",
	"domain"
]);
function asWatchKind(value) {
	return WATCH_KINDS.has(value) ? value : null;
}
var analyzeNumber = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const kind = asWatchKind(textField(data.kind, 20));
	const value = textField(data.value, 80);
	const context = textField(data.context, 4e3);
	if (kind !== "phone" && kind !== "account") throw new Error("Choose a phone or an account number.");
	const id = resolveIdentifier(kind, value);
	if (!id) throw new Error(kind === "phone" ? "Use a Nigerian mobile number, like 0803 000 0000." : "Use the 10-digit account number, with no account name.");
	return {
		kind,
		id,
		context
	};
}).handler(createSsrRpc("9b7fc7d792c189d59f81eac3f66a1fade0100e9d911c80e930d5d6b3ca91aa18"));
var listWatch = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("5297eb7f0ea8447eb9fcf8aca6fdce72d08a8d745321bdf305d9e4e647b0e38a"));
var lookupWatch = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const kind = asWatchKind(textField(data.kind, 20));
	const value = textField(data.value, 160);
	if (!kind) throw new Error("Choose phone, account, or domain.");
	const id = resolveIdentifier(kind, value);
	if (!id) throw new Error(kind === "phone" ? "That doesn't look like a Nigerian mobile number." : kind === "account" ? "Account numbers here are 10 digits." : "Paste a domain, like brand-secure.xyz.");
	return { id };
}).handler(createSsrRpc("af6f058905364ddf698fdba667a7427a66dcc85cfdb29eb8740cdbb85846f4e8"));
var reportScam = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const data = input ?? {};
	const kind = asWatchKind(textField(data.kind, 20));
	const value = textField(data.value, 160);
	const category = textField(data.category, 40);
	if (!kind) throw new Error("Choose phone, account, or domain.");
	if (!isWatchCategory(category)) throw new Error("Pick what they tried to do.");
	const id = resolveIdentifier(kind, value);
	if (!id) throw new Error("That number or domain is not in a form Guardian can store.");
	return {
		id,
		category
	};
}).handler(createSsrRpc("4639cdc1afe391402cd2f2225f9a1eecfc83f32a8653745ae82756809010e96d"));
var useGuardian = create((set) => ({
	me: null,
	forUser: null,
	setMe: (userId, me) => set({
		forUser: userId,
		me
	})
}));
var NAV = [
	{
		to: "/home",
		label: "Dashboard",
		icon: LayoutDashboard
	},
	{
		to: "/check",
		label: "Check",
		icon: ScanSearch
	},
	{
		to: "/history",
		label: "History",
		icon: History
	},
	{
		to: "/watch",
		label: "Watch",
		icon: Radar
	},
	{
		to: "/learn",
		label: "Lessons",
		icon: BookOpen
	},
	{
		to: "/family",
		label: "Family",
		icon: Users
	},
	{
		to: "/plans",
		label: "Plans",
		icon: WalletCards
	},
	{
		to: "/settings",
		label: "Settings",
		icon: Settings
	}
];
function Frame({ children }) {
	const pathname = useRouterState({ select: (state) => state.location.pathname });
	const { user } = useCurrentUserState();
	const me = useGuardian((s) => s.me);
	const forUser = useGuardian((s) => s.forUser);
	const setMe = useGuardian((s) => s.setMe);
	const [more, setMore] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!user?.id || forUser === user.id) return;
		let cancel = false;
		getMe().then((next) => {
			if (!cancel) setMe(user.id, next);
		}).catch(() => void 0);
		return () => {
			cancel = true;
		};
	}, [
		user?.id,
		forUser,
		setMe
	]);
	const items = me?.role === "admin" ? [...NAV, {
		to: "/admin",
		label: "Admin",
		icon: ShieldAlert
	}] : [...NAV];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-fg md:grid md:grid-cols-[16rem_1fr]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "shell-side hidden md:flex md:min-h-screen md:flex-col md:px-3 md:py-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/home",
						className: "px-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "mt-8 flex flex-1 flex-col gap-1",
						children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideLink, {
							to: item.to,
							label: item.label,
							icon: item.icon,
							active: active(pathname, item.to)
						}, item.to))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 border-t border-line px-2 pt-4",
						children: [me ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-3 rounded-lg bg-bg px-3 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium text-fg",
								children: PLANS[me.plan].name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-0.5 font-mono text-xs tabular-nums text-faint",
								children: [
									me.checksUsed,
									"/",
									me.checksLimit,
									" this month"
								]
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mb-3 h-4 w-28 animate-pulse rounded bg-surface-2 motion-safe:animate-pulse" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 pb-24 md:pb-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-20 flex items-center justify-between border-b border-line bg-bg/90 px-4 py-3 backdrop-blur md:hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/home",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, { compact: true })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-8",
					children
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "app-dock fixed inset-x-0 bottom-0 z-30 md:hidden",
				children: [more ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-2 border-b border-line p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
							to: "/learn",
							label: "Lessons"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
							to: "/watch",
							label: "Watch"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
							to: "/playbooks",
							label: "Playbooks"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
							to: "/plans",
							label: "Plans"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
							to: "/settings",
							label: "Settings"
						}),
						me?.role === "admin" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mini, {
							to: "/admin",
							label: "Admin"
						}) : null
					]
				}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
							to: "/home",
							label: "Home",
							icon: House,
							active: pathname === "/home"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
							to: "/check",
							label: "Check",
							icon: ScanSearch,
							active: pathname.startsWith("/check")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
							to: "/history",
							label: "History",
							icon: History,
							active: pathname.startsWith("/history")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tab, {
							to: "/family",
							label: "Family",
							icon: Users,
							active: pathname.startsWith("/family")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex min-h-14 flex-col items-center justify-center gap-1 text-xs text-muted",
							onClick: () => setMore((open) => !open),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, {
								className: "size-5",
								strokeWidth: 1.75,
								"aria-hidden": "true"
							}), "More"]
						})
					]
				})]
			})
		]
	});
}
function active(pathname, to) {
	if (to === "/home") return pathname === "/home";
	if (to === "/check") return pathname.startsWith("/check");
	return pathname === to || pathname.startsWith(`${to}/`);
}
function SideLink({ to, label, icon: Icon, active: on }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		"aria-current": on ? "page" : void 0,
		className: `nav-link flex min-h-11 items-center gap-2.5 rounded-md px-2.5 text-sm ${on ? "" : "text-muted hover:bg-bg hover:text-fg"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: "size-4",
			strokeWidth: 1.75,
			"aria-hidden": "true"
		}), label]
	});
}
function Tab({ to, label, icon: Icon, active: on }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: `flex min-h-14 flex-col items-center justify-center gap-1 text-xs ${on ? "text-primary" : "text-muted"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
			className: "size-5",
			strokeWidth: 1.75,
			"aria-hidden": "true"
		}), label]
	});
}
function Mini({ to, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to,
		className: "flex min-h-11 items-center justify-center rounded-md bg-surface-2 text-sm font-medium",
		children: label
	});
}
function Authed({ children }) {
	const { user, isPending } = useCurrentUserState();
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-bg text-fg md:grid md:grid-cols-[15rem_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hidden border-r border-line md:block" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-5xl px-4 py-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-40 animate-pulse rounded bg-surface-2" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-6 h-28 animate-pulse rounded-lg bg-surface" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-4 h-40 animate-pulse rounded-lg bg-surface" })
			]
		})]
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Frame, { children });
}
function MarketingBar() {
	const { user, isPending } = useCurrentUserState();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: "sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex items-center gap-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/#pricing",
						className: "hidden min-h-11 items-center px-2 text-muted sm:inline-flex",
						children: "Pricing"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/learn",
						className: "hidden min-h-11 items-center px-2 text-muted sm:inline-flex",
						children: "Lessons"
					}),
					isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-11 w-28 animate-pulse rounded-md bg-surface-2" }) : null,
					!isPending && user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/home",
						className: "btn inline-flex min-h-11 items-center rounded-md bg-primary px-4 font-semibold text-primary-ink",
						children: "Open Guardian"
					}) : null,
					!isPending && !user ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						className: "btn inline-flex min-h-11 items-center rounded-md bg-primary px-4 font-semibold text-primary-ink",
						children: "Sign in"
					}) : null
				]
			})]
		})
	});
}
//#endregion
export { setPlan as A, listHistory as C, reportScam as D, removeDomain as E, useGuardian as M, verifyPhrase as N, setMemberLabel as O, listDomains as S, lookupWatch as T, getDashboard as _, adminSetPlan as a, leaveFamily as b, analyzeInvestment as c, analyzeUrl as d, clearHistory as f, getAdmin as g, deleteFamily as h, adminSaveArticle as i, updateSettings as j, setPhrase as k, analyzeMessage as l, deleteCheck as m, MarketingBar as n, adminSetRole as o, createFamily as p, addDomain as r, analyzeImage as s, Authed as t, analyzeNumber as u, getFamily as v, listWatch as w, listArticles as x, joinFamily as y };
