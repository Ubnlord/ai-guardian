import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

/**
 * API-key server functions for the browser extension.
 *
 * Thin wrappers: every bit of crypto lives in `api-keys.server.ts`, imported
 * dynamically inside the handler so the client bundle never sees `node:crypto`.
 * Keys are always scoped to the calling `context.userId` \u2014 a client can never
 * name another account.
 */

const MAX_KEYS = 5;

const clean = (value: unknown, max: number): string =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export const listApiKeys = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const mod = await import("./api-keys.server");
    return mod.listKeys(context.userId);
  });

export const createApiKey = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => ({ name: clean((input as { name?: unknown })?.name, 40) || "Browser extension" }))
  .handler(async ({ context, data }) => {
    const mod = await import("./api-keys.server");
    return mod.createKey(context.userId, data.name, MAX_KEYS);
  });

export const revokeApiKey = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => ({ id: clean((input as { id?: unknown })?.id, 80) }))
  .handler(async ({ context, data }) => {
    const mod = await import("./api-keys.server");
    if (!data.id) throw new Error("Missing key.");
    return { ok: await mod.revokeKey(context.userId, data.id) };
  });
