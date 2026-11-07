import { Link } from "@tanstack/react-router";
import { Image as ImageIcon, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { hintLines, scoreInvestment, scoreMessage, scoreNumber, scoreUrl } from "@/lib/guardian/heuristics";
import { analyzeImage, analyzeInvestment, analyzeMessage, analyzeNumber, analyzeUrl } from "@/lib/guardian/api";
import { detectPaste } from "@/lib/guardian/identifiers";
import { canUse } from "@/lib/guardian/plans";
import { takeSharedPaste } from "@/lib/guardian/share";
import { INVESTMENT_SAMPLES, MESSAGE_SAMPLES, NUMBER_SAMPLES, URL_SAMPLES } from "@/lib/guardian/samples";
import { useGuardian } from "@/lib/guardian/store";
import { Scanner } from "./scanner";
import type { Analysis, CheckKind, CheckResponse, ScanMode } from "@/lib/guardian/types";
import { Button, Field, Notice, PageIntro, Panel, TextArea, TextInput } from "./ui";
import { VerdictCard } from "./verdict";

const COPY: Record<CheckKind, { kicker: string; title: string; body: string }> = {
  message: {
    kicker: "MESSAGE",
    title: "Is this message safe?",
    body: "Paste the SMS, WhatsApp, email, or DM before you reply, pay, or share a code.",
  },
  url: {
    kicker: "LINK",
    title: "Is this link safe?",
    body: "Paste the address. Guardian reads the link itself. It does not open the page.",
  },
  image: {
    kicker: "SCAN",
    title: "Scan a photo, ID, or video",
    body: "Open the camera for a still or a six-second live scan. Or upload a picture or a short clip.",
  },
  investment: {
    kicker: "INVESTMENT",
    title: "Is this offer a trap?",
    body: "Crypto, forex, task groups, and “double your money” pitches. Describe what they promised and what they want.",
  },
  number: {
    kicker: "NUMBER",
    title: "Is this number safe to pay?",
    body: "A phone or a 10-digit account, plus what they said. Guardian cannot see who owns it. It can see the ask.",
  },
};

const CHANNELS = ["WhatsApp", "SMS", "Email", "DM", "Call"];

export function Checker({ kind }: { kind: CheckKind }) {
  const me = useGuardian((s) => s.me);
  const copy = COPY[kind];
  const locked =
    me &&
    ((kind === "image" && !canUse(me.plan, "image")) || (kind === "investment" && !canUse(me.plan, "investment")));

  return (
    <div>
      <PageIntro kicker={copy.kicker} title={copy.title} body={copy.body} />
      {locked ? (
        <Panel>
          <p className="text-sm text-muted">
            {kind === "image"
              ? "Photo, ID, passport, document, and short video scans are on Guardian Plus. Free covers messages, links, and numbers — five times a month."
              : "This check is on Guardian Plus. Free covers messages, links, and numbers — five times a month."}
          </p>
          <Link
            to="/plans"
            className="mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-ink"
          >
            See plans
          </Link>
        </Panel>
      ) : kind === "message" ? (
        <MessageForm />
      ) : kind === "url" ? (
        <UrlForm />
      ) : kind === "image" ? (
        <ImageForm />
      ) : kind === "number" ? (
        <NumberForm />
      ) : (
        <InvestmentForm />
      )}
    </div>
  );
}

let sharedFlight: Promise<CheckResponse> | null = null;

function runPaste(text: string): Promise<CheckResponse> {
  if (!sharedFlight) sharedFlight = dispatchPaste(text);
  return sharedFlight;
}

function dispatchPaste(text: string): Promise<CheckResponse> {
  const detected = detectPaste(text);
  if (detected.kind === "url") {
    return analyzeUrl({ data: { url: detected.url || text, note: "" } }) as Promise<CheckResponse>;
  }
  if (detected.kind === "number") {
    return analyzeNumber({
      data: { kind: detected.numberKind || "phone", value: detected.value, context: "" },
    }) as Promise<CheckResponse>;
  }
  return analyzeMessage({ data: { text, channel: "WhatsApp", mode: "message" } }) as Promise<CheckResponse>;
}

export function SmartCheck() {
  const [text, setText] = useState("");
  const [auto, setAuto] = useState(false);
  const state = useCheck();
  const runRef = useRef(state.run);
  runRef.current = state.run;
  const detected = detectPaste(text);
  const hints = useMemo(() => {
    if (text.trim().length < 8) return [];
    if (detected.kind === "url") return hintLines(scoreUrl(detected.url || text));
    if (detected.kind === "number") return hintLines(scoreNumber(detected.numberKind || "phone", detected.value, ""));
    return text.trim().length < 12 ? [] : hintLines(scoreMessage(text));
  }, [text, detected.kind, detected.url, detected.numberKind, detected.value]);
  const label =
    detected.kind === "url"
      ? "Reading this as a link."
      : detected.kind === "number"
        ? detected.numberKind === "account"
          ? "Reading this as an account number."
          : "Reading this as a phone number."
        : "Reading this as a message. A number or a link inside it is included.";

  useEffect(() => {
    let alive = true;
    void (async () => {
      const shared = await takeSharedPaste();
      const stored = sessionStorage.getItem("guardian-draft") || "";
      const shouldAuto = sessionStorage.getItem("guardian-auto") === "1" || shared.trim().length >= 8;
      sessionStorage.removeItem("guardian-draft");
      sessionStorage.removeItem("guardian-auto");
      const next = (shared || stored).trim();
      if (!alive || next.length < 8) return;
      setText(next);
      if (shouldAuto) setAuto(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!auto) return;
    setAuto(false);
    void runRef.current(() => runPaste(text));
  }, [auto, text]);

  return (
    <div>
      <PageIntro
        kicker="CHECK"
        title="Is this safe?"
        body="Paste the message, the number, and the link together. Guardian picks what it is. Or share it here from WhatsApp."
      />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          sharedFlight = null;
          void state.run(() => dispatchPaste(text));
        }}
      >
        <TextArea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste it exactly as you received it."
          className="min-h-36"
        />
        {text.trim().length >= 8 ? <p className="mt-2 text-base text-muted">{label}</p> : null}
        <Hints lines={hints} />
        <div className="mt-4">
          <Button type="submit" disabled={state.pending || text.trim().length < 8}>
            {state.pending ? "Checking…" : "Check"}
          </Button>
        </div>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/check/image" className="chip gap-2">
          <ImageIcon className="size-4" strokeWidth={1.75} aria-hidden="true" />
          Scan
        </Link>
        <Link to="/check/investment" className="chip gap-2">
          <TrendingUp className="size-4" strokeWidth={1.75} aria-hidden="true" />
          Investment
        </Link>
      </div>
      <p className="mt-3 max-w-xl text-base text-muted">
        Install Guardian, then share a WhatsApp message and choose AI Guardian. That opens this check.
      </p>
      <Result {...state} subject={detected.kind === "number" ? "number" : detected.kind === "url" ? "link" : "message"} />
    </div>
  );
}

function useCheck() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upgrade, setUpgrade] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  async function run(work: () => Promise<CheckResponse>) {
    setPending(true);
    setError(null);
    setUpgrade(false);
    try {
      const result = await work();
      if (!result.ok) {
        setError(result.error);
        setUpgrade(Boolean(result.upgrade));
        setAnalysis(null);
      } else {
        setAnalysis(result.analysis);
      }
    } catch (err) {
      setAnalysis(null);
      setError(err instanceof Error ? err.message : "The check did not finish.");
    } finally {
      setPending(false);
    }
  }

  return { pending, error, upgrade, analysis, run };
}

