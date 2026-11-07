import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { AuthProvider } from "@/lib/auth/provider";
import { PrefsProvider } from "@/components/prefs";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "AI Guardian";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "AI Guardian is the safety layer between you and the internet. Check a message, link, image, or investment offer before you click, pay, or trust it.",
      },
      { name: "theme-color", content: "#071018" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  shellComponent: RootShell,
  component: () => <Outlet />,
  notFoundComponent: NotFound,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("guardian-theme");var l=localStorage.getItem("guardian-locale");document.documentElement.dataset.theme=t==="light"?"light":"dark";if(l==="ar"){document.documentElement.lang="ar";document.documentElement.dir="rtl"}else if(l){document.documentElement.lang=l}}catch(e){}',
          }}
        />
        <HeadContent />
      </head>
      <body>
        <PreviewHostBridge />
        <ShareWorker />
        <PrefsProvider>
          <AuthProvider>{children}</AuthProvider>
        </PrefsProvider>
        <Scripts />
      </body>
    </html>
  );
}

function ShareWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);
  return null;
}

function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-bg px-6 text-center text-fg">
      <div className="max-w-sm">
        <p className="font-mono text-xs tracking-widest text-primary">404</p>
        <h1 className="mt-2 text-2xl font-semibold">That page is not here</h1>
        <p className="mt-2 text-sm text-muted">The link may be old. The checks are still on the home screen.</p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-11 items-center rounded-md bg-primary px-4 font-semibold text-primary-ink"
        >
          Back to AI Guardian
        </Link>
      </div>
    </main>
  );
}
