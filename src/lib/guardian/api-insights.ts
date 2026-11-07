import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { checksLimit, asPlan } from "./plans";
import {
  asRange,
  buildInsights,
  checksToCsv,
  shiftDay,
  today,
  type CsvCheck,
  type InsightRow,
  type Insights,
} from "./insights";

/**
 * Insights + export server functions.
 *
 * Deliberately separate from `api.ts` (which is `@ts-nocheck` legacy) so these
 * carry real return types into the client. Every query is scoped to the
 * authenticated `context.userId` — never a client-sent id.
 */

const num = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};

async function planUsage(userId: string): Promise<{ used: number; limit: number }> {
  const sql = await getSql();
  const rows = await sql<{ plan: string; checks_used: number }>`
    select plan, checks_used from profiles where user_id = ${userId}
  `;
  const plan = asPlan(rows[0]?.plan ?? "free");
  return { used: num(rows[0]?.checks_used), limit: checksLimit(plan) };
}

async function loadRows(userId: string, fromDay: string): Promise<InsightRow[]> {
  const sql = await getSql();
  return sql<InsightRow>`
    select
      to_char(created_at at time zone 'UTC', 'YYYY-MM-DD') as day,
      kind,
      verdict,
      score::int as score,
      reasons
    from checks
    where user_id = ${userId}
      and created_at >= ${`${fromDay} 00:00:00+00`}::timestamptz
    order by created_at desc
  `;
}

/**
 * Aggregated analytics for the signed-in account over a 7/30/90 day window.
 * Reads only the `checks` table, so it works identically on Neon and PGlite.
 */
export const getInsights = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const data = (input ?? {}) as { range?: unknown };
    return { range: asRange(data.range) };
  })
  .handler(async ({ context, data }): Promise<Insights> => {
    const endDay = today();
    const windowStart = shiftDay(endDay, -(data.range - 1));
    const previousStart = shiftDay(windowStart, -data.range);

    const rows = await loadRows(context.userId, windowStart);
    const previous = await loadRows(context.userId, previousStart);
    const plan = await planUsage(context.userId);

    return buildInsights({
      range: data.range,
      rows,
      previousTotal: previous.filter((row) => row.day < windowStart).length,
      plan,
      endDay,
    });
  });

const csvText = (value: unknown, max: number): string =>
  typeof value === "string" ? value.slice(0, max) : "";

/**
 * Everything the person has ever checked, as CSV. Used by the History export
 * button; returns the text plus a suggested filename.
 */
export const exportChecks = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<{ filename: string; csv: string; count: number }> => {
    const sql = await getSql();
    const rows = await sql<CsvCheck>`
      select
        to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "createdAt",
        kind,
        verdict,
        score::int as score,
        title,
        summary,
        excerpt
      from checks
      where user_id = ${context.userId}
      order by created_at desc
      limit 5000
    `;
    const clean = rows.map((row) => ({
      createdAt: csvText(row.createdAt, 40),
      kind: csvText(row.kind, 20),
      verdict: csvText(row.verdict, 20),
      score: num(row.score),
      title: csvText(row.title, 200),
      summary: csvText(row.summary, 700),
      excerpt: csvText(row.excerpt, 400),
    }));
    return {
      filename: `ai-guardian-checks-${today()}.csv`,
      csv: checksToCsv(clean),
      count: clean.length,
    };
  });

export type HistoryFilter = {
  q: string;
  kind: string;
  verdict: string;
};

export type HistoryRow = {
  id: string;
  kind: string;
  verdict: string;
  score: number;
  title: string;
  summary: string;
  reasons: string;
  actions: string;
  uncertainty: string;
  source: string;
  excerpt: string;
  createdAt: string;
};

/**
 * Searchable history. Filtering happens in SQL so it stays fast as the record
 * grows; `q` is matched against title, summary and the stored excerpt.
 */
export const searchHistory = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown): HistoryFilter => {
    const data = (input ?? {}) as Record<string, unknown>;
    return {
      q: csvText(data.q, 120).trim(),
      kind: ["message", "url", "number", "image", "investment"].includes(String(data.kind))
        ? String(data.kind)
        : "",
      verdict: ["safe", "suspicious", "high_risk"].includes(String(data.verdict))
        ? String(data.verdict)
        : "",
    };
  })
  .handler(async ({ context, data }): Promise<HistoryRow[]> => {
    const sql = await getSql();
    const term = data.q ? `%${data.q.replace(/[%_\\]/g, "\\$&")}%` : null;
    const kind = data.kind || null;
    const verdict = data.verdict || null;

    return sql<HistoryRow>`
      select
        id,
        kind,
        verdict,
        score::int as score,
        title,
        summary,
        reasons,
        actions,
        uncertainty,
        source,
        excerpt,
        to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "createdAt"
      from checks
      where user_id = ${context.userId}
        and (${term}::text is null
             or title ilike ${term}
             or summary ilike ${term}
             or excerpt ilike ${term})
        and (${kind}::text is null or kind = ${kind})
        and (${verdict}::text is null or verdict = ${verdict})
      order by created_at desc
      limit 200
    `;
  });

/**
 * One saved check by id, scoped to the caller.
 *
 * Used by the scam-card page, which needs the full record (reasons, actions) for
 * a single check rather than the list. Returns null when the id is unknown or
 * belongs to somebody else — the `user_id` filter is what makes that safe.
 */
export const getCheck = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: unknown) => ({ id: csvText((input as { id?: unknown })?.id, 80) }))
  .handler(async ({ context, data }): Promise<HistoryRow | null> => {
    if (!data.id) return null;
    const sql = await getSql();
    const rows = await sql<HistoryRow>`
      select
        id,
        kind,
        verdict,
        score::int as score,
        title,
        summary,
        reasons,
        actions,
        uncertainty,
        source,
        excerpt,
        to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as "createdAt"
      from checks
      where user_id = ${context.userId} and id = ${data.id}
      limit 1
    `;
    return rows[0] ?? null;
  });
