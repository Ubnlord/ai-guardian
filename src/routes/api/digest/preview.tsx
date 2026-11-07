import { createFileRoute } from "@tanstack/react-router";

/**
 * Browser preview of the weekly digest email.
 *
 *   GET /api/digest/preview            \u2014 the signed-in person's own digest
 *   GET /api/digest/preview?userId=... \u2014 an admin previewing someone else
 *
 * Renders the exact HTML the email sends, so you can check the layout in a real
 * browser before a single message goes out. It is session-gated: you can only see
 * your own digest unless you are an admin.
 */

export const Route = createFileRoute("/api/digest/preview")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getSessionUser } = await import("@/lib/auth/verify.server");
        const viewer = await getSessionUser();
        if (!viewer) {
          return new Response("Sign in to preview your digest.", { status: 401, headers: { "content-type": "text/plain" } });
        }

        const requested = new URL(request.url).searchParams.get("userId") ?? "";
        const mod = await import("@/lib/guardian/digest.server");
        const { getSql } = await import("@/lib/db");

        let targetId = viewer.id;
        if (requested && requested !== viewer.id) {
          const sql = await getSql();
          const rows = await sql<{ role: string }>`select role from profiles where user_id = ${viewer.id}`;
          if (rows[0]?.role !== "admin") {
            return new Response("Only an admin can preview another account's digest.", {
              status: 403,
              headers: { "content-type": "text/plain" },
            });
          }
          targetId = requested;
        }

        const sql = await getSql();
        const profile = await sql<{ display_name: string }>`
          select display_name from profiles where user_id = ${targetId}
        `;
        const digest = await mod.loadDigest(targetId);
        const token = await mod.ensureDigestToken(targetId);
        const links = mod.digestLinks(token);
        const { digestHtml } = await import("@/lib/guardian/digest-email");

        const html = digestHtml({
          digest,
          displayName: profile[0]?.display_name ?? "",
          appUrl: `${mod.APP_URL}/insights`,
          unsubscribeUrl: links.unsubscribeUrl,
          preferencesUrl: links.preferencesUrl,
        });

        return new Response(html, {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
        });
      },
    },
  },
});
