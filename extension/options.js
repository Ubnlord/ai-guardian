// Options page logic: load, save, and a live "test connection" probe.

import { DEFAULT_SETTINGS, getSettings, normalizeBase, saveSettings } from "./lib/guardian-api.js";

const form = document.getElementById("form");
const apiBase = document.getElementById("apiBase");
const apiKey = document.getElementById("apiKey");
const openReportInNewTab = document.getElementById("openReportInNewTab");
const status = document.getElementById("status");
const testBtn = document.getElementById("test");

function setStatus(text, kind = "") {
  status.textContent = text;
  status.className = `status ${kind}`.trim();
}

async function load() {
  const settings = await getSettings();
  apiBase.value = settings.apiBase || DEFAULT_SETTINGS.apiBase;
  apiKey.value = settings.apiKey || "";
  openReportInNewTab.checked = Boolean(settings.openReportInNewTab);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const saved = await saveSettings({
    apiBase: normalizeBase(apiBase.value) || DEFAULT_SETTINGS.apiBase,
    apiKey: apiKey.value,
    openReportInNewTab: openReportInNewTab.checked,
  });
  apiBase.value = saved.apiBase;
  setStatus("Saved.", "ok");
  setTimeout(() => setStatus(""), 2500);
});

/**
 * Probe the endpoint with the key that is currently typed in.
 *
 * A GET to `/api/check` is answered with a 405 and a JSON body, which is exactly
 * what we want here: it proves the base URL is a Guardian instance and that the
 * network path works, without spending a check or needing a page to look at.
 */
testBtn.addEventListener("click", async () => {
  const base = normalizeBase(apiBase.value) || DEFAULT_SETTINGS.apiBase;
  setStatus("Testing…");
  try {
    const response = await fetch(`${base}/api/check`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${apiKey.value.trim()}` },
      body: JSON.stringify({ url: "https://example.com", title: "Connection test" }),
    });
    const payload = await response.json().catch(() => null);
    if (!payload) {
      setStatus(`Reached ${base}, but it did not answer with JSON (HTTP ${response.status}).`, "bad");
      return;
    }
    if (response.status === 401 || payload.code === "bad_key") {
      setStatus("Reached the server, but the API key was rejected. Create a new one in Settings.", "bad");
      return;
    }
    if (payload.ok === true) {
      setStatus("Connected. The key works and a check ran successfully.", "ok");
      return;
    }
    setStatus(`Connected, but the check returned: ${payload.error ?? "unknown error"}`, "bad");
  } catch (err) {
    setStatus(`Could not reach ${base}. ${err instanceof Error ? err.message : ""}`, "bad");
  }
});

void load();
