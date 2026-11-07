import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MarketingBar } from "@/components/guardian/frame";
import { PageIntro } from "@/components/guardian/ui";
import { listArticles } from "@/lib/guardian/api";
import type { Article } from "@/lib/guardian/types";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Authed } from "@/components/guardian/frame";

export const Route = createFileRoute("/learn/")({ component: LearnRoute });

function LearnRoute() {
  const { user, isPending } = useCurrentUserState();
  const page = <LearnIndex />;
  if (isPending || !user) {
    return (
      <div className="min-h-screen bg-bg text-fg">
        <MarketingBar />
        <div className="mx-auto w-full max-w-3xl px-4 py-8">{page}</div>
      </div>
    );
  }
  return <Authed>{page}</Authed>;
}

function LearnIndex() {
  const [articles, setArticles] = useState<Article[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    listArticles()
      .then((rows) => {
        if (!cancel) setArticles(rows);
      })
      .catch((err: unknown) => {
        if (!cancel) setError(err instanceof Error ? err.message : "Lessons did not load.");
      });
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <div>
      <PageIntro
        kicker="LESSONS"
        title="The tricks, in plain language"
        body="Read these before you need them. None of them ask you to sign in."
      />
      <Link to="/playbooks" className="panel card-link mb-4">
        <p className="text-xs text-primary">REHEARSAL</p>
        <h2 className="mt-1 font-semibold">Walk a situation before it happens</h2>
        <p className="mt-1 text-sm text-muted">Four playbooks. Family voice, a bank threat, a trading group, a changed account.</p>
      </Link>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {!articles ? <div className="h-24 animate-pulse rounded-lg bg-surface" /> : null}
      <ul className="space-y-3">
        {(articles ?? []).map((article) => (
          <li key={article.slug}>
            <Link to="/learn/$slug" params={{ slug: article.slug }} className="panel card-link">
              <p className="text-xs text-primary">{article.category}</p>
              <h2 className="mt-1 font-semibold">{article.title}</h2>
              <p className="mt-1 text-xs text-faint">{article.minutes} min</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
