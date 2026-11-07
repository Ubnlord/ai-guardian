import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Authed } from "@/components/guardian/frame";
import { Button, PageIntro, when } from "@/components/guardian/ui";
import { VerdictCard } from "@/components/guardian/verdict";
import { clearHistory, deleteCheck, listHistory } from "@/lib/guardian/api";
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

function HistoryPage() {
  const user = useCurrentUser();
  const [rows, setRows] = useState<Analysis[] | null>(null);
  const [kind, setKind] = useState<CheckKind | "all">("all");
  const [verdict, setVerdict] = useState<Verdict | "all">("all");
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancel = false;
    listHistory()
      .then((next) => {
        if (!cancel) setRows(next);
      })
      .catch((err: unknown) => {
        if (!cancel) setError(err instanceof Error ? err.message : "Could not load history.");
      });
    return () => {
      cancel = true;
    };
  }, [user?.id]);

  const visible = (rows ?? []).filter((row) => (kind === "all" || row.kind === kind) && (verdict === "all" || row.verdict === verdict));

  return (
    <div>
      <PageIntro kicker="HISTORY" title="Your risk record" body="Scores stay here unless you turn off history or delete them." />
      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        {(["all", "message", "number", "url", "image", "investment"] as const).map((item) => (
          <Filter key={item} on={kind === item} label={item} onClick={() => setKind(item)} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {(["all", "safe", "suspicious", "high_risk"] as const).map((item) => (
          <Filter key={item} on={verdict === item} label={item === "high_risk" ? "high risk" : item} onClick={() => setVerdict(item)} />
        ))}
      </div>
      {!rows ? <div className="mt-6 h-24 animate-pulse rounded-lg bg-surface" /> : null}
      {rows && visible.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Nothing in this filter yet.</p>
      ) : null}
      <ul className="mt-4 space-y-3">
        {visible.map((row) => (
          <li key={row.id}>
            <button type="button" className="w-full text-left" onClick={() => setOpen(open === row.id ? null : row.id)}>
              <div className="flex items-center justify-between gap-3 rounded-xl bg-surface px-4 py-3 shadow-card">
                <div className="min-w-0">
                  <p className="truncate font-medium">{row.title}</p>
                  <p className="text-xs text-faint">
                    {row.kind} · {when(row.createdAt)}
                  </p>
                </div>
                <span className="font-mono tabular-nums">{row.score}</span>
              </div>
            </button>
            {open === row.id ? (
              <div className="mt-2 space-y-2">
                <VerdictCard analysis={row} />
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
    <button
      type="button"
      onClick={onClick}
      className={`chip capitalize ${on ? "chip-on" : ""}`}
    >
      {label}
    </button>
  );
}
