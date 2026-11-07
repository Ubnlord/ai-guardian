import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Authed } from "@/components/guardian/frame";
import { Button, Notice, PageIntro } from "@/components/guardian/ui";
import { setPlan } from "@/lib/guardian/api";
import { PLAN_ORDER, PLANS } from "@/lib/guardian/plans";
import { useGuardian } from "@/lib/guardian/store";
import type { PlanId } from "@/lib/guardian/types";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/plans")({ component: PlansRoute });

function PlansRoute() {
  return (
    <Authed>
      <PlansPage />
    </Authed>
  );
}

function PlansPage() {
  const user = useCurrentUser();
  const me = useGuardian((s) => s.me);
  const setMe = useGuardian((s) => s.setMe);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<PlanId | null>(null);

  return (
    <div>
      <PageIntro
        kicker="PLANS"
        title="Pick the allowance you need"
        body="Payments are not connected. Choosing a plan updates your account so the limits work. Nothing is charged."
      />
      {error ? (
        <div className="mb-4">
          <Notice tone="danger">{error}</Notice>
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const current = me?.plan === id;
          return (
            <article key={id} className={`panel flex flex-col ${plan.highlight ? "shadow-card-hover" : ""}`}>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                <p className="font-mono text-xl tabular-nums">{plan.price}</p>
              </div>
              <p className="mt-1 text-xs text-faint">{plan.cadence}</p>
              <p className="mt-3 text-sm text-muted">{plan.blurb}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <Button
                className="mt-4"
                variant={current ? "quiet" : "primary"}
                disabled={current || busy !== null}
                onClick={() => {
                  if (!user?.id) return;
                  setBusy(id);
                  setError(null);
                  void setPlan({ data: { plan: id } })
                    .then((next) => setMe(user.id, next))
                    .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not change plan."))
                    .finally(() => setBusy(null));
                }}
              >
                {current ? "Current plan" : busy === id ? "Saving…" : "Use this plan"}
              </Button>
            </article>
          );
        })}
      </div>
      <p className="mt-6 text-xs text-faint">
        Voice and deepfake audio checks are next. Image review is already here, and it will tell you when it is unsure.
        A hard hourly cap keeps one account from draining the AI budget.
      </p>
    </div>
  );
}
