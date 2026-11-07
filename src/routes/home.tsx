import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BookMarked, Image as ImageIcon, Radar, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Authed } from "@/components/guardian/frame";
import { Notice, Panel, UsageBar, when } from "@/components/guardian/ui";
import { usePrefs } from "@/components/prefs";
import { getDashboard } from "@/lib/guardian/api";
import { takeSharedPaste } from "@/lib/guardian/share";
import { useGuardian } from "@/lib/guardian/store";
import type { DashboardData } from "@/lib/guardian/types";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/home")({ component: HomeRoute });

function HomeRoute() {
  return (
    <Authed>
      <Dashboard />
    </Authed>
  );
}

function Dashboard() {
  const user = useCurrentUser();
  const setMe = useGuardian((s) => s.setMe);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    void takeSharedPaste().then((text) => {
      if (!alive || text.trim().length < 8) return;
      sessionStorage.setItem("guardian-draft", text);
      sessionStorage.setItem("guardian-auto", "1");
      void navigate({ to: "/check" });
    });
    return () => {
      alive = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!user?.id) return;
    let cancel = false;
    getDashboard()
      .then((next) => {
        if (cancel) return;
        const dash = next as DashboardData;
        setData(dash);
        setMe(user.id, dash.me);
      })
      .catch((err: unknown) => {
        if (!cancel) setError(err instanceof Error ? err.message : "Could not load your dashboard.");
      });
    return () => {
      cancel = true;
    };
  }, [user?.id, setMe]);

  const { t } = usePrefs();
  const hour = new Date().getHours();
  const hello = hour < 12 ? t("morning") : hour < 17 ? t("afternoon") : t("evening");
  const name = data?.me.displayName || user?.displayName || "there";

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-primary">DASHBOARD</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
        {hello}, {name.split(" ")[0]}
      </h1>
      <p className="mt-2 max-w-xl text-base text-muted">Paste it on Check. One answer, then the next move.</p>
      <Link
        to="/check"
        className="btn mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-ink"
      >
        Check something
      </Link>

      {error ? (
        <div className="mt-4">
          <Notice tone="danger">{error}</Notice>
        </div>
      ) : null}

      {!data ? <div className="mt-6 h-28 animate-pulse rounded-lg bg-surface" /> : null}

      {data?.recent[0] ? (
        <Panel className="mt-5">
          <p className="font-mono text-xs tracking-widest text-faint">LAST VERDICT</p>
          <div className="mt-2 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold">{data.recent[0].title}</h2>
              <p className="mt-1 text-base text-muted">{data.recent[0].summary}</p>
              <p className="mt-2 text-sm text-faint">
                {data.recent[0].kind} · {when(data.recent[0].createdAt)}
              </p>
            </div>
            <span className="font-mono text-3xl font-semibold tabular-nums">{data.recent[0].score}</span>
          </div>
          {data.counts.high_risk > 0 ? (
            <p className="mt-3 text-base font-medium">
              {data.counts.high_risk} high-risk {data.counts.high_risk === 1 ? "check" : "checks"} caught
            </p>
          ) : null}
          {data.recent.length > 1 ? (
            <Link to="/history" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary">
              History
            </Link>
          ) : null}
        </Panel>
      ) : data ? (
        <p className="mt-5 max-w-xl text-base text-muted">No checks yet. The first one is the message you almost replied to.</p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Quick to="/check/image" title="Scan" icon={ImageIcon} />
        <Quick to="/check/investment" title="Investment" icon={TrendingUp} />
        <Quick to="/watch" title="Watch" icon={Radar} />
        <Quick to="/playbooks" title="Playbook" icon={BookMarked} />
      </div>

      {data ? <UsageBar used={data.me.checksUsed} limit={data.me.checksLimit} /> : null}

      {data && data.watch.hot.length > 0 ? (
        <Panel className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">On Watch</h2>
            <Link to="/watch" className="text-sm font-semibold text-primary">
              {data.watch.week} this week
            </Link>
          </div>
          <ul className="mt-3 space-y-2">
            {data.watch.hot.map((item) => (
              <li key={`${item.kind}-${item.display}`} className="flex items-center justify-between gap-3 text-base">
                <span className="truncate font-mono">{item.display}</span>
                <span className="shrink-0 text-faint">
                  {item.reports} report{item.reports === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {data?.alerts[0] ? (
        <div className="mt-4">
          <Notice tone="danger">
            {data.alerts[0].label} flagged a high-risk check: {data.alerts[0].headline}
          </Notice>
        </div>
      ) : null}
    </div>
  );
}

function Quick({
  to,
  title,
  icon: Icon,
}: {
  to: "/check/image" | "/check/investment" | "/watch" | "/playbooks";
  title: string;
  icon: typeof ImageIcon;
}) {
  return (
    <Link to={to} className="panel card-link flex min-h-14 items-center gap-2 px-3 py-3">
      <Icon className="size-5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden="true" />
      <span className="text-base font-semibold">{title}</span>
    </Link>
  );
}
