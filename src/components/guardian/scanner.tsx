import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePrefs } from "@/components/prefs";
import type { ScanMode } from "@/lib/guardian/types";
import type { CopyKey } from "@/lib/i18n";
import { Button, Field, Notice, TextInput } from "./ui";

const MODES: { id: ScanMode; label: string; hint: string; frame: string }[] = [
  { id: "photo", label: "Photo", hint: "Screenshot, profile, or payment proof.", frame: "frame-photo" },
  { id: "id", label: "ID", hint: "National ID, NIN slip, licence, or voter card. Hold it flat.", frame: "frame-id" },
  { id: "passport", label: "Passport", hint: "The photo page, open and flat. Avoid glare.", frame: "frame-passport" },
  { id: "document", label: "Document", hint: "Invoice, receipt, letter, or bank alert.", frame: "frame-document" },
  { id: "video", label: "Video", hint: "A person, a screen recording, or someone showing a page. Six seconds is enough.", frame: "frame-photo" },
];

type Quality = "wait" | "dark" | "blur" | "ready";

const QUALITY_COPY: Record<Quality, string> = {
  wait: "Point the camera at the page.",
  dark: "Too dark. Turn toward a light.",
  blur: "Hold still. The page is soft.",
  ready: "Sharp enough. Fill the frame, then capture.",
};