function Result({
  pending,
  error,
  upgrade,
  analysis,
  subject,
}: {
  pending: boolean;
  error: string | null;
  upgrade: boolean;
  analysis: Analysis | null;
  subject: string;
}) {
  return (
    <div className="mt-5 space-y-3">
      {pending ? <Scan subject={subject} /> : null}
      {!pending && error ? (
        <Notice tone="danger">
          {error}{" "}
          {upgrade ? (
            <Link to="/plans" className="font-semibold text-primary">
              See plans
            </Link>
          ) : null}
        </Notice>
      ) : null}
      {!pending && analysis ? <VerdictCard key={analysis.id} analysis={analysis} live /> : null}
    </div>
  );
}

const SCAN_STEPS = ["Matching pressure and impersonation", "Scoring the ask", "Writing what to do next"];

function Scan({ subject }: { subject: string }) {
  const steps = [`Reading the ${subject}`, ...SCAN_STEPS];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setIndex((current) => (current + 1) % steps.length), 900);
    return () => window.clearInterval(id);
  }, [steps.length]);
  return (
    <div className="scan panel" role="status" aria-live="polite">
      <div className="scan-grid" aria-hidden="true" />
      <div className="scan-beam" aria-hidden="true" />
      <div className="relative">
        <p className="font-mono text-xs tracking-widest text-primary">CHECKING</p>
        <p key={steps[index]} className="scan-phrase mt-2 text-lg font-semibold">
          {steps[index]}
        </p>
        <p className="mt-2 text-sm text-muted">This usually takes a few seconds.</p>
      </div>
    </div>
  );
}

