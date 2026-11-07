import { o as __toESM } from "../_runtime.mjs";
import { Z as require_react, w as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as authClient } from "./client-1vAx-gM_.mjs";
import { i as Shield } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-CPX071CA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	return useSessionUserState();
}
function useSessionUserState() {
	const { data, isPending } = authClient.useSession();
	const id = data?.user.id;
	const displayName = data?.user.name ?? null;
	const primaryEmail = data?.user.email ?? null;
	const profileImageUrl = data?.user.image ?? null;
	const user = (0, import_react.useMemo)(() => id ? {
		id,
		displayName,
		primaryEmail,
		profileImageUrl,
		isDevFallback: false
	} : null, [
		id,
		displayName,
		primaryEmail,
		profileImageUrl
	]);
	return (0, import_react.useMemo)(() => ({
		user,
		isPending
	}), [user, isPending]);
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
function Wordmark({ compact = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid size-9 place-items-center rounded-lg bg-primary-soft text-primary",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
				className: "size-4",
				strokeWidth: 2,
				"aria-hidden": "true"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "leading-tight",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block text-sm font-semibold tracking-tight text-fg",
				children: "AI Guardian"
			}), compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block font-mono text-xs tracking-widest text-faint",
				children: "BODYGUARD"
			})]
		})]
	});
}
var buttonClass = {
	primary: "bg-primary text-primary-ink hover:brightness-110 disabled:opacity-50",
	quiet: "bg-surface-2 text-fg hover:bg-line disabled:opacity-50",
	danger: "bg-danger-soft text-danger hover:brightness-110 disabled:opacity-50",
	ghost: "bg-transparent text-muted hover:text-fg disabled:opacity-50"
};
function Button({ variant = "primary", className = "", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		...props,
		className: `btn inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold disabled:opacity-50 ${buttonClass[variant]} ${className}`
	});
}
function Field({ label, hint, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mb-1.5 block text-sm font-medium text-fg",
				children: label
			}),
			children,
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1.5 block text-xs text-faint",
				children: hint
			}) : null
		]
	});
}
var control = "field-control min-h-11";
function TextInput(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		...props,
		className: `${control} min-h-11 ${props.className ?? ""}`
	});
}
function TextArea(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		...props,
		className: `${control} min-h-36 py-3 leading-relaxed ${props.className ?? ""}`
	});
}
function Panel({ children, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: `panel ${className}`,
		children
	});
}
function PageIntro({ kicker, title, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "mb-6",
		children: [
			kicker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow",
				children: kicker
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 text-2xl font-semibold tracking-tight md:text-3xl",
				children: title
			}),
			body ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-xl text-sm text-muted md:text-base",
				children: body
			}) : null
		]
	});
}
function when(iso) {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "";
	return date.toLocaleString(void 0, {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
}
function Notice({ tone = "warn", children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: `rounded-lg border px-3 py-2.5 text-sm ${tone === "danger" ? "border-danger/40 bg-danger-soft text-fg" : tone === "ok" ? "border-primary/30 bg-primary-soft text-fg" : "border-warn/40 bg-warn-soft text-fg"}`,
		children
	});
}
//#endregion
export { Panel as a, Wordmark as c, when as d, PageIntro as i, useCurrentUser as l, Field as n, TextArea as o, Notice as r, TextInput as s, Button as t, useCurrentUserState as u };
