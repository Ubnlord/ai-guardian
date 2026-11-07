import { useCallback, useEffect, useState } from "react";
import { Copy, KeyRound, Plus, Trash2 } from "lucide-react";
import { Button, Notice, Panel, TextInput } from "@/components/guardian/ui";
import { createApiKey, listApiKeys, revokeApiKey } from "@/lib/guardian/api-keys";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { when } from "@/components/guardian/ui";

/**
 * "Browser extension" panel on the Settings page.
 *
 * A key is shown exactly once, at creation, and only its hash is stored \u2014 so the
 * panel keeps the fresh secret in component state and never re-fetches it. After
 * a reload the row shows the prefix only, which is enough to tell keys apart.
 */

type KeyRow = {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revoked: boolean;
};

export function ApiKeysPanel() {
  const user = useCurrentUser();
  const [keys, setKeys] = useState<KeyRow[]>([]);
  const [name, setName] = useState("Browser extension");
  const [fresh, setFresh] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    listApiKeys()
      .then((rows) => setKeys(rows as KeyRow[]))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    refresh();
  }, [user?.id, refresh]);

  const active = keys.filter((key) => !key.revoked);

  return (
    <Panel className="mt-4">
      <h2 className="flex items-center gap-2 font-semibold">
        <KeyRound className="size-4 text-primary" strokeWidth={1.75} aria-hidden="true" />
        Browser extension
      </h2>
      <p className="mt-1 text-sm text-muted">
        Create a key, then paste it into the AI Guardian extension options. The extension checks the page you are on
        in one click. Keys are shown once and stored only as a hash.
      </p>

      {error ? (
        <div className="mt-3">
          <Notice tone="danger">{error}</Notice>
        </div>
      ) : null}

      {fresh ? (
        <div className="mt-3">
          <Notice tone="ok">
            <p className="font-semibold">Copy this key now \u2014 it will not be shown again.</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
              <code className="min-w-0 flex-1 overflow-x-auto rounded-md bg-bg px-3 py-2 font-mono text-xs">{fresh}</code>
              <Button
                variant="quiet"
                onClick={() => {
                  void navigator.clipboard?.writeText(fresh).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  });
                }}
              >
                <Copy className="size-4" strokeWidth={1.75} aria-hidden="true" />
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </Notice>
        </div>
      ) : null}

      <form
        className="mt-3 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (busy) return;
          setBusy(true);
          setError(null);
          void createApiKey({ data: { name } })
            .then((result) => {
              const value = result as { ok: boolean; key?: string; error?: string };
              if (!value.ok) {
                setError(value.error ?? "Could not create a key.");
                return;
              }
              setFresh(value.key ?? null);
              refresh();
            })
            .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not create a key."))
            .finally(() => setBusy(false));
        }}
      >
        <TextInput
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Browser extension"
          aria-label="Key name"
        />
        <Button type="submit" variant="quiet" disabled={busy || active.length >= 5}>
          <Plus className="size-4" strokeWidth={1.75} aria-hidden="true" />
          Create key
        </Button>
      </form>

      {active.length >= 5 ? <p className="mt-2 text-xs text-faint">Five active keys is the limit. Revoke one first.</p> : null}

      {keys.length > 0 ? (
        <ul className="mt-3 divide-y divide-line">
          {keys.map((key) => (
            <li key={key.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {key.name}
                  {key.revoked ? <span className="ml-2 text-xs text-faint">revoked</span> : null}
                </p>
                <p className="truncate font-mono text-xs text-faint">
                  {key.prefix}\u2026 \u00b7 created {when(key.createdAt)}
                  {key.lastUsedAt ? ` \u00b7 last used ${when(key.lastUsedAt)}` : " \u00b7 never used"}
                </p>
              </div>
              {key.revoked ? null : (
                <button
                  type="button"
                  className="inline-flex min-h-11 shrink-0 items-center gap-1.5 px-2 text-danger"
                  onClick={() => {
                    void revokeApiKey({ data: { id: key.id } }).then(() => refresh());
                  }}
                >
                  <Trash2 className="size-4" strokeWidth={1.75} aria-hidden="true" />
                  Revoke
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-faint">No keys yet.</p>
      )}
    </Panel>
  );
}
