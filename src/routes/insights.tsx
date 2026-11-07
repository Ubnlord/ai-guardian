import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Flame, Minus, Radar, ShieldAlert, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Authed } from "@/components/guardian/frame";
import { PageIntro, Panel, when } from "@/components/guardian/ui";
import { getInsights } from "@/lib/guardian/api-insights";
import {
  RANGES,
  WEEKDAYS,
  dayLabel,
  type Insights,
  type InsightsRange,
} from "@/lib/guardian/insights";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/insights")({ component: InsightsRoute });

function InsightsRoute() {
  return (
    <Authed>
      <InsightsPage />
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

const PALETTE = {
  primary: "var(--color-primary)",
  warn: "var(--color-warn)",
  danger: "var(--color-danger)",
  grid: "var(--color-line)",
};

function InsightsPage() {
  const user = useCurrentUser();
  const [range, setRange] = useState<InsightsRange>(7);
  const [data, setData] = useState<Insights | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let cancel = false;
    setData(null);
    getInsights({ data: { range } })
      .then((next) => {
        if (!cancel) setData(next as Insights);
      })
      .catch((err: unknown) => {
        if (!cancel) setError(err instanceof Error ? err.message : "Could not load your insights.");
      });
    return () => {
      cancel = true;
    };
  }, [user?.id, range]);

  const trend = useMemo(() => {
    if (!data) return [];
    return data.daily.map((point) => ({
      ...point,
      label: dayLabel(point.day),
    }));
  }, [data]);

  const delta = data ? data.totals.total - data.totals.previousTotal : 0;
  const empty = data ? data.totals.total === 0 : false;

  return (
    <div>
      <PageIntro
        kicker="INSIGHTS"
        title="What you have been catching"
        body="A clear read on your own risk record — nothing here leaves this account."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {RANGES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setRange(item)}
            aria-pressed={range === item}
            className={`chip ${range === item ? "chip-on" : ""}`}
          >
            {item} days
          </button>
        ))}
        {data ? (
          <span className="ml-auto inline-flex items-center gap-1.5 text-sm text-muted">
            {delta > 0 ? (
              <ArrowUpRight className="size-4 text-warn" aria-hidden="true" />
            ) : delta < 0 ? (
              <ArrowDownRight className="size-4 text-primary" aria-hidden="true" />
            ) : (
              <Minus className="size-4 text-faint" aria-hidden="true" />
            )}
            {Math.abs(delta)} vs previous {data.range} days
          </span>
        ) : null}
      </div>

      {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

      {!data ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-surface" />
          ))}
        </div>
      ) : null}

      {data && empty ? (
        <Panel>
          <div className="flex items-start gap-3">
            <span className="icon-well">
              <Sparkles className="size-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-semibold">No checks in this window yet</h2>
              <p className="mt-1 text-sm text-muted">
                Run a check and this page fills in: the mix of what you caught, how scores moved day by day, and the
                reasons that keep coming up.
              </p>
              <Link
                to="/check"
                className="mt-3 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-ink"
              >
                Check something
              </Link>
            </div>
          </div>
        </Panel>
      ) : null}

      {data && !empty ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Checks" value={String(data.totals.total)} hint={`in ${data.range} days`} />
            <Stat
              label="High risk caught"
              value={String(data.totals.highRisk)}
              hint={`${data.totals.highRiskShare}% of checks`}
              tone="danger"
            />
            <Stat label="Average score" value={String(data.totals.avgScore)} hint="0 safe · 100 dangerous" tone="warn" />
            <Stat
              label="Streak"
              value={`${data.streak}d`}
              hint={data.streak > 1 ? "days in a row" : "days with a check"}
              icon={<Flame className="size-4 text-warn" strokeWidth={1.75} aria-hidden="true" />}
            />
          </div>

          <Panel className="mt-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold">Checks per day</h2>
              <p className="text-sm text-muted">
                {data.busiest
                  ? `Busiest: ${dayLabel(data.busiest.day)} with ${data.busiest.total}`
                  : "No activity yet"}
              </p>
            </div>
            <div className="mt-4 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid stroke={PALETTE.grid} strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "var(--color-faint)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: PALETTE.grid }}
                    interval="preserveStartEnd"
                    minTickGap={18}
                  />
                  <YAxis
                    tick={{ fill: "var(--color-faint)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={40}
                  />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="safe" stackId="a" fill={PALETTE.primary} radius={[0, 0, 0, 0]} name="Safe" />
                  <Bar dataKey="suspicious" stackId="a" fill={PALETTE.warn} name="Suspicious" />
                  <Bar dataKey="highRisk" stackId="a" fill={PALETTE.danger} radius={[4, 4, 0, 0]} name="High risk" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
              <Legend color={PALETTE.primary} label="Safe" />
              <Legend color={PALETTE.warn} label="Suspicious" />
              <Legend color={PALETTE.danger} label="High risk" />
            </div>
          </Panel>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Panel>
              <h2 className="font-semibold">Average score over time</h2>
              <p className="mt-1 text-sm text-muted">Higher means the things reaching you got more dangerous.</p>
              <div className="mt-4 h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
                    <defs>
                      <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={PALETTE.warn} stopOpacity={0.42} />
                        <stop offset="100%" stopColor={PALETTE.warn} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={PALETTE.grid} strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "var(--color-faint)", fontSize: 11 }}
                      tickLine={false}
                      axisLine={{ stroke: PALETTE.grid }}
                      interval="preserveStartEnd"
                      minTickGap={18}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: "var(--color-faint)", fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      width={40}
                    />
                    <Tooltip content={<ChartTip suffix="" />} />
                    <Area
                      type="monotone"
                      dataKey="avgScore"
                      stroke={PALETTE.warn}
                      strokeWidth={2}
                      fill="url(#scoreFill)"
                      name="Avg score"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel>
              <h2 className="font-semibold">What you check most</h2>
              <p className="mt-1 text-sm text-muted">Where the pressure actually arrives.</p>
              <div className="mt-4 h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.kinds.map((slice) => ({ ...slice, label: KIND_LABEL[slice.kind] ?? slice.kind }))}
                    layout="vertical"
                    margin={{ top: 0, right: 12, bottom: 0, left: 8 }}
                  >
                    <CartesianGrid stroke={PALETTE.grid} strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: "var(--color-faint)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={78}
                      tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTip suffix=" checks" />} />
                    <Bar dataKey="total" radius={[0, 4, 4, 0]} name="Checks">
                      {data.kinds.map((slice) => (
                        <Cell key={slice.kind} fill={slice.highRisk > 0 ? PALETTE.danger : PALETTE.primary} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <Panel>
              <h2 className="font-semibold">Score distribution</h2>
              <ul className="mt-3 space-y-3">
                {data.bands.map((band) => {
                  const pct = data.totals.total ? Math.round((band.total / data.totals.total) * 100) : 0;
                  const color =
                    band.id === "high" ? PALETTE.danger : band.id === "watch" ? PALETTE.warn : PALETTE.primary;
                  return (
                    <li key={band.id}>
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="font-medium">
                          {band.range} <span className="font-mono text-faint">{band.label}</span>
                        </span>
                        <span className="tabular-nums text-muted">
                          {band.total} · {pct}%
                        </span>
                      </div>
                      <div className="quota-track mt-1.5">
                        <div className="quota-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
              {data.peakWeekday !== null ? (
                <p className="mt-4 text-sm text-muted">
                  Most checks land on a <span className="font-semibold text-fg">{WEEKDAYS[data.peakWeekday]}</span>.
                </p>
              ) : null}
            </Panel>

            <Panel>
              <h2 className="font-semibold">Reasons that keep coming back</h2>
              <p className="mt-1 text-sm text-muted">The patterns Guardian flagged most in this window.</p>
              {data.reasons.length === 0 ? (
                <p className="mt-3 text-sm text-muted">No repeated reasons yet.</p>
              ) : (
                <ul className="mt-3 space-y-2.5">
                  {data.reasons.map((reason) => (
                    <li key={reason.text} className="flex items-start gap-2.5">
                      <span className="mt-1 shrink-0 rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs tabular-nums text-primary">
                        {reason.n}×
                      </span>
                      <span className="text-sm text-muted">{reason.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Link to="/history" className="panel card-link flex items-center gap-3">
              <span className="icon-well">
                <ShieldAlert className="size-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span>
                <span className="block font-semibold">Open the full record</span>
                <span className="block text-sm text-muted">Search, filter, and export every check.</span>
              </span>
            </Link>
            <Link to="/watch" className="panel card-link flex items-center gap-3">
              <span className="icon-well">
                <Radar className="size-5" strokeWidth={1.75} aria-hidden="true" />
              </span>
              <span>
                <span className="block font-semibold">Guardian Watch</span>
                <span className="block text-sm text-muted">
                  {data.plan.limit - data.plan.used > 0
                    ? `${data.plan.limit - data.plan.used} checks left this month.`
                    : "Lookups and reporting still work."}
                </span>
              </span>
            </Link>
          </div>
        </>
      ) : null}

      {!data && !error ? (
        <p className="mt-4 text-sm text-faint">Loading your record…</p>
      ) : null}

      {data && !empty ? (
        <p className="mt-6 text-xs text-faint">
          Computed from {data.totals.total} saved {data.totals.total === 1 ? "check" : "checks"} · updated {when(new Date().toISOString())}
        </p>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone = "primary",
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  tone?: "primary" | "warn" | "danger";
  icon?: React.ReactNode;
}) {
  const color = tone === "danger" ? "text-danger" : tone === "warn" ? "text-warn" : "text-primary";
  return (
    <div className="panel">
      <div className="flex items-center gap-1.5">
        <p className="font-mono text-xs tracking-widest text-faint">{label.toUpperCase()}</p>
        {icon}
      </div>
      <p className={`mt-2 font-mono text-3xl font-semibold tabular-nums ${color}`}>{value}</p>
      <p className="mt-1 text-sm text-muted">{hint}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-2.5 rounded-sm" style={{ background: color }} aria-hidden="true" />
      {label}
    </span>
  );
}

type TipPayload = { name?: string; value?: number | string; color?: string };

function ChartTip({
  active,
  payload,
  label,
  suffix = "",
}: {
  active?: boolean;
  payload?: TipPayload[];
  label?: string | number;
  suffix?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-card">
      <p className="font-mono text-xs tracking-widest text-faint">{String(label ?? "")}</p>
      <ul className="mt-1 space-y-0.5">
        {payload.map((item) => (
          <li key={`${item.name}-${item.value}`} className="flex items-center gap-2 text-sm">
            <span className="size-2 rounded-sm" style={{ background: item.color }} aria-hidden="true" />
            <span className="text-muted">{item.name}</span>
            <span className="ml-auto font-mono tabular-nums text-fg">
              {item.value}
              {suffix}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
