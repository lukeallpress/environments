import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/button";
import { Card, EmptyState, PageHeader } from "@/components/ui/page-header";
import { Badge, StatusBadge } from "@/components/ui/badge";
import type { Organization } from "@/lib/db/types";

export const metadata = { title: "Organizations · AIEE Coalition Tracker" };

export default async function OrgsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("organizations")
    .select("id, name, type, district, county, status, tags, updated_at")
    .order("name", { ascending: true });

  if (q && q.trim()) {
    query = query.ilike("name", `%${q.trim()}%`);
  }

  const { data: orgs, error } = await query;

  return (
    <div>
      <PageHeader
        title="Organizations"
        subtitle="Partner orgs in the AIEE coalition."
        actions={<LinkButton href="/orgs/new">+ New organization</LinkButton>}
      />

      <SearchBar initial={q ?? ""} />

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-danger mb-4">
          Failed to load organizations: {error.message}
        </div>
      )}

      {!error && (!orgs || orgs.length === 0) && (
        <EmptyState
          title={q ? `No organizations match "${q}"` : "No organizations yet"}
          body={
            q
              ? "Try a different search."
              : "Add the first partner org to get started."
          }
          action={
            !q && (
              <LinkButton href="/orgs/new">+ Add the first organization</LinkButton>
            )
          }
        />
      )}

      {!error && orgs && orgs.length > 0 && (
        <OrgsTable orgs={orgs as Pick<Organization, "id" | "name" | "type" | "district" | "county" | "status" | "tags" | "updated_at">[]} />
      )}
    </div>
  );
}

function SearchBar({ initial }: { initial: string }) {
  return (
    <form className="mb-4 flex gap-2" action="/orgs">
      <input
        type="search"
        name="q"
        defaultValue={initial}
        placeholder="Search by name…"
        className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-nau-gold focus:border-nau-navy"
      />
      <button
        type="submit"
        className="rounded-md bg-nau-navy text-white px-4 py-2 text-sm font-medium hover:bg-nau-navy-700"
      >
        Search
      </button>
    </form>
  );
}

function OrgsTable({
  orgs,
}: {
  orgs: Pick<Organization, "id" | "name" | "type" | "district" | "county" | "status" | "tags" | "updated_at">[];
}) {
  return (
    <Card>
      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-border bg-surface-muted/50">
              <th className="px-4 py-3 font-semibold text-nau-navy">Name</th>
              <th className="px-4 py-3 font-semibold text-nau-navy">Type</th>
              <th className="px-4 py-3 font-semibold text-nau-navy">District</th>
              <th className="px-4 py-3 font-semibold text-nau-navy">County</th>
              <th className="px-4 py-3 font-semibold text-nau-navy">Status</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((o) => (
              <tr
                key={o.id}
                className="border-b border-border last:border-0 hover:bg-nau-navy-50/40"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/orgs/${o.id}`}
                    className="font-medium text-nau-navy hover:underline"
                  >
                    {o.name}
                  </Link>
                  {o.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {o.tags.map((t) => (
                        <Badge key={t} tone="accent">{t}</Badge>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-ink-muted">{o.type ?? "—"}</td>
                <td className="px-4 py-3 text-ink-muted">{o.district ?? "—"}</td>
                <td className="px-4 py-3 text-ink-muted">{o.county ?? "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: card list */}
      <ul className="md:hidden divide-y divide-border">
        {orgs.map((o) => (
          <li key={o.id}>
            <Link href={`/orgs/${o.id}`} className="block p-4 active:bg-nau-navy-50">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-nau-navy">{o.name}</p>
                  <p className="text-xs text-ink-muted mt-1">
                    {[o.type, o.district, o.county].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
