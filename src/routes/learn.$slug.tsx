import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Authed, MarketingBar } from "@/components/guardian/frame";
import { listArticles } from "@/lib/guardian/api";
import type { Article } from "@/lib/guardian/types";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/learn/$slug")({ component: ArticleRoute });

function ArticleRoute() {
  const { user, isPending } = useCurrentUserState();
  const page = <ArticlePage />;
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

function ArticlePage() {
  const { slug } = Route.useParams();
  const [article, setArticle] = useState<Article | null | undefined>(undefined);

  useEffect(() => {
    let cancel = false;
    listArticles()
      .then((rows) => {
        if (cancel) return;
        setArticle(rows.find((row) => row.slug === slug) ?? null);
      })
      .catch(() => {
        if (!cancel) setArticle(null);
      });
    return () => {
      cancel = true;
    };
  }, [slug]);

  if (article === undefined) return <div className="h-32 animate-pulse rounded-lg bg-surface" />;
  if (!article) {
    return (
      <div>
        <h1 className="text-2xl font-semibold">That lesson is not here</h1>
        <Link to="/learn" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-primary">
          All lessons
        </Link>
      </div>
    );
  }

  return (
    <article>
      <Link to="/learn" className="text-sm font-semibold text-primary">
        All lessons
      </Link>
      <p className="mt-4 font-mono text-xs tracking-widest text-primary">{article.category}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{article.title}</h1>
      <p className="mt-1 text-xs text-faint">{article.minutes} min read</p>
      <div className="mt-6 space-y-4">
        {article.body.split(/\n\n+/).map((paragraph) => (
          <p key={paragraph.slice(0, 24)} className="text-base leading-relaxed text-fg">
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}
