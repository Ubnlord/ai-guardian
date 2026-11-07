import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isLocale, LOCALES, translate, type CopyKey, type Locale } from "@/lib/i18n";
import { signOut } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { updateSettings } from "@/lib/guardian/api";
import { useGuardian } from "@/lib/guardian/store";
import type { Me } from "@/lib/guardian/types";

export type ThemeName = "dark" | "light";

type Prefs = {
  theme: ThemeName;
  locale: Locale;
  setTheme: (theme: ThemeName) => void;
  setLocale: (locale: Locale) => void;
  t: (key: CopyKey) => string;
};

const PrefsContext = createContext<Prefs | null>(null);

function applyTheme(theme: ThemeName) {
  document.documentElement.dataset.theme = theme;
}

function applyLocale(locale: Locale) {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
}

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("dark");
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const storedTheme = localStorage.getItem("guardian-theme");
    const storedLocale = localStorage.getItem("guardian-locale");
    const nextTheme: ThemeName = storedTheme === "light" ? "light" : "dark";
    const nextLocale = isLocale(storedLocale) ? storedLocale : "en";
    setThemeState(nextTheme);
    setLocaleState(nextLocale);
    applyTheme(nextTheme);
    applyLocale(nextLocale);
  }, []);

  const value = useMemo<Prefs>(
    () => ({
      theme,
      locale,
      setTheme: (next) => {
        localStorage.setItem("guardian-theme", next);
        applyTheme(next);
        setThemeState(next);
      },
      setLocale: (next) => {
        localStorage.setItem("guardian-locale", next);
        applyLocale(next);
        setLocaleState(next);
      },
      t: (key) => translate(locale, key),
    }),
    [theme, locale],
  );

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs(): Prefs {
  const value = useContext(PrefsContext);
  if (!value) {
    return {
      theme: "dark",
      locale: "en",
      setTheme: () => undefined,
      setLocale: () => undefined,
      t: (key) => translate("en", key),
    };
  }
  return value;
}

export function AccountControls({ language = true }: { language?: boolean }) {
  const { theme, locale, setTheme, setLocale, t } = usePrefs();
  const { user } = useCurrentUserState();
  const setMe = useGuardian((s) => s.setMe);
  const [signingOut, setSigningOut] = useState(false);

  return (
    <div className="space-y-4">
      {language ? (
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">{t("language")}</span>
          <select
            value={locale}
            aria-label={t("language")}
            className="field-control min-h-11 w-full"
            onChange={(event) => {
              const next = event.target.value;
              if (!isLocale(next)) return;
              setLocale(next);
              if (!user?.id) return;
              void updateSettings({ data: { locale: next } })
                .then((nextMe) => setMe(user.id, nextMe as Me))
                .catch(() => undefined);
            }}
          >
            {LOCALES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-md border border-line bg-surface px-4 text-sm font-semibold"
          aria-label={t("theme")}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? t("light") : t("dark")}
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-md bg-surface-2 px-4 text-sm font-semibold"
          disabled={signingOut}
          onClick={() => {
            setSigningOut(true);
            void signOut().catch(() => setSigningOut(false));
          }}
        >
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}
