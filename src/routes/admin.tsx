import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Authed } from "@/components/guardian/frame";
import { Button, Notice, PageIntro, Panel, TextArea, TextInput, when } from "@/components/guardian/ui";
import { adminSaveArticle, adminSetPlan, adminSetRole, getAdmin } from "@/lib/guardian/api";
import { PLAN_ORDER } from "@/lib/guardian/plans";
import { useGuardian } from "@/lib/guardian/store";
import type { AdminData, PlanId } from "@/lib/guardian/types";
import { useCurrentUser } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/admin")({ component: AdminRoute });

function AdminRoute() {
  return (
    <Authed>
      <AdminPage />
    </Authed>
  );
}

function AdminPage() {
  const user = useCurrentUser();
  const me = useGuardian((s) => s.me);
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"overview" | "people" | "lessons">("overview");
  const [editing, setEditing] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function reload() {
    getAdmin()
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Admin data is not available."));
  }

  useEffect(() => {
    if (!user?.id || me?.role !== "admin") return;
    reload();
    // user id is the trigger
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, me?.role]);

  if (me && me.role !== "admin") return <Navigate to="/home" />;

  return (
    <div>
      <PageIntro kicker="ADMIN" title="The whole system, lightly" body="Counts and headlines. Not the full text of anyone's messages." />
      {error ? (
        <div className="mb-4">
          <Notice tone="danger">{error}</Notice>
        </div>
      ) : null}
      <div className="mb-4 flex gap-2">
        {(["overview", "people", "lessons"] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`min-h-11 rounded-md px-3 text-sm capitalize ${tab === item ? "bg-primary-soft text-primary" : "bg-surface text-muted"}`}
          >
            {item}
          </button>
        ))}
      </div>
      {!data ? <div className="h-28 animate-pulse rounded-lg bg-surface" /> : null}
      {data && tab === "overview" ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="People" value={data.users} />
            <Stat label="Checks" value={data.checks} />
            <Stat label="High risk" value={data.highRisk} />
          </div>
          <p className="mt-3 text-xs text-faint">
            Plans: {data.plans.map((row) => `${row.plan} ${row.n}`).join(" · ") || "none yet"}
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead className="text-xs text-faint">
                <tr>
                  <th className="py-2 font-medium">When</th>
                  <th className="py-2 font-medium">Who</th>
                  <th className="py-2 font-medium">Kind</th>
                  <th className="py-2 font-medium">Score</th>
                  <th className="py-2 font-medium">Headline</th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((row) => (
                  <tr key={row.id} className="border-t border-line">
                    <td className="py-2 pr-3 text-faint">{when(row.createdAt)}</td>
                    <td className="py-2 pr-3">{row.displayName}</td>
                    <td className="py-2 pr-3">{row.kind}</td>
                    <td className="py-2 pr-3 font-mono tabular-nums">{row.score}</td>
                    <td className="py-2">{row.title}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
      {data && tab === "people" ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="text-xs text-faint">
              <tr>
                <th className="py-2 font-medium">Name</th>
                <th className="py-2 font-medium">Plan</th>
                <th className="py-2 font-medium">Role</th>
                <th className="py-2 font-medium">Used</th>
              </tr>
            </thead>
            <tbody>
              {data.people.map((person) => (
                <tr key={person.userId} className="border-t border-line">
                  <td className="py-3 pr-3">
                    <p>{person.displayName}</p>
                    <p className="text-xs text-faint">{person.email}</p>
                  </td>
                  <td className="py-3 pr-3">
                    <select
                      className="min-h-11 rounded-md border border-line bg-bg px-2"
                      value={person.plan}
                      onChange={(event) => {
                        const plan = event.target.value as PlanId;
                        void adminSetPlan({ data: { userId: person.userId, plan } }).then(reload);
                      }}
                    >
                      {PLAN_ORDER.map((id) => (
                        <option key={id} value={id}>
                          {id}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 pr-3">
                    <Button
                      variant="quiet"
                      onClick={() => {
                        void adminSetRole({
                          data: { userId: person.userId, role: person.role === "admin" ? "member" : "admin" },
                        }).then((result) => {
                          if (!result.ok) setError(result.error ?? "Could not change the role.");
                          else reload();
                        });
                      }}
                    >
                      {person.role === "admin" ? "Make member" : "Make admin"}
                    </Button>
                  </td>
                  <td className="py-3 font-mono tabular-nums">{person.checksUsed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {data && tab === "lessons" ? (
        <div className="space-y-3">
          {data.articles.map((article) => (
            <Panel key={article.slug}>
              <button
                type="button"
                className="min-h-11 text-left font-semibold"
                onClick={() => {
                  setEditing(article.slug);
                  setTitle(article.title);
                  setBody(article.body);
                }}
              >
                {article.title}
              </button>
              <p className="text-xs text-faint">{article.category}</p>
              {editing === article.slug ? (
                <form
                  className="mt-3 space-y-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void adminSaveArticle({ data: { slug: article.slug, title, body, published: true } }).then(() => {
                      setEditing(null);
                      reload();
                    });
                  }}
                >
                  <TextInput value={title} onChange={(event) => setTitle(event.target.value)} />
                  <TextArea value={body} onChange={(event) => setBody(event.target.value)} className="min-h-48" />
                  <Button type="submit">Save lesson</Button>
                </form>
              ) : null}
            </Panel>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-3">
      <p className="text-xs text-faint">{label}</p>
      <p className="font-mono text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
