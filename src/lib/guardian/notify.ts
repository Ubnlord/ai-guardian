import type { CheckKind, FamilyAlert, Me, Verdict } from "./types";

/**
 * Notification centre.
 *
 * Notifications are derived, not stored: every source of "something happened"
 * (family alerts, high-risk checks of yours, fresh Guardian Watch reports, a
 * near-exhausted quota) is folded into one flat feed. Nothing here writes, so a
 * user can never be spammed into an unreadable state and there is no second
 * source of truth to drift out of sync.
 */

export type NoticeKind = "alert" | "high_risk" | "watch" | "quota";

export type Notice = {
  /** Stable, deterministic id so dismissals survive a refresh. */
  id: string;
  kind: NoticeKind;
  title: string;
  detail: string;
  createdAt: string;
  /** Where the bell row should send the person. */
  to: "/home" | "/history" | "/watch" | "/family" | "/plans";
  unread: boolean;
};

export type NotifySource = {
  me: Me | null;
  alerts: FamilyAlert[];
  recent: {
    id: string;
    kind: CheckKind;
    verdict: Verdict;
    title: string;
    summary: string;
    createdAt: string;
  }[];
  watch: { week: number; hot: { kind: string; display: string; reports: number }[] };
  /** Epoch ms of the last time the bell was opened, 0 when never. */
  lastSeenAt: number;
  now?: number;
};

/** A notice is unread when it happened after the bell was last opened. */
function seenCutoff(lastSeenAt: number): number {
  return Number.isFinite(lastSeenAt) && lastSeenAt > 0 ? lastSeenAt : 0;
}

function stamp(iso: string): number {
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : 0;
}

export function buildNotices(source: NotifySource): Notice[] {
  const cutoff = seenCutoff(source.lastSeenAt);
  const nowIso = new Date(source.now ?? Date.now()).toISOString();
  const notices: Notice[] = [];

  // Family circle alerts are the most urgent thing we can show.
  for (const alert of source.alerts) {
    notices.push({
      id: `alert:${alert.id}`,
      kind: "alert",
      title: `${alert.label} flagged a high-risk check`,
      detail: alert.headline,
      createdAt: alert.createdAt,
      to: "/family",
      unread: stamp(alert.createdAt) > cutoff,
    });
  }

  // Your own high-risk verdicts, so an unresolved warning does not vanish.
  for (const check of source.recent) {
    if (check.verdict !== "high_risk") continue;
    notices.push({
      id: `check:${check.id}`,
      kind: "high_risk",
      title: check.title,
      detail: check.summary,
      createdAt: check.createdAt,
      to: "/history",
      unread: stamp(check.createdAt) > cutoff,
    });
  }

  // Numbers the community reported in the last week — passive signal.
  for (const hot of source.watch.hot.slice(0, 3)) {
    if (hot.reports <= 0) continue;
    notices.push({
      id: `watch:${hot.kind}:${hot.display}`,
      kind: "watch",
      title: `${hot.display} is on Guardian Watch`,
      detail: `${hot.reports} ${hot.reports === 1 ? "person has" : "people have"} reported this ${hot.kind}.`,
      createdAt: nowIso,
      to: "/watch",
      unread: source.watch.week > 0,
    });
  }

  // Running low is a nudge, not an error.
  if (source.me) {
    const left = Math.max(0, source.me.checksLimit - source.me.checksUsed);
    if (left <= 2) {
      notices.push({
        id: `quota:${source.me.plan}:${source.me.checksUsed}`,
        kind: "quota",
        title: left === 0 ? "You have used this month's checks" : `Only ${left} checks left this month`,
        detail:
          left === 0
            ? "Your allowance resets next month. A higher plan raises the limit right away."
            : "Guardian Watch lookups and lessons still work. The allowance resets next month.",
        createdAt: nowIso,
        to: "/plans",
        unread: true,
      });
    }
  }

  return notices.sort((a, b) => stamp(b.createdAt) - stamp(a.createdAt));
}

export function unreadCount(notices: Notice[], dismissed: string[]): number {
  const hidden = new Set(dismissed);
  return notices.filter((notice) => notice.unread && !hidden.has(notice.id)).length;
}

/** The bell badge caps at "9+" so the pill never grows. */
export function badgeLabel(count: number): string {
  return count > 9 ? "9+" : String(count);
}

const SEEN_KEY = "guardian-notices-seen";
const DISMISSED_KEY = "guardian-notices-dismissed";

export function readLastSeen(): number {
  if (typeof window === "undefined") return 0;
  const raw = window.localStorage.getItem(SEEN_KEY);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

export function markSeen(at = Date.now()): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SEEN_KEY, String(at));
}

export function readDismissed(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(DISMISSED_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function dismiss(id: string): string[] {
  if (typeof window === "undefined") return [];
  const next = [...new Set([...readDismissed(), id])].slice(-200);
  window.localStorage.setItem(DISMISSED_KEY, JSON.stringify(next));
  return next;
}
