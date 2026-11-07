// AI Guardian — background service worker (Manifest V3).
//
// Two jobs, both thin:
//   1. register the right-click menu items on install
//   2. answer "check this page" requests from the popup and the menu by
//      grabbing the tab's URL/title/selection and POSTing to the Guardian API
//
// The popup owns all rendering. Keeping the worker dumb means a service-worker
// restart (which MV3 does aggressively) can never lose a result the person is
// looking at.

import { checkPage, getSettings, rememberResult } from "./lib/guardian-api.js";

const MENU_ID = "guardian-check-page";
const MENU_SELECTION_ID = "guardian-check-selection";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Check this page with AI Guardian",
      contexts: ["page", "frame"],
    });
    chrome.contextMenus.create({
      id: MENU_SELECTION_ID,
      title: "Check the selected text with AI Guardian",
      contexts: ["selection"],
    });
  });
});

/**
 * Read the page facts we are allowed to read.
 *
 * `activeTab` grants access only after a user gesture (the toolbar click or the
 * menu item), which is exactly when this runs. If the page is a browser-internal
 * URL (chrome://, the Web Store, a PDF viewer) injection is refused — we fall
 * back to the tab's own title and URL, which is still enough to score a link.
 */
async function readPage(tabId, fallback) {
  const base = {
    url: fallback?.url ?? "",
    title: fallback?.title ?? "",
    selection: "",
  };
  if (typeof tabId !== "number") return base;
  try {
    const [injected] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => ({
        url: location.href,
        title: document.title || "",
        selection: String(window.getSelection?.() ?? "").trim().slice(0, 4000),
      }),
    });
    const value = injected?.result;
    if (value && typeof value === "object") {
      return {
        url: typeof value.url === "string" && value.url ? value.url : base.url,
        title: typeof value.title === "string" && value.title ? value.title : base.title,
        selection: typeof value.selection === "string" ? value.selection : "",
      };
    }
  } catch {
    // Restricted page, or the tab went away. The fallback is still useful.
  }
  return base;
}

/**
 * Run a check and stash the result so the popup can pick it up.
 *
 * The popup may not be open (context-menu path), so the result is written to
 * session storage first and the popup reads it on open. When the popup IS open
 * it also gets a live message, so it can show the scanning state immediately.
 */
async function runCheck({ tabId, fallback, selection }) {
  const page = await readPage(tabId, fallback);
  if (selection) page.selection = selection;

  const settings = await getSettings();
  if (!settings.apiKey) {
    const result = {
      ok: false,
      code: "no_key",
      error: "Add your AI Guardian API key in the extension options first.",
      page,
    };
    await rememberResult(result);
    return result;
  }

  const result = await checkPage(page, settings);
  await rememberResult(result);
  return result;
}

// The popup asks the worker to run a check (it cannot inject scripts itself).
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || message.type !== "guardian:check") return false;
  runCheck({ tabId: message.tabId, fallback: message.page, selection: message.selection })
    .then((result) => sendResponse({ ok: true, result }))
    .catch((err) =>
      sendResponse({
        ok: false,
        result: { ok: false, error: err instanceof Error ? err.message : "The check did not finish." },
      }),
    );
  return true; // keep the message channel open for the async reply
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID && info.menuItemId !== MENU_SELECTION_ID) return;
  const selection = info.menuItemId === MENU_SELECTION_ID ? String(info.selectionText ?? "") : "";
  void runCheck({
    tabId: tab?.id,
    fallback: { url: info.pageUrl ?? tab?.url ?? "", title: tab?.title ?? "" },
    selection,
  });
});

// Keyboard shortcut (Alt+Shift+G) opens the popup via `_execute_action`, so no
// handler is needed here — Chrome routes it to the action.
