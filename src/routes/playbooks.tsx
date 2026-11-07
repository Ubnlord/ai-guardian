import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Authed, MarketingBar } from "@/components/guardian/frame";
import { Button, PageIntro, Panel } from "@/components/guardian/ui";
import { ScoreMark } from "@/components/guardian/verdict";
import { band } from "@/lib/guardian/heuristics";
import { PLAYBOOKS, scorePlay, type Playbook } from "@/lib/guardian/playbooks";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/playbooks")({ component: PlayRoute });

function PlayRoute() {
  const { user, isPending } = useCurrentUserState();
  const page = <PlayIndex />;
  if (isPending || !user) {
    return (
      <div className="min-h-screen bg-bg text-fg">
        <MarketingBar />
        <div className="mx-auto w-full max-w-3xl px-4 py-8">{page}</div>
      </div>
    );
  }
  return <Authed>{page}</Authed>;
}

function PlayIndex() {
  const [book, setBook] = useState<Playbook | null>(null);

  if (book) {
    return <Runner book={book} onExit={() => setBook(null)} />;
  }

  return (
    <div>
      <PageIntro
        kicker="PLAYBOOKS"
        title="Walk it before the money moves"
        body="Four situations people actually get. A few questions. A next step. This is a rehearsal, not a score on a real message."
      />
      <ul className="space-y-3">
        {PLAYBOOKS.map((item) => (
          <li key={item.id}>
            <button type="button" onClick={() => setBook(item)} className="panel card-link w-full text-left">
              <h2 className="font-semibold">{item.title}</h2>
              <p className="mt-1 text-sm text-muted">{item.situation}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Runner({ book, onExit }: { book: Playbook; onExit: () => void }) {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<Record<string, string>>({});
  const question = book.questions[step];
  const done = book.questions.every((item) => picks[item.id]);
  const showResult = done && step === book.questions.length - 1;
  const result = scorePlay(book, picks);
  const verdict = band(result.score);

  if (!question) return null;

  return (
    <div>
      <button type="button" onClick={onExit} className="min-h-11 text-sm font-semibold text-primary">
        All situations
      </button>
      <PageIntro kicker={`0${step + 1} / 0${book.questions.length}`} title={book.title} body={book.situation} />
      <Panel key={question.id} className="reveal">
        <h2 className="text-lg font-semibold">{question.prompt}</h2>
        <div className="mt-4 space-y-2">
          {question.options.map((option) => {
            const on = picks[question.id] === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setPicks((current) => ({ ...current, [question.id]: option.id }));
                  if (step < book.questions.length - 1) setStep(step + 1);
                }}
                className={`block min-h-11 w-full rounded-md border px-3 py-3 text-left text-sm ${on ? "border-primary bg-primary-soft text-fg" : "border-line bg-bg text-muted"}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex gap-2">
          <Button type="button" variant="ghost" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}>
            Back
          </Button>
        </div>
      </Panel>

      {showResult ? (
        <div className="mt-4">
          <article className="panel">
            <div className="flex items-start gap-4">
              <ScoreMark score={result.score} verdict={verdict} live />
              <div className="reveal">
                <p className="font-mono text-xs tracking-widest text-primary">REHEARSAL</p>
                <h2 className="mt-1 text-lg font-semibold">
                  {verdict === "high_risk" ? "Don't pay from this conversation." : verdict === "suspicious" ? "Pause and verify." : "Nothing here is the usual trap."}
                </h2>
                <p className="mt-2 text-sm text-muted">This is not a verdict on a real message. If they already sent words, paste those into a check.</p>
              </div>
            </div>
            <div className="reveal mt-5 grid gap-4 md:grid-cols-2" style={{ animationDelay: "160ms" }}>
              <div>
                <h3 className="text-sm font-semibold">Why</h3>
                <ul className="mt-2 space-y-2">
                  {(result.reasons.length > 0
                    ? result.reasons
                    : ["Your answers didn't match the usual pressure, secrecy, or payment trick."]
                  ).map((reason) => (
                    <li key={reason} className="text-sm text-muted">
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className={`rounded-lg p-3 ${verdict === "high_risk" ? "bg-danger-soft" : verdict === "suspicious" ? "bg-warn-soft" : "bg-primary-soft"}`}
              >
                <h3 className="text-sm font-semibold">What to do</h3>
                <ul className="mt-2 space-y-2">
                  {book.actions.map((action) => (
                    <li key={action} className="text-sm">
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Link to="/check/message" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-primary">
              Check the actual message
            </Link>
          </article>
        </div>
      ) : null}
    </div>
  );
}