export function Scanner({
  mode,
  onMode,
  busy,
  onScan,
  children,
}: {
  mode: ScanMode;
  onMode: (mode: ScanMode) => void;
  busy: boolean;
  onScan: (payload: { frames: string[]; note: string }) => void;
  children?: ReactNode;
}) {
  const { t } = usePrefs();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const stopScan = useRef(false);
  const [live, setLive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [shot, setShot] = useState<string | null>(null);
  const [frames, setFrames] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [quality, setQuality] = useState<Quality>("wait");
  const [localError, setLocalError] = useState<string | null>(null);
  const guide = MODES.find((item) => item.id === mode) ?? MODES[0];

  useEffect(() => {
    setFrames([]);
    setShot(null);
    setLocalError(null);
  }, [mode]);

  useEffect(() => {
    return () => {
      stopScan.current = true;
      stopStream(streamRef.current);
    };
  }, []);

  useEffect(() => {
    if (!live) return;
    const video = videoRef.current;
    if (!video) return;
    const timer = window.setInterval(() => {
      if (video.readyState < 2) return;
      setQuality(readQuality(video));
    }, 450);
    return () => window.clearInterval(timer);
  }, [live]);

  async function openCamera() {
    setLocalError(null);
    setShot(null);
    setFrames([]);
    if (!navigator.mediaDevices?.getUserMedia) {
      setLocalError("This browser has no camera. Upload a photo instead.");
      return;
    }
    try {
      stopStream(streamRef.current);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      setLive(true);
      setQuality("wait");
    } catch {
      setLive(false);
      setLocalError("Camera permission was blocked. You can still upload a photo.");
    }
  }

  function closeCamera() {
    stopScan.current = true;
    stopStream(streamRef.current);
    streamRef.current = null;
    setLive(false);
    setScanning(false);
    setQuality("wait");
  }

  function capture() {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      setLocalError("The camera is not ready yet.");
      return;
    }
    setShot(frameToDataUrl(video));
    setFrames([]);
    setLocalError(null);
    closeCamera();
  }

  async function scanLive() {
    const video = videoRef.current;
    if (!video) return;
    stopScan.current = false;
    setScanning(true);
    setShot(null);
    setFrames([]);
    setLocalError(null);
    const collected: string[] = [];
    for (let step = 0; step < 3; step += 1) {
      if (step > 0) await pause(1600);
      if (stopScan.current) break;
      if (video.readyState < 2) continue;
      setQuality(readQuality(video));
      collected.push(frameToDataUrl(video, 720, 0.7));
      setFrames([...collected]);
    }
    setScanning(false);
    const keep = collected.slice();
    closeCamera();
    setFrames(keep);
    if (keep.length < 2) {
      setFrames([]);
      setLocalError("Not enough of the clip was readable. Keep it in the light and scan again.");
    }
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`chip ${mode === item.id ? "chip-on" : ""}`}
            onClick={() => onMode(item.id)}
          >
            {t(item.id as CopyKey)}
          </button>
        ))}
      </div>
      <p className="mb-3 text-sm text-muted">{guide.hint}</p>

      <div className={`relative overflow-hidden rounded-xl bg-black ${live ? "" : "hidden"}`}>
        <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className={`finder ${guide.frame}`}>
            <span className="finder-corner left-0 top-0 border-l-2 border-t-2 border-solid" />
            <span className="finder-corner right-0 top-0 border-r-2 border-t-2 border-solid" />
            <span className="finder-corner bottom-0 left-0 border-b-2 border-l-2 border-solid" />
            <span className="finder-corner bottom-0 right-0 border-b-2 border-r-2 border-solid" />
            <span className="scan-beam" />
          </div>
        </div>
        <p className="absolute inset-x-0 bottom-3 text-center text-sm text-white">
          {scanning ? `Reading the clip · frame ${Math.min(frames.length + 1, 3)} of 3` : QUALITY_COPY[quality]}
        </p>
      </div>

      {frames.length > 0 ? (
        <div className="mt-3">
          <div className="filmstrip">
            {frames.map((src, index) => (
              <img key={`${index}-${src.length}`} src={src} alt={`Frame ${index + 1} of ${frames.length}`} />
            ))}
          </div>
          <div className="quota-track mt-2">
            <div className="quota-fill" style={{ width: `${(frames.length / 3) * 100}%` }} />
          </div>
        </div>
      ) : null}

      {shot ? (
        <img src={shot} alt="Captured page" className="mt-3 max-h-80 w-full rounded-xl object-contain outline outline-1 -outline-offset-1 outline-white/10" />
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {live ? (
          scanning ? (
            <Button
              type="button"
              variant="quiet"
              onClick={() => {
                stopScan.current = true;
              }}
            >
              {t("stop")}
            </Button>
          ) : (
            <>
              <Button type="button" onClick={() => void scanLive()} disabled={busy}>
                {t("scanLive")}
              </Button>
              <Button type="button" variant="quiet" onClick={capture} disabled={busy}>
                {t("capture")}
              </Button>
              <Button type="button" variant="quiet" onClick={closeCamera}>
                {t("closeCamera")}
              </Button>
            </>
          )
        ) : (
          <>
            <Button type="button" variant="quiet" onClick={() => void openCamera()} disabled={busy || scanning}>
              {shot || frames.length > 0 ? t("scanAgain") : t("openCamera")}
            </Button>
            <Button type="button" variant="quiet" onClick={() => fileRef.current?.click()} disabled={busy || scanning}>
              {mode === "video" ? t("uploadVideo") : t("upload")}
            </Button>
          </>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept={mode === "video" ? "video/mp4,video/webm,video/quicktime,image/*" : "image/*"}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          setLocalError(null);
          if (!file) return;
          closeCamera();
          if (file.type.startsWith("video/")) {
            setShot(null);
            void framesFromVideo(file)
              .then(setFrames)
              .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Could not read that video."));
            return;
          }
          setFrames([]);
          void fileToDataUrl(file)
            .then(setShot)
            .catch((err: unknown) => setLocalError(err instanceof Error ? err.message : "Could not read that file."));
        }}
      />

      <div className="mt-3">
        <Field label="What claim came with it?" hint="Optional. Example: they said this proves the payment, or that they are your son.">
          <TextInput value={note} onChange={(event) => setNote(event.target.value)} />
        </Field>
      </div>
      <p className="mt-3 text-xs text-faint">
        The picture is sent for this check only and is not stored. A live scan reads three frames from about six seconds, and that is still one check.
        {mode === "id" || mode === "passport"
          ? " This does not confirm the document with NIMC, immigration, or any government register."
          : mode === "video"
            ? " A few frames cannot prove a deepfake, or that the clip is real."
            : " A low score is not proof the picture is real."}
      </p>
      {localError ? (
        <div className="mt-3">
          <Notice tone="danger">{localError}</Notice>
        </div>
      ) : null}
      <div className="mt-4">
        <Button
          type="button"
          disabled={busy || scanning || (frames.length === 0 && !shot)}
          onClick={() => {
            const payload = frames.length > 0 ? frames : shot ? [shot] : [];
            if (payload.length > 0) onScan({ frames: payload, note });
          }}
        >
          {busy ? "Reading the page…" : frames.length > 1 ? "Check clip" : `Check ${guide.label.toLowerCase()}`}
        </Button>
      </div>
      {children}
    </div>
  );
}

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

