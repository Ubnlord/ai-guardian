export const WATCH_CATEGORIES = [
  { id: "impersonation", label: "Impersonation" },
  { id: "otp", label: "OTP or secret" },
  { id: "payment", label: "Asked for money" },
  { id: "investment", label: "Investment scam" },
  { id: "invoice", label: "Fake invoice" },
  { id: "other", label: "Other" },
] as const;

export type WatchCategory = (typeof WATCH_CATEGORIES)[number]["id"];

export function isWatchCategory(value: string): value is WatchCategory {
  return WATCH_CATEGORIES.some((item) => item.id === value);
}
