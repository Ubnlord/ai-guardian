import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { Notice, Panel } from "@/components/guardian/ui";
import { getDigestPrefs, setDigestPrefs } from "@/lib/guardian/digest-api";
import { useCurrentUser } from "@/lib/auth/use-current-user";

/**
 * "Weekly digest" panel on the Settings page.
 *
 * The digest is on by default \u2014 it is the product's retention loop \u2014 so this is
 * an opt-OUT switch, and the copy says so plainly. The preview link opens the
 * exact HTML the email sends, which is the honest way to show what someone is
 * signing up for.
 */

export function DigestPanel() {
  const user = useCurrentUser();
  const [optOut, setOptOut] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    getDigestPrefs()
      .then((prefs) => {
        setOptOut(Boolean(prefs.optOut));
        setEmail(prefs.email ?? null);
      })
      .catch(() => undefined);
  }, [user?.id]);

  const toggle = () => {
    if (busy) return;
    const next = !optOut;
    setBusy(true);
    setError(null);
    setNote(null);
    void setDigestPrefs({ data: { optOut: next } })
      .then(() => {
        setOptOut(next);
        setNote(next ? "Weekly digest turned off." : "Weekly digest turned on.");
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not save that."))
      .finally(() => setBusy(false));
  };

  return (
    <Panel className="mt-4">
      <h2 className="flex items-center gap-2 font-semibold">
        <Mail className="size-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
        Weekly risk digest
      </h2>
      <p className="mt-1 text-sm text-muted">
        One email a week: how many checks you ran, your average score, anything that came back high risk, the patterns
        that kept showing up, and a tip. Sent to {email ?? "your account email"}.
      </p>

      {error ? (
        <div className="mt-3">
          <Notice tone="danger">{error}</Notice>
        </div>
      ) : null}
      {note ? (
        <div className="mt-3">
          <Notice tone="ok">{note}</Notice>
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{optOut ? "Digest is off" : "Digest is on"}</p>
          <p className="text-xs text-faint">
            {optOut ? "Turn it back on any time." : "Every email has a one-click unsubscribe link."}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={!optOut}
          aria-label="Weekly digest"
          disabled={busy}
          onClick={toggle}
          className={`relative h-7 w-12 shrink-0 rounded-full ${optOut ? "bg-surface-2" : "bg-primary"}`}
        >
          <span className={`absolute top-0.5 size-6 rounded-full bg-fg transition ${optOut ? "left-0.5" : "left-5"}`} />
        </button>
      </div>

      <a
        href="/api/digest/preview"
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary"
      >
        Preview this week's email
      </a>
    </Panel>
  );
}
