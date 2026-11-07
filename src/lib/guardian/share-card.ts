import type { Analysis, Verdict } from "./types";

/**
 * Scam-card model + canvas renderer.
 *
 * A "scam card" is a square image a person can drop into a family WhatsApp group
 * to warn people. It has to survive being screenshotted, forwarded, and viewed
 * on a phone at arm's length, so the layout is deliberately blunt: a huge score,
 * a one-word verdict, the scam type, the top warning signs, and one line of
 * advice.
 *
 * Everything here is pure \u2014 no React, no DOM at import time \u2014 so the same
 * functions can render in the browser and be unit-tested in Node.
 */

export type CardThemeId = "guardian" | "alert" | "paper";

export type CardTheme = {
  id: CardThemeId;
  label: string;
  /** Page background behind the card. */
  backdrop: string;
  surface: string;
  ink: string;
  muted: string;
  line: string;
  accent: string;
  accentInk: string;
  /** Soft tint used behind the "what to do" line. */
  soft: string;
};

export const CARD_THEMES: CardTheme[] = [
  {
    id: "guardian",
    label: "Guardian",
    backdrop: "#071018",
    surface: "#101c28",
    ink: "#e8f0f6",
    muted: "#a9bdd0",
    line: "#243646",
    accent: "#3ddec0",
    accentInk: "#04241d",
    soft: "#12352e",
  },
  {
    id: "alert",
    label: "Alert",
    backdrop: "#1a0a0e",
    surface: "#2a1016",
    ink: "#ffeef1",
    muted: "#e0aab4",
    line: "#4a1f28",
    accent: "#ff5a6a",
    accentInk: "#2a0a10",
    soft: "#3c1620",
  },
  {
    id: "paper",
    label: "Paper",
    backdrop: "#f4f1ea",
    surface: "#ffffff",
    ink: "#14181c",
    muted: "#5b6672",
    line: "#dcd6c9",
    accent: "#0f766e",
    accentInk: "#ffffff",
    soft: "#e6f2f0",
  },
];

export function themeById(id: string | null | undefined): CardTheme {
  return CARD_THEMES.find((theme) => theme.id === id) ?? CARD_THEMES[0];
}

/** Verdict \u2192 the colour the score ring and kicker use. */
export function verdictColor(verdict: Verdict, theme: CardTheme): string {
  if (verdict === "safe") return theme.id === "paper" ? "#0f766e" : "#3ddec0";
  if (verdict === "high_risk") return theme.id === "paper" ? "#c2263a" : "#ff5a6a";
  return theme.id === "paper" ? "#a16207" : "#f0b429";
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  safe: "LOOKS SAFE",
  suspicious: "BE CAREFUL",
  high_risk: "HIGH RISK",
};

const KIND_LABEL: Record<string, string> = {
  message: "Message",
  url: "Link",
  number: "Phone number",
  image: "Screenshot",
  investment: "Investment pitch",
};

/**
 * The scam type shown on the card.
 *
 * Prefers the check's own title (which the model writes to name the pattern, e.g.
 * "Fake bank SMS"), and falls back to the kind so the card is never blank.
 */
export function scamType(analysis: Pick<Analysis, "title" | "kind">): string {
  const title = (analysis.title ?? "").trim();
  if (title && title.length <= 60) return title;
  return KIND_LABEL[analysis.kind] ?? "Suspicious message";
}

/** One short line of advice, taken from the check's own actions. */
export function adviceLine(analysis: Pick<Analysis, "actions" | "verdict">): string {
  const first = (analysis.actions ?? []).map((line) => line.trim()).find(Boolean);
  if (first) return first.length > 120 ? `${first.slice(0, 117)}...` : first;
  if (analysis.verdict === "safe") return "Still verify on a channel you already trust before sending money.";
  if (analysis.verdict === "high_risk") return "Do not pay, do not click, do not reply. Verify with the real company.";
  return "Slow down. Check the sender through a channel you already trust.";
}

export type CardModel = {
  score: number;
  verdict: Verdict;
  verdictLabel: string;
  scamType: string;
  reasons: string[];
  advice: string;
  brand: string;
  footer: string;
};

/** Everything the renderer needs, derived from a check. */
export function buildCardModel(
  analysis: Analysis,
  options: { brand?: string; footer?: string; maxReasons?: number } = {},
): CardModel {
  const score = Math.max(0, Math.min(100, Math.round(Number(analysis.score) || 0)));
  return {
    score,
    verdict: analysis.verdict,
    verdictLabel: VERDICT_LABEL[analysis.verdict] ?? VERDICT_LABEL.suspicious,
    scamType: scamType(analysis),
    reasons: (analysis.reasons ?? []).map((line) => line.trim()).filter(Boolean).slice(0, options.maxReasons ?? 3),
    advice: adviceLine(analysis),
    brand: options.brand ?? "AI Guardian",
    footer: options.footer ?? "Checked with AI Guardian \u00b7 a second look before you pay",
  };
}

/** Wrap text to a pixel width, returning at most `maxLines` lines. */
export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) break;
    }
  }
  if (lines.length < maxLines && current) lines.push(current);
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1];
    if (ctx.measureText(last).width > maxWidth) {
      let trimmed = last;
      while (trimmed.length > 1 && ctx.measureText(`${trimmed}\u2026`).width > maxWidth) trimmed = trimmed.slice(0, -1);
      lines[maxLines - 1] = `${trimmed}\u2026`;
    }
  }
  return lines;
}

const FONT = '"IBM Plex Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace';

