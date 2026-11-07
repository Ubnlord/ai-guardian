import { createHash, randomBytes, randomUUID } from "node:crypto";
import { getSql } from "@/lib/db";

/**
 * API keys for the browser extension (server-only).
 *
 * A key is shown once, at creation, and stored as a SHA-256 hash \u2014 the same way
 * a password would be. Lookup hashes the presented secret and matches the hash,
 * so a database leak cannot be replayed against the API.
 *
 * Kept in a `.server.ts` module so `randomBytes`/`createHash` never reach the
 * browser bundle: `api-keys.ts` imports this through a dynamic `import()` from
 * inside a server-function handler.
 */

export const KEY_PREFIX = "grd_live_";

/** Characters we show in the UI so a person can tell keys apart. */
const VISIBLE = 8;

function hashKey(raw: string): string {
  return createHash("sha256").update(raw.trim()).digest("hex");
}

function mint(): { raw: string; prefix: string; hash: string } {
  const secret = randomBytes(24).toString("hex");
  const raw = `${KEY_PREFIX}${secret}`;
  return { raw, prefix: `${KEY_PREFIX}${secret.slice(0, VISIBLE)}`, hash: hashKey(raw) };
}

export type KeyRow = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revoked: boolean;
};

export async function listKeys(userId: string): Promise<KeyRow[]> {
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    name: string;
    prefix: string;
    created_at: string;
    last_used_at: string | null;
    revoked_at: string | null;
  }>`
    select id, name, prefix,
      to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
      case when last_used_at is null then null
        else to_char(last_used_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') end as last_used_at,
      case when revoked_at is null then null
        else to_char(revoked_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') end as revoked_at
    from api_keys
    where user_id = ${userId}
    order by created_at desc
    limit 25
  `;
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    prefix: row.prefix,
    createdAt: String(row.created_at),
    lastUsedAt: row.last_used_at ? String(row.last_used_at) : null,
    revoked: Boolean(row.revoked_at),
  }));
}

/** Create a key and return the plaintext exactly once. */
export async function createKey(
  userId: string,
  name: string,
  cap: number,
): Promise<{ ok: true; key: string; prefix: string; id: string } | { ok: false; error: string }> {
  const sql = await getSql();
  const live = await sql<{ n: number }>`
    select count(*)::int as n from api_keys
    where user_id = ${userId} and revoked_at is null
  `;
  if (Number(live[0]?.n ?? 0) >= cap) {
    return { ok: false, error: `You can keep ${cap} active keys. Revoke one first.` };
  }
  const minted = mint();
  const id = randomUUID();
  await sql`
    insert into api_keys (id, user_id, name, prefix, hash)
    values (${id}, ${userId}, ${name.slice(0, 40)}, ${minted.prefix}, ${minted.hash})
  `;
  return { ok: true, key: minted.raw, prefix: minted.prefix, id };
}

export async function revokeKey(userId: string, id: string): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql<{ id: string }>`
    update api_keys set revoked_at = now()
    where id = ${id} and user_id = ${userId} and revoked_at is null
    returning id
  `;
  return rows.length > 0;
}

export type KeyIdentity = { userId: string; keyId: string };

/**
 * Resolve `Authorization: Bearer grd_live_\u2026` to a user.
 *
 * Constant work regardless of whether the key exists (one indexed lookup), the
 * key is revoked, or the shape is wrong \u2014 no branch reveals which keys exist.
 */
export async function resolveKey(raw: string | null): Promise<KeyIdentity | null> {
  const token = (raw ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token.startsWith(KEY_PREFIX) || token.length < KEY_PREFIX.length + 16) return null;
  const sql = await getSql();
  const rows = await sql<{ id: string; user_id: string }>`
    select id, user_id from api_keys
    where hash = ${hashKey(token)} and revoked_at is null
    limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  await sql`update api_keys set last_used_at = now() where id = ${row.id}`;
  return { userId: row.user_id, keyId: row.id };
}
