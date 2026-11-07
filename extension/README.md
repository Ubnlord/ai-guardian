# AI Guardian — browser extension

One click checks the page you are on for scam, phishing, and impersonation risk.
You get a 0–100 score, a verdict, and the reasons — before you click, pay, or
reply.

This is a **Manifest V3** extension for Chrome and Edge. It also runs on Firefox
(see [Firefox](#firefox) below).

---

## What it does

- **Toolbar button** — click the Guardian icon (or press `Alt`+`Shift`+`G`) and the
  current page is checked.
- **Right-click menu** — *Check this page with AI Guardian*, or *Check the selected
  text* when you have text highlighted.
- **Popup result** — risk score, verdict, the top reasons, and what to do next,
  with a link that opens the full report in the app.
- **Options page** — point it at your own Guardian instance and paste an API key.

## What it reads

Only three things, and only when you ask it to:

1. the page **address** (URL),
2. the page **title**,
3. any **text you selected**.

It never reads passwords, form fields, cookies, or your browsing history. There is
no content script running in the background — the page is read once, on your click,
through the `activeTab` permission.

---

## Install (load unpacked)

### Chrome / Edge

1. Download or clone this repository.
2. Open `chrome://extensions` (Chrome) or `edge://extensions` (Edge).
3. Turn on **Developer mode** (top-right).
4. Click **Load unpacked** and select the **`extension/`** folder — the one that
   contains `manifest.json`.
5. Pin the Guardian icon to the toolbar.

### Firefox

Firefox supports MV3 with a few differences. The manifest already carries a
`browser_specific_settings.gecko` block, so:

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on…** and pick `extension/manifest.json`.

Two notes for Firefox:

- Firefox uses `browser.*` rather than `chrome.*`. The extension calls `chrome.*`,
  which Firefox aliases, so it works as-is. For a permanent Firefox build, add a
  small `browser` shim or use `webextension-polyfill`.
- `chrome.storage.session` is available from Firefox 115+. On older builds the
  popup simply re-runs the check instead of showing a cached result.

---

## Configure it

1. In the AI Guardian app, go to **Settings → Browser extension** and create an
   API key. Copy it — it is shown once.
2. Click the Guardian icon → the gear, or right-click the icon → **Options**.
3. Set the **API base URL** to where your app runs:
   - production: `https://your-app.example.com`
   - local development: `http://localhost:3000`
4. Paste the **API key** and click **Save**.
5. Click **Test connection** to confirm.

---

## How it works

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

The service worker holds the API key and does the page read; the popup only
renders. That means a service-worker restart can never lose a result you are
looking at, and there is exactly one code path for both the button and the menu.

### Files

| File | Purpose |
| --- | --- |
| `manifest.json` | MV3 manifest: permissions, action, options, commands |
| `background.js` | Service worker: context menus + the check request |
| `popup.html` / `popup.css` / `popup.js` | The result popup |
| `options.html` / `options.css` / `options.js` | API base URL + key, connection test |
| `lib/guardian-api.js` | Settings, the API call, result hand-off |
| `icons/` | Toolbar and store icons (16/32/48/128) |

---

## Permissions, and why each one

| Permission | Why |
| --- | --- |
| `activeTab` | Read the current page's URL/title/selection — only after you click |
| `scripting` | Run the one-shot page read on that click |
| `storage` | Keep your API base URL and key in synced browser storage |
| `contextMenus` | The right-click menu items |
| `notifications` | Reserved for high-risk alerts |
| `host_permissions` | Reach your Guardian instance to run the check |

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| *Add your API key in the extension options first* | Create a key in the app and paste it into Options |
| *That API key was rejected* | The key was revoked or mistyped — create a new one |
| *Could not reach …* | Wrong API base URL, or the app is not running |
| *The check did not finish* | You may have hit your daily check limit for your plan |
| Nothing happens on a `chrome://` page | Browser-internal pages cannot be read; that is expected |

---

## Development

There is no build step. Edit the files and press **Reload** on the extension card
in `chrome://extensions`. The popup and options pages are plain ES modules.

## License

MIT — see the repository `LICENSE`.
