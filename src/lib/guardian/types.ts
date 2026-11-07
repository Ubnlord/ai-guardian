export type Verdict = "safe" | "suspicious" | "high_risk";
export type CheckKind = "message" | "url" | "image" | "investment" | "number";
export type ScanMode = "photo" | "id" | "passport" | "document" | "video";
export type PlanId = "free" | "plus" | "family" | "business";

export type Analysis = {
  id: string;
  kind: CheckKind;
  verdict: Verdict;
  score: number;
  title: string;
  summary: string;
  reasons: string[];
  actions: string[];
  uncertainty: string;
  source: "ai" | "rules";
  excerpt: string;
  createdAt: string;
};

export type CheckResponse =
  | { ok: true; analysis: Analysis; used: number; limit: number }
  | { ok: false; error: string; upgrade?: boolean };

export type Me = {
  displayName: string;
  role: "member" | "admin";
  plan: PlanId;
  checksUsed: number;
  checksLimit: number;
  storeHistory: boolean;
  shareHighRisk: boolean;
  avatar: string;
  country: string;
  locale: string;
};

export type DashboardData = {
  me: Me;
  counts: { total: number; safe: number; suspicious: number; high_risk: number };
  recent: Analysis[];
  alerts: FamilyAlert[];
  watch: {
    week: number;
    hot: { kind: string; display: string; reports: number }[];
  };
};

export type FamilyAlert = {
  id: string;
  headline: string;
  detail: string;
  createdAt: string;
  label: string;
};

export type FamilyView = {
  family: null | {
    id: string;
    name: string;
    inviteCode: string | null;
    isOwner: boolean;
    hasPhrase: boolean;
    seats: number;
    seatLimit: number;
  };
  members: { userId: string; label: string; role: string; isYou: boolean }[];
  alerts: FamilyAlert[];
};

export type Article = {
  slug: string;
  title: string;
  category: string;
  body: string;
  minutes: number;
};

export type WatchKind = "phone" | "account" | "domain";

export type WatchEntry = {
  kind: WatchKind;
  display: string;
  reports: number;
  lastAt: string;
};

export type WatchLookup =
  | { ok: true; kind: WatchKind; display: string; reports: number; alreadyReported: boolean }
  | { ok: false; error: string };

export type AdminData = {
  users: number;
  checks: number;
  highRisk: number;
  plans: { plan: string; n: number }[];
  recent: {
    id: string;
    kind: string;
    verdict: string;
    score: number;
    title: string;
    createdAt: string;
    displayName: string;
  }[];
  people: {
    userId: string;
    displayName: string;
    email: string;
    role: string;
    plan: string;
    checksUsed: number;
  }[];
  articles: Article[];
};
