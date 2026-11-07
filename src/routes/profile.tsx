import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Authed } from "@/components/guardian/frame";
import { Button, Field, Notice, PageIntro, Panel, TextInput } from "@/components/guardian/ui";
import { AccountControls, usePrefs } from "@/components/prefs";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { updateSettings } from "@/lib/guardian/api";
import { useGuardian } from "@/lib/guardian/store";
import type { Me } from "@/lib/guardian/types";
import { isLocale, LOCALES, translate, type Locale } from "@/lib/i18n";

export const Route = createFileRoute("/profile")({ component: ProfileRoute });

function ProfileRoute() {
  return (
    <Authed>
      <ProfilePage />
    </Authed>
  );
}

function ProfilePage() {
  const user = useCurrentUser();
  const me = useGuardian((s) => s.me);
  const setMe = useGuardian((s) => s.setMe);
  const { t, setLocale } = usePrefs();
  const fileRef = useRef<HTMLInputElement>(null);
  const hydrated = useRef(false);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [locale, setLocaleField] = useState<Locale>("en");
  const [avatar, setAvatar] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!me || hydrated.current) return;
    hydrated.current = true;
    setName(me.displayName);
    setCountry(me.country);
    setAvatar(me.avatar);
    if (isLocale(me.locale)) setLocaleField(me.locale);
  }, [me]);

  const initial = (name || "G").slice(0, 1).toUpperCase();

  return (
    <div>
      <PageIntro kicker={t("profile")} title={t("profileTitle")} body={t("profileBody")} />
      {error ? (
        <div className="mb-4">
          <Notice tone="danger">{error}</Notice>
        </div>
      ) : null}
      {note ? (
        <div className="mb-4">
          <Notice tone="ok">{note}</Notice>
        </div>
      ) : null}
      <Panel>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!user?.id || busy) return;
            setBusy(true);
            setError(null);
            setNote(null);
            void updateSettings({ data: { displayName: name.trim(), country: country.trim(), locale, avatar } })
              .then((next) => {
                setMe(user.id, next as Me);
                setLocale(locale);
                setNote(translate(locale, "saved"));
              })
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not save."))
              .finally(() => setBusy(false));
          }}
        >
          <div className="flex items-center gap-4">
            {avatar ? (
              <img src={avatar} alt="" className="size-16 rounded-full object-cover" />
            ) : (
              <span className="grid size-16 place-items-center rounded-full bg-surface-2 text-lg font-semibold">{initial}</span>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="quiet" onClick={() => fileRef.current?.click()}>
                {t("photoLabel")}
              </Button>
              {avatar ? (
                <Button type="button" variant="ghost" onClick={() => setAvatar("")}>
                  {t("removePhoto")}
                </Button>
              ) : null}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                setError(null);
                void toAvatar(file)
                  .then(setAvatar)
                  .catch((err: unknown) => setError(err instanceof Error ? err.message : "Use a smaller photo."));
              }}
            />
          </div>
          <Field label={t("displayName")}>
            <TextInput value={name} onChange={(event) => setName(event.target.value)} maxLength={40} required />
          </Field>
          <Field label={t("country")} hint={t("countryHint")}>
            <TextInput value={country} onChange={(event) => setCountry(event.target.value)} maxLength={40} placeholder="Nigeria, France, Brazil…" />
          </Field>
          <Field label={t("language")}>
            <select
              value={locale}
              className="field-control min-h-11 w-full"
              onChange={(event) => {
                if (isLocale(event.target.value)) setLocaleField(event.target.value);
              }}
            >
              {LOCALES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Button type="submit" disabled={busy}>
            {t("save")}
          </Button>
        </form>
      </Panel>
      <Panel className="mt-4">
        <h2 className="font-semibold">Appearance and sign out</h2>
        <div className="mt-3">
          <AccountControls language={false} />
        </div>
      </Panel>
    </div>
  );
}

async function toAvatar(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image.");
  const bitmap = await createImageBitmap(file);
  const size = 160;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that photo.");
  const scale = Math.max(size / bitmap.width, size / bitmap.height);
  const width = bitmap.width * scale;
  const height = bitmap.height * scale;
  ctx.drawImage(bitmap, (size - width) / 2, (size - height) / 2, width, height);
  bitmap.close();
  const url = canvas.toDataURL("image/jpeg", 0.72);
  if (url.length > 180000) throw new Error("Use a smaller photo.");
  return url;
}
