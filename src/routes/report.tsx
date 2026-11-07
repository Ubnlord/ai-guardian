import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Printer, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Authed } from "@/components/guardian/frame";
import { Button, PageIntro, when } from "@/components/guardian/ui";
import { getInsights } from "@/lib/guardian/api-insights";
import { searchHistory, type HistoryRow } from "@/lib/guardian/api-insights";
import { dayLabel, type Insights } from "@/lib/guardian/insights";
import { useGuardian } from "@/lib/guardian/store";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/report")({ component: ReportRoute });

function ReportRoute() {
  return (
    <Authed>
      <ReportPage />
    </Authed>
  );
}

const KIND_LABEL: Record<string, string> = {
  message: "Message",
  url: "Link",
  number: "Number",
  image: "Scan",
  investment: "Investment",
};

function ReportPage() {
  const user = useCurrentUser();
  const me = useGuardian((s) => s.me);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [rows, setRows] = useState<HistoryRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancel = false;
    Promise.all([getInsights({ data: { range: 30 } }), searchHistory({ data: { q: "", kind: "", verdict: "" } })])
      .then(([nextInsights, nextRows]) => {
        if (cancel) return;
        setInsights(nextInsights as Insights);
        setRows(nextRows as HistoryRow[]);
      })
      .catch((err: unknown) => {
        if (!cancel) setError(err instanceof Error ? err.message : "Could not build the report.");
      });
    return () => {
      cancel = true;
    };
  }, [user?.id]);

  const generated = new Date();
  const highRisk = (rows ?? []).filter((row) => row.verdict === "high_risk");

  return (
    <div>
      <div className="print:hidden">
        <PageIntro
          kicker="REPORT"
          title="Your Guardian report"
          body="A clean summary of your risk record you can print, save as PDF, or hand to someone you trust."
        />
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            to="/history"
            className="btn inline-flex min-h-11 items-center gap-2 rounded-md bg-surface-2 px-4 text-sm font-semibold text-fg"
          >
            <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
            Back to history
          </Link>
          <Button onClick={() => window.print()} disabled={!insights}>
            <Printer className="size-4" strokeWidth={1.75} aria-hidden="true" />
            Print or save as PDF
          </Button>
        </div>
      </div>

      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
      {!insights || !rows ? <div className="h-64 animate-pulse rounded-xl bg-surface" /> : null}

      {insights && rows ? (
        <article className="panel print:shadow-none">
          <header className="flex items-start justify-between gap-4 border-b border-line pb-4">
            <div>
              <p className="inline-flex items-center gap-2 font-semibold">
                <ShieldCheck className="size-5 text-primary" strokeWidth={1.75} aria-hidden="true" />
                AI Guardian
              </p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight">Personal risk report</h1>
              <p className="mt-1 text-sm text-muted">
                {me?.displayName || user?.displayName || "Guardian"} · generated {when(generated.toISOString())}
              </p>
            </div>
            <div className="text-right text-sm text-muted">
              <p className="font-mono text-3xl font-semibold tabular-nums text-fg">{insights.totals.total}</p>
              <p>checks in 30 days</p>
            </div>
          </header>

          <section className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Cell label="Safe" value={insights.totals.safe} tone="text-primary" />
            <Cell label="Suspicious" value={insights.totals.suspicious} tone="text-warn" />
            <Cell label="High risk" value={insights.totals.highRisk} tone="text-danger" />
            <Cell label="Average score" value={insights.totals.avgScore} tone="text-fg" />
          </section>

          <section className="mt-6">
            <h2 className="text-sm font-semibold tracking-wide text-faint uppercase">What you checked</h2>
            <ul className="mt-2 divide-y divide-line">
              {insights.kinds.map((slice) => (
                <li key={slice.kind} className="flex items-center justify-between py-2 text-sm">
                  <span>{KIND_LABEL[slice.kind] ?? slice.kind}</span>
                  <span className="text-muted">
                    {slice.total} {slice.total === 1 ? "check" : "checks"}
                    {slice.highRisk > 0 ? ` · ${slice.highRisk} high risk` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {insights.reasons.length > 0 ? (
            <section className="mt-6">
              <h2 className="text-sm font-semibold tracking-wide text-faint uppercase">Patterns that kept appearing</h2>
              <ul className="mt-2 space-y-1.5">
                {insights.reasons.map((reason) => (
                  <li key={reason.text} className="flex gap-2 text-sm text-muted">
                    <span className="font-mono text-primary">{reason.n}×</span>
                    {reason.text}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {highRisk.length > 0 ? (
            <section className="mt-6">
              <h2 className="text-sm font-semibold tracking-wide text-faint uppercase">
                High-risk checks ({highRisk.length})
              </h2>
              <ul className="mt-2 space-y-3">
                {highRisk.slice(0, 12).map((row) => (
                  <li key={row.id} className="border-l-2 border-danger pl-3">
                    <p className="text-sm font-medium">
                      {row.title} <span className="font-mono text-danger">{row.score}</span>
                    </p>
                    <p className="text-xs text-muted">{row.summary}</p>
                    <p className="mt-0.5 text-xs text-faint">
                      {KIND_LABEL[row.kind] ?? row.kind} · {when(row.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {insights.busiest ? (
            <section className="mt-6">
              <h2 className="text-sm font-semibold tracking-wide text-faint uppercase">Activity</h2>
              <p className="mt-2 text-sm text-muted">
                Busiest day: {dayLabel(insights.busiest.day)} with {insights.busiest.total}{" "}
                {insights.busiest.total === 1 ? "check" : "checks"}. Current streak: {insights.streak}{" "}
                {insights.streak === 1 ? "day" : "days"}.
              </p>
            </section>
          ) : null}

          <footer className="mt-8 border-t border-line pt-4 text-xs text-faint">
            AI Guardian is a second look, not a guarantee. A low score is not permission to send money, and a high
            score is not proof of a crime. Verify on a channel you already trust.
          </footer>
        </article>
      ) : null}
    </div>
  );
}

function Cell({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-lg bg-bg px-3 py-3">
      <p className="font-mono text-xs tracking-widest text-faint">{label.toUpperCase()}</p>
      <p className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}
