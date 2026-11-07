import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, FileText, Search, Share2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Authed } from "@/components/guardian/frame";
import { Button, Notice, PageIntro, when } from "@/components/guardian/ui";
import { VerdictCard } from "@/components/guardian/verdict";
import { clearHistory, deleteCheck } from "@/lib/guardian/api";
import { exportChecks, searchHistory, type HistoryRow } from "@/lib/guardian/api-insights";
import type { Analysis, CheckKind, Verdict } from "@/lib/guardian/types";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/history")({ component: HistoryRoute });

function HistoryRoute() {
  return (
    <Authed>
      <HistoryPage />
    </Authed>
  );
}

const KINDS: { id: CheckKind | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "message", label: "Messages" },
  { id: "number", label: "Numbers" },
  { id: "url", label: "Links" },
  { id: "image", label: "Scans" },
  { id: "investment", label: "Investments" },
];

const VERDICTS: { id: Verdict | "all"; label: string }[] = [
  { id: "all", label: "Any verdict" },
  { id: "safe", label: "Safe" },
  { id: "suspicious", label: "Suspicious" },
  { id: "high_risk", label: "High risk" },
];

function toAnalysis(row: HistoryRow): Analysis {
  return {
    id: row.id,
    kind: row.kind as CheckKind,
    verdict: row.verdict as Verdict,
    score: row.score,
    title: row.title,
    summary: row.summary,
    reasons: parseList(row.reasons),
    actions: parseList(row.actions),
    uncertainty: row.uncertainty,
    source: row.source === "ai" ? "ai" : "rules",
    excerpt: row.excerpt,
    createdAt: row.createdAt,
  };
}

function parseList(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function HistoryPage() {
  const user = useCurrentUser();
  const [rows, setRows] = useState<HistoryRow[] | null>(null);
  const [kind, setKind] = useState<CheckKind | "all">("all");
  const [verdict, setVerdict] = useState<Verdict | "all">("all");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Debounce the search box so typing does not fire a query per keystroke.
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query.trim()), 250);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (!user?.id) return;
    let cancel = false;
    setRows(null);
    searchHistory({
      data: { q: debounced, kind: kind === "all" ? "" : kind, verdict: verdict === "all" ? "" : verdict },
    })
      .then((next) => {
        if (!cancel) setRows(next as HistoryRow[]);
      })
      .catch((err: unknown) => {
        if (!cancel) setError(err instanceof Error ? err.message : "Could not load history.");
      });
    return () => {
      cancel = true;
    };
  }, [user?.id, debounced, kind, verdict]);

  const filtered = rows ?? [];
  const highRisk = useMemo(() => filtered.filter((row) => row.verdict === "high_risk").length, [filtered]);
  const activeFilters = (kind !== "all" ? 1 : 0) + (verdict !== "all" ? 1 : 0) + (debounced ? 1 : 0);

  function download() {
    setBusy(true);
    setError(null);
    setNote(null);
    exportChecks()
      .then((result) => {
        const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        setNote(`Exported ${result.count} ${result.count === 1 ? "check" : "checks"} to ${result.filename}.`);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not export."))
      .finally(() => setBusy(false));
  }

  return (
    <div>
      <PageIntro
        kicker="HISTORY"
        title="Your risk record"
        body="Search it, filter it, export it. Scores stay here unless you turn off history or delete them."
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

      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-faint"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search titles, summaries, and pasted text…"
          aria-label="Search your checks"
          className="field-control min-h-11 w-full pl-9"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            className="absolute top-1/2 right-2 -translate-y-1/2 p-2 text-faint"
            onClick={() => setQuery("")}
          >
            <X className="size-4" strokeWidth={1.75} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {KINDS.map((item) => (
          <Filter key={item.id} on={kind === item.id} label={item.label} onClick={() => setKind(item.id)} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {VERDICTS.map((item) => (
          <Filter key={item.id} on={verdict === item.id} label={item.label} onClick={() => setVerdict(item.id)} />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted">
          {rows === null
            ? "Loading…"
            : `${filtered.length} ${filtered.length === 1 ? "check" : "checks"}${
                highRisk > 0 ? ` · ${highRisk} high risk` : ""
              }`}
        </p>
        {activeFilters > 0 ? (
          <button
            type="button"
            className="text-sm font-semibold text-primary"
            onClick={() => {
              setKind("all");
              setVerdict("all");
              setQuery("");
            }}
          >
            Clear filters
          </button>
        ) : null}
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="quiet" onClick={download} disabled={busy || (rows?.length ?? 0) === 0}>
            <Download className="size-4" strokeWidth={1.75} aria-hidden="true" />
            {busy ? "Exporting…" : "Export CSV"}
          </Button>
          <Link
            to="/report"
            className="btn inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-surface-2 px-4 text-sm font-semibold text-fg"
          >
            <FileText className="size-4" strokeWidth={1.75} aria-hidden="true" />
            Report
          </Link>
        </div>
      </div>

      {rows === null ? <div className="mt-6 h-24 animate-pulse rounded-lg bg-surface" /> : null}
      {rows !== null && filtered.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          {activeFilters > 0
            ? "Nothing matches those filters."
            : "No checks yet. The first one is the message you almost replied to."}
        </p>
      ) : null}

      <ul className="mt-4 space-y-3">
        {filtered.map((row) => (
          <li key={row.id}>
            <button type="button" className="w-full text-left" onClick={() => setOpen(open === row.id ? null : row.id)}>
              <div className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 shadow-card">
                <div className="min-w-0">
                  <p className="truncate font-medium">{row.title}</p>
                  <p className="text-xs text-faint">
                    {row.kind} · {when(row.createdAt)}
                  </p>
                </div>
                <span
                  className={`font-mono tabular-nums ${
                    row.verdict === "high_risk"
                      ? "text-danger"
                      : row.verdict === "suspicious"
                        ? "text-warn"
                        : "text-primary"
                  }`}
                >
                  {row.score}
                </span>
              </div>
            </button>
            {open === row.id ? (
              <div className="mt-2 space-y-2">
                <VerdictCard analysis={toAnalysis(row)} />
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/card"
                    search={{ check: row.id }}
                    className="btn inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-surface-2 px-4 text-sm font-semibold text-fg"
                  >
                    <Share2 className="size-4" strokeWidth={1.75} aria-hidden="true" />
                    Make a scam card
                  </Link>
                  <Button
                    variant="danger"
                    onClick={() => {
                      void deleteCheck({ data: { id: row.id } }).then(() => {
                        setRows((current) => current?.filter((item) => item.id !== row.id) ?? null);
                      });
                    }}
                  >
                    Delete this check
                  </Button>
                </div>
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      {rows && rows.length > 0 ? (
        <Button
          variant="ghost"
          className="mt-6"
          onClick={() => {
            if (!window.confirm("Delete every saved check on this account?")) return;
            void clearHistory().then(() => setRows([]));
          }}
        >
          Clear all history
        </Button>
      ) : null}
    </div>
  );
}

function Filter({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className={`chip ${on ? "chip-on" : ""}`}>
      {label}
    </button>
  );
}
