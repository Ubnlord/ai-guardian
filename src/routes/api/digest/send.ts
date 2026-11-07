import { createFileRoute } from "@tanstack/react-router";

/**
 * Weekly digest sender — the scheduled job's entry point.
 *
 *   POST /api/digest/send
 *   Authorization: Bearer <DIGEST_SECRET>   (or Vercel's CRON_SECRET)
 *
 * Vercel Cron calls this once a week (see `vercel.json`). It is also safe to call
 * by hand with the secret, which is how you test it before trusting the schedule.
 *
 * The job is deliberately forgiving: one person's failure never stops the run, and
 * a missing `RESEND_API_KEY` is reported as `skipped` rather than `failed`, so an
 * environment that has not been wired up yet still answers honestly.
 */

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

/** Constant-time-ish comparison so a wrong secret cannot be timed out. */
function secretMatches(presented: string, expected: string): boolean {
  if (!expected || presented.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) diff |= presented.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

async function run(request: Request): Promise<Response> {
  const expected = process.env.DIGEST_SECRET?.trim() || process.env.CRON_SECRET?.trim() || "";
  const presented = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!expected) {
    return json({ ok: false, error: "DIGEST_SECRET is not configured on the server." }, 503);
  }
  if (!secretMatches(presented, expected)) {
    return json({ ok: false, error: "Unauthorized." }, 401);
  }

  const mod = await import("@/lib/guardian/digest.server");
  const recipients = await mod.listRecipients();

  let sent = 0;
  let skipped = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const person of recipients) {
    try {
      const digest = await mod.loadDigest(person.userId);
      const token = await mod.ensureDigestToken(person.userId);
      const links = mod.digestLinks(token);
      const result = await mod.sendDigestEmail({
        to: person.email,
        displayName: person.displayName,
        digest,
        unsubscribeUrl: links.unsubscribeUrl,
        preferencesUrl: links.preferencesUrl,
      });
      if (result.ok) {
        sent += 1;
        await mod.markDigestSent(person.userId);
      } else if (result.skipped) {
        skipped += 1;
        if (errors.length < 3) errors.push(result.reason);
      } else {
        failed += 1;
        if (errors.length < 3) errors.push(result.error);
      }
    } catch (err) {
      failed += 1;
      if (errors.length < 3) errors.push(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  return json({
    ok: true,
    recipients: recipients.length,
    sent,
    skipped,
    failed,
    errors,
    ranAt: new Date().toISOString(),
  });
}

/**
 * Vercel Cron issues a GET with `Authorization: Bearer $CRON_SECRET`, so GET and
 * POST share one handler. Both require the secret — neither is public.
 */
export const Route = createFileRoute("/api/digest/send")({
  server: {
    handlers: {
      GET: ({ request }) => run(request),
      POST: ({ request }) => run(request),
    },
  },
});
