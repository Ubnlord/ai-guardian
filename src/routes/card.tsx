import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Authed } from "@/components/guardian/frame";
import { PageIntro } from "@/components/guardian/ui";
import { ShareCardStudio } from "@/components/guardian/share-card";
import { getCheck, type HistoryRow } from "@/lib/guardian/api-insights";
import type { Analysis, CheckKind, Verdict } from "@/lib/guardian/types";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/card")({
  validateSearch: (search: Record<string, unknown>) => ({
    check: typeof search.check === "string" ? search.check : "",
  }),
  component: CardRoute,
});

function CardRoute() {
  return (
    <Authed>
      <CardPage />
    </Authed>
  );
}

const KINDS: CheckKind[] = ["message", "url", "number", "image", "investment"];

const parseList = (raw: string): string[] => {
  try {
    const value = JSON.parse(raw || "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
};

/** Turn a stored row back into the `Analysis` shape the card renderer expects. */
function toAnalysis(row: HistoryRow): Analysis {
  return {
    id: row.id,
    kind: KINDS.includes(row.kind as CheckKind) ? (row.kind as CheckKind) : "message",
    verdict: (row.verdict === "safe" || row.verdict === "high_risk" ? row.verdict : "suspicious") as Verdict,
    score: Number(row.score) || 0,
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

function CardPage() {
  const user = useCurrentUser();
  const { check } = Route.useSearch();
  const [row, setRow] = useState<HistoryRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    if (!check) {
      setLoading(false);
      return;
    }
    let cancel = false;
    getCheck({ data: { id: check } })
      .then((result) => {
        if (cancel) return;
        setRow((result as HistoryRow | null) ?? null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancel) return;
        setError(err instanceof Error ? err.message : "Could not load that check.");
        setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [user?.id, check]);

  const shareUrl =
    typeof window === "undefined" ? "" : `${window.location.origin}/card?check=${encodeURIComponent(check)}`;

  return (
    <div>
      <PageIntro
        kicker="SCAM CARD"
        title="Warn your family"
        body="Turn a check into a shareable warning image. Send it to the group chat before someone else gets the same message."
      />
      <Link to="/history" className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary">
        <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
        Back to history
      </Link>

      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
      {loading ? <div className="h-64 animate-pulse rounded-xl bg-surface" /> : null}

      {!loading && !row ? (
        <div className="panel">
          <p className="text-sm text-muted">
            Pick a check from your history to turn into a card. Open{" "}
            <Link to="/history" className="font-semibold text-primary">
              History
            </Link>{" "}
            and choose <em>Make a scam card</em> on any result.
          </p>
        </div>
      ) : null}

      {!loading && row ? <ShareCardStudio analysis={toAnalysis(row)} shareUrl={shareUrl} /> : null}
    </div>
  );
}
