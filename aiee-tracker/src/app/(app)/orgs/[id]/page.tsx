import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, EmptyState, PageHeader } from "@/components/ui/page-header";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { DeleteOrgButton } from "./delete-org-button";
import { InteractionsTimeline } from "@/components/interactions-timeline";
import type { Contact, Organization } from "@/lib/db/types";

export const metadata = { title: "Organization · AIEE Coalition Tracker" };

export default async function OrgDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: org, error: orgError },
    { data: contacts },
    { data: interactions },
  ] = await Promise.all([
    supabase.from("organizations").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("contacts")
      .select("id, first_name, last_name, title, email, status, role_tags")
      .eq("org_id", id)
      .order("last_name", { ascending: true }),
    supabase
      .from("interactions")
      .select("id, occurred_at, channel, summary, follow_up_at")
      .eq("target_type", "org")
      .eq("target_id", id)
      .order("occurred_at", { ascending: false })
      .limit(10),
  ]);

  if (orgError) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-danger">
        Failed to load organization: {orgError.message}
      </div>
    );
  }
  if (!org) notFound();
  const o = org as Organization;
  const cs = (contacts ?? []) as Pick<
    Contact,
    "id" | "first_name" | "last_name" | "title" | "email" | "status" | "role_tags"
  >[];

  return (
    <div className="space-y-6">
      <PageHeader
        title={o.name}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2 text-sm">
            <StatusBadge status={o.status} />
            {o.type && <Badge>{o.type}</Badge>}
            {o.tags?.map((t) => (
              <Badge key={t} tone="accent">{t}</Badge>
            ))}
          </span>
        }
        actions={
          <>
            <LinkButton variant="secondary" href={`/orgs/${o.id}/edit`}>
              Edit
            </LinkButton>
            <DeleteOrgButton id={o.id} name={o.name} />
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 p-5">
          <h2 className="text-lg section-rule inline-block mb-4">Overview</h2>
          <dl className="text-sm space-y-3">
            <Field label="District" value={o.district} />
            <Field label="County" value={o.county} />
            <Field
              label="Website"
              value={
                o.website ? (
                  <a
                    href={o.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-nau-navy hover:underline break-all"
                  >
                    {o.website}
                  </a>
                ) : null
              }
            />
            <Field label="Address" value={o.address} />
            <Field
              label="Notes"
              value={o.notes ? <p className="whitespace-pre-wrap">{o.notes}</p> : null}
            />
          </dl>
        </Card>

        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg section-rule inline-block">Contacts</h2>
            <LinkButton size="sm" href={`/orgs/${o.id}/contacts/new`}>
              + Add contact
            </LinkButton>
          </div>

          {cs.length === 0 ? (
            <EmptyState
              title="No contacts yet"
              body="Add the first contact at this organization."
              action={
                <LinkButton size="sm" href={`/orgs/${o.id}/contacts/new`}>
                  + Add contact
                </LinkButton>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {cs.map((c) => (
                <li key={c.id} className="py-3 flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/contacts/${c.id}`}
                      className="font-medium text-nau-navy hover:underline"
                    >
                      {c.first_name} {c.last_name}
                    </Link>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {[c.title, c.email].filter(Boolean).join(" · ") || "—"}
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
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg section-rule inline-block">Interactions</h2>
          <LinkButton size="sm" href={`/interactions/new?org_id=${o.id}`}>
            + Log interaction
          </LinkButton>
        </div>
        <InteractionsTimeline rows={(interactions ?? []) as InteractionRow[]} />
      </Card>
    </div>
  );
}

type InteractionRow = {
  id: string;
  occurred_at: string;
  channel: import("@/lib/db/types").InteractionChannel;
  summary: string;
  follow_up_at: string | null;
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-muted">{label}</dt>
      <dd className="text-sm text-ink mt-0.5">{value || <span className="text-ink-muted">—</span>}</dd>
    </div>
  );
}
