import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  Ellipsis,
  History,
  House,
  LayoutDashboard,
  ListChecks,
  Radar,
  ScanSearch,
  Settings,
  Share2,
  ShieldAlert,
  Sun,
  Moon,
  UserRound,
  Users,
  WalletCards,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { usePrefs } from "@/components/prefs";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getMe, updateSettings } from "@/lib/guardian/api";
import { PLANS } from "@/lib/guardian/plans";
import { useGuardian } from "@/lib/guardian/store";
import { isLocale, LOCALES, type CopyKey } from "@/lib/i18n";
import type { Me } from "@/lib/guardian/types";
import { NoticeBell } from "./notice-bell";
import { Wordmark, UsageBar } from "./ui";

const NAV = [
  { to: "/home", key: "dashboard", icon: LayoutDashboard },
  { to: "/check", key: "check", icon: ScanSearch },
  { to: "/history", key: "history", icon: History },
  { to: "/card", key: "scamCard", icon: Share2 },
  { to: "/insights", key: "insights", icon: BarChart3 },
  { to: "/watch", key: "watch", icon: Radar },
  { to: "/learn", key: "lessons", icon: BookOpen },
  { to: "/family", key: "family", icon: Users },
  { to: "/playbooks", key: "playbooks", icon: ListChecks },
  { to: "/plans", key: "plans", icon: WalletCards },
  { to: "/profile", key: "profile", icon: UserRound },
  { to: "/settings", key: "settings", icon: Settings },
] as const;

const MORE = [
  { to: "/card" as const, key: "scamCard" as const, icon: Share2 },
  { to: "/insights" as const, key: "insights" as const, icon: BarChart3 },
  { to: "/learn" as const, key: "lessons" as const, icon: BookOpen },
  { to: "/watch" as const, key: "watch" as const, icon: Radar },
  { to: "/playbooks" as const, key: "playbooks" as const, icon: ListChecks },
  { to: "/profile" as const, key: "profile" as const, icon: UserRound },
  { to: "/plans" as const, key: "plans" as const, icon: WalletCards },
  { to: "/settings" as const, key: "settings" as const, icon: Settings },
];

type NavTo = (typeof NAV)[number]["to"] | "/admin";

