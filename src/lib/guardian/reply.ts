import type { Analysis } from "./types";

export function safeReply(analysis: Analysis): string | null {
  if (analysis.verdict === "safe") return null;
  const blob = `${analysis.title} ${analysis.summary} ${analysis.reasons.join(" ")}`.toLowerCase();
  if (/otp|pin|bvn|nin|password|secret/.test(blob)) {
    return "I won't share a code, PIN, BVN, or password here. I'll open the official app myself.";
  }
  if (/money|pay|transfer|account|naira|invoice|watch/.test(blob) || analysis.verdict === "high_risk") {
    return "I can't send money or codes from this chat. I'll reach you on the number I already have.";
  }
  return "I need to confirm this on a channel I already trust. I won't tap a link or share a code here.";
}

export function circleWarning(analysis: Analysis): string | null {
  if (analysis.verdict === "safe") return null;
  const tone = analysis.verdict === "high_risk" ? "high risk" : "suspicious";
  return `Guardian marked a check as ${tone}: ${analysis.title}. Don't send money until we talk on a number we already saved.`;
}
