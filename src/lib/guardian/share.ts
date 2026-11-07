const CACHE = "guardian-share";
const KEY = "/share-payload";

let pending: Promise<string> | null = null;
let delivered = false;

/** Read a share-target payload once per page load. Later calls return "". */
export function takeSharedPaste(): Promise<string> {
  if (delivered) return Promise.resolve("");
  if (!pending) {
    pending = readShared().finally(() => {
      delivered = true;
    });
  }
  return pending;
}

async function readShared(): Promise<string> {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  const fromQuery = [params.get("title"), params.get("text"), params.get("url")]
    .filter((part): part is string => Boolean(part && part.trim()))
    .join("\n")
    .trim();
  if (fromQuery) {
    params.delete("title");
    params.delete("text");
    params.delete("url");
    params.delete("shared");
    const rest = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (rest ? `?${rest}` : ""));
    return fromQuery;
  }
  if (!("caches" in window)) return "";
  try {
    const cache = await caches.open(CACHE);
    const saved = await cache.match(KEY);
    if (!saved) return "";
    await cache.delete(KEY);
    const data = (await saved.json()) as { title?: unknown; text?: unknown; url?: unknown };
    return [data.title, data.text, data.url]
      .filter((part): part is string => typeof part === "string" && part.trim().length > 0)
      .join("\n")
      .trim();
  } catch {
    return "";
  }
}
