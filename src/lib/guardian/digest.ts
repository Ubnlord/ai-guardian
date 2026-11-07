import type { CheckKind, Verdict } from "./types";

/**
 * Weekly digest model \u2014 pure functions, no DB and no DOM.
 *
 * The digest is the product's retention loop: once a week we tell a person what
 * they checked, what came back dangerous, and which pattern kept showing up. It
 * is built from the same `checks` rows the Insights page reads, so the numbers in
 * the email always match the numbers in the app.
 */

export type DigestRow = {
  day: string;
  kind: string;
  verdict: string;
  score: number;
  title: string;
  summary: string;
  reasons: string;
};

export type DigestHighRisk = {
  title: string;
  summary: string;
  score: number;
  kind: CheckKind;
  day: string;
};

export type DigestPattern = { text: string; n: number };

export type Digest = {
  /** ISO `YYYY-MM-DD` of the last day covered. */
  weekEnding: string;
  /** ISO `YYYY-MM-DD` of the first day covered. */
  weekStart: string;
  total: number;
  safe: number;
  suspicious: number;
  highRisk: number;
  avgScore: number;
  /** Checks in the previous week, for a "vs last week" line. */
  previousTotal: number;
  /** Percentage change vs the previous week, rounded; null when there is no base. */
  changePct: number | null;
  highRiskItems: DigestHighRisk[];
  patterns: DigestPattern[];
  /** The single most common kind, or null when the week is empty. */
  topKind: CheckKind | null;
  tip: { title: string; body: string };
};

const KIND_ORDER: CheckKind[] = ["message", "url", "number", "image", "investment"];

const asKind = (value: string): CheckKind =>
  KIND_ORDER.includes(value as CheckKind) ? (value as CheckKind) : "message";

const asVerdict = (value: string): Verdict =>
  value === "high_risk" || value === "safe" ? value : "suspicious";

const num = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};

/** Parse the JSON `reasons` column, tolerating a malformed row. */
export function parseReasons(raw: string): string[] {
  try {
    const value = JSON.parse(raw || "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

/**
 * A rotating tip, chosen deterministically from the week so the same week always
 * produces the same email (important for the preview route and for retries).
 */
export const TIPS: { title: string; body: string }[] = [
  {
    title: "Verify on a channel you already trust",
    body: "Never use the phone number, link, or reply address inside the message that reached you. Open the company's app, or call the number on the back of your card.",
  },
  {
    title: "Urgency is the tell",
    body: "\"Act in the next 10 minutes\" exists to stop you thinking. Real banks, real couriers, and real tax offices do not work on a countdown.",
  },
  {
    title: "Payment methods are a signal",
    body: "Gift cards, crypto, and instant bank transfers are how scammers get money back out fast. A real business will take a card or an invoice.",
  },
  {
    title: "Check the address, not the logo",
    body: "A page can copy any logo in seconds. The domain is the part that is expensive to fake \u2014 read it character by character.",
  },
  {
    title: "Tell one person",
    body: "Scams work on silence. Forwarding a warning to your family group is the cheapest protection there is \u2014 and it takes ten seconds.",
  },
];

/** Pick the tip for a given week, stable across runs. */
export function tipForWeek(weekEnding: string): { title: string; body: string } {
  const digits = weekEnding.replace(/\D/g, "");
  const seed = digits ? Number(digits.slice(-4)) : 0;
  return TIPS[seed % TIPS.length];
}

/**
 * Build the digest for one week.
 *
 * `rows` must already be scoped to the user and to the week; `previousTotal` is
 * the count for the week before, used only for the comparison line.
 */
export function buildDigest(input: {
  rows: DigestRow[];
  previousTotal: number;
  weekStart: string;
  weekEnding: string;
}): Digest {
  let safe = 0;
  let suspicious = 0;
  let highRisk = 0;
  let scoreSum = 0;
  const kindCount = new Map<CheckKind, number>();
  const reasonCount = new Map<string, number>();
  const highRiskItems: DigestHighRisk[] = [];

  for (const row of input.rows) {
    const score = num(row.score);
    scoreSum += score;
    const verdict = asVerdict(row.verdict);
    if (verdict === "safe") safe += 1;
    else if (verdict === "high_risk") highRisk += 1;
    else suspicious += 1;

    const kind = asKind(row.kind);
    kindCount.set(kind, (kindCount.get(kind) ?? 0) + 1);

    for (const reason of parseReasons(row.reasons)) {
      const key = reason.trim();
      if (key) reasonCount.set(key, (reasonCount.get(key) ?? 0) + 1);
    }

    if (verdict === "high_risk") {
      highRiskItems.push({
        title: String(row.title ?? "High-risk check").slice(0, 140),
        summary: String(row.summary ?? "").slice(0, 240),
        score,
        kind,
        day: String(row.day ?? ""),
      });
    }
  }

  const total = input.rows.length;
  const topKind = [...kindCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const patterns = [...reasonCount.entries()]
    .map(([text, n]) => ({ text, n }))
    .sort((a, b) => b.n - a.n || a.text.localeCompare(b.text))
    .slice(0, 3);

  const changePct =
    input.previousTotal > 0 ? Math.round(((total - input.previousTotal) / input.previousTotal) * 100) : null;

  return {
    weekEnding: input.weekEnding,
    weekStart: input.weekStart,
    total,
    safe,
    suspicious,
    highRisk,
    avgScore: total ? Math.round(scoreSum / total) : 0,
    previousTotal: input.previousTotal,
    changePct,
    highRiskItems: highRiskItems.sort((a, b) => b.score - a.score).slice(0, 5),
    patterns,
    topKind,
    tip: tipForWeek(input.weekEnding),
  };
}

/** Human label for a check kind, used in the email. */
export const KIND_LABEL: Record<CheckKind, string> = {
  message: "Messages",
  url: "Links",
  number: "Phone numbers",
  image: "Screenshots",
  investment: "Investment pitches",
};

/** Subject line for the email \u2014 leads with the number that matters. */
export function digestSubject(digest: Digest): string {
  if (digest.total === 0) return "Your Guardian week: nothing checked, and that is fine";
  if (digest.highRisk > 0) {
    return `Your Guardian week: ${digest.highRisk} high-risk ${digest.highRisk === 1 ? "check" : "checks"} out of ${digest.total}`;
  }
  return `Your Guardian week: ${digest.total} ${digest.total === 1 ? "check" : "checks"}, nothing dangerous`;
}
