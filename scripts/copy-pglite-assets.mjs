#!/usr/bin/env node
/**
 * Mirror PGlite's runtime assets next to the bundled server.
 *
 * Why this exists
 * ---------------
 * PGlite (the embedded Postgres fallback used when `DATABASE_URL` is unset)
 * resolves its engine files with `new URL("./pglite.wasm", import.meta.url)` —
 * i.e. **relative to the module that loads it**. In a Vercel build that module
 * is bundled into
 *
 *     .vercel/output/functions/__server.func/_libs/electric-sql__pglite.mjs
 *
 * so at runtime the function looks for
 *
 *     .vercel/output/functions/__server.func/_libs/pglite.wasm
 *     .vercel/output/functions/__server.func/_libs/pglite.data
 *
 * The bundler (correctly, for a *client* build) also emits those two files as
 * hashed public assets under `.vercel/output/static/assets/`, which is the wrong
 * place for the server: the function has its own, separate filesystem, and
 * `static/` is served over HTTP, not read with `fs`.
 *
 * The failure mode is severe and easy to miss: the build succeeds, `/` returns
 * 200, and the first request that touches the database kills the process with
 *
 *     ENOENT: no such file or directory, open '.../_libs/pglite.data'
 *
 * so a "successful" deploy is dead on arrival whenever no `DATABASE_URL` is set.
 * Copying the assets into the function directory fixes the resolution without
 * touching the client build, and costs nothing when a real database is used.
 *
 * Idempotent, and a no-op on builds that do not produce a Vercel function.
 */
import { copyFile, mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const PGLITE_DIST = join(root, "node_modules", "@electric-sql", "pglite", "dist");
const FUNCTION_LIBS = join(root, ".vercel", "output", "functions", "__server.func", "_libs");

/**
 * Assets PGlite loads by name at runtime, next to its own module.
 *
 * `initdb.wasm` is easy to miss: it is only requested when PGlite *creates* a
 * fresh data directory, so a build that looks healthy still dies the first time
 * the embedded database bootstraps its schema. All three are required.
 */
const ASSETS = ["pglite.wasm", "pglite.data", "initdb.wasm"];

function log(message) {
  console.log(`[pglite-assets] ${message}`);
}

async function sizeOf(path) {
  try {
    const { size } = await stat(path);
    return size;
  } catch {
    return 0;
  }
}

async function main() {
  // A non-Vercel build (or a build that has not run Nitro yet) has nothing to
  // mirror. Say so plainly instead of failing the build.
  if (!existsSync(FUNCTION_LIBS)) {
    log(`no Vercel function bundle at ${FUNCTION_LIBS} — nothing to do.`);
    return;
  }
  if (!existsSync(PGLITE_DIST)) {
    log("PGlite is not installed — nothing to do.");
    return;
  }

  await mkdir(FUNCTION_LIBS, { recursive: true });

  let copied = 0;
  let alreadyThere = 0;
  for (const name of ASSETS) {
    const from = join(PGLITE_DIST, name);
    const to = join(FUNCTION_LIBS, name);

    // Compare sizes: a partially written file from an interrupted build must be
    // replaced, not trusted.
    const [sourceSize, targetSize] = await Promise.all([sizeOf(from), sizeOf(to)]);
    if (sourceSize === 0) {
      log(`WARNING: ${name} is missing from ${PGLITE_DIST} — the embedded database will not start.`);
      continue;
    }
    if (targetSize === sourceSize) {
      alreadyThere += 1;
      continue;
    }
    await copyFile(from, to);
    copied += 1;
    log(`${name} → _libs/ (${(sourceSize / 1024 / 1024).toFixed(1)} MB)`);
  }

  if (copied === 0 && alreadyThere === ASSETS.length) {
    log("already in place — embedded database will start.");
  } else {
    log(`done — ${copied} file(s) copied, ${alreadyThere} already present.`);
  }
}

main().catch((err) => {
  console.error("[pglite-assets] failed:", err?.message || err);
  process.exit(1);
});
