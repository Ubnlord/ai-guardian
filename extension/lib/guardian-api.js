// Shared extension plumbing: settings, the API call, and result hand-off.
//
// Plain ES modules, no build step — the extension loads exactly what is in this
// folder, so "load unpacked" works straight from a clone.

export const DEFAULT_API_BASE = "https://ai-guardian.vercel.app";

const SETTINGS_KEY = "guardian.settings";
const RESULT_KEY = "guardian.lastResult";

export const DEFAULT_SETTINGS = {
  apiBase: DEFAULT_API_BASE,
  apiKey: "",
  autoCheck: false,
  openReportInNewTab: true,
};

/** Normalize a base URL: trim, drop trailing slashes, require http(s). */
export function normalizeBase(value) {
  const raw = String(value ?? "").trim().replace(/\/+$/, "");
  if (!raw) return "";
  if (!/^https?:\/\//i.test(raw)) return `https://${raw}`;
  return raw;
}

export async function getSettings() {
  const stored = await chrome.storage.sync.get(SETTINGS_KEY);
  const value = stored?.[SETTINGS_KEY];
  return { ...DEFAULT_SETTINGS, ...(value && typeof value === "object" ? value : {}) };
}

export async function saveSettings(patch) {
  const next = { ...(await getSettings()), ...patch };
  next.apiBase = normalizeBase(next.apiBase) || DEFAULT_API_BASE;
  next.apiKey = String(next.apiKey ?? "").trim();
  await chrome.storage.sync.set({ [SETTINGS_KEY]: next });
  return next;
}

/** The report URL a person can open in the app, with the check highlighted. */
export function reportUrl(settings, analysis) {
  const base = normalizeBase(settings.apiBase) || DEFAULT_API_BASE;
  if (!analysis?.id) return `${base}/history`;
  return `${base}/history?check=${encodeURIComponent(analysis.id)}`;
}

/**
 * POST the page facts to `/api/check`.
 *
 * Every failure mode is turned into a result object the popup can render — a
 * thrown error here would leave the popup stuck on "checking".
 */
export async function checkPage(page, settings) {
  const base = normalizeBase(settings.apiBase) || DEFAULT_API_BASE;
  const started = Date.now();
  try {
    const response = await fetch(`${base}/api/check`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        url: page.url,
        title: page.title,
        selection: page.selection,
      }),
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!payload) {
      return {
        ok: false,
        code: "bad_response",
        error: `The Guardian server at ${base} did not return JSON (HTTP ${response.status}). Check the API base URL in options.`,
        page,
      };
    }

    if (response.status === 401 || payload.code === "bad_key") {
      return {
        ok: false,
        code: "bad_key",
        error: payload.error ?? "That API key was rejected. Create a new one in AI Guardian → Settings.",
        page,
      };
    }

    if (payload.ok !== true) {
      return { ok: false, code: payload.code ?? "failed", error: payload.error ?? "The check did not finish.", page };
    }

    return {
      ok: true,
      analysis: payload.analysis,
      used: payload.used,
      limit: payload.limit,
      page,
      elapsedMs: Date.now() - started,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    return {
      ok: false,
      code: "network",
      error: `Could not reach ${base}. Check your connection and the API base URL in options.`,
      detail: err instanceof Error ? err.message : String(err),
      page,
    };
  }
}

export async function rememberResult(result) {
  try {
    await chrome.storage.session.set({ [RESULT_KEY]: result });
  } catch {
    // session storage is unavailable in some contexts; the popup still gets the
    // live message reply, so this is not fatal.
  }
}

export async function readResult() {
  try {
    const stored = await chrome.storage.session.get(RESULT_KEY);
    return stored?.[RESULT_KEY] ?? null;
  } catch {
    return null;
  }
}

export async function clearResult() {
  try {
    await chrome.storage.session.remove(RESULT_KEY);
  } catch {
    /* ignore */
  }
}

export const VERDICT = {
  safe: { label: "SAFE", tone: "safe" },
  suspicious: { label: "SUSPICIOUS", tone: "warn" },
  high_risk: { label: "HIGH RISK", tone: "danger" },
};

export function verdictOf(analysis) {
  return VERDICT[analysis?.verdict] ?? VERDICT.suspicious;
}
