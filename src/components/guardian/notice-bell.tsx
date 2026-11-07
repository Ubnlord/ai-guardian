import { Link } from "@tanstack/react-router";
import { Bell, Radar, ShieldAlert, Sparkles, TriangleAlert, WalletCards, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePrefs } from "@/components/prefs";
import { getDashboard } from "@/lib/guardian/api";
import {
  badgeLabel,
  buildNotices,
  dismiss,
  markSeen,
  readDismissed,
  readLastSeen,
  unreadCount,
  type Notice,
  type NoticeKind,
} from "@/lib/guardian/notify";
import { useGuardian } from "@/lib/guardian/store";
import type { DashboardData } from "@/lib/guardian/types";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { when } from "./ui";

const ICON: Record<NoticeKind, typeof Bell> = {
  alert: TriangleAlert,
  high_risk: ShieldAlert,
  watch: Radar,
  quota: WalletCards,
};

const TONE: Record<NoticeKind, string> = {
  alert: "text-danger",
  high_risk: "text-danger",
  watch: "text-primary",
  quota: "text-warn",
};

/**
 * Notification centre.
 *
 * Reuses the dashboard payload the app already fetches, so the bell costs no
 * extra server call. Everything is derived client-side (see `notify.ts`); the
 * "seen" timestamp and dismissals live in localStorage.
 */
export function NoticeBell() {
  const user = useCurrentUser();
  const me = useGuardian((s) => s.me);
  const forUser = useGuardian((s) => s.forUser);
  const { t } = usePrefs();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<DashboardData | null>(null);
  const [seenAt, setSeenAt] = useState(0);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setSeenAt(readLastSeen());
    setDismissed(readDismissed());
  }, []);

  useEffect(() => {
    if (!user?.id || forUser !== user.id) return;
    let cancel = false;
    getDashboard()
      .then((next) => {
        if (!cancel) setRows(next as DashboardData);
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, [user?.id, forUser]);

  // Refresh when the tab regains focus so a family alert is not stale.
  useEffect(() => {
    if (!user?.id) return;
    function onFocus() {
      getDashboard()
        .then((next) => setRows(next as DashboardData))
        .catch(() => undefined);
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user?.id]);

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (panelRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const notices = useMemo<Notice[]>(() => {
    if (!rows) return [];
    return buildNotices({
      me: me ?? rows.me,
      alerts: rows.alerts,
      recent: rows.recent.map((row) => ({
        id: row.id,
        kind: row.kind,
        verdict: row.verdict,
        title: row.title,
        summary: row.summary,
        createdAt: row.createdAt,
      })),
      watch: rows.watch,
      lastSeenAt: seenAt,
    });
  }, [rows, me, seenAt]);

  const visible = notices.filter((notice) => !dismissed.includes(notice.id));
  const count = unreadCount(notices, dismissed);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={count > 0 ? `${t("notifications")} (${count} unread)` : t("notifications")}
        aria-expanded={open}
        onClick={() => {
          const next = !open;
          setOpen(next);
          if (next) {
            markSeen();
            setSeenAt(Date.now());
          }
        }}
        className="relative grid size-11 place-items-center rounded-md border border-line bg-surface text-fg"
      >
        <Bell className="size-4" strokeWidth={1.75} aria-hidden="true" />
        {count > 0 ? (
          <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-danger px-1 font-mono text-[10px] font-semibold leading-4 text-danger-ink">
            {badgeLabel(count)}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          ref={panelRef}
          className="absolute right-0 z-40 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-line bg-surface shadow-card"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-semibold">{t("notifications")}</p>
            <button type="button" className="text-faint" aria-label={t("close")} onClick={() => setOpen(false)}>
              <X className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>

          {!rows ? (
            <div className="space-y-2 p-3">
              <div className="h-14 animate-pulse rounded-lg bg-bg" />
              <div className="h-14 animate-pulse rounded-lg bg-bg" />
            </div>
          ) : visible.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Sparkles className="mx-auto size-6 text-primary" strokeWidth={1.75} aria-hidden="true" />
              <p className="mt-2 text-sm font-medium">{t("allClear")}</p>
              <p className="mt-1 text-xs text-faint">{t("allClearHint")}</p>
            </div>
          ) : (
            <ul className="max-h-[22rem] divide-y divide-line overflow-y-auto">
              {visible.map((notice) => {
                const Icon = ICON[notice.kind];
                return (
                  <li key={notice.id} className="group flex items-start gap-2.5 px-3 py-3">
                    <Link to={notice.to} className="flex min-w-0 flex-1 items-start gap-2.5" onClick={() => setOpen(false)}>
                      <span className="icon-well mt-0.5 size-8 shrink-0">
                        <Icon className={`size-4 ${TONE[notice.kind]}`} strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5">
                          {notice.unread ? (
                            <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-label={t("unread")} />
                          ) : null}
                          <span className="truncate text-sm font-medium">{notice.title}</span>
                        </span>
                        <span className="mt-0.5 line-clamp-2 block text-xs text-muted">{notice.detail}</span>
                        <span className="mt-1 block text-xs text-faint">{when(notice.createdAt)}</span>
                      </span>
                    </Link>
                    <button
                      type="button"
                      aria-label={t("dismiss")}
                      className="mt-0.5 shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                      onClick={() => setDismissed(dismiss(notice.id))}
                    >
                      <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <Link
            to="/insights"
            className="block border-t border-line px-4 py-2.5 text-center text-sm font-semibold text-primary"
            onClick={() => setOpen(false)}
          >
            {t("seeInsights")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
