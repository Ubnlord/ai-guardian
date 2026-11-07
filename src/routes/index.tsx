import { createFileRoute, Link } from "@tanstack/react-router";
import { Image as ImageIcon, Landmark, Link2, MessageSquareWarning } from "lucide-react";
import { MarketingBar } from "@/components/guardian/frame";
import { StaticExample } from "@/components/guardian/verdict";
import { usePrefs } from "@/components/prefs";
import { PLANS, PLAN_ORDER } from "@/lib/guardian/plans";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/")({ component: Landing });

const CHECKS = [
  {
    icon: MessageSquareWarning,
    title: "Messages",
    body: "SMS, WhatsApp, email, DMs. The “I lost my phone” text. The OTP that wants your BVN.",
  },
  {
    icon: Link2,
    title: "Links",
    body: "Lookalike banks, shortened URLs, and addresses that dress up as a brand you trust.",
  },
  {
    icon: ImageIcon,
    title: "Scans",
    body: "Photos, IDs, passports, documents, and a short video. A live scan reads a few frames. It does not call a government register.",
  },
  {
    icon: Landmark,
    title: "Investments",
    body: "Crypto, forex, giveaways, and anyone who can double your money by tonight.",
  },
];

function Landing() {
  const { t } = usePrefs();
  return (
    <div className="min-h-screen bg-bg text-fg">
      <MarketingBar />
      <main>
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-14 md:grid-cols-2 md:py-24">
          <div>
            <p className="eyebrow">{t("heroKicker")}</p>
            <h1 className="display mt-5">{t("heroTitle")}</h1>
            <p className="mt-5 max-w-md text-base text-muted md:text-lg">{t("heroBody")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <PrimaryCta />
              <a href="#how" className="btn inline-flex min-h-11 items-center rounded-md border border-line px-4 text-sm font-semibold text-fg">
                {t("how")}
              </a>
            </div>
            <p className="mt-5 max-w-sm text-sm text-faint">{t("heroNote")}</p>
          </div>
          <div>
            <p className="mb-3 font-mono text-xs tracking-widest text-faint">SAMPLE VERDICT</p>
            <StaticExample />
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
            {CHECKS.map((item) => (
              <article key={item.title} className="panel">
                <span className="icon-well">
                  <item.icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                </span>
                <h2 className="mt-4 font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm text-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-line">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 md:grid-cols-3">
            <div className="md:col-span-3">
              <p className="font-mono text-xs tracking-widest text-primary">BEFORE THE TRANSFER</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Three things a score by itself doesn't do</h2>
            </div>
            {[
              ["Check the number", "Paste the phone or the 10-digit account with what they said. The ask is the evidence, not the digits."],
              ["Guardian Watch", "Report a number that tried you. The next person who pastes it sees that someone already did. Your name stays off it."],
              ["Playbooks", "Family voice, a bank countdown, a task group, a new supplier account. A few questions, then the next move."],
            ].map(([title, body]) => (
              <article key={title}>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how" className="border-t border-line">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 md:grid-cols-3">
            <div>
              <p className="font-mono text-xs tracking-widest text-primary">THE SCORE</p>
              <h2 className="mt-2 text-2xl font-semibold">One number. A reason. A next step.</h2>
            </div>
            {[
              ["Safe", "var(--color-primary)", "Nothing in it is asking for money, secrets, or a rush. Still yours to judge."],
              ["Suspicious", "var(--color-warn)", "Something is off. Pause. Verify on a channel you already trust."],
              ["High risk", "var(--color-danger)", "Don't pay. Don't tap. Don't send the code. Call the saved number."],
            ].map(([title, band, body]) => (
              <article key={title} className="band" style={{ ["--band" as string]: band }}>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-line bg-surface">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 md:grid-cols-2 md:items-center">
            <div>
              <p className="font-mono text-xs tracking-widest text-primary">FAMILY GUARDIAN</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">A private phrase beats a familiar voice.</h2>
              <p className="mt-3 text-muted">
                Mom, Dad, the children, grandparents. When someone says “I’m your son, send the money, don’t call this
                number,” the circle already knows what to ask. The phrase is stored as a hash. Guardian never shows it
                back.
              </p>
            </div>
            <ol className="space-y-3">
              {[
                "Create a circle and share the invite code.",
                "Set a nonsense sentence only your people know.",
                "If a high-risk check should warn the others, you turn that on. It stays off until you do.",
              ].map((step, index) => (
                <li key={step} className="flex gap-3 rounded-lg bg-bg p-4">
                  <span className="font-mono text-sm text-primary">0{index + 1}</span>
                  <span className="text-sm">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="pricing" className="border-t border-line">
          <div className="mx-auto w-full max-w-6xl px-4 py-14">
            <h2 className="text-3xl font-semibold tracking-tight">Plans</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Card checkout is not connected yet. Choosing a plan stores it on your account so the limits are real.
              Nothing is charged in this preview.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {PLAN_ORDER.map((id) => {
                const plan = PLANS[id];
                return (
                  <article
                    key={id}
                    className={`panel flex flex-col ${plan.highlight ? "shadow-card-hover" : ""}`}
                  >
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="mt-2 font-mono text-2xl tabular-nums">
                      {plan.price}
                      <span className="ml-1 font-sans text-xs text-muted">{plan.cadence}</span>
                    </p>
                    <p className="mt-2 text-sm text-muted">{plan.blurb}</p>
                    <ul className="mt-4 flex-1 space-y-2 text-sm">
                      {plan.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="privacy" className="border-t border-line">
          <div className="mx-auto w-full max-w-6xl px-4 py-14">
            <h2 className="text-2xl font-semibold">What we keep</h2>
            <p className="mt-3 max-w-2xl text-sm text-muted">
              A check sends the text — or the image, for that one review — to the model. Images are not stored. You can
              turn off saved history, delete a check, or wipe the list. High-risk alerts reach your family only if you
              switch that on. Guardian is not your bank, and a low score is not permission to send money.
            </p>
          </div>
        </section>
      </main>
      <footer className="border-t border-line px-4 py-6 text-center text-xs text-faint">
        AI Guardian · a second look, not a guarantee
      </footer>
    </div>
  );
}

function PrimaryCta() {
  const { user, isPending } = useCurrentUserState();
  const { t } = usePrefs();
  if (isPending) return <span className="inline-flex h-11 w-36 animate-pulse rounded-md bg-surface-2" />;
  if (user) {
    return (
      <Link to="/home" className="btn inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-ink">
        {t("open")}
      </Link>
    );
  }
  return (
    <Link to="/login" className="btn inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-ink">
      {t("checkSomething")}
    </Link>
  );
}
