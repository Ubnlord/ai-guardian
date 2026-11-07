import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Authed } from "@/components/guardian/frame";
import { Button, Field, Notice, PageIntro, Panel, TextInput, when } from "@/components/guardian/ui";
import {
  createFamily,
  deleteFamily,
  getFamily,
  joinFamily,
  leaveFamily,
  setMemberLabel,
  setPhrase,
  verifyPhrase,
} from "@/lib/guardian/api";
import { canUse, seatLimit } from "@/lib/guardian/plans";
import { useGuardian } from "@/lib/guardian/store";
import type { FamilyView } from "@/lib/guardian/types";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/family")({ component: FamilyRoute });

function FamilyRoute() {
  return (
    <Authed>
      <FamilyPage />
    </Authed>
  );
}

function FamilyPage() {
  const user = useCurrentUser();
  const me = useGuardian((s) => s.me);
  const [view, setView] = useState<FamilyView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("Our family");
  const [code, setCode] = useState("");
  const [label, setLabel] = useState("");
  const [phrase, setPhraseText] = useState("");
  const [guess, setGuess] = useState("");
  const [match, setMatch] = useState<boolean | null>(null);

  function reload() {
    if (!user?.id) return;
    getFamily()
      .then(setView)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load the circle."));
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function act(work: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    setMatch(null);
    const result = await work();
    if (!result.ok) setError(result.error ?? "That did not work.");
    else reload();
  }

  return (
    <div>
      <PageIntro
        kicker="FAMILY"
        title="Ask for the phrase before you send"
        body="A stranger can sound like your son. They cannot know a sentence you made up together."
      />
      <Panel className="mb-4">
        <p className="text-base">Them: “I’m stranded. Send the money. Don’t call this number.”</p>
        <p className="mt-2 text-base">You: “Say the phrase.”</p>
        <p className="mt-2 text-base text-muted">
          If they don’t know “the green kettle sings at dawn,” hang up. Call the number already in your phone.
        </p>
      </Panel>
      {error ? (
        <div className="mb-4">
          <Notice tone="danger">{error}</Notice>
        </div>
      ) : null}
      {!view ? <div className="h-28 animate-pulse rounded-lg bg-surface" /> : null}

      {view && !view.family ? (
        <div className="grid gap-4 md:grid-cols-2">
          {me && canUse(me.plan, "circle") ? (
            <Panel>
              <h2 className="font-semibold">Start a circle</h2>
              <p className="mt-1 text-base text-muted">
                This plan holds {seatLimit(me.plan)} people. Next you’ll set a phrase only they should know.
              </p>
              <form
                className="mt-4 space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void act(() => createFamily({ data: { name } }));
                }}
              >
                <Field label="Circle name">
                  <TextInput value={name} onChange={(event) => setName(event.target.value)} />
                </Field>
                <Button type="submit">Create circle</Button>
              </form>
            </Panel>
          ) : (
            <Panel>
              <h2 className="font-semibold">A circle starts on Guardian Plus</h2>
              <p className="mt-1 text-base text-muted">
                Plus holds 2 people. Family holds 6. Business holds 15. You can still join a circle someone else started.
              </p>
              <Link
                to="/plans"
                className="btn mt-4 inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-ink"
              >
                See plans
              </Link>
            </Panel>
          )}
          <Panel>
            <h2 className="font-semibold">Join with a code</h2>
            <p className="mt-1 text-base text-muted">Use the code the circle owner shows you.</p>
            <form
              className="mt-4 space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                void act(() => joinFamily({ data: { code } }));
              }}
            >
              <Field label="Invite code">
                <TextInput value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} autoCapitalize="characters" />
              </Field>
              <Button type="submit">Join</Button>
            </form>
          </Panel>
        </div>
      ) : null}

      {view?.family ? (
        <div className="space-y-4">
          {view.family.isOwner && !view.family.hasPhrase ? (
            <Panel>
              <p className="font-mono text-xs tracking-widest text-primary">STEP 2</p>
              <h2 className="mt-1 text-xl font-semibold">Set the phrase</h2>
              <p className="mt-1 text-base text-muted">
                A nonsense sentence. After you save it, nobody can read it back — including you. Tell your people in person, not in the same chat.
              </p>
              <form
                className="mt-3 space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void act(async () => {
                    const result = await setPhrase({ data: { phrase } });
                    if (result.ok) setPhraseText("");
                    return result;
                  });
                }}
              >
                <Field label="The phrase">
                  <TextInput
                    value={phrase}
                    onChange={(event) => setPhraseText(event.target.value)}
                    autoComplete="off"
                    placeholder="The green kettle sings at dawn"
                  />
                </Field>
                <Button type="submit">Save phrase</Button>
              </form>
            </Panel>
          ) : null}
          <Panel>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">{view.family.name}</h2>
                <p className="mt-1 text-sm text-muted">
                  {view.family.seats} of {view.family.seatLimit} seats
                  {view.family.hasPhrase ? " · phrase is set" : " · no phrase yet"}
                </p>
              </div>
              {view.family.inviteCode ? (
                <p className="rounded-md bg-bg px-3 py-2 font-mono text-lg tracking-widest text-primary">{view.family.inviteCode}</p>
              ) : (
                <p className="text-sm text-muted">Ask the owner for the invite code.</p>
              )}
            </div>
            <ul className="mt-4 divide-y divide-line">
              {view.members.map((member) => (
                <li key={member.userId} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    {member.label}
                    {member.isYou ? " · you" : ""}
                  </span>
                  <span className="text-faint">{member.role}</span>
                </li>
              ))}
            </ul>
            <form
              className="mt-4 flex flex-col gap-2 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                void act(() => setMemberLabel({ data: { label } }));
              }}
            >
              <TextInput value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Your label, like Mum" />
              <Button type="submit" variant="quiet">
                Save label
              </Button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {view.family.isOwner ? (
                <Button
                  variant="danger"
                  onClick={() => {
                    if (!window.confirm("Delete this circle for everyone?")) return;
                    void act(() => deleteFamily());
                  }}
                >
                  Delete circle
                </Button>
              ) : (
                <Button variant="quiet" onClick={() => void act(() => leaveFamily())}>
                  Leave circle
                </Button>
              )}
            </div>
          </Panel>

          <div className="grid gap-4 md:grid-cols-2">
            {view.family.isOwner && !view.family.hasPhrase ? null : (
            <Panel>
              <h2 className="font-semibold">Verification phrase</h2>
              <p className="mt-1 text-base text-muted">
                A nonsense sentence. After you save it, nobody can read it back — including you. Reset by saving a new one.
              </p>
              {view.family.isOwner ? (
                <form
                  className="mt-3 space-y-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void act(async () => {
                      const result = await setPhrase({ data: { phrase } });
                      if (result.ok) setPhraseText("");
                      return result;
                    });
                  }}
                >
                  <Field label="Replace the phrase">
                    <TextInput
                      value={phrase}
                      onChange={(event) => setPhraseText(event.target.value)}
                      autoComplete="off"
                      placeholder="The green kettle sings at dawn"
                    />
                  </Field>
                  <Button type="submit">Save phrase</Button>
                </form>
              ) : (
                <p className="mt-3 text-base text-muted">Only the owner can set or replace the phrase.</p>
              )}
            </Panel>
            )}
            <Panel>
              <h2 className="font-semibold">Verify the person</h2>
              <p className="mt-1 text-sm text-muted">Ask them for the phrase. Type what they say. Do not read the phrase out first.</p>
              <form
                className="mt-3 space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  setError(null);
                  void verifyPhrase({ data: { phrase: guess } }).then((result) => {
                    if (!result.ok) setError(result.error ?? "Could not check that.");
                    else setMatch(result.match);
                  });
                }}
              >
                <Field label="What they said">
                  <TextInput value={guess} onChange={(event) => setGuess(event.target.value)} autoComplete="off" />
                </Field>
                <Button type="submit" variant="quiet">
                  Check phrase
                </Button>
              </form>
              {match === true ? <div className="mt-3"><Notice tone="ok">That matches the family phrase. You can still call them on the saved number.</Notice></div> : null}
              {match === false ? (
                <div className="mt-3">
                  <Notice tone="danger">That does not match. Do not send money. Call them on the number already in your phone.</Notice>
                </div>
              ) : null}
            </Panel>
          </div>

          <Panel>
            <h2 className="font-semibold">Alerts</h2>
            {view.alerts.length === 0 ? (
              <p className="mt-2 text-sm text-muted">
                No shared alerts. A high-risk check is shared only when that person turns it on in Settings.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {view.alerts.map((alert) => (
                  <li key={alert.id} className="border-t border-line pt-3 first:border-0 first:pt-0">
                    <p className="text-sm font-medium">{alert.headline}</p>
                    <p className="text-sm text-muted">{alert.detail}</p>
                    <p className="text-xs text-faint">
                      {alert.label} · {when(alert.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      ) : null}
    </div>
  );
}
