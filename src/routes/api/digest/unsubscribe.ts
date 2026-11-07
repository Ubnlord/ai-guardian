import { createFileRoute } from "@tanstack/react-router";

/**
 * One-click unsubscribe.
 *
 *   GET  /api/digest/unsubscribe?token=...   \u2014 the link in the email footer
 *   POST /api/digest/unsubscribe?token=...   \u2014 RFC 8058 one-click, sent by the
 *                                              mail client itself
 *
 * The token is the credential: it is per-user and random, so this works from an
 * email client where there is no session cookie. Both verbs are supported because
 * Gmail and Apple Mail POST to the `List-Unsubscribe` URL without a human click.
 */

function page(title: string, body: string, status = 200): Response {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title></head>
<body style="margin:0;background:#071018;color:#e8f0f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;">
  <main style="max-width:520px;margin:0 auto;padding:64px 24px;">
    <div style="font-size:17px;font-weight:600;">AI Guardian</div>
    <div style="font-family:ui-monospace,monospace;font-size:10px;letter-spacing:2px;color:#a9bdd0;margin-top:2px;">WEEKLY DIGEST</div>
    <h1 style="font-size:22px;margin:24px 0 8px;">${title}</h1>
    <p style="color:#a9bdd0;font-size:15px;line-height:1.6;margin:0;">${body}</p>
    <p style="margin-top:28px;"><a href="/settings" style="color:#3ddec0;font-weight:600;">Open settings</a></p>
  </main>
</body></html>`;
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

async function handle(request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!token) return page("That link is incomplete", "The unsubscribe link is missing its token. Open settings to turn the digest off instead.", 400);
  const { unsubscribeByToken } = await import("@/lib/guardian/digest.server");
  const done = await unsubscribeByToken(token);
  if (!done) {
    return page(
      "That link is no longer valid",
      "We could not match this link to an account. It may have been rotated. Open settings to turn the weekly digest off instead.",
      404,
    );
  }
  return page("You are unsubscribed", "You will not get the weekly risk digest again. Your checks and your history are untouched \u2014 you can turn it back on any time in settings.");
}

export const Route = createFileRoute("/api/digest/unsubscribe")({
  server: {
    handlers: {
      GET: ({ request }) => handle(request),
      POST: ({ request }) => handle(request),
    },
  },
});
