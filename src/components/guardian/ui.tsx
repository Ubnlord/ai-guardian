import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { Link } from "@tanstack/react-router";
import { Shield } from "lucide-react";

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-lg bg-primary-soft text-primary">
        <Shield className="size-4" strokeWidth={2} aria-hidden="true" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold tracking-tight text-fg">AI Guardian</span>
        {compact ? null : <span className="block font-mono text-xs tracking-widest text-faint">BODYGUARD</span>}
      </span>
    </span>
  );
}

const buttonClass = {
  primary:
    "bg-primary text-primary-ink hover:brightness-110 disabled:opacity-50",
  quiet: "bg-surface-2 text-fg hover:bg-line disabled:opacity-50",
  danger: "bg-danger-soft text-danger hover:brightness-110 disabled:opacity-50",
  ghost: "bg-transparent text-muted hover:text-fg disabled:opacity-50",
} as const;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof buttonClass }) {
  return (
    <button
      {...props}
      className={`btn inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold disabled:opacity-50 ${buttonClass[variant]} ${className}`}
    />
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-fg">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-faint">{hint}</span> : null}
    </label>
  );
}

const control = "field-control min-h-11";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${control} min-h-11 ${props.className ?? ""}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${control} min-h-36 py-3 leading-relaxed ${props.className ?? ""}`} />;
}

export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`panel ${className}`}>{children}</section>;
}

export function PageIntro({
  kicker,
  title,
  body,
}: {
  kicker?: string;
  title: string;
  body?: string;
}) {
  return (
    <header className="mb-6">
      {kicker ? <p className="eyebrow">{kicker}</p> : null}
      <h1 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
      {body ? <p className="mt-2 max-w-xl text-base text-muted">{body}</p> : null}
    </header>
  );
}

export function UsageBar({ used, limit }: { used: number; limit: number }) {
  const pct = Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  const left = Math.max(0, limit - used);
  const close = left <= 2 || pct >= 80;
  return (
    <Link to="/plans" className="mt-4 block rounded-lg bg-bg px-3 py-3">
      <span className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-fg">
          {used} of {limit} this month
        </span>
        <span className={close ? "font-semibold text-warn" : "font-semibold text-primary"}>{close ? `${left} left` : "Plans"}</span>
      </span>
      <span className="quota-track mt-2 block">
        <span className={`quota-fill block ${close ? "is-warn" : ""}`} style={{ width: `${pct}%` }} />
      </span>
      {close ? <span className="mt-2 block text-sm font-medium text-warn">You’re close to this month’s limit.</span> : null}
    </Link>
  );
}

export function when(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function Notice({
  tone = "warn",
  children,
}: {
  tone?: "warn" | "danger" | "ok";
  children: ReactNode;
}) {
  const toneClass =
    tone === "danger" ? "border-danger/40 bg-danger-soft text-fg" : tone === "ok" ? "border-primary/30 bg-primary-soft text-fg" : "border-warn/40 bg-warn-soft text-fg";
  return <p className={`rounded-lg border px-3 py-2.5 text-sm ${toneClass}`}>{children}</p>;
}
