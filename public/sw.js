/* Share target only. Other requests pass through so the app is not cached here. */
const CACHE = "guardian-share";
const KEY = "/share-payload";

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "POST" || url.pathname !== "/share") return;
  event.respondWith(receiveShare(event.request, url.origin));
});

async function receiveShare(request, origin) {
  const form = await request.formData();
  const payload = {
    title: String(form.get("title") || ""),
    text: String(form.get("text") || ""),
    url: String(form.get("url") || ""),
  };
  const cache = await caches.open(CACHE);
  await cache.put(
    new Request(KEY),
    new Response(JSON.stringify(payload), { headers: { "content-type": "application/json" } }),
  );
  return Response.redirect(`${origin}/check?shared=1`, 303);
}