function frameToDataUrl(video: HTMLVideoElement, max = 1280, quality = 0.8): string {
  return drawToJpeg(video.videoWidth, video.videoHeight, (ctx, width, height) => {
    ctx.drawImage(video, 0, 0, width, height);
  }, max, quality);
}

async function fileToDataUrl(file: File): Promise<string> {
  if (file.type === "application/pdf") throw new Error("Save the PDF as a photo or screenshot. PDF files are not read.");
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
  const bitmap = await createImageBitmap(file);
  try {
    return drawToJpeg(bitmap.width, bitmap.height, (ctx, width, height) => {
      ctx.drawImage(bitmap, 0, 0, width, height);
    });
  } finally {
    bitmap.close();
  }
}

function drawToJpeg(
  sourceWidth: number,
  sourceHeight: number,
  paint: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
  max = 1280,
  quality = 0.8,
): string {
  const scale = Math.min(1, max / Math.max(sourceWidth, sourceHeight, 1));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not read that image.");
  paint(ctx, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

function pause(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function framesFromVideo(file: File): Promise<string[]> {
  if (file.size > 40 * 1024 * 1024) return Promise.reject(new Error("That video is too large. Keep it under 40 MB."));
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.src = url;
  return new Promise((resolve, reject) => {
    const fail = (message: string) => {
      URL.revokeObjectURL(url);
      reject(new Error(message));
    };
    const openTimer = window.setTimeout(() => fail("That video took too long to open."), 12000);
    video.onerror = () => {
      window.clearTimeout(openTimer);
      fail("Could not open that video.");
    };
    video.onloadedmetadata = () => {
      window.clearTimeout(openTimer);
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration < 0.4) {
        fail("That video is too short to read.");
        return;
      }
      if (duration > 45) {
        fail("Keep the clip under 45 seconds.");
        return;
      }
      const times = [duration * 0.12, duration * 0.5, Math.max(0, Math.min(duration - 0.05, duration * 0.88))];
      const frames: string[] = [];
      let index = 0;
      const seek = () => {
        if (index >= times.length) {
          URL.revokeObjectURL(url);
          resolve(frames);
          return;
        }
        const wait = window.setTimeout(() => fail("Could not read a frame from that video."), 8000);
        const onSeek = () => {
          window.clearTimeout(wait);
          video.removeEventListener("seeked", onSeek);
          try {
            frames.push(frameToDataUrl(video, 720, 0.7));
          } catch (err) {
            fail(err instanceof Error ? err.message : "Could not read a frame.");
            return;
          }
          index += 1;
          seek();
        };
        video.addEventListener("seeked", onSeek);
        video.currentTime = times[index];
      };
      seek();
    };
  });
}

function readQuality(video: HTMLVideoElement): Quality {
  const width = 64;
  const height = 48;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return "wait";
  ctx.drawImage(video, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const gray = new Float32Array(width * height);
  let sum = 0;
  for (let i = 0; i < gray.length; i += 1) {
    const value = pixels[i * 4] * 0.3 + pixels[i * 4 + 1] * 0.59 + pixels[i * 4 + 2] * 0.11;
    gray[i] = value;
    sum += value;
  }
  if (sum / gray.length < 42) return "dark";
  let energy = 0;
  let count = 0;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const i = y * width + x;
      const lap = gray[i - width] + gray[i + width] + gray[i - 1] + gray[i + 1] - 4 * gray[i];
      energy += lap * lap;
      count += 1;
    }
  }
  if (energy / count < 40) return "blur";
  return "ready";
}