function Hints({ lines }: { lines: string[] }) {
  if (lines.length === 0) return null;
  return (
    <div className="mt-3 rounded-md border border-line bg-bg px-3 py-2">
      <p className="font-mono text-xs tracking-widest text-faint">PATTERN HINTS</p>
      <ul className="mt-1 space-y-1">
        {lines.map((line) => (
          <li key={line} className="hint-pop text-sm text-muted">
            {line}
          </li>
        ))}
      </ul>
      <p className="mt-1 text-xs text-faint">Hints are not the Guardian score. Run the check.</p>
    </div>
  );
}

function MessageForm() {
  const me = useGuardian((s) => s.me);
  const [text, setText] = useState("");
  const [channel, setChannel] = useState("WhatsApp");
  const [invoice, setInvoice] = useState(false);
  const state = useCheck();

  useEffect(() => {
    const draft = sessionStorage.getItem("guardian-draft");
    if (draft) {
      setText(draft);
      sessionStorage.removeItem("guardian-draft");
    }
  }, []);

  const hints = useMemo(() => (text.trim().length < 20 ? [] : hintLines(scoreMessage(text, invoice ? "invoice" : "message"))), [text, invoice]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void state.run(() => analyzeMessage({ data: { text, channel, mode: invoice ? "invoice" : "message" } }));
      }}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {MESSAGE_SAMPLES.map((sample) => (
          <button
            key={sample.label}
            type="button"
            className="chip"
            onClick={() => {
              setText(sample.text);
              setChannel(sample.channel);
            }}
          >
            Try: {sample.label}
          </button>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {CHANNELS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setChannel(item)}
            className={`chip ${channel === item ? "chip-on" : ""}`}
          >
            {item}
          </button>
        ))}
      </div>
      {me?.plan === "business" ? (
        <label className="mb-3 flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={invoice} onChange={(event) => setInvoice(event.target.checked)} />
          Treat this as a supplier invoice
        </label>
      ) : null}
      <Field label="The message" hint="Nothing is sent until you press Check.">
        <TextArea value={text} onChange={(event) => setText(event.target.value)} placeholder="Paste the message exactly as you received it." />
      </Field>
      <Hints lines={hints} />
      <div className="mt-4">
        <Button type="submit" disabled={state.pending || text.trim().length < 8}>
          {state.pending ? "Reading the signals…" : "Check message"}
        </Button>
      </div>
      <Result {...state} subject="message" />
    </form>
  );
}

