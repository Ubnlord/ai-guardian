import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, Image as ImageIcon, Link2, MessageSquareWarning, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { Authed } from "@/components/guardian/frame";
import { Button, Panel } from "@/components/guardian/ui";
import { useGuardian } from "@/lib/guardian/store";

export const Route = createFileRoute("/onboarding")({ component: OnboardingRoute });

const ONBOARDED_KEY = "guardian-onboarded";

export function hasOnboarded(): boolean {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(ONBOARDED_KEY) === "1";
}

export function markOnboarded(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ONBOARDED_KEY, "1");
}

function OnboardingRoute() {
  return (
    <Authed>
      <Onboarding />
    </Authed>
  );
}

const STEPS = ["Welcome", "How it works", "Your first check", "Your circle"] as const;

function Onboarding() {
  const [step, setStep] = useState(0);
  const me = useGuardian((s) => s.me);
  const navigate = useNavigate();

  function finish(to: "/home" | "/check" | "/family") {
    markOnboarded();
    void navigate({ to });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-2">
        {STEPS.map((label, index) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full font-mono text-xs ${
                index < step
                  ? "bg-primary text-primary-ink"
                  : index === step
                    ? "bg-primary-soft text-primary"
                    : "bg-surface-2 text-faint"
              }`}
            >
              {index < step ? <Check className="size-3.5" strokeWidth={2.5} aria-hidden="true" /> : index + 1}
            </span>
            {index < STEPS.length - 1 ? (
              <span className={`h-px flex-1 ${index < step ? "bg-primary" : "bg-line"}`} aria-hidden="true" />
            ) : null}
          </div>
        ))}
      </div>

      {step === 0 ? (
        <Panel>
          <span className="icon-well">
            <ShieldCheck className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            Welcome{me?.displayName ? `, ${me.displayName.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-2 text-base text-muted">
            AI Guardian is the safety layer between you and the internet. Before you click, pay, or reply, paste it
            here. You get a straight answer, the reasons behind it, and the next move.
          </p>
          <ul className="mt-5 space-y-3">
            {[
              "Built for the scams people actually get — cloned banks, fake investments, and a voice that sounds like family.",
              "Every check ends with something concrete to do, not just a number.",
              "Your history is yours. Turn it off, delete a check, or wipe the list at any time.",
            ].map((line) => (
              <li key={line} className="flex gap-2.5 text-sm text-muted">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={2} aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
          <Button className="mt-6" onClick={() => setStep(1)}>
            Get started
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
          </Button>
        </Panel>
      ) : null}

      {step === 1 ? (
        <Panel>
          <h1 className="text-2xl font-semibold tracking-tight">One number. A reason. A next step.</h1>
          <p className="mt-2 text-base text-muted">
            Guardian reads what you paste and scores it from 0 to 100. The band tells you how to treat it.
          </p>
          <div className="mt-5 space-y-3">
            {[
              ["Safe", "var(--color-primary)", "Nothing in it is asking for money, secrets, or a rush. Still yours to judge."],
              ["Suspicious", "var(--color-warn)", "Something is off. Pause. Verify on a channel you already trust."],
              ["High risk", "var(--color-danger)", "Don't pay. Don't tap. Don't send the code. Call the saved number."],
            ].map(([title, band, body]) => (
              <div key={title} className="band" style={{ ["--band" as string]: band }}>
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm text-muted">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            <Button variant="quiet" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button onClick={() => setStep(2)}>
              Next
              <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </Button>
          </div>
        </Panel>
      ) : null}

      {step === 2 ? (
        <Panel>
          <h1 className="text-2xl font-semibold tracking-tight">Try your first check</h1>
          <p className="mt-2 text-base text-muted">
            Paste a message, a link, or a number. Guardian works out what it is and checks it in one go.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              { icon: MessageSquareWarning, title: "Messages", body: "SMS, WhatsApp, email, DMs." },
              { icon: Link2, title: "Links", body: "Lookalike banks and shortened URLs." },
              { icon: ImageIcon, title: "Scans", body: "Photos, IDs, documents, short video." },
              { icon: TrendingUp, title: "Investments", body: "Crypto, forex, and money-doubling." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-lg bg-bg p-3">
                <span className="icon-well size-9 shrink-0">
                  <item.icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{item.title}</span>
                  <span className="block text-xs text-muted">{item.body}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="quiet" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={() => finish("/check")}>
              Run a check now
              <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
            </Button>
            <Button variant="ghost" onClick={() => setStep(3)}>
              Skip for now
            </Button>
          </div>
        </Panel>
      ) : null}

      {step === 3 ? (
        <Panel>
          <span className="icon-well">
            <Users className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">A private phrase beats a familiar voice</h1>
          <p className="mt-2 text-base text-muted">
            When someone says “I'm your son, send the money, don't call this number,” your circle already knows what to
            ask. The phrase is stored as a hash — Guardian never shows it back.
          </p>
          <p className="mt-3 text-sm text-faint">
            Circles are part of Guardian Plus. You can set one up whenever you are ready.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="quiet" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button onClick={() => finish("/home")}>
              Finish
              <Check className="size-4" strokeWidth={2} aria-hidden="true" />
            </Button>
            <Link
              to="/family"
              className="btn inline-flex min-h-11 items-center rounded-md bg-surface-2 px-4 text-sm font-semibold text-fg"
              onClick={markOnboarded}
            >
              Set up a circle
            </Link>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}
