import { useEffect, useState } from "react";
import { circleWarning, safeReply } from "@/lib/guardian/reply";
import type { Analysis, Verdict } from "@/lib/guardian/types";
import { when } from "./ui";

const TONE: Record<Verdict, { label: string; ring: string; text: string; soft: string }> = {
  safe: { label: "SAFE", ring: "var(--color-primary)", text: "text-primary", soft: "bg-primary-soft" },
  suspicious: { label: "SUSPICIOUS", ring: "var(--color-warn)", text: "text-warn", soft: "bg-warn-soft" },
  high_risk: { label: "HIGH RISK", ring: "var(--color-danger)", text: "text-danger", soft: "bg-danger-soft" },
};

export function ScoreMark({
  score,
  verdict,
  size = "md",
  live = false,
}: {
  score: number;
  verdict: Verdict;
  size?: "md" | "sm";
  live?: boolean;
}) {
  const tone = TONE[verdict];
  const shown = useSweepNumber(score, live);
  const box = size === "sm" ? "size-16" : "size-28";
  const type = size === "sm" ? "text-lg" : "text-3xl";
  return (
    <div className={`relative grid ${box} shrink-0 place-items-center`} aria-hidden="true">
      <div
        className={`score-ring absolute inset-0 rounded-full ${live ? "score-draw" : ""}`}
        style={{ ["--ring" as string]: tone.ring, ["--score" as string]: String(score) }}
      />
      <div className={`relative font-mono font-semibold tabular-nums ${type}`}>{shown}</div>
    </div>
  );
}

function useSweepNumber(target: number, live: boolean) {
  const [value, setValue] = useState(live ? 0 : target);
  useEffect(() => {
    if (!live) {
      setValue(target);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(eased * target));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, live]);
  return value;
}

export function VerdictCard({
  analysis,
  compact = false,
  reply = true,
  live = false,
}: {
  analysis: Analysis;
  compact?: boolean;
  reply?: boolean;
  live?: boolean;
}) {
  const tone = TONE[analysis.verdict];
  const say = !compact && reply ? safeReply(analysis) : null;
  const warn = !compact && reply ? circleWarning(analysis) : null;
  const rise = live ? "reveal" : "";
  return (
    <article className="panel">
      <div className="flex items-start gap-4">
        <ScoreMark score={analysis.score} verdict={analysis.verdict} size={compact ? "sm" : "md"} live={live} />
        <div className={`min-w-0 flex-1 ${rise}`}>
          <p className={`font-mono text-xs tracking-widest ${tone.text}`}>{tone.label}</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight md:text-xl">{analysis.title}</h2>
          <p className="mt-2 text-sm text-muted">{analysis.summary}</p>
          <p className="mt-2 text-xs text-faint">
            {analysis.source === "ai" ? "Reviewed with AI" : "Pattern rules only"} · {when(analysis.createdAt)}
          </p>
        </div>
      </div>

      {compact ? null : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className={rise} style={live ? { animationDelay: "120ms" } : undefined}>
            <h3 className="text-sm font-semibold">Why</h3>
            <ul className="reason-list mt-3" style={{ ["--mark" as string]: tone.ring }}>
              {analysis.reasons.map((reason, index) => (
                <li key={reason} className={rise} style={live ? { animationDelay: `${180 + index * 70}ms` } : undefined}>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
          <div className={`rounded-lg p-4 ${tone.soft} ${rise}`} style={live ? { animationDelay: "220ms" } : undefined}>
            <h3 className="text-sm font-semibold">What to do</h3>
            <ul className="mt-2 space-y-2">
              {analysis.actions.map((action) => (
                <li key={action} className="text-sm">
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {say ? <CopyBlock label="Reply you can send" text={say} className={rise} delay={live ? "320ms" : undefined} /> : null}
      {warn ? <CopyBlock label="Text for your circle" text={warn} className={rise} delay={live ? "400ms" : undefined} /> : null}

      {analysis.uncertainty ? (
        <p className={`mt-4 text-xs text-faint ${rise}`} style={live ? { animationDelay: "460ms" } : undefined}>
          {analysis.uncertainty}
        </p>
      ) : null}
    </article>
  );
}

function CopyBlock({ label, text, className = "", delay }: { label: string; text: string; className?: string; delay?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  return (
    <div className={`mt-4 rounded-lg bg-bg p-4 ${className}`} style={delay ? { animationDelay: delay } : undefined}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{label}</h3>
        <button
          type="button"
          className="min-h-11 shrink-0 rounded-md bg-surface-2 px-3 text-sm font-semibold"
          onClick={() => {
            void navigator.clipboard
              .writeText(text)
              .then(() => {
                setState("copied");
                window.setTimeout(() => setState("idle"), 1600);
              })
              .catch(() => setState("failed"));
          }}
        >
          {state === "copied" ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-2 text-sm text-muted">{text}</p>
      {state === "failed" ? <p className="mt-1 text-xs text-faint">Select the text and copy it yourself.</p> : null}
    </div>
  );
}

export function StaticExample() {
  const analysis: Analysis = {
    id: "example",
    kind: "message",
    verdict: "high_risk",
    score: 92,
    title: "Possible impersonation",
    summary:
      "This reads like a relative in trouble who does not want you to use the number you already have. The money request is the point of the message.",
    reasons: [
      "Urgent request for ₦200,000",
      "Tells you not to call the saved number",
      "New sender claiming to be your son",
      "Payment destination you cannot verify",
    ],
    actions: [
      "Don't send the money",
      "Call your son on the number already in your phone",
      "Ask for the family phrase if you have one",
    ],
    uncertainty: "The words alone cannot prove who typed them.",
    source: "rules",
    excerpt: "",
    createdAt: new Date().toISOString(),
  };
  return <VerdictCard analysis={analysis} reply={false} live />;
}
