import type { CheckKind, Verdict } from "./types";

/**
 * Analytics for the personal risk record.
 *
 * Pure aggregation helpers live here (no DB, no React) so they can be unit
 * tested and reused by both the server function and the client charts.
 * The shape is deliberately flat and JSON-safe — PGlite and Neon both feed it.
 */

export const RANGES = [7, 30, 90] as const;
export type InsightsRange = (typeof RANGES)[number];

export function asRange(value: unknown): InsightsRange {
  const n = typeof value === "number" ? value : Number(value);
  return n === 30 || n === 90 ? n : 7;
}

/** One day of activity, always present (zero-filled) so charts never gap. */
export type DayPoint = {
  /** ISO `YYYY-MM-DD` in UTC. */
  day: string;
  total: number;
  safe: number;
  suspicious: number;
  highRisk: number;
  avgScore: number;
};

export type KindSlice = {
  kind: CheckKind;
  total: number;
  highRisk: number;
};

export type ScoreBand = {
  id: "low" | "watch" | "high";
  label: string;
  range: string;
  total: number;
  verdict: Verdict;
};

export type ReasonCount = { text: string; n: number };

export type Insights = {
  range: InsightsRange;
  totals: {
    total: number;
    safe: number;
    suspicious: number;
    highRisk: number;
    avgScore: number;
    /** Share of checks that came back high risk, 0–100, rounded. */
    highRiskShare: number;
    /** Checks saved in the previous equally-long window, for a delta badge. */
    previousTotal: number;
  };
  daily: DayPoint[];
  kinds: KindSlice[];
  bands: ScoreBand[];
  reasons: ReasonCount[];
  busiest: DayPoint | null;
  /** Consecutive days ending today with at least one check. */
  streak: number;
  /** Day-of-week with the most checks (0 = Sunday), or null when empty. */
  peakWeekday: number | null;
  plan: { used: number; limit: number };
};

/** Raw row as it comes back from Postgres — everything is pre-normalized. */
export type InsightRow = {
  day: string;
  kind: string;
  verdict: string;
  score: number;
  reasons: string;
};

const KIND_ORDER: CheckKind[] = ["message", "url", "number", "image", "investment"];

export function asKind(value: string): CheckKind {
  return KIND_ORDER.includes(value as CheckKind) ? (value as CheckKind) : "message";
}

export function asVerdict(value: string): Verdict {
  return value === "high_risk" || value === "safe" ? value : "suspicious";
}

