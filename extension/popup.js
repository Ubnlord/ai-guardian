// AI Guardian popup — renders the result of a page check.
//
// The popup never talks to the network itself: it asks the service worker to run
// the check (the worker holds the API key and can inject the page-reading script)
// and then draws whatever comes back. That keeps one code path for both the
// toolbar click and the right-click menu.

import { getSettings, readResult, reportUrl, verdictOf } from "./lib/guardian-api.js";

const view = document.getElementById("view");
const quota = document.getElementById("quota");
const openApp = document.getElementById("open-app");
const optionsBtn = document.getElementById("options");

const TONE_VAR = {
  safe: { ring: "#3ddec0", soft: "#12352e" },
  warn: { ring: "#f0b429", soft: "#3a2c10" },
  danger: { ring: "#ff5a6a", soft: "#3c1620" },
};

const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function hostOf(url) {
  try {
    return new URL(url).host;
  } catch {
    return String(url ?? "").slice(0, 60);
  }
}

function renderLoading() {
  view.innerHTML = `
    <section class="state">
      <div class="spinner" aria-hidden="true"></div>
      <p class="state-title">Reading this page…</p>
      <p class="state-body">The address, the headline, and anything you selected.</p>
    </section>`;
}

function renderError(result) {
  const needsKey = result?.code === "no_key" || result?.code === "bad_key";
  const tone = needsKey ? "warn" : "danger";
  view.innerHTML = `
    <div class="notice ${tone}">
      <strong>${needsKey ? "Connect the extension" : "Check failed"}</strong>
      <p style="margin:6px 0 0">${esc(result?.error ?? "The check did not finish.")}</p>
    </div>
    <div class="cta">
      <button class="btn" id="retry" type="button">Try again</button>
      <button class="btn quiet" id="fix" type="button">${needsKey ? "Open options" : "Open AI Guardian"}</button>
    </div>`;
  document.getElementById("retry")?.addEventListener("click", () => void run());
  document.getElementById("fix")?.addEventListener("click", () => {
    if (needsKey) chrome.runtime.openOptionsPage();
    else chrome.tabs.create({ url: openApp.href });
  });
}

function renderResult(result) {
  const analysis = result.analysis;
  const tone = verdictOf(analysis);
  const vars = TONE_VAR[tone.tone] ?? TONE_VAR.warn;
  const score = Math.max(0, Math.min(100, Number(analysis.score) || 0));
  const reasons = (analysis.reasons ?? []).slice(0, 4);
  const actions = (analysis.actions ?? []).slice(0, 3);
  const report = reportUrl({ apiBase: result.apiBase }, analysis);

  view.innerHTML = `
    <div class="verdict" style="--ring:${vars.ring};--soft:${vars.soft}">
      <div class="ring-wrap">
        <div class="ring" style="--score:${score};--ring:${vars.ring}"></div>
        <span class="num">${score}</span>
      </div>
      <div>
        <div class="kicker ${tone.tone}">${tone.label}</div>
        <p class="headline">${esc(analysis.title || "Page checked")}</p>
        <p class="summary">${esc(analysis.summary || "")}</p>
      </div>
    </div>

    ${
      reasons.length
        ? `<div class="section"><h3>Why</h3><ul class="reasons">${reasons
            .map((r) => `<li>${esc(r)}</li>`)
            .join("")}</ul></div>`
        : ""
    }

    ${
      actions.length
        ? `<div class="section"><h3>What to do</h3><ul class="actions" style="--soft:${vars.soft}">${actions
            .map((a) => `<li>${esc(a)}</li>`)
            .join("")}</ul></div>`
        : ""
    }

    <div class="page-facts">
      <b>Checked:</b> ${esc(hostOf(result.page?.url))}
      ${result.page?.selection ? `<br /><b>Selected text:</b> ${esc(result.page.selection.slice(0, 120))}${result.page.selection.length > 120 ? "…" : ""}` : ""}
    </div>

    <div class="cta">
      <a class="btn" id="report" href="${esc(report)}" target="_blank" rel="noreferrer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3h7v7"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>
        Full report
      </a>
      <button class="btn quiet" id="again" type="button">Check again</button>
    </div>`;

  document.getElementById("again")?.addEventListener("click", () => void run());
  if (result.used != null && result.limit != null) {
    quota.textContent = `${result.used}/${result.limit} today`;
  }
}

async function run() {
  renderLoading();
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const settings = await getSettings();
  openApp.href = settings.apiBase;

  const reply = await chrome.runtime.sendMessage({
    type: "guardian:check",
    tabId: tab?.id,
    page: { url: tab?.url ?? "", title: tab?.title ?? "" },
  });

  const result = reply?.result;
  if (!result) {
    renderError({ error: "The background worker did not answer. Reload the extension and try again." });
    return;
  }
  if (result.ok) renderResult({ ...result, apiBase: settings.apiBase });
  else renderError(result);
}

optionsBtn.addEventListener("click", () => chrome.runtime.openOptionsPage());

// On open: if a check was just run from the context menu, show it instead of
// re-checking (the person already asked once).
(async () => {
  const settings = await getSettings();
  openApp.href = settings.apiBase;
  const cached = await readResult();
  if (cached && Date.now() - new Date(cached.checkedAt ?? 0).getTime() < 60_000) {
    if (cached.ok) renderResult({ ...cached, apiBase: settings.apiBase });
    else renderError(cached);
    return;
  }
  await run();
})();
