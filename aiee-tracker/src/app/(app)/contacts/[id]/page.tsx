import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Card, PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/button";
import { DeleteContactButton } from "./delete-contact-button";
import { InteractionsTimeline } from "@/components/interactions-timeline";
import type { Contact } from "@/lib/db/types";

type ContactWithOrg = Contact & {
  organizations: { id: string; name: string } | null;
};

export const metadata = { title: "Contact · AIEE Coalition Tracker" };

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data, error }, { data: interactions }] = await Promise.all([
    supabase
      .from("contacts")
      .select("*, organizations:org_id ( id, name )")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("interactions")
      .select("id, occurred_at, channel, summary, follow_up_at")
      .eq("target_type", "contact")
      .eq("target_id", id)
      .order("occurred_at", { ascending: false })
      .limit(10),
  ]);

  if (error) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-danger">
        Failed to load contact: {error.message}
      </div>
    );
  }
  if (!data) notFound();
  const c = data as unknown as ContactWithOrg;

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={`${c.first_name} ${c.last_name}`}
        subtitle={
          <span className="inline-flex items-center gap-2 text-sm">
            <StatusBadge status={c.status} />
            {c.organizations && (
              <Link
                href={`/orgs/${c.organizations.id}`}
                className="text-ink-muted hover:text-nau-navy hover:underline"
              >
                {c.organizations.name}
              </Link>
            )}
          </span>
        }
        actions={
          <>
            <LinkButton variant="secondary" href={`/contacts/${c.id}/edit`}>
              Edit
            </LinkButton>
            <DeleteContactButton id={c.id} name={`${c.first_name} ${c.last_name}`} />
          </>
        }
      />

      <Card className="p-5">
        <h2 className="text-lg section-rule inline-block mb-4">Profile</h2>
        <dl className="text-sm space-y-3">
          <Field label="Title" value={c.title} />
          <Field
            label="Email"
            value={
              c.email ? (
                <a className="text-nau-navy hover:underline break-all" href={`mailto:${c.email}`}>
                  {c.email}
                </a>
              ) : null
            }
          />
          <Field
            label="Phone"
            value={
              c.phone ? (
                <a className="text-nau-navy hover:underline" href={`tel:${c.phone}`}>
                  {c.phone}
                </a>
              ) : null
            }
          />
          <Field
            label="Role tags"
            value={
              c.role_tags?.length ? (
                <div className="flex flex-wrap gap-1">
                  {c.role_tags.map((t) => (
                    <Badge key={t} tone="accent">
                      {t}
                    </Badge>
                  ))}
                </div>
              ) : null
            }
          />
          <Field
            label="Notes"
            value={c.notes ? <p className="whitespace-pre-wrap">{c.notes}</p> : null}
          />
        </dl>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-lg section-rule inline-block">Interactions</h2>
          <LinkButton size="sm" href={`/interactions/new?contact_id=${c.id}`}>
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
