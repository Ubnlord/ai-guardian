import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, b as Link, w as require_jsx_runtime, x as Navigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as signIn, t as authClient } from "./client-1vAx-gM_.mjs";
import { c as Wordmark, n as Field, r as Notice, s as TextInput, t as Button, u as useCurrentUserState } from "./ui-CPX071CA.mjs";
import { t as GROK_PROVIDERS } from "./server-Cv1FyK93.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-BDt8ek2p.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const { user, isPending } = useCurrentUserState();
	const [mode, setMode] = (0, import_react.useState)("in");
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-bg px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-40 w-full max-w-sm animate-pulse rounded-xl bg-surface" })
	});
	if (user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/home" });
	async function submit(event) {
		event.preventDefault();
		setError(null);
		if (password.length < 8) {
			setError("Use at least 8 characters.");
			return;
		}
		setBusy(true);
		try {
			if (mode === "up") {
				const { error: signUpError } = await authClient.signUp.email({
					email: email.trim(),
					password,
					name: name.trim() || "Guardian",
					callbackURL: "/home"
				});
				if (signUpError) {
					setError(signUpError.message ?? "Could not create the account.");
					return;
				}
			} else {
				const { error: signInError } = await authClient.signIn.email({
					email: email.trim(),
					password,
					callbackURL: "/home"
				});
				if (signInError) {
					setError(signInError.message ?? "Those details did not match.");
					return;
				}
			}
			window.location.href = "/home";
		} catch (err) {
			setError(err instanceof Error ? err.message : "Sign-in did not finish.");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center bg-bg px-4 py-10 text-fg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel w-full max-w-sm",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wordmark, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-8 text-2xl font-semibold tracking-tight",
					children: mode === "in" ? "Sign in" : "Create your account"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Your checks stay on your account. Family members each get their own."
				}),
				null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-6 space-y-3",
					onSubmit: (event) => void submit(event),
					children: [
						mode === "up" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Name",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: name,
								onChange: (event) => setName(event.target.value),
								autoComplete: "name"
							})
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Email",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								type: "email",
								required: true,
								value: email,
								onChange: (event) => setEmail(event.target.value),
								autoComplete: "email"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Password",
							hint: "At least 8 characters.",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								type: "password",
								required: true,
								value: password,
								onChange: (event) => setPassword(event.target.value),
								autoComplete: mode === "up" ? "new-password" : "current-password"
							})
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notice, {
							tone: "danger",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							disabled: busy,
							className: "w-full",
							children: busy ? "Working…" : mode === "in" ? "Sign in" : "Create account"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "min-h-11 w-full text-sm text-muted",
							onClick: () => {
								setMode(mode === "in" ? "up" : "in");
								setError(null);
							},
							children: mode === "in" ? "Need an account? Create one" : "Already have an account? Sign in"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-xs tracking-widest text-faint",
						children: "OR"
					}), GROK_PROVIDERS.map((provider) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "quiet",
						className: "w-full",
						onClick: () => void signIn(provider.providerId, { callbackURL: "/home" }),
						children: ["Continue with ", provider.label]
					}, provider.providerId))]
				})
			]
		})
	});
}
//#endregion
export { LoginPage as component };
