import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Authed } from "@/components/guardian/frame";
import { Button, Notice, PageIntro, Panel, TextInput } from "@/components/guardian/ui";
import { usePrefs, AccountControls } from "@/components/prefs";
import { ApiKeysPanel } from "@/components/guardian/api-keys-panel";
import { DigestPanel } from "@/components/guardian/digest-panel";
import { addDomain, clearHistory, listDomains, removeDomain, updateSettings } from "@/lib/guardian/api";
import { useGuardian } from "@/lib/guardian/store";
import type { Me } from "@/lib/guardian/types";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/settings")({ component: SettingsRoute });

function SettingsRoute() {
  return (
    <Authed>
      <SettingsPage />
    </Authed>
  );
}

function SettingsPage() {
  const user = useCurrentUser();
  const me = useGuardian((s) => s.me);
  const setMe = useGuardian((s) => s.setMe);
  const { t } = usePrefs();
  const [storeHistory, setStoreHistory] = useState(true);
  const [share, setShare] = useState(false);
  const [domains, setDomains] = useState<string[]>([]);
  const [domain, setDomain] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!me) return;
    setStoreHistory(me.storeHistory);
    setShare(me.shareHighRisk);
  }, [me]);

  useEffect(() => {
    if (!user?.id || me?.plan !== "business") return;
    listDomains()
      .then(setDomains)
      .catch(() => undefined);
  }, [user?.id, me?.plan]);

  return (
    <div>
      <PageIntro kicker="SETTINGS" title="Privacy" body="History is on by default. Family alerts are off until you opt in. Your name and photo live on your profile." />
      <Link to="/profile" className="mb-4 inline-flex min-h-11 items-center text-sm font-semibold text-primary">
        {t("editProfile")}
      </Link>
      <Panel className="mb-4">
        <h2 className="font-semibold">Language, theme, sign out</h2>
        <div className="mt-3">
          <AccountControls />
        </div>
      </Panel>
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
            if (!user?.id) return;
            setError(null);
            void updateSettings({ data: { storeHistory, shareHighRisk: share } })
              .then((next) => {
                setMe(user.id, next as Me);
                setNote("Saved.");
              })
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not save."));
          }}
        >
          <Toggle
            on={storeHistory}
            label="Save check history"
            hint="Turn this off to keep the score in the moment, without storing the text."
            onClick={() => setStoreHistory((value) => !value)}
          />
          <Toggle
            on={share}
            label="Share high-risk checks with my circle"
            hint="They see the headline and summary, not the full message. Off unless you switch it on."
            onClick={() => setShare((value) => !value)}
          />
          <Button type="submit">Save settings</Button>
        </form>
      </Panel>

      <Panel className="mt-4">
        <h2 className="font-semibold">Watched domains</h2>
        <p className="mt-1 text-sm text-muted">
          Business plan. Link checks warn when an address is close to a domain you list — your brand, your bank, your store.
        </p>
        {me?.plan === "business" ? (
          <>
            <form
              className="mt-3 flex flex-col gap-2 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                void addDomain({ data: { domain } }).then((result) => {
                  if (!result.ok) setError(result.error ?? "Could not add that domain.");
                  else {
                    setDomain("");
                    setError(null);
                    void listDomains().then(setDomains);
                  }
                });
              }}
            >
              <TextInput value={domain} onChange={(event) => setDomain(event.target.value)} placeholder="yourbrand.com" autoCapitalize="none" />
              <Button type="submit" variant="quiet">
                Watch
              </Button>
            </form>
            <ul className="mt-3 space-y-2">
              {domains.map((item) => (
                <li key={item} className="flex items-center justify-between text-sm">
                  <span className="font-mono">{item}</span>
                  <button
                    type="button"
                    className="min-h-11 px-2 text-danger"
                    onClick={() => {
                      void removeDomain({ data: { domain: item } }).then(() => {
                        setDomains((current) => current.filter((row) => row !== item));
                      });
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <Link to="/plans" className="mt-3 inline-block text-sm font-semibold text-primary">
            Domain watch is on the Business plan
          </Link>
        )}
      </Panel>

      <DigestPanel />

      <ApiKeysPanel />

      <Panel className="mt-4">
        <h2 className="font-semibold">Delete saved checks</h2>
        <p className="mt-1 text-sm text-muted">This removes your history. It does not delete your account or your circle.</p>
        <Button
          variant="danger"
          className="mt-3"
          onClick={() => {
            if (!window.confirm("Delete every saved check?")) return;
            void clearHistory().then(() => setNote("History cleared."));
          }}
        >
          Clear history
        </Button>
      </Panel>
    </div>
  );
}

function Toggle({ on, label, hint, onClick }: { on: boolean; label: string; hint: string; onClick: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-faint">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={onClick}
        className={`relative h-7 w-12 shrink-0 rounded-full ${on ? "bg-primary" : "bg-surface-2"}`}
      >
        <span className={`absolute top-0.5 size-6 rounded-full bg-fg transition ${on ? "left-5" : "left-0.5"}`} />
      </button>
    </div>
  );
}