/** `YYYY-MM-DD` for the UTC day `offset` days before `today`. */
export function shiftDay(day: string, offset: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

/** Today in UTC as `YYYY-MM-DD`. */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Build the continuous, zero-filled day series the charts expect. */
export function fillDays(rows: InsightRow[], days: number, endDay = today()): DayPoint[] {
  const buckets = new Map<string, { total: number; safe: number; suspicious: number; highRisk: number; score: number }>();
  for (let i = days - 1; i >= 0; i -= 1) {
    buckets.set(shiftDay(endDay, -i), { total: 0, safe: 0, suspicious: 0, highRisk: 0, score: 0 });
  }
  for (const row of rows) {
    const bucket = buckets.get(row.day);
    if (!bucket) continue;
    bucket.total += 1;
    bucket.score += Number.isFinite(row.score) ? row.score : 0;
    const verdict = asVerdict(row.verdict);
    if (verdict === "safe") bucket.safe += 1;
    else if (verdict === "high_risk") bucket.highRisk += 1;
    else bucket.suspicious += 1;
  }
  return [...buckets.entries()].map(([day, b]) => ({
    day,
    total: b.total,
    safe: b.safe,
    suspicious: b.suspicious,
    highRisk: b.highRisk,
    avgScore: b.total ? Math.round(b.score / b.total) : 0,
  }));
}

export function countKinds(rows: InsightRow[]): KindSlice[] {
  const map = new Map<CheckKind, KindSlice>();
  for (const kind of KIND_ORDER) map.set(kind, { kind, total: 0, highRisk: 0 });
  for (const row of rows) {
    const kind = asKind(row.kind);
    const slice = map.get(kind);
    if (!slice) continue;
    slice.total += 1;
    if (asVerdict(row.verdict) === "high_risk") slice.highRisk += 1;
  }
  return [...map.values()].filter((slice) => slice.total > 0);
}

export function scoreBands(rows: InsightRow[]): ScoreBand[] {
  const bands: ScoreBand[] = [
    { id: "low", label: "0–34", range: "Low risk", total: 0, verdict: "safe" },
    { id: "watch", label: "35–69", range: "Suspicious", total: 0, verdict: "suspicious" },
    { id: "high", label: "70–100", range: "High risk", total: 0, verdict: "high_risk" },
  ];
  for (const row of rows) {
    const score = Number.isFinite(row.score) ? row.score : 0;
    const band = score >= 70 ? bands[2] : score >= 35 ? bands[1] : bands[0];
    if (band) band.total += 1;
  }
  return bands;
}

/** Most frequently cited reasons across a range, newest bias ignored on purpose. */
export function topReasons(rows: InsightRow[], limit = 5): ReasonCount[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    for (const text of parseReasons(row.reasons)) {
      const key = text.trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([text, n]) => ({ text, n }))
    .sort((a, b) => b.n - a.n || a.text.localeCompare(b.text))
    .slice(0, limit);
}

function parseReasons(raw: string): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

/** Consecutive days with activity, counting back from the last day in the series. */
export function streak(daily: DayPoint[]): number {
  let n = 0;
  for (let i = daily.length - 1; i >= 0; i -= 1) {
    const point = daily[i];
    if (!point || point.total === 0) break;
    n += 1;
  }
  return n;
}

export function peakWeekday(daily: DayPoint[]): number | null {
  const totals = [0, 0, 0, 0, 0, 0, 0];
  let any = false;
  for (const point of daily) {
    if (point.total === 0) continue;
    const index = new Date(`${point.day}T00:00:00Z`).getUTCDay();
    totals[index] = (totals[index] ?? 0) + point.total;
    any = true;
  }
  if (!any) return null;
  let best = 0;
  for (let i = 1; i < 7; i += 1) {
    if ((totals[i] ?? 0) > (totals[best] ?? 0)) best = i;
  }
  return best;
}

export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Format `YYYY-MM-DD` (UTC) as a short label, e.g. "Nov 4". */
export function dayLabel(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return day;
  return date.toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" });
}

/** Assemble the payload from raw rows plus the surrounding counters. */
export function buildInsights(input: {
  range: InsightsRange;
  rows: InsightRow[];
  previousTotal: number;
  plan: { used: number; limit: number };
  endDay?: string;
}): Insights {
  const endDay = input.endDay ?? today();
  const daily = fillDays(input.rows, input.range, endDay);
  const totals = input.rows.reduce(
    (acc, row) => {
      acc.total += 1;
      acc.avgSum += Number.isFinite(row.score) ? row.score : 0;
      const verdict = asVerdict(row.verdict);
      if (verdict === "safe") acc.safe += 1;
      else if (verdict === "high_risk") acc.highRisk += 1;
      else acc.suspicious += 1;
      return acc;
    },
    { total: 0, safe: 0, suspicious: 0, highRisk: 0, avgSum: 0 },
  );
  const busiest = daily.reduce<DayPoint | null>(
    (best, point) => (!best || point.total > best.total ? point : best),
    null,
  );
  return {
    range: input.range,
    totals: {
      total: totals.total,
      safe: totals.safe,
      suspicious: totals.suspicious,
      highRisk: totals.highRisk,
      avgScore: totals.total ? Math.round(totals.avgSum / totals.total) : 0,
      highRiskShare: totals.total ? Math.round((totals.highRisk / totals.total) * 100) : 0,
      previousTotal: input.previousTotal,
    },
    daily,
    kinds: countKinds(input.rows),
    bands: scoreBands(input.rows),
    reasons: topReasons(input.rows),
    busiest: busiest && busiest.total > 0 ? busiest : null,
    streak: streak(daily),
    peakWeekday: peakWeekday(daily),
    plan: input.plan,
  };
}

/** RFC-4180-ish CSV cell: quote when the value could break a row. */
export function csvCell(value: string | number): string {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export type CsvCheck = {
  createdAt: string;
  kind: string;
  verdict: string;
  score: number;
  title: string;
  summary: string;
  excerpt: string;
};

/** Build a spreadsheet-ready CSV of the checks a person can export. */
export function checksToCsv(rows: CsvCheck[]): string {
  const header = ["Date", "Kind", "Verdict", "Score", "Title", "Summary", "Excerpt"];
  const lines = [header.join(",")];
  for (const row of rows) {
    lines.push(
      [
        csvCell(row.createdAt),
        csvCell(row.kind),
        csvCell(row.verdict === "high_risk" ? "high risk" : row.verdict),
        csvCell(row.score),
        csvCell(row.title),
        csvCell(row.summary),
        csvCell(row.excerpt),
      ].join(","),
    );
  }
  return `${lines.join("\r\n")}\r\n`;
}
