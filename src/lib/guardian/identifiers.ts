export type IdentifierKind = "phone" | "account" | "domain";

export type Identifier = {
  kind: IdentifierKind;
  normalized: string;
  display: string;
};

const BANK_NEAR =
  /(account|acct|nuban|opay|palmpay|kuda|gtbank|\bgtb\b|zenith|access|uba|moniepoint|first\s?bank|fidelity|sterling|wema|polaris|send to|transfer to|pay into)/i;

const PHONE_RE = /(?:\+\s*234|234|0)[\s.-]*[789](?:[\s.-]*\d){9}\b/gi;

const INTL_PHONE_RE = /\+\s*\d(?:[\s().-]*\d){7,14}\b/g;

const DOMAIN_RE = /\b(?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,24}\b/gi;

export function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  const hadPlus = raw.trim().startsWith("+");
  if (digits.startsWith("234") && digits.length === 14 && digits.charAt(3) === "0") digits = digits.slice(4);
  else if (digits.startsWith("234") && digits.length === 13) digits = digits.slice(3);
  if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  if (/^[789]\d{9}$/.test(digits)) return digits;
  if (hadPlus && digits.length >= 8 && digits.length <= 15 && !digits.startsWith("0")) return `+${digits}`;
  return null;
}

export function formatPhone(value: string): string {
  if (value.startsWith("+")) {
    const digits = value.slice(1);
    const chunks = digits.match(/.{1,3}/g) ?? [digits];
    return `+${chunks.join(" ")}`;
  }
  return `0${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`;
}

export function normalizeDomain(raw: string): string | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed || /\s/.test(trimmed)) return null;
  const assumed = !/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed);
  try {
    const url = new URL(assumed ? `https://${trimmed}` : trimmed);
    const host = url.hostname.replace(/^www\./, "");
    if (!host.includes(".") || host.length > 120) return null;
    if (!/^[a-z0-9.-]+$/.test(host)) return null;
    if (host.startsWith(".") || host.endsWith(".")) return null;
    return host;
  } catch {
    return null;
  }
}

export type PasteKind = "message" | "url" | "number";

export type PasteDetect = {
  kind: PasteKind;
  value: string;
  url?: string;
  numberKind?: "phone" | "account";
};

/** One paste can be a message, a bare link, or a bare number. Mixed text stays a message. */
export function detectPaste(raw: string): PasteDetect {
  const text = raw.trim();
  if (!text) return { kind: "message", value: "" };
  if (/^https?:\/\/\S+$/i.test(text)) return { kind: "url", value: text, url: text };
  if (/^(?:www\.)?(?:[a-z0-9-]+\.)+[a-z]{2,24}(?:\/\S*)?$/i.test(text)) {
    return { kind: "url", value: text, url: /^https?:\/\//i.test(text) ? text : `https://${text}` };
  }
  const phone = normalizePhone(text);
  if (phone && text.length <= 24) return { kind: "number", value: text, numberKind: "phone" };
  const compact = text.replace(/\s/g, "");
  const digits = text.replace(/\D/g, "");
  if (/^\d{10}$/.test(digits) && compact === digits) return { kind: "number", value: digits, numberKind: "account" };
  return { kind: "message", value: text };
}

export function resolveIdentifier(kind: string, raw: string): Identifier | null {
  if (kind === "phone") {
    const normalized = normalizePhone(raw);
    if (!normalized) return null;
    return { kind: "phone", normalized, display: formatPhone(normalized) };
  }
  if (kind === "account") {
    const digits = raw.replace(/\D/g, "");
    if (!/^\d{10}$/.test(digits)) return null;
    return { kind: "account", normalized: digits, display: digits };
  }
  if (kind === "domain") {
    const normalized = normalizeDomain(raw);
    if (!normalized) return null;
    return { kind: "domain", normalized, display: normalized };
  }
  return null;
}

function add(found: Identifier[], seen: Set<string>, item: Identifier) {
  const key = `${item.kind}:${item.normalized}`;
  if (seen.has(key)) return;
  seen.add(key);
  found.push(item);
}

function nearBank(text: string, index: number): boolean {
  const start = Math.max(0, index - 42);
  const end = Math.min(text.length, index + 28);
  return BANK_NEAR.test(text.slice(start, end));
}

export function extractIdentifiers(text: string): Identifier[] {
  const found: Identifier[] = [];
  const seen = new Set<string>();

  for (const match of text.matchAll(PHONE_RE)) {
    const normalized = normalizePhone(match[0]);
    if (!normalized) continue;
    const index = match.index ?? 0;
    add(found, seen, { kind: "phone", normalized, display: formatPhone(normalized) });
    if (nearBank(text, index) && !normalized.startsWith("+")) {
      add(found, seen, { kind: "account", normalized, display: normalized });
    }
  }

  for (const match of text.matchAll(INTL_PHONE_RE)) {
    const normalized = normalizePhone(match[0]);
    if (!normalized?.startsWith("+")) continue;
    add(found, seen, { kind: "phone", normalized, display: formatPhone(normalized) });
  }

  for (const match of text.matchAll(/\b(\d{3,4})[\s.-](\d{3,4})[\s.-](\d{3,4})\b/g)) {
    const digits = `${match[1] ?? ""}${match[2] ?? ""}${match[3] ?? ""}`;
    if (digits.length !== 10 && digits.length !== 11) continue;
    const index = match.index ?? 0;
    const phone = normalizePhone(digits);
    const bank = nearBank(text, index);
    if (phone && (digits.startsWith("0") || digits.startsWith("234") || bank)) {
      add(found, seen, { kind: "phone", normalized: phone, display: formatPhone(phone) });
    }
    if (bank) {
      const account = phone ?? (digits.length === 10 ? digits : null);
      if (account) add(found, seen, { kind: "account", normalized: account, display: account });
    }
  }

  for (const match of text.matchAll(/\b(\d{10})\b/g)) {
    const digits = match[1] ?? "";
    const index = match.index ?? 0;
    if (!nearBank(text, index)) continue;
    add(found, seen, { kind: "account", normalized: digits, display: digits });
    const asPhone = normalizePhone(digits);
    if (asPhone) add(found, seen, { kind: "phone", normalized: asPhone, display: formatPhone(asPhone) });
  }

  for (const match of text.matchAll(DOMAIN_RE)) {
    const normalized = normalizeDomain(match[0] ?? "");
    if (!normalized) continue;
    if (normalized.endsWith(".png") || normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) continue;
    add(found, seen, { kind: "domain", normalized, display: normalized });
  }

  return found.slice(0, 8);
}
