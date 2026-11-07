import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button, Field, Notice, TextInput, Wordmark } from "@/components/guardian/ui";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-bg px-4">
        <div className="h-40 w-full max-w-sm animate-pulse rounded-xl bg-surface" />
      </main>
    );
  }
  if (user) return <Navigate to="/home" />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "up") {
        const { error: signUpError } = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: name.trim() || "Guardian",
          callbackURL: "/home",
        });
        if (signUpError) {
          setError(signUpError.message ?? "Could not create the account.");
          return;
        }
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email: email.trim(),
          password,
          callbackURL: "/home",
        });
        if (signInError) {
          setError(signInError.message ?? "Those details did not match.");
          return;
        }
      }
      window.location.href = "/home";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in did not finish.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-bg px-4 py-10 text-fg">
      <div className="panel w-full max-w-sm">
        <Link to="/">
          <Wordmark />
        </Link>
        <h1 className="mt-8 text-2xl font-semibold tracking-tight">
          {mode === "in" ? "Sign in" : "Create your account"}
        </h1>
        <p className="mt-2 text-sm text-muted">Your checks stay on your account. Family members each get their own.</p>

        {!authEnabled ? <p className="mt-6 text-sm text-muted">Sign-in is disabled.</p> : null}

        {authEnabled ? (
          <form className="mt-6 space-y-3" onSubmit={(event) => void submit(event)}>
            {mode === "up" ? (
              <Field label="Name">
                <TextInput value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
              </Field>
            ) : null}
            <Field label="Email">
              <TextInput
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </Field>
            <Field label="Password" hint="At least 8 characters.">
              <TextInput
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "up" ? "new-password" : "current-password"}
              />
            </Field>
            {error ? <Notice tone="danger">{error}</Notice> : null}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Working…" : mode === "in" ? "Sign in" : "Create account"}
            </Button>
            <button
              type="button"
              className="min-h-11 w-full text-sm text-muted"
              onClick={() => {
                setMode(mode === "in" ? "up" : "in");
                setError(null);
              }}
            >
              {mode === "in" ? "Need an account? Create one" : "Already have an account? Sign in"}
            </button>
          </form>
        ) : null}

        {authEnabled ? (
          <div className="mt-4 space-y-2">
            <p className="text-center text-xs tracking-widest text-faint">OR</p>
            {GROK_PROVIDERS.map((provider) => (
              <Button
                key={provider.providerId}
                type="button"
                variant="quiet"
                className="w-full"
                onClick={() => void signIn(provider.providerId, { callbackURL: "/home" })}
              >
                Continue with {provider.label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
