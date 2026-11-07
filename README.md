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
├── routes/                 # file-based pages (check, history, insights, report, watch, family, …)
├── components/guardian/    # app shell, verdict card, notification bell, UI primitives
├── lib/
│   ├── guardian/           # domain logic: heuristics, plans, watch, insights, notify, api
│   ├── auth/               # Better Auth client, middleware, gates
│   └── db.ts               # Postgres / PGlite connection
migrations/                 # SQL schema (auth, guardian, watch, profile)
scripts/                    # env loader, migrator, preview + smoke tooling
screenshots/                # product captures used in this README
```

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
- [ ] Browser extension that checks a page in one click
- [ ] Shareable "scam card" images for warning friends and family
- [ ] Weekly email digest of your risk record
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