export function Frame({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user } = useCurrentUserState();
  const me = useGuardian((s) => s.me);
  const forUser = useGuardian((s) => s.forUser);
  const setMe = useGuardian((s) => s.setMe);
  const { t, setLocale } = usePrefs();
  const [more, setMore] = useState(false);

  useEffect(() => {
    if (!user?.id || forUser === user.id) return;
    let cancel = false;
    getMe()
      .then((next) => {
        if (!cancel) setMe(user.id, next as Me);
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, [user?.id, forUser, setMe]);

  useEffect(() => {
    if (!me || !isLocale(me.locale)) return;
    if (localStorage.getItem("guardian-locale")) return;
    setLocale(me.locale);
  }, [me, setLocale]);

  useEffect(() => {
    setMore(false);
  }, [pathname]);

  const items = me?.role === "admin" ? [...NAV, { to: "/admin" as const, key: "admin" as const, icon: ShieldAlert }] : [...NAV];

  return (
    <div className="min-h-screen bg-bg text-fg md:grid md:grid-cols-[16rem_1fr]">
      <aside className="shell-side hidden md:flex md:min-h-screen md:flex-col md:px-3 md:py-5">
        <div className="flex items-center justify-between gap-2 px-2">
          <Link to="/home">
            <Wordmark />
          </Link>
          <NoticeBell />
        </div>
        <SideNav items={items} pathname={pathname} t={t} me={me} />
      </aside>

      {more ? (
        <div className="fixed inset-x-0 top-0 z-40 md:hidden" style={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}>
          <button type="button" className="absolute inset-0 bg-black/55" aria-label={t("close")} onClick={() => setMore(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-xl border border-line bg-surface px-4 pt-3 pb-4 shadow-[var(--shadow-card)]">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
            <p className="mb-3 text-base font-semibold">{t("more")}</p>
            <div className="grid grid-cols-2 gap-2">
              {MORE.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex min-h-12 items-center gap-2 rounded-lg bg-bg px-3 text-base font-medium"
                >
                  <item.icon className="size-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
                  {t(item.key)}
                </Link>
              ))}
              {me?.role === "admin" ? (
                <Link to="/admin" className="flex min-h-12 items-center gap-2 rounded-lg bg-bg px-3 text-base font-medium">
                  <ShieldAlert className="size-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
                  {t("admin")}
                </Link>
              ) : null}
            </div>
            {me ? (
              <div className="mt-3">
                <UsageBar used={me.checksUsed} limit={me.checksLimit} />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="min-w-0 pb-24 md:pb-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur md:hidden">
          <Link to="/home">
            <Wordmark compact />
          </Link>
          <NoticeBell />
        </header>
        <main className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>

      <nav className="app-dock fixed inset-x-0 bottom-0 z-30 md:hidden">
        <div className="grid grid-cols-5">
          <Tab to="/home" label={t("home")} icon={House} active={pathname === "/home"} />
          <Tab to="/check" label={t("check")} icon={ScanSearch} active={pathname.startsWith("/check")} />
          <Tab to="/history" label={t("history")} icon={History} active={pathname.startsWith("/history")} />
          <Tab to="/family" label={t("family")} icon={Users} active={pathname.startsWith("/family")} />
          <button
            type="button"
            className={`flex min-h-14 flex-col items-center justify-center gap-1 text-xs ${more ? "text-primary" : "text-muted"}`}
            aria-expanded={more}
            onClick={() => setMore((open) => !open)}
          >
            <Ellipsis className="size-5" strokeWidth={1.75} aria-hidden="true" />
            {t("more")}
          </button>
        </div>
      </nav>
    </div>
  );
}

function SideNav({
  items,
  pathname,
  t,
  me,
}: {
  items: { to: NavTo; key: CopyKey; icon: typeof House }[];
  pathname: string;
  t: (key: CopyKey) => string;
  me: { displayName: string; plan: keyof typeof PLANS; checksUsed: number; checksLimit: number; avatar: string } | null;
}) {
  const initial = (me?.displayName || "G").slice(0, 1).toUpperCase();
  return (
    <>
      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {items.map((item) => (
          <SideLink key={item.to} to={item.to} label={t(item.key)} icon={item.icon} active={active(pathname, item.to)} />
        ))}
      </nav>
      <div className="mt-4 border-t border-line px-2 pt-4">
        {me ? (
          <Link to="/profile" className="mb-3 flex items-center gap-2 rounded-lg bg-bg px-3 py-2">
            {me.avatar ? (
              <img src={me.avatar} alt="" className="size-9 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-semibold">{initial}</span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-fg">{me.displayName}</span>
              <span className="block text-sm text-muted">{PLANS[me.plan].name}</span>
            </span>
          </Link>
        ) : (
          <div className="mb-3 h-12 animate-pulse rounded-lg bg-bg" />
        )}
        {me ? <UsageBar used={me.checksUsed} limit={me.checksLimit} /> : null}
      </div>
    </>
  );
}

function PrefsControls({ id = "guardian-lang" }: { id?: string }) {
  const { theme, locale, setTheme, setLocale, t } = usePrefs();
  const { user } = useCurrentUserState();
  const setMe = useGuardian((s) => s.setMe);

  return (
    <div className="flex items-center gap-1.5">
      <label className="sr-only" htmlFor={id}>
        {t("language")}
      </label>
      <select
        id={id}
        value={locale}
        aria-label={t("language")}
        className="h-11 max-w-28 rounded-md border border-line bg-surface px-2 text-sm text-fg"
        onChange={(event) => {
          const next = event.target.value;
          if (!isLocale(next)) return;
          setLocale(next);
          if (!user?.id) return;
          void updateSettings({ data: { locale: next } })
            .then((nextMe) => setMe(user.id, nextMe as Me))
            .catch(() => undefined);
        }}
      >
        {LOCALES.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="inline-flex h-11 items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 text-sm text-fg"
        aria-label={t("theme")}
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? <Sun className="size-4" strokeWidth={1.75} /> : <Moon className="size-4" strokeWidth={1.75} />}
        <span className="hidden sm:inline">{theme === "dark" ? t("light") : t("dark")}</span>
      </button>
    </div>
  );
}

function active(pathname: string, to: string): boolean {
  if (to === "/home") return pathname === "/home";
  if (to === "/check") return pathname.startsWith("/check");
  return pathname === to || pathname.startsWith(`${to}/`);
}

function SideLink({
  to,
  label,
  icon: Icon,
  active: on,
}: {
  to: NavTo;
  label: string;
  icon: typeof House;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      aria-current={on ? "page" : undefined}
      className={`nav-link flex min-h-11 items-center gap-2.5 rounded-md px-2.5 text-sm ${on ? "" : "text-muted hover:bg-bg hover:text-fg"}`}
    >
      <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
      {label}
    </Link>
  );
}

function Tab({
  to,
  label,
  icon: Icon,
  active: on,
}: {
  to: "/home" | "/check" | "/history" | "/family";
  label: string;
  icon: typeof House;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex min-h-14 flex-col items-center justify-center gap-1 text-xs ${on ? "text-primary" : "text-muted"}`}
    >
      <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
      {label}
    </Link>
  );
}

export function Authed({ children }: { children: ReactNode }) {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <div className="min-h-screen bg-bg text-fg md:grid md:grid-cols-[15rem_1fr]">
        <div className="hidden border-r border-line md:block" />
        <div className="mx-auto w-full max-w-5xl px-4 py-8">
          <div className="h-8 w-40 animate-pulse rounded bg-surface-2" />
          <div className="mt-6 h-28 animate-pulse rounded-lg bg-surface" />
          <div className="mt-4 h-40 animate-pulse rounded-lg bg-surface" />
        </div>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  return <Frame>{children}</Frame>;
}

export function MarketingBar() {
  const { user, isPending } = useCurrentUserState();
  const { t } = usePrefs();
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/">
          <Wordmark />
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          <PrefsControls />
          <a href="/#pricing" className="hidden min-h-11 items-center px-2 text-muted sm:inline-flex">
            {t("pricing")}
          </a>
          <Link to="/learn" className="hidden min-h-11 items-center px-2 text-muted lg:inline-flex">
            {t("lessons")}
          </Link>
          {isPending ? <span className="h-11 w-28 animate-pulse rounded-md bg-surface-2" /> : null}
          {!isPending && user ? (
            <Link to="/home" className="btn inline-flex min-h-11 items-center rounded-md bg-primary px-4 font-semibold text-primary-ink">
              {t("open")}
            </Link>
          ) : null}
          {!isPending && !user ? (
            <Link to="/login" className="btn inline-flex min-h-11 items-center rounded-md bg-primary px-4 font-semibold text-primary-ink">
              {t("signIn")}
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
