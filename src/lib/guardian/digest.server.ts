import { randomBytes } from "node:crypto";
import { getSql } from "@/lib/db";
import { shiftDay, today } from "./insights";
import { buildDigest, digestSubject, type Digest, type DigestRow } from "./digest";
import { digestHtml, digestText } from "./digest-email";

/**
 * Weekly digest \u2014 server side (DB reads, email delivery, tokens).
 *
 * Kept in a `.server.ts` module so `node:crypto` and the mail credentials never
 * reach the browser bundle. The route handlers import this dynamically.
 */

const APP_URL =
  process.env.APP_URL?.trim() ||
  process.env.VITE_APP_URL?.trim() ||
  "https://ai-guardian.vercel.app";

/** The 7-day window the digest covers, ending today (UTC). */
export function digestWindow(endDay = today()): { weekStart: string; weekEnding: string; previousStart: string } {
  const weekEnding = endDay;
  const weekStart = shiftDay(endDay, -6);
  const previousStart = shiftDay(weekStart, -7);
  return { weekStart, weekEnding, previousStart };
}

async function loadRows(userId: string, fromDay: string, toDay: string): Promise<DigestRow[]> {
  const sql = await getSql();
  return sql<DigestRow>`
    select
      to_char(created_at at time zone 'UTC', 'YYYY-MM-DD') as day,
      kind,
      verdict,
      score::int as score,
      title,
      summary,
      reasons
    from checks
    where user_id = ${userId}
      and created_at >= ${`${fromDay} 00:00:00+00`}::timestamptz
      and created_at < ${`${shiftDay(toDay, 1)} 00:00:00+00`}::timestamptz
    order by created_at desc
  `;
}

/** Build one person's digest for the week ending `endDay`. */
export async function loadDigest(userId: string, endDay = today()): Promise<Digest> {
  const { weekStart, weekEnding, previousStart } = digestWindow(endDay);
  const rows = await loadRows(userId, weekStart, weekEnding);
  const previous = await loadRows(userId, previousStart, shiftDay(weekStart, -1));
  return buildDigest({ rows, previousTotal: previous.length, weekStart, weekEnding });
}

/**
 * The per-user unsubscribe token, minted on first use.
 *
 * A token (rather than a session) is what lets someone unsubscribe from inside
 * their email client, where there is no cookie. It is random and per-user, so it
 * can be rotated without touching anyone else.
 */
export async function ensureDigestToken(userId: string): Promise<string> {
  const sql = await getSql();
  const rows = await sql<{ digest_token: string }>`
    select digest_token from profiles where user_id = ${userId}
  `;
  const existing = rows[0]?.digest_token;
  if (existing) return existing;
  const token = randomBytes(20).toString("hex");
  await sql`update profiles set digest_token = ${token} where user_id = ${userId}`;
  return token;
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  if (!token || token.length < 16) return false;
  const sql = await getSql();
  const rows = await sql<{ user_id: string }>`
    update profiles set digest_opt_out = true, updated_at = now()
    where digest_token = ${token}
    returning user_id
  `;
  return rows.length > 0;
}

export async function setDigestOptOut(userId: string, optOut: boolean): Promise<void> {
  const sql = await getSql();
  await sql`
    update profiles set digest_opt_out = ${optOut}, updated_at = now()
    where user_id = ${userId}
  `;
}

export async function digestOptOut(userId: string): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql<{ digest_opt_out: boolean }>`
    select digest_opt_out from profiles where user_id = ${userId}
  `;
  return Boolean(rows[0]?.digest_opt_out);
}

export type DigestRecipient = { userId: string; email: string; displayName: string };

/** Everyone who should get the digest: has an email, has not opted out. */
export async function listRecipients(): Promise<DigestRecipient[]> {
  const sql = await getSql();
  const rows = await sql<{ user_id: string; email: string; display_name: string }>`
    select p.user_id, u.email, p.display_name
    from profiles p
    join "user" u on u.id = p.user_id
    where p.digest_opt_out = false
      and u.email is not null
      and u.email <> ''
    order by p.updated_at desc
    limit 500
  `;
  return rows.map((row) => ({
    userId: String(row.user_id),
    email: String(row.email),
    displayName: String(row.display_name ?? ""),
  }));
}

export async function markDigestSent(userId: string): Promise<void> {
  const sql = await getSql();
  await sql`update profiles set digest_sent_at = now() where user_id = ${userId}`;
}

export type SendResult =
  | { ok: true; id: string | null }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; skipped: false; error: string };

/**
 * Send one digest email.
 *
 * Uses Resend's REST API over `fetch` \u2014 no SDK, no dependency, and it works in
 * any runtime. When `RESEND_API_KEY` is not set the send is *skipped* rather than
 * failed, so the scheduled job can run in an environment that has not been wired
 * up yet and still report honestly.
 */
export async function sendDigestEmail(input: {
  to: string;
  displayName: string;
  digest: Digest;
  unsubscribeUrl: string;
  preferencesUrl: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.DIGEST_FROM?.trim() || "AI Guardian <digest@ai-guardian.app>";
  if (!apiKey) {
    return { ok: false, skipped: true, reason: "RESEND_API_KEY is not set, so no email was sent." };
  }

  const emailInput = {
    digest: input.digest,
    displayName: input.displayName,
    appUrl: `${APP_URL}/insights`,
    unsubscribeUrl: input.unsubscribeUrl,
    preferencesUrl: input.preferencesUrl,
  };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: digestSubject(input.digest),
        html: digestHtml(emailInput),
        text: digestText(emailInput),
        headers: {
          "List-Unsubscribe": `<${input.unsubscribeUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }),
    });
    const payload = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;
    if (!response.ok) {
      return { ok: false, skipped: false, error: payload?.message ?? `Resend returned HTTP ${response.status}.` };
    }
    return { ok: true, id: payload?.id ?? null };
  } catch (err) {
    return { ok: false, skipped: false, error: err instanceof Error ? err.message : "The send failed." };
  }
}

/** URLs the email needs, derived from the app base. */
export function digestLinks(token: string): { unsubscribeUrl: string; preferencesUrl: string } {
  return {
    unsubscribeUrl: `${APP_URL}/api/digest/unsubscribe?token=${encodeURIComponent(token)}`,
    preferencesUrl: `${APP_URL}/settings`,
  };
}

export { APP_URL };
