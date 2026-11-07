# Deployment

CI/CD runs on **GitHub Actions**: [`.github/workflows/ci-cd.yml`](./.github/workflows/ci-cd.yml).
Every push to `main` builds the app and, if the Vercel secrets are present, deploys it to
production. Pull requests run the build only.

```
push to main
     │
     ▼
┌─────────────┐   npm ci → typecheck (report only) → npm run build
│    build    │   emits .vercel/output  ← uploaded as an artifact
└─────────────┘
     │
     ├──────────────► ┌────────────┐  vercel deploy --prebuilt --prod
     │                │   deploy   │  (skips cleanly if a secret is missing)
     │                └────────────┘
     │
     └──────────────► ┌───────────────┐  what still needs configuring at runtime
                      │ config-health │
                      └───────────────┘
```

**The build is the gate.** `npm run build` must succeed. `npm run typecheck` runs but is
not blocking — this repo carries a small number of pre-existing errors in legacy files,
and the job reports its count against that baseline instead of failing on them. See
[Known type errors](#known-type-errors).

---

## 1. Deployment target

The app deploys to **Vercel** using Nitro's `vercel` preset (set in `vite.config.ts`),
which emits Vercel's **Build Output API v3** layout at `.vercel/output/`. Nothing else
needs configuring: `npm run build` produces the artifact, and the workflow ships that
exact artifact with `vercel deploy --prebuilt`.

| | |
| --- | --- |
| Node in CI | **22** (`.nvmrc`, `NODE_VERSION` in the workflow, `engines` in `package.json`) |
| Build command | `npm run build` → `vite build` + `db:migrate` |
| Output | `.vercel/output/` (config, functions, static) |
| Deploy command | `npx vercel@latest deploy --prebuilt --prod --yes --token …` |
| Build output in git | **Not committed** — `.vercel/` is gitignored; CI uploads `.vercel/output` as a run artifact |
| Scheduled job | `vercel.json` → `POST /api/digest/send`, Mondays 14:00 UTC |

Node 22 is not cosmetic, for two independent reasons:

- `@tanstack/start-*` declare `engines.node >= 22.12.0`.
- `npm test` runs the TypeScript suites with `--experimental-strip-types`, which Node 20
  rejects outright (`node: bad option`). On 20 the test script fails before a single test runs.

CI pins **22.18.0** (in `.nvmrc` and `NODE_VERSION`) so a 22.x LTS release is guaranteed to
be installable, while `engines` stays at `>=22.18.0` for local checkouts.

> **`vercel.json` sets `installCommand` to `npm install --omit=dev`.** That is correct for
> Vercel's own build image, which installs production dependencies only. The CI build step
> runs a plain `npm ci` because `vite` is a dev dependency — the build needs it. Both paths
> build the same app; only the dependency set differs.

> **Build output is not committed.** `.vercel/` is gitignored. The build writes
> `.vercel/output`, the workflow uploads it as a run artifact, and the deploy job downloads it
> and runs `vercel deploy --prebuilt`. Committing build output instead rewrites ~180
> content-hashed filenames on every build — enormous no-op diffs that obscure real changes.
> An earlier revision of this repo had 20 MB of stale output tracked; it has been removed.

---

## 2. Repository secrets

Add these under **Settings → Secrets and variables → Actions → New repository secret**.

### Required for the deploy to run

| Secret | Where to get it | Without it |
| --- | --- | --- |
| `VERCEL_TOKEN` | Vercel → **Account Settings → Tokens → Create Token** | Deploy job **skips** with a notice |
| `VERCEL_ORG_ID` | Vercel → project → **Settings → General → Team ID** | Deploy job **skips** with a notice |
| `VERCEL_PROJECT_ID` | Vercel → project → **Settings → General → Project ID** | Deploy job **skips** with a notice |

A missing secret **never fails the build**. The run reports green, the deploy job writes a
summary saying exactly which secret is absent, and the build artifact stays attached to the
run — so adding the secret and pressing **Re-run all jobs** deploys without a new commit.

You can also get all three in one go from a local checkout with the Vercel CLI:

```bash
npx vercel login
npx vercel link          # writes .vercel/project.json
cat .vercel/project.json # → orgId, projectId  (this file is gitignored)
```

### Optional for the build

These are passed to `npm run build` only. Every one of them is optional — the app is
designed to degrade, not crash.

| Secret | Effect during build | Without it |
| --- | --- | --- |
| `DATABASE_URL` | `npm run build` applies pending migrations from `migrations/` in one transaction each | The migrator logs `DATABASE_URL not set — skipping` and the build continues |
| `XAI_API_KEY` | Not needed at build time (read at request time) | Rules engine still produces verdicts |
| `BETTER_AUTH_SECRET` | Not needed at build time | Sessions use a process-local fallback |
| `VITE_APP_URL` | Base URL baked into the client bundle | Falls back to the request origin |
| `VITE_AUTH_ENABLED` | Defaults to `true` in the workflow | Sign-in gate defaults to on |

> **If `DATABASE_URL` is set, it must be reachable.** `npm run build` is
> `vite build && db:migrate`, so a bad or unreachable database fails the **build** — and
> therefore blocks the deploy. That is deliberate: you should never ship a build against an
> unmigrated database. The workflow detects this case and prints a hint naming the secret.
> Leave `DATABASE_URL` unset if you want to build without running migrations.

---

## 3. Runtime environment variables

Secrets in GitHub are for **CI**. The deployed app reads its environment from **Vercel →
Project → Settings → Environment Variables**. Set these there too, or the build will
succeed and the running app will be missing features.

| Variable | Required? | What breaks without it |
| --- | --- | --- |
| `DATABASE_URL` | **Strongly recommended** | Falls back to embedded **PGlite** — the app runs, but data does not persist across deploys or instances |
| `BETTER_AUTH_SECRET` | **Strongly recommended** | Sessions signed with a process-local fallback; users are logged out on every redeploy |
| `BETTER_AUTH_URL` | Recommended | Public origin of the app, e.g. `https://your-app.vercel.app` |
| `APP_URL` | Recommended | Base URL in digest email links (falls back to `VITE_APP_URL`, then the request origin) |
| `XAI_API_KEY` | Optional | No natural-language layer — the deterministic rules engine still scores every check |
| `RESEND_API_KEY` | Optional | Weekly digest reports `skipped` and sends nothing |
| `DIGEST_FROM` | Optional | Defaults to `AI Guardian <digest@ai-guardian.app>` |
| `DIGEST_SECRET` | Optional (recommended) | `POST /api/digest/send` answers **503** — set it so the cron route is protected (falls back to `CRON_SECRET`) |
| `VITE_AUTH_ENABLED` | Optional | `true` by default |

Generate a strong auth secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

<details>
<summary><strong>Getting a Postgres database</strong></summary>

Any Postgres 14+ works. On Vercel the shortest path is **Storage → Create → Postgres**
(Neon), which injects `DATABASE_URL` into the project automatically. Migrations then apply
themselves on the next build, because `npm run build` runs `db:migrate`.

To apply them by hand against any database:

```bash
DATABASE_URL='postgres://…' npm run db:migrate
```
</details>

---

## 4. What the workflow does, step by step

**`build`** (every push to `main`, every PR)

1. **Checkout** — `actions/checkout@v4`.
2. **Set up Node 22** — `actions/setup-node@v4` with `cache: npm`.
3. **Install** — `npm ci`; falls back to `npm install` with a warning if the lockfile is
   out of sync, so a stale lockfile is a visible warning rather than an `EUSAGE` failure.
4. **Typecheck** — `continue-on-error: true`. Reports the error count against the baseline.
5. **Build** — `npm run build`. **This is the gate.**
6. **Verify build output** — fails with a specific message if `.vercel/output` is missing.
7. **Upload artifact** — `.vercel/output`, 7-day retention.

**`deploy`** (push to `main` only, after `build` succeeds)

1. **Check required secrets** — sets `ready=false` and writes a summary naming what is
   missing when the Vercel secrets are absent.
2. **Download build output** — the artifact from `build`, unchanged.
3. **Bind Vercel project** — writes `.vercel/project.json` from the secrets.
4. **Deploy** — `vercel deploy --prebuilt --prod --yes`; the job's URL is the deployment URL.

**`config-health`** — writes a table of the runtime variables above with ✅/⬜ per variable,
so a green run still tells you what is left to configure.

---

## 6. Deploy artifact integrity (the PGlite asset fix)

A build can succeed, `/` can return 200, and the deploy can still be dead on arrival. This was
a real failure mode and is now fixed and guarded.

**The problem.** When `DATABASE_URL` is unset the app uses the embedded **PGlite** database.
PGlite locates its engine files with `new URL("./pglite.wasm", import.meta.url)` — relative to
*the module doing the loading*. In a Vercel build, that module is bundled to:

```
.vercel/output/functions/__server.func/_libs/electric-sql__pglite.mjs
```

so at runtime the function opens `_libs/pglite.wasm`, `_libs/pglite.data` and
`_libs/initdb.wasm`. The bundler emits those files as *hashed public assets* under
`static/assets/` instead — a separate filesystem from the function, served over HTTP rather
than read with `fs`. Result: the build passes, the homepage renders, and the first request
that touches the database kills the function with

```
ENOENT: no such file or directory, open '.../_libs/pglite.data'
```

`initdb.wasm` is the nastiest of the three: it is only requested when PGlite *creates* a fresh
data directory, so the app can look healthy until the very first bootstrap.

**The fix.** `scripts/copy-pglite-assets.mjs` copies all three assets from
`node_modules/@electric-sql/pglite/dist/` into the function's `_libs/` directory. It runs as
`npm run build:assets`, chained into `npm run build` after `vite build`, so it applies to CI,
Vercel's own build image, and a local `npm run build` alike. It is idempotent, compares sizes
so a partial file is replaced, and no-ops when there is no Vercel function bundle or no PGlite.

**The guard.** The **Verify build output** step asserts all three files exist and are non-empty,
so a regression fails the build with a message naming the file and the script, instead of
shipping a broken deploy.

**Verification performed.** A clean `npm run build` was served with
`npx srvx --static .vercel/output/static .vercel/output/functions/__server.func/index.mjs`, and
`/`, `/check`, `/card`, `/history`, `/insights`, `/family`, `/watch` all returned **HTTP 200**
with no errors in the log.

> Note: with a real `DATABASE_URL` set, PGlite is never loaded and these assets are inert — but
> they are still copied, costing ~17 MB in the bundle, so the build works either way without a
> second code path.

---

## 7. Known type errors

`npm run typecheck` reports **13 errors**, all pre-existing and all outside the files this
project's recent feature work touched:

| File | Errors | Cause |
| --- | --- | --- |
| `src/components/guardian/checker.tsx` | 5 | Server functions typed `Promise<unknown>` assigned where `Promise<CheckResponse>` is expected (TS2322) |
| `src/routes/settings.tsx` | 2 | `setState` passed a handler that accepts `unknown` (TS2345) |
| `src/routes/admin.tsx`, `family.tsx`, `watch.tsx`, `plans.tsx`, `learn.index.tsx`, `learn.$slug.tsx` | 1 each | Same untyped server-function payload flowing into a typed `setState` (TS2345) |

They share one root cause: `src/lib/guardian/api.ts` carries a whole-file `// @ts-nocheck`,
so every `createServerFn` it exports is inferred as returning `unknown` at each call site.
Removing that `@ts-nocheck` and typing the returns would clear all 13 at once — that is a
contained follow-up, not a reason to block deploys in the meantime.

Typecheck is therefore **reported, never blocking**: failing every deploy on errors
unrelated to the change under review trains people to ignore red builds. The count is
printed in the job summary next to the baseline, so a change that *adds* type errors is
visible immediately (`::warning` when the count exceeds 13).

To make typecheck blocking once `api.ts` is typed, delete `continue-on-error: true`
from the **Typecheck** step and change the baseline to `0`.

---

## 8. Running the pipeline locally

```bash
npm ci
npm run typecheck              # report only — see above
npm run build                  # the real gate; emits .vercel/output
npx vercel deploy --prebuilt   # deploy exactly what you just built
```

Preview locally from the same artifact:

```bash
npx srvx --static .vercel/output/static .vercel/output/functions/__server.func/index.mjs
```

---

## 9. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Deploy job is **grey / skipped** | One of `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` is unset | Add it, then **Re-run all jobs** |
| `Error: No existing credentials found` | `VERCEL_TOKEN` expired or revoked | Create a new token in Vercel and update the secret |
| `The specified project does not exist` | `VERCEL_PROJECT_ID` points at another project | Copy it from **Project → Settings → General** |
| Build fails on `vite: not found` | Something ran `npm ci --omit=dev` | CI must run a plain `npm ci`; `vite` is a dev dependency |
| `EBADENGINE` warnings | Node < 22.12 | Use Node 22 (`nvm use`) — CI already does |
| Build succeeds, app 500s at runtime | Runtime env vars not set in Vercel | See [§3](#3-runtime-environment-variables) and the `config-health` summary |
| Build succeeds, homepage 200, **database call kills the function** with `ENOENT …/_libs/pglite.data` | PGlite assets not copied into the function | Fixed by `npm run build:assets` — see [§6](#6-deploy-artifact-integrity-the-pglite-asset-fix) |
| Sessions drop after each deploy | `BETTER_AUTH_SECRET` not set in Vercel | Set it to a fixed random value |
| Digest never arrives | `RESEND_API_KEY` / `DIGEST_SECRET` missing | Set both; check `POST /api/digest/send` returns `ok` |