/**
 * Draw the card onto a 2D canvas at `size` \u00d7 `size` CSS pixels.
 *
 * The caller is responsible for the device-pixel-ratio scale (see `renderCard`),
 * so all coordinates here are in CSS pixels and the layout is resolution-free.
 */
export function drawCard(
  ctx: CanvasRenderingContext2D,
  model: CardModel,
  theme: CardTheme,
  size = 1080,
): void {
  const pad = size * 0.062;
  const radius = size * 0.045;
  const accent = verdictColor(model.verdict, theme);

  const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  // Backdrop + card surface
  ctx.fillStyle = theme.backdrop;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = theme.surface;
  roundRect(pad * 0.5, pad * 0.5, size - pad, size - pad, radius);
  ctx.fill();

  const left = pad;
  const right = size - pad;
  const innerWidth = right - left;
  let y = pad + size * 0.012;

  // Brand row
  ctx.fillStyle = theme.ink;
  ctx.font = `600 ${size * 0.026}px ${FONT}`;
  ctx.textBaseline = "top";
  ctx.fillText(model.brand, left, y);
  ctx.fillStyle = theme.muted;
  ctx.font = `500 ${size * 0.019}px ${MONO}`;
  const tag = "SCAM WARNING";
  ctx.fillText(tag, right - ctx.measureText(tag).width, y + size * 0.006);
  y += size * 0.055;

  // Score ring + verdict
  const ringR = size * 0.105;
  const ringCx = left + ringR;
  const ringCy = y + ringR;
  ctx.lineWidth = size * 0.019;
  ctx.strokeStyle = theme.line;
  ctx.beginPath();
  ctx.arc(ringCx, ringCy, ringR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = accent;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(ringCx, ringCy, ringR, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * model.score) / 100);
  ctx.stroke();

  ctx.fillStyle = theme.ink;
  ctx.font = `600 ${size * 0.062}px ${MONO}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(model.score), ringCx, ringCy + size * 0.004);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const textX = ringCx + ringR + size * 0.035;
  const textWidth = right - textX;
  ctx.fillStyle = accent;
  ctx.font = `600 ${size * 0.024}px ${MONO}`;
  ctx.fillText(model.verdictLabel, textX, ringCy - ringR + size * 0.012);

  ctx.fillStyle = theme.ink;
  ctx.font = `600 ${size * 0.042}px ${FONT}`;
  const typeLines = wrapText(ctx, model.scamType, textWidth, 2);
  typeLines.forEach((line, index) => {
    ctx.fillText(line, textX, ringCy - ringR + size * 0.052 + index * size * 0.05);
  });

  y = ringCy + ringR + size * 0.045;

  // Warning signs
  if (model.reasons.length > 0) {
    ctx.fillStyle = theme.muted;
    ctx.font = `600 ${size * 0.019}px ${MONO}`;
    ctx.fillText("WARNING SIGNS", left, y);
    y += size * 0.036;

    ctx.font = `400 ${size * 0.027}px ${FONT}`;
    for (const reason of model.reasons) {
      const lines = wrapText(ctx, reason, innerWidth - size * 0.035, 2);
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(left + size * 0.008, y + size * 0.014, size * 0.007, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = theme.ink;
      lines.forEach((line, index) => {
        ctx.fillText(line, left + size * 0.035, y + index * size * 0.034);
      });
      y += lines.length * size * 0.034 + size * 0.016;
    }
  }

  // What to do
  const adviceLines = wrapText(ctx, model.advice, innerWidth - size * 0.05, 3);
  const boxH = size * 0.05 + adviceLines.length * size * 0.034;
  const boxY = Math.min(y + size * 0.012, size - pad - size * 0.1 - boxH);
  ctx.fillStyle = theme.soft;
  roundRect(left, boxY, innerWidth, boxH, size * 0.022);
  ctx.fill();
  ctx.fillStyle = theme.muted;
  ctx.font = `600 ${size * 0.018}px ${MONO}`;
  ctx.fillText("WHAT TO DO", left + size * 0.025, boxY + size * 0.016);
  ctx.fillStyle = theme.ink;
  ctx.font = `500 ${size * 0.027}px ${FONT}`;
  adviceLines.forEach((line, index) => {
    ctx.fillText(line, left + size * 0.025, boxY + size * 0.042 + index * size * 0.034);
  });

  // Footer
  ctx.fillStyle = theme.muted;
  ctx.font = `400 ${size * 0.019}px ${FONT}`;
  const footerLines = wrapText(ctx, model.footer, innerWidth, 1);
  ctx.fillText(footerLines[0] ?? "", left, size - pad - size * 0.012);
}

/**
 * Render the card to a PNG data URL at `size` \u00d7 `size` CSS pixels.
 *
 * Draws at `size * dpr` and scales the context, so the exported PNG is crisp on
 * a retina phone without the layout code knowing about it.
 */
export function renderCard(model: CardModel, theme: CardTheme, size = 1080, dpr = 2): string {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(size * dpr);
  canvas.height = Math.round(size * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser cannot draw the card.");
  ctx.scale(dpr, dpr);
  drawCard(ctx, model, theme, size);
  return canvas.toDataURL("image/png");
}

/** Filename for the download, derived from the check. */
export function cardFilename(analysis: Pick<Analysis, "id" | "verdict">): string {
  const slug = String(analysis.id ?? "check").replace(/[^a-z0-9]/gi, "").slice(0, 10) || "check";
  return `ai-guardian-${analysis.verdict}-${slug}.png`;
}
