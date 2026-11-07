import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Authed } from "@/components/guardian/frame";
import { Button, Field, Notice, PageIntro, Panel, TextInput, when } from "@/components/guardian/ui";
import { listWatch, lookupWatch, reportScam } from "@/lib/guardian/api";
import type { WatchEntry, WatchKind, WatchLookup } from "@/lib/guardian/types";
import { WATCH_CATEGORIES, type WatchCategory } from "@/lib/guardian/watch";

export const Route = createFileRoute("/watch")({ component: WatchRoute });

function WatchRoute() {
  return (
    <Authed>
      <WatchPage />
    </Authed>
  );
}

const KINDS: { id: WatchKind; label: string }[] = [
  { id: "phone", label: "Phone" },
  { id: "account", label: "Account" },
  { id: "domain", label: "Domain" },
];

function WatchPage() {
  const [kind, setKind] = useState<WatchKind>("phone");
  const [value, setValue] = useState("");
  const [category, setCategory] = useState<WatchCategory>("payment");
  const [lookup, setLookup] = useState<WatchLookup | null>(null);
  const [entries, setEntries] = useState<WatchEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [pending, setPending] = useState<"lookup" | "report" | null>(null);

  function reload() {
    listWatch()
      .then(setEntries)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Watch did not load."));
  }

  useEffect(() => {
    reload();
  }, []);

  return (
    <div>
      <PageIntro
        kicker="WATCH"
        title="Numbers other people already flagged"
        body="Your name stays off the list. A report is the number, the account, or the domain, plus what they tried. The next check that contains it will say so."
      />
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
        <h2 className="font-semibold">Look it up</h2>
        <p className="mt-1 text-sm text-muted">This does not use one of your monthly checks.</p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            setNote(null);
            setPending("lookup");
            void lookupWatch({ data: { kind, value } })
              .then((result) => {
                setLookup(result);
                if (!result.ok) setError(result.error);
              })
              .catch((err: unknown) => {
                setLookup(null);
                setError(err instanceof Error ? err.message : "That lookup did not finish.");
              })
              .finally(() => setPending(null));
          }}
        >
          <KindChips kind={kind} onChange={setKind} />
          <Field label={kind === "phone" ? "Phone" : kind === "account" ? "Account" : "Domain"}>
            <TextInput
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder={kind === "phone" ? "+44 7700 900000 or 0803 000 0000" : kind === "account" ? "0123456789" : "brand-login.xyz"}
              autoCapitalize="none"
              inputMode={kind === "domain" ? "url" : "numeric"}
            />
          </Field>
          <Button type="submit" disabled={pending !== null || value.trim().length < 4}>
            {pending === "lookup" ? "Looking…" : "Check Watch"}
          </Button>
        </form>
        {lookup?.ok ? (
          <p className="mt-4 text-sm">
            <span className="font-mono text-primary">{lookup.display}</span>
            {lookup.reports === 0
              ? " has no reports yet."
              : ` has ${lookup.reports} report${lookup.reports === 1 ? "" : "s"}.`}
            {lookup.alreadyReported ? " You already added this one." : ""}
          </p>
        ) : null}
      </Panel>

      <Panel className="mt-4">
        <h2 className="font-semibold">Report it</h2>
        <p className="mt-1 text-sm text-muted">
          Eight a day. One report per number. Don't write a story — pick the category. Real brand domains, like gtbank.com, are refused.
        </p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            setNote(null);
            setPending("report");
            void reportScam({ data: { kind, value, category } })
              .then((result) => {
                if (!result.ok) {
                  setError(result.error ?? "That report did not save.");
                  return;
                }
                setNote("Reported. The next check that contains it will mention Watch.");
                setLookup(null);
                reload();
              })
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "That report did not save."))
              .finally(() => setPending(null));
          }}
        >
          <div className="flex flex-wrap gap-2">
            {WATCH_CATEGORIES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCategory(item.id)}
                className={`chip ${category === item.id ? "chip-on" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <Button type="submit" variant="quiet" disabled={pending !== null || value.trim().length < 4}>
            {pending === "report" ? "Saving…" : "Report this"}
          </Button>
        </form>
      </Panel>

      <Panel className="mt-4">
        <h2 className="font-semibold">Recently reported</h2>
        {!entries ? <div className="mt-3 h-16 animate-pulse rounded-md bg-bg" /> : null}
        {entries && entries.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            Nothing yet. If a number asked you for money, put it here. The lost-phone example uses 0803 445 2211 — report it, then check that message.
          </p>
        ) : null}
        <ul className="mt-2 divide-y divide-line">
          {(entries ?? []).map((entry) => (
            <li key={`${entry.kind}-${entry.display}`} className="flex items-center justify-between gap-3 py-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-mono">{entry.display}</p>
                <p className="text-xs text-faint">
                  {entry.kind} · {when(entry.lastAt)}
                </p>
              </div>
              <span className="shrink-0 text-muted">
                {entry.reports} report{entry.reports === 1 ? "" : "s"}
              </span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

function KindChips({ kind, onChange }: { kind: WatchKind; onChange: (kind: WatchKind) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {KINDS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id)}
          className={`chip ${kind === item.id ? "chip-on" : ""}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
