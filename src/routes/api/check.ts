import { createFileRoute } from "@tanstack/react-router";
import { runApiCheck } from "@/lib/guardian/api";

/**
 * Public check endpoint for the browser extension.
 *
 *   POST /api/check
 *   Authorization: Bearer grd_live_\u2026
 *   { "url": "https://\u2026", "title": "\u2026", "selection": "\u2026" }
 *
 * The extension runs on pages the person is already looking at, so the flow has
 * to be one request: no cookie, no CSRF token, no redirect. Identity is the API
 * key \u2014 resolved server-side to a user id, which is the ONLY id the check uses.
 * A caller cannot check on behalf of somebody else.
 *
 * CORS is open (`*`) because the key is the credential; a browser could already
 * forge an Origin header, so restricting it would buy nothing.
 */

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...CORS },
  });
}

export const Route = createFileRoute("/api/check")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: CORS }),

      // A browser will sometimes probe with GET (e.g. a service worker retry).
      GET: () =>
        json({
          ok: false,
          error: "Use POST with a Bearer API key. Create one in AI Guardian \u2192 Settings \u2192 Browser extension.",
        }, 405),

      POST: async ({ request }) => {
        const { resolveKey } = await import("@/lib/guardian/api-keys.server");
        const identity = await resolveKey(request.headers.get("authorization"));
        if (!identity) {
          return json(
            {
              ok: false,
              code: "bad_key",
              error:
                "That API key is missing, revoked, or wrong. Open AI Guardian \u2192 Settings \u2192 Browser extension and paste a fresh key into the extension options.",
            },
            401,
          );
        }

        let body: { url?: unknown; title?: unknown; selection?: unknown } = {};
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return json({ ok: false, error: "Send JSON with `url`, `title`, and optional `selection`." }, 400);
        }

        try {
          const result = (await runApiCheck(identity.userId, body)) as Record<string, unknown>;
          if (!result || result.ok !== true) {
            return json(result ?? { ok: false, error: "The check did not finish." }, 200);
          }
          return json(result, 200);
        } catch (err) {
          const message = err instanceof Error ? err.message : "The check did not finish.";
          return json({ ok: false, error: message }, 200);
        }
      },
    },
  },
});
