import { KIND_LABEL, type Digest } from "./digest";

/**
 * The weekly digest email \u2014 HTML and plain text.
 *
 * Email clients are hostile: no external CSS, no flexbox worth trusting, and
 * Outlook still renders with Word. So this is table-based, inline-styled, and
 * capped at 600px. The plain-text version is not an afterthought \u2014 it is what
 * most people on a phone will actually read, and it is what keeps the message out
 * of the spam folder.
 */

const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const esc = (value: unknown): string => String(value ?? "").replace(/[&<>"']/g, (c) => ENTITIES[c] ?? c);

const BG = "#071018";
const SURFACE = "#101c28";
const INK = "#e8f0f6";
const MUTED = "#a9bdd0";
const LINE = "#243646";
const PRIMARY = "#3ddec0";
const WARN = "#f0b429";
const DANGER = "#ff5a6a";

function statCell(label: string, value: number, color: string): string {
  return `<td width="25%" style="padding:0 4px;">
    <div style="background:${BG};border-radius:10px;padding:12px 10px;text-align:center;">
      <div style="font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:11px;letter-spacing:1.5px;color:${MUTED};text-transform:uppercase;">${esc(label)}</div>
      <div style="font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:24px;font-weight:600;color:${color};margin-top:4px;">${value}</div>
    </div>
  </td>`;
}

export type DigestEmailInput = {
  digest: Digest;
  displayName: string;
  appUrl: string;
  unsubscribeUrl: string;
  preferencesUrl: string;
};

/** Render the HTML body of the digest. */
export function digestHtml(input: DigestEmailInput): string {
  const { digest } = input;
  const name = input.displayName?.trim() || "there";

  const highRiskBlock = digest.highRiskItems.length
    ? `<tr><td style="padding:24px 28px 0;">
        <div style="font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:11px;letter-spacing:1.5px;color:${MUTED};text-transform:uppercase;">High-risk this week</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
          ${digest.highRiskItems
            .map(
              (item) => `<tr><td style="padding:10px 0;border-bottom:1px solid ${LINE};">
              <div style="font-size:15px;font-weight:600;color:${INK};">${esc(item.title)} <span style="font-family:'IBM Plex Mono',ui-monospace,monospace;color:${DANGER};">${item.score}</span></div>
              <div style="font-size:13px;color:${MUTED};margin-top:3px;">${esc(item.summary)}</div>
              <div style="font-size:11px;color:${MUTED};margin-top:4px;">${esc(KIND_LABEL[item.kind])} \u00b7 ${esc(item.day)}</div>
            </td></tr>`,
            )
            .join("")}
        </table>
      </td></tr>`
    : `<tr><td style="padding:24px 28px 0;">
        <div style="background:${SURFACE};border:1px solid ${LINE};border-radius:10px;padding:14px 16px;font-size:14px;color:${MUTED};">
          Nothing came back high risk this week. That is the result you want \u2014 keep checking before you pay.
        </div>
      </td></tr>`;

  const patternsBlock = digest.patterns.length
    ? `<tr><td style="padding:24px 28px 0;">
        <div style="font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:11px;letter-spacing:1.5px;color:${MUTED};text-transform:uppercase;">Patterns that kept appearing</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:10px;">
          ${digest.patterns
            .map(
              (pattern) => `<tr><td style="padding:6px 0;font-size:14px;color:${INK};">
              <span style="font-family:'IBM Plex Mono',ui-monospace,monospace;color:${PRIMARY};">${pattern.n}\u00d7</span>
              <span style="color:${MUTED};">${esc(pattern.text)}</span>
            </td></tr>`,
            )
            .join("")}
        </table>
      </td></tr>`
    : "";

  const changeLine =
    digest.changePct === null
      ? ""
      : `<div style="font-size:13px;color:${MUTED};margin-top:6px;">${
          digest.changePct === 0
            ? "Same as last week."
            : `${Math.abs(digest.changePct)}% ${digest.changePct > 0 ? "more" : "fewer"} checks than last week.`
        }</div>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Your Guardian week</title>
</head>
<body style="margin:0;padding:0;background:${BG};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:24px 12px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${SURFACE};border:1px solid ${LINE};border-radius:16px;overflow:hidden;">
      <tr><td style="padding:24px 28px 0;">
        <div style="font-size:17px;font-weight:600;color:${INK};">AI Guardian</div>
        <div style="font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:10px;letter-spacing:2px;color:${MUTED};margin-top:2px;">WEEKLY RISK DIGEST</div>
      </td></tr>

      <tr><td style="padding:20px 28px 0;">
        <h1 style="margin:0;font-size:22px;line-height:1.3;color:${INK};">Hi ${esc(name)}, here is your week</h1>
        <p style="margin:8px 0 0;font-size:14px;color:${MUTED};">
          ${esc(digest.weekStart)} to ${esc(digest.weekEnding)} \u00b7 ${digest.total} ${digest.total === 1 ? "check" : "checks"}
        </p>
        ${changeLine}
      </td></tr>

      <tr><td style="padding:20px 24px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          ${statCell("Safe", digest.safe, PRIMARY)}
          ${statCell("Suspicious", digest.suspicious, WARN)}
          ${statCell("High risk", digest.highRisk, DANGER)}
          ${statCell("Avg score", digest.avgScore, INK)}
        </tr></table>
      </td></tr>

      ${highRiskBlock}
      ${patternsBlock}

      <tr><td style="padding:24px 28px 0;">
        <div style="background:${BG};border-radius:10px;padding:16px;">
          <div style="font-family:'IBM Plex Mono',ui-monospace,monospace;font-size:11px;letter-spacing:1.5px;color:${PRIMARY};text-transform:uppercase;">Tip of the week</div>
          <div style="font-size:15px;font-weight:600;color:${INK};margin-top:6px;">${esc(digest.tip.title)}</div>
          <div style="font-size:14px;color:${MUTED};margin-top:4px;line-height:1.5;">${esc(digest.tip.body)}</div>
        </div>
      </td></tr>

      <tr><td style="padding:24px 28px 0;">
        <a href="${esc(input.appUrl)}" style="display:inline-block;background:${PRIMARY};color:#04241d;font-size:15px;font-weight:600;text-decoration:none;padding:12px 22px;border-radius:9px;">Open AI Guardian</a>
      </td></tr>

      <tr><td style="padding:24px 28px 28px;">
        <div style="border-top:1px solid ${LINE};padding-top:16px;font-size:12px;color:${MUTED};line-height:1.6;">
          AI Guardian is a second look, not a guarantee. A low score is not permission to send money, and a high score is not proof of a crime.<br /><br />
          <a href="${esc(input.preferencesUrl)}" style="color:${PRIMARY};">Email preferences</a>
          &nbsp;\u00b7&nbsp;
          <a href="${esc(input.unsubscribeUrl)}" style="color:${MUTED};">Unsubscribe from the weekly digest</a>
        </div>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

/** Render the plain-text alternative. */
export function digestText(input: DigestEmailInput): string {
  const { digest } = input;
  const name = input.displayName?.trim() || "there";
  const lines: string[] = [
    `AI Guardian \u2014 weekly risk digest`,
    `Hi ${name}, here is your week (${digest.weekStart} to ${digest.weekEnding}).`,
    "",
    `Checks: ${digest.total}`,
    `  Safe: ${digest.safe}`,
    `  Suspicious: ${digest.suspicious}`,
    `  High risk: ${digest.highRisk}`,
    `  Average score: ${digest.avgScore}`,
  ];

  if (digest.changePct !== null && digest.changePct !== 0) {
    lines.push(`  (${Math.abs(digest.changePct)}% ${digest.changePct > 0 ? "more" : "fewer"} than last week)`);
  }

  if (digest.highRiskItems.length) {
    lines.push("", "HIGH-RISK THIS WEEK");
    for (const item of digest.highRiskItems) {
      lines.push(`  - ${item.title} (${item.score}) \u2014 ${item.summary}`);
    }
  } else {
    lines.push("", "Nothing came back high risk this week.");
  }

  if (digest.patterns.length) {
    lines.push("", "PATTERNS THAT KEPT APPEARING");
    for (const pattern of digest.patterns) lines.push(`  ${pattern.n}x ${pattern.text}`);
  }

  lines.push("", `TIP: ${digest.tip.title}`, digest.tip.body);
  lines.push("", `Open AI Guardian: ${input.appUrl}`);
  lines.push("", "AI Guardian is a second look, not a guarantee.");
  lines.push(`Email preferences: ${input.preferencesUrl}`);
  lines.push(`Unsubscribe: ${input.unsubscribeUrl}`);
  return lines.join("\n");
}
