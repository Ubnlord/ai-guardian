<div align="center">

# 🛡️ AI Guardian

**The safety layer between you and the internet.**

Paste a message, a link, a number, a photo, or an "investment" — get a straight answer, the reasons behind it, and the next move. Built for the scams people actually get: cloned banks, fake job offers, money-doubling schemes, and a voice that sounds like family.

[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e.svg)](./LICENSE)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TanStack Start](https://img.shields.io/badge/TanStack-Start-ff4154.svg)
![Postgres](https://img.shields.io/badge/Postgres-ready-336791.svg)

</div>

---

## Why this exists

Fraud does not arrive as an obvious lie. It arrives as a text that looks like your bank, a job that pays too well, a link that is one letter off, or a call from a number that says it is your son. The people who lose the most are the ones with the least time to check.

AI Guardian is a **second look** that takes ten seconds. It reads what you paste, scores the risk from 0 to 100, explains *why*, and tells you what to do next — in plain language, in your language.

> A low score is not permission to send money. A high score is not proof of a crime. Guardian is a second look, not a guarantee — always verify on a channel you already trust.

---

## What it does

| | |
|---|---|
| 🔎 **Check anything** | Messages, links, phone numbers, screenshots/photos, and investment pitches — Guardian works out what it is and checks it in one go. |
| 🎯 **A verdict you can act on** | Every check returns a **0–100 score**, a band (Safe / Suspicious / High risk), the **reasons** behind it, and **concrete next steps**. |
| 📊 **Insights dashboard** | Your own risk record, visualised: checks per day, average score over time, what you check most, score distribution, and the patterns that keep coming back. |
| 🔔 **Notification centre** | One bell for everything that needs you — family-circle alerts, your own high-risk verdicts, fresh Guardian Watch reports, and low-allowance nudges. |
| 🗂️ **Searchable history** | Full-text search plus filters by type and verdict. Export everything to **CSV**, or generate a **printable risk report**. |
| 🧩 **Browser extension** | A Manifest V3 extension for Chrome, Edge, and Firefox. One click (or a right-click) checks the page you are on and shows the score, verdict, and reasons in a popup. |
| 🖼️ **Scam cards** | Turn any check into a shareable warning image — score, verdict, scam type, warning signs, and one line of advice — ready for a family WhatsApp group. |
| 📧 **Weekly digest** | A scheduled email summarising your week: checks run, average score, high-risk items, recurring patterns, and a tip. One-click unsubscribe. |
| 👨‍👩‍👧 **Family Guardian** | A private circle with a shared safety phrase (stored as a hash) so "it's me, send the money" never works again. |
| 📡 **Guardian Watch** | Community-reported numbers and links, so a scam caught by one person warns the next. |
| 📚 **Lessons & playbooks** | Short, practical guidance and step-by-step playbooks for the situations that actually happen. |
| 🌍 **Five languages** | English, French, Spanish, Portuguese, and Arabic — with full RTL support. |
| 🔐 **Accounts & privacy** | Real authentication, per-user data isolation, and history you can delete or switch off at any time. |

---

## Screenshots

> Drop your own captures into `screenshots/` — the app already ships with a set.

| Landing | Dashboard |
|---|---|
| ![Landing page](screenshots/hero-settled.png) | ![Dashboard](screenshots/dashboard.png) |

| A verdict | Guardian Watch |
|---|---|
| ![Verdict](screenshots/verdict.png) | ![Watch](screenshots/watch.png) |

| Scan a document | Check hub |
|---|---|
| ![Scan](screenshots/scan.png) | ![Check hub](screenshots/check-hub.png) |

| Mobile dashboard | Mobile number check |
|---|---|
| ![Mobile dashboard](screenshots/dashboard-mobile.png) | ![Mobile number](screenshots/number-mobile.png) |

| Browser extension popup | Scam card |
|---|---|
| ![Extension popup](screenshots/extension-popup.png) | ![Scam card](screenshots/scam-card.png) |

| Weekly digest email |
|---|
| ![Weekly digest](screenshots/digest-email.png) |

---

## Tech stack

- **Framework** — [TanStack Start](https://tanstack.com/start) + TanStack Router (file-based, type-safe routes) on Vite 8
- **UI** — React 19, TypeScript 5.7, Tailwind CSS 4, Radix primitives, `lucide-react` icons, `recharts` charts
- **Data** — PostgreSQL via `pg`/Kysely, with an embedded **PGlite** fallback so the app runs with zero external services
- **Auth** — [Better Auth](https://better-auth.com) with server-side middleware and per-user row scoping
- **AI** — xAI Grok (`grok-3-mini`) for the language layer, with a deterministic rules engine underneath so a verdict is always produced
- **Deploy** — Nitro / Vercel

---

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure

The app runs with **no configuration** — it falls back to an embedded PGlite database. To use a real Postgres instance and the AI layer, set:

```bash
# Database (optional — omit to use the embedded PGlite fallback)
DATABASE_URL=postgres://user:password@host:5432/guardian

# AI layer (optional — the rules engine still produces verdicts without it)
XAI_API_KEY=your_xai_key

# Auth
VITE_AUTH_ENABLED=true
VITE_PUBLIC_HOSTNAME=http://localhost:8080
```

### 3. Run

```bash
npm run dev        # http://localhost:8080
```

Migrations run automatically on build; to apply them by hand:

```bash
npm run db:migrate
```

### 4. Quality checks

```bash
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm test           # node:test suites
npm run build      # production build + migrations
```

---

## Project structure

```
src/
├── routes/                 # file-based pages (check, history, insights, report, card, watch, family, …)
│   └── api/                # server endpoints: check (extension), digest (send / preview / unsubscribe)
├── components/guardian/    # app shell, verdict card, notification bell, scam-card studio, UI primitives
├── lib/
│   ├── guardian/           # domain logic: heuristics, plans, watch, insights, notify, share-card, digest, api
│   ├── auth/               # Better Auth client, middleware, gates
│   └── db.ts               # Postgres / PGlite connection
extension/                  # Manifest V3 browser extension (Chrome / Edge / Firefox)
├── manifest.json           # permissions, action, options, commands
├── background.js           # service worker: context menus + the check request
├── popup.html/css/js       # the result popup
├── options.html/css/js     # API base URL + key, connection test
├── lib/guardian-api.js     # settings, the API call, result hand-off
└── icons/                  # toolbar and store icons (16/32/48/128)
migrations/                 # SQL schema (auth, guardian, watch, profile, api keys, digest)
scripts/                    # env loader, migrator, preview + smoke tooling
screenshots/                # product captures used in this README
```

---

## The browser extension

One click checks the page you are on. The extension lives in [`extension/`](./extension) and
is a plain **Manifest V3** add-on — no build step, so "load unpacked" works straight
from a clone.

**What it does**

- **Toolbar button** — click the Guardian icon, or press `Alt`+`Shift`+`G`.
- **Right-click menu** — *Check this page with AI Guardian*, or *Check the selected text*.
- **Popup result** — risk score, verdict, the top reasons, what to do next, and a link
  that opens the full report in the app.
- **Options page** — point it at your own instance and paste an API key.

**What it reads:** only the page **address**, its **title**, and any **text you
selected** — and only when you click. It never reads passwords, form fields, cookies,
or your browsing history.

**Install (Chrome / Edge)**

1. Open `chrome://extensions` (or `edge://extensions`) and turn on **Developer mode**.
2. Click **Load unpacked** and select the **`extension/`** folder.
3. Pin the Guardian icon to the toolbar.

**Install (Firefox)** — open `about:debugging#/runtime/this-firefox`, click **Load
Temporary Add-on…**, and pick `extension/manifest.json`. The manifest already carries
a `browser_specific_settings.gecko` block.

**Connect it** — in the app, go to **Settings → Browser extension**, create a key
(shown once), then paste it into the extension options along with your API base URL.

**How it works**

```
click / context menu
        │
        ▼
background.js  ── reads url + title + selection (activeTab)
        │
        ▼
POST {apiBase}/api/check   Authorization: Bearer grd_live_…
        │
        ▼
popup.js  ── score, verdict, reasons, actions, link to full report
```

The service worker holds the key and does the page read; the popup only renders. Keys
are stored as a SHA-256 hash server-side and are scoped to the account that created
them, so a key can never check on someone else's behalf. See
[`extension/README.md`](./extension/README.md) for the full guide.

---

## Scam cards

A verdict is only useful if you can pass it on. **Scam cards** turn any check into a
square image you can drop into a family group chat: the score, the verdict, the scam
type, the top warning signs, and one line of what to do.

- Open **Scam card** in the sidebar, or choose *Make a scam card* on any result in
  **History**.
- Pick from three themes — **Guardian**, **Alert**, and **Paper** (light, for printing).
- **Download PNG** (1080×1080, rendered at 2× so it stays sharp), **Share** through the
  OS share sheet (which is how it reaches WhatsApp on a phone), or **Copy link** to the
  full check.

The card is drawn entirely in your browser with the Canvas API — nothing is uploaded,
and the renderer (`src/lib/guardian/share-card.ts`) is pure, so it can be unit-tested
in Node.

---

## Weekly digest

Once a week, Guardian emails you your own risk record: how many checks you ran, your
average score, anything that came back high risk, the patterns that kept showing up,
and a rotating tip.

- **Preview it** — **Settings → Weekly risk digest → Preview this week's email**, or
  open `/api/digest/preview` directly. It renders the exact HTML the email sends.
- **Turn it off** — the toggle in **Settings**, or the one-click unsubscribe link in
  every email footer (RFC 8058, so Gmail and Apple Mail can do it without a click).
- **Send it** — `POST /api/digest/send` with `Authorization: Bearer $DIGEST_SECRET`.
  `vercel.json` schedules it for **Mondays at 14:00 UTC**.

```bash
# Send this week's digests by hand
curl -X POST https://your-app.example.com/api/digest/send \
  -H "Authorization: Bearer $DIGEST_SECRET"
```

Delivery uses Resend's REST API over `fetch` — no SDK, no dependency. Set
`RESEND_API_KEY` and (optionally) `DIGEST_FROM` to enable sending; without a key the
job reports `skipped` rather than failing, so an environment that has not been wired up
yet still answers honestly.

| Variable | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Enables sending. Without it, the job skips. |
| `DIGEST_FROM` | From address, e.g. `AI Guardian <digest@your-domain.com>`. |
| `DIGEST_SECRET` | Protects `POST /api/digest/send`. Falls back to `CRON_SECRET`. |
| `APP_URL` | Base URL used in email links. Falls back to `VITE_APP_URL`. |

---

## Roadmap

- [x] Multi-type checks (message, link, number, image, investment)
- [x] Accounts, plans, and per-user history
- [x] Guardian Watch community reporting
- [x] Family Guardian circles with a hashed safety phrase
- [x] **Insights dashboard** with real analytics
- [x] **Notification centre**
- [x] **History search, filters, and CSV export**
- [x] **Printable risk report**
- [x] **First-run onboarding**
- [x] **Browser extension** that checks a page in one click
- [x] **Shareable "scam card"** images for warning friends and family
- [x] **Weekly email digest** of your risk record
- [ ] Offline-first PWA with on-device checks
- [ ] Public API for banks, telcos, and community groups

---

## Contributing

Issues and pull requests are welcome. Please run `npm run typecheck && npm run lint && npm test` before opening a PR, and keep the tone of the product: **plain language, no fear-mongering, always a next step.**

## License

[MIT](./LICENSE) © 2026 ubnlord

---

<div align="center">
<sub>If Guardian ever stops you from sending money to a stranger, it has done its job.</sub>
</div>
