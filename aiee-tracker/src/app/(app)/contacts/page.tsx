import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, EmptyState, PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Contacts · AIEE Coalition Tracker" };

type Row = {
  id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  email: string | null;
  status: string;
  role_tags: string[];
  organizations: { id: string; name: string } | null;
};

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("contacts")
    .select(
      "id, first_name, last_name, title, email, status, role_tags, organizations:org_id ( id, name )"
    )
    .order("last_name", { ascending: true });

  if (q && q.trim()) {
    const term = `%${q.trim()}%`;
    // Match against first or last name OR email.
    query = query.or(
      `first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term}`
    );
  }

  const { data, error } = await query;
  const rows = (data ?? []) as unknown as Row[];

  return (
    <div>
      <PageHeader
        title="Contacts"
        subtitle="People at our partner orgs. Add new ones from the org detail page."
      />

      <form className="mb-4 flex gap-2" action="/contacts">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name or email…"
          className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-nau-gold focus:border-nau-navy"
        />
        <button
          type="submit"
          className="rounded-md bg-nau-navy text-white px-4 py-2 text-sm font-medium hover:bg-nau-navy-700"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-danger mb-4">
          Failed to load contacts: {error.message}
        </div>
      )}

      {!error && rows.length === 0 && (
        <EmptyState
          title={q ? `No contacts match "${q}"` : "No contacts yet"}
          body={q ? "Try a different search." : "Open an organization to add its first contact."}
        />
      )}

      {!error && rows.length > 0 && (
        <Card>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-border bg-surface-muted/50">
                  <th className="px-4 py-3 font-semibold text-nau-navy">Name</th>
                  <th className="px-4 py-3 font-semibold text-nau-navy">Organization</th>
                  <th className="px-4 py-3 font-semibold text-nau-navy">Title</th>
                  <th className="px-4 py-3 font-semibold text-nau-navy">Email</th>
                  <th className="px-4 py-3 font-semibold text-nau-navy">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-border last:border-0 hover:bg-nau-navy-50/40"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/contacts/${c.id}`}
                        className="font-medium text-nau-navy hover:underline"
                      >
                        {c.first_name} {c.last_name}
                      </Link>
                      {c.role_tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {c.role_tags.map((t) => (
                            <Badge key={t} tone="accent">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {c.organizations ? (
                        <Link
                          href={`/orgs/${c.organizations.id}`}
                          className="text-ink-muted hover:text-nau-navy hover:underline"
                        >
                          {c.organizations.name}
                        </Link>
                      ) : (
                        <span className="text-ink-muted">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-muted">{c.title ?? "—"}</td>
                    <td className="px-4 py-3 text-ink-muted break-all">{c.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <ul className="md:hidden divide-y divide-border">
            {rows.map((c) => (
              <li key={c.id}>
                <Link href={`/contacts/${c.id}`} className="block p-4 active:bg-nau-navy-50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-nau-navy">
                        {c.first_name} {c.last_name}
                      </p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {c.organizations?.name ?? "—"}
                        {c.title ? ` · ${c.title}` : ""}
                      </p>
                      {c.role_tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {c.role_tags.map((t) => (
                            <Badge key={t} tone="accent">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
