import type { CheckKind, PlanId } from "./types";

export const PLAN_ORDER: PlanId[] = ["free", "plus", "family", "business"];

export const HOUR_CAP = 20;

type Plan = {
  id: PlanId;
  name: string;
  price: string;
  cadence: string;
  checks: number;
  seats: number;
  blurb: string;
  features: string[];
  highlight?: boolean;
};

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    price: "$0",
    cadence: "forever",
    checks: 5,
    seats: 0,
    blurb: "Enough to check the message that made your stomach drop.",
    features: [
      "5 AI checks each month",
      "Messages, links, and numbers",
      "Guardian Watch",
      "A reply you can copy",
      "Lessons and playbooks",
    ],
  },
  plus: {
    id: "plus",
    name: "Guardian Plus",
    price: "$4.99",
    cadence: "per month",
    checks: 150,
    seats: 2,
    highlight: true,
    blurb: "The safety layer for one person who is tired of guessing.",
    features: [
      "150 checks each month",
      "Messages, links, images, ID and passport scans, documents, short video, investments",
      "Personal risk history",
      "A circle of 2 with a private phrase",
    ],
  },
  family: {
    id: "family",
    name: "Family",
    price: "$9.99",
    cadence: "per month",
    checks: 400,
    seats: 6,
    blurb: "One phrase. Up to six people. Nobody sends money on a stranger's word.",
    features: [
      "400 checks each month",
      "Everything in Plus",
      "Up to 6 people in the circle",
      "Shared high-risk alerts",
    ],
  },
  business: {
    id: "business",
    name: "Business",
    price: "$19",
    cadence: "per month",
    checks: 800,
    seats: 15,
    blurb: "For a small team that gets fake invoices and lookalike domains.",
    features: [
      "800 checks each month",
      "Invoice review mode",
      "Up to 15 people",
      "Brand domain watch",
    ],
  },
};

export function asPlan(value: string | null | undefined): PlanId {
  if (value === "plus" || value === "family" || value === "business") return value;
  return "free";
}

export function checksLimit(plan: PlanId): number {
  return PLANS[plan].checks;
}

export function seatLimit(plan: PlanId): number {
  return PLANS[plan].seats;
}

export function canUse(plan: PlanId, kind: CheckKind | "invoice" | "domains" | "circle"): boolean {
  if (kind === "message" || kind === "url" || kind === "number") return true;
  if (kind === "image" || kind === "investment" || kind === "circle") return plan !== "free";
  if (kind === "invoice" || kind === "domains") return plan === "business";
  return false;
}
