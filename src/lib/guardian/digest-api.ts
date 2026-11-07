import { createServerFn as createFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type { Digest } from "./digest";

/**
 * Digest server functions for the Settings page.
 *
 * Thin wrappers over `digest.server.ts`, imported dynamically inside each handler
 * so the client bundle never pulls in `node:crypto` or the mail credentials.
 */

export type DigestPrefs = { optOut: boolean; email: string | null };

export const getDigestPrefs = createFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<DigestPrefs> => {
    const mod = await import("./digest.server");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ email: string | null }>`
      select u.email from "user" u where u.id = ${context.userId}
    `;
    return { optOut: await mod.digestOptOut(context.userId), email: rows[0]?.email ?? null };
  });

export const setDigestPrefs = createFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => ({ optOut: Boolean((input as { optOut?: unknown })?.optOut) }))
  .handler(async ({ context, data }): Promise<{ ok: true; optOut: boolean }> => {
    const mod = await import("./digest.server");
    await mod.setDigestOptOut(context.userId, data.optOut);
    return { ok: true, optOut: data.optOut };
  });

/** The signed-in person's digest for the current week, for the in-app preview. */
export const previewDigest = createFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<Digest> => {
    const mod = await import("./digest.server");
    return mod.loadDigest(context.userId);
  });
