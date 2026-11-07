import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Download, Link2, Share2 } from "lucide-react";
import { Button, Notice, Panel } from "@/components/guardian/ui";
import {
  CARD_THEMES,
  buildCardModel,
  cardFilename,
  renderCard,
  themeById,
  type CardThemeId,
} from "@/lib/guardian/share-card";
import type { Analysis } from "@/lib/guardian/types";

/**
 * Scam-card studio.
 *
 * Renders the card to a canvas, shows it as a live preview, and offers the three
 * things a person actually wants: download the PNG, copy a link to the check, or
 * share it through the OS share sheet (which is how it reaches WhatsApp on a
 * phone).
 *
 * The canvas is drawn at 2\u00d7 and displayed at 1\u00d7, so the preview is sharp and
 * the exported file is print-quality without any extra work.
 */

export function ShareCardStudio({ analysis, shareUrl }: { analysis: Analysis; shareUrl: string }) {
  const [themeId, setThemeId] = useState<CardThemeId>("guardian");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const theme = useMemo(() => themeById(themeId), [themeId]);
  const model = useMemo(() => buildCardModel(analysis), [analysis]);

  const draw = useCallback(() => {
    try {
      const url = renderCard(model, theme, 1080, 2);
      setDataUrl(url);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not draw the card.");
    }
  }, [model, theme]);

  useEffect(() => {
    draw();
  }, [draw]);

  const download = () => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = cardFilename(analysis);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const copyLink = () => {
    void navigator.clipboard?.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /**
   * Share the image itself when the platform supports files (mobile), and fall
   * back to sharing the link when it does not (most desktops).
   */
  const share = async () => {
    const text = `${model.verdictLabel} \u2014 ${model.scamType}. Checked with AI Guardian.`;
    try {
      if (dataUrl && typeof navigator.canShare === "function") {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], cardFilename(analysis), { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text, url: shareUrl });
          setShared(true);
          setTimeout(() => setShared(false), 2000);
          return;
        }
      }
      if (typeof navigator.share === "function") {
        await navigator.share({ title: "AI Guardian warning", text, url: shareUrl });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
        return;
      }
      copyLink();
    } catch {
      // The person dismissed the share sheet \u2014 not an error worth showing.
    }
  };

  return (
    <Panel className="mt-4">
      <h2 className="flex items-center gap-2 font-semibold">
        <Share2 className="size-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
        Warn your family
      </h2>
      <p className="mt-1 text-sm text-muted">
        Turn this check into an image you can drop into a family group or a WhatsApp chat. It carries the score, the
        scam type, the warning signs, and one line of advice.
      </p>

      {error ? (
        <div className="mt-3">
          <Notice tone="danger">{error}</Notice>
        </div>
      ) : null}

      <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,320px)_1fr]">
        <div>
          <div className="overflow-hidden rounded-xl border border-line bg-bg">
            {dataUrl ? (
              <img src={dataUrl} alt="Scam warning card preview" className="block w-full" />
            ) : (
              <div className="aspect-square animate-pulse bg-surface" />
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-faint uppercase">Theme</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {CARD_THEMES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setThemeId(option.id)}
                  aria-pressed={themeId === option.id}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-lg border px-3 text-sm font-medium ${
                    themeId === option.id ? "border-primary text-fg" : "border-line text-muted"
                  }`}
                >
                  <span
                    className="size-4 rounded-full border border-line"
                    style={{ background: option.accent }}
                    aria-hidden="true"
                  />
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-bg px-3 py-3 text-sm">
            <p className="font-mono text-xs tracking-widest text-faint">ON THE CARD</p>
            <p className="mt-1 font-medium">
              {model.score} \u00b7 {model.verdictLabel} \u00b7 {model.scamType}
            </p>
            <p className="mt-1 text-xs text-muted">{model.advice}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={download} disabled={!dataUrl}>
              <Download className="size-4" strokeWidth={1.75} aria-hidden="true" />
              Download PNG
            </Button>
            <Button variant="quiet" onClick={() => void share()} disabled={!dataUrl}>
              {shared ? (
                <Check className="size-4" strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <Share2 className="size-4" strokeWidth={1.75} aria-hidden="true" />
              )}
              {shared ? "Shared" : "Share"}
            </Button>
            <Button variant="quiet" onClick={copyLink}>
              {copied ? (
                <Check className="size-4" strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <Link2 className="size-4" strokeWidth={1.75} aria-hidden="true" />
              )}
              {copied ? "Link copied" : "Copy link"}
            </Button>
          </div>

          <p className="text-xs text-faint">
            The card is generated in your browser \u2014 nothing is uploaded. Sharing the link opens the full check for
            whoever you send it to.
          </p>
        </div>
      </div>
    </Panel>
  );
}

/** Small inline button used from the history list to jump to the card studio. */
export function CardLink({ to }: { to: string }) {
  return (
    <a
      href={to}
      className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary"
    >
      <Copy className="size-4" strokeWidth={1.75} aria-hidden="true" />
      Make a scam card
    </a>
  );
}