function NumberForm() {
  const [kind, setKind] = useState<"phone" | "account">("phone");
  const [value, setValue] = useState("");
  const [context, setContext] = useState("");
  const state = useCheck();
  const hints = useMemo(() => {
    if (value.trim().length < 8 && context.trim().length < 12) return [];
    return hintLines(scoreNumber(kind, value, context));
  }, [kind, value, context]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void state.run(() => analyzeNumber({ data: { kind, value, context } }));
      }}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {NUMBER_SAMPLES.map((sample) => (
          <button
            key={sample.label}
            type="button"
            className="chip"
            onClick={() => {
              setKind(sample.kind);
              setValue(sample.value);
              setContext(sample.context);
            }}
          >
            Try: {sample.label}
          </button>
        ))}
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {(
          [
            ["phone", "Phone"],
            ["account", "Account"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setKind(id)}
            className={`chip ${kind === id ? "chip-on" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>
      <Field label={kind === "phone" ? "Phone number" : "Account number"} hint={kind === "phone" ? "A local number, or one with a country code such as +44. Not the person's name." : "The account digits. This check does not see the bank name."}>
        <TextInput
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={kind === "phone" ? "+44 7700 900000 or 0803 000 0000" : "0123456789"}
          inputMode={kind === "phone" ? "tel" : "numeric"}
          autoCapitalize="none"
        />
      </Field>
      <div className="mt-3">
        <Field label="What they said" hint="Optional, but this is where the scam usually is.">
          <TextArea value={context} onChange={(event) => setContext(event.target.value)} placeholder="Send it now. Don't call the old number." />
        </Field>
      </div>
      <Hints lines={hints} />
      <div className="mt-4">
        <Button type="submit" disabled={state.pending || value.trim().length < 8}>
          {state.pending ? "Reading the number…" : "Check number"}
        </Button>
      </div>
      <Result {...state} subject="number" />
    </form>
  );
}

function UrlForm() {
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const state = useCheck();
  const hints = useMemo(() => (url.trim().length < 4 ? [] : hintLines(scoreUrl(url))), [url]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void state.run(() => analyzeUrl({ data: { url, note } }));
      }}
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {URL_SAMPLES.map((sample) => (
          <button
            key={sample.label}
            type="button"
            className="chip"
            onClick={() => setUrl(sample.url)}
          >
            Try: {sample.label}
          </button>
        ))}
      </div>
      <Field label="Web address">
        <TextInput value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://" inputMode="url" autoCapitalize="none" />
      </Field>
      <div className="mt-3">
        <Field label="What did they ask you to do there?" hint="Optional.">
          <TextInput value={note} onChange={(event) => setNote(event.target.value)} placeholder="Log in, pay a fee, enter an OTP…" />
        </Field>
      </div>
      <Hints lines={hints} />
      <div className="mt-4">
        <Button type="submit" disabled={state.pending || url.trim().length < 4}>
          {state.pending ? "Reading the address…" : "Check link"}
        </Button>
      </div>
      <Result {...state} subject="link" />
    </form>
  );
}

function InvestmentForm() {
  const [platform, setPlatform] = useState("");
  const [contact, setContact] = useState("");
  const [url, setUrl] = useState("");
  const [promise, setPromise] = useState("");
  const state = useCheck();
  const hints = useMemo(() => {
    const blob = `${platform}\n${contact}\n${url}\n${promise}`;
    return blob.trim().length < 12 ? [] : hintLines(scoreInvestment(blob));
  }, [platform, contact, url, promise]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void state.run(() => analyzeInvestment({ data: { platform, contact, url, promise } }));
      }}
    >
      <div className="mb-3">
        {INVESTMENT_SAMPLES.map((sample) => (
          <button
            key={sample.label}
            type="button"
            className="chip"
            onClick={() => {
              setPlatform(sample.platform);
              setContact(sample.contact);
              setUrl(sample.url);
              setPromise(sample.promise);
            }}
          >
            Try: {sample.label}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Platform or group name">
          <TextInput value={platform} onChange={(event) => setPlatform(event.target.value)} placeholder="Aurex Prime" />
        </Field>
        <Field label="How they reached you">
          <TextInput value={contact} onChange={(event) => setContact(event.target.value)} placeholder="WhatsApp, a stranger" />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="Their link" hint="Optional.">
          <TextInput value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://" autoCapitalize="none" />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="What they promised">
          <TextArea value={promise} onChange={(event) => setPromise(event.target.value)} placeholder="Deposit this, withdraw that, a fee to unlock…" />
        </Field>
      </div>
      <Hints lines={hints} />
      <div className="mt-4">
        <Button type="submit" disabled={state.pending || (promise.trim().length < 8 && platform.trim().length < 2)}>
          {state.pending ? "Reading the offer…" : "Check offer"}
        </Button>
      </div>
      <Result {...state} subject="offer" />
    </form>
  );
}

function ImageForm() {
  const [mode, setMode] = useState<ScanMode>("photo");
  const state = useCheck();
  const subject = mode === "id" ? "ID" : mode === "passport" ? "passport" : mode === "document" ? "document" : mode === "video" ? "video" : "photo";
  return (
    <Scanner
      mode={mode}
      onMode={setMode}
      busy={state.pending}
      onScan={({ frames, note }) => {
        void state.run(() => analyzeImage({ data: { frames, note, mode } }));
      }}
    >
      <Result {...state} subject={subject} />
    </Scanner>
  );
}
