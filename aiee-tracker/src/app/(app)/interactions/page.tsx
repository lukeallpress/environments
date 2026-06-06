import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, EmptyState, PageHeader } from "@/components/ui/page-header";
import { formatEventDate, formatEventTime } from "@/lib/format";
import { INTERACTION_CHANNELS } from "@/lib/db/types";
import type { InteractionChannel, InteractionTargetType } from "@/lib/db/types";

export const metadata = { title: "Interactions · AIEE Coalition Tracker" };

type Row = {
  id: string;
  target_type: InteractionTargetType;
  target_id: string;
  occurred_at: string;
  channel: InteractionChannel;
  summary: string;
  follow_up_at: string | null;
};

const CHANNEL_LABELS: Record<InteractionChannel, string> = Object.fromEntries(
  INTERACTION_CHANNELS.map((c) => [c.value, c.label])
) as Record<InteractionChannel, string>;

export default async function InteractionsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("interactions")
    .select("id, target_type, target_id, occurred_at, channel, summary, follow_up_at")
    .order("occurred_at", { ascending: false })
    .limit(50);

  const rows = (data ?? []) as Row[];

  // Resolve target names in a second query — keeps the SQL simple given the
  // polymorphic relationship.
  const orgIds = rows.filter((r) => r.target_type === "org").map((r) => r.target_id);
  const contactIds = rows
    .filter((r) => r.target_type === "contact")
    .map((r) => r.target_id);

  const [orgsRes, contactsRes] = await Promise.all([
    orgIds.length
      ? supabase.from("organizations").select("id, name").in("id", orgIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    contactIds.length
      ? supabase
          .from("contacts")
          .select("id, first_name, last_name, organizations:org_id ( name )")
          .in("id", contactIds)
      : Promise.resolve({ data: [] as { id: string; first_name: string; last_name: string; organizations: { name: string } | null }[] }),
  ]);

  const orgNames = new Map<string, string>(
    (orgsRes.data ?? []).map((o) => [o.id, o.name])
  );
  const contactNames = new Map<string, { name: string; orgName: string | null }>(
    ((contactsRes.data ?? []) as unknown as {
      id: string;
      first_name: string;
      last_name: string;
      organizations: { name: string } | null;
    }[]).map((c) => [
      c.id,
      {
        name: `${c.first_name} ${c.last_name}`,
        orgName: c.organizations?.name ?? null,
      },
    ])
  );

  return (
    <div>
      <PageHeader
        title="Interactions"
        subtitle="Touchpoints, conversations, and memorable moments with the coalition."
        actions={<LinkButton href="/interactions/new">+ Log interaction</LinkButton>}
      />

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-danger mb-4">
          Failed to load interactions: {error.message}
        </div>
      )}

      {!error && rows.length === 0 && (
        <EmptyState
          title="No interactions yet"
          body="Log your first one. The mobile floating button takes you straight here."
          action={<LinkButton href="/interactions/new">+ Log the first interaction</LinkButton>}
        />
      )}

      {!error && rows.length > 0 && (
        <Card>
          <ul className="divide-y divide-border">
            {rows.map((r) => {
              let targetName = "(unknown)";
              let targetHref = "/interactions";
              if (r.target_type === "org") {
                targetName = orgNames.get(r.target_id) ?? "Unknown org";
                targetHref = `/orgs/${r.target_id}`;
              } else {
                const c = contactNames.get(r.target_id);
                targetName = c?.name ?? "Unknown contact";
                targetHref = `/contacts/${r.target_id}`;
              }
              const overdue =
                r.follow_up_at && new Date(r.follow_up_at) < new Date();
              return (
                <li key={r.id}>
                  <Link
                    href={`/interactions/${r.id}`}
                    className="block p-4 sm:p-5 hover:bg-nau-navy-50/40"
                  >
                    <div className="flex items-baseline justify-between gap-3 flex-wrap">
                      <p className="font-medium text-nau-navy">
                        {targetName}
                        <span className="ml-2 inline-block">
                          <Badge tone="accent">
                            {CHANNEL_LABELS[r.channel] ?? r.channel}
                          </Badge>
                        </span>
                      </p>
                      <span className="text-xs text-ink-muted whitespace-nowrap">
                        {formatEventDate(r.occurred_at)} · {formatEventTime(r.occurred_at)}
                      </span>
                    </div>
                    <p className="text-sm text-ink-muted mt-1 line-clamp-2 whitespace-pre-wrap">
                      {r.summary}
                    </p>
                    {r.follow_up_at && (
                      <p
                        className={`text-xs mt-2 ${
                          overdue ? "text-danger font-medium" : "text-ink-muted"
                        }`}
                      >
                        {overdue ? "Overdue — " : "Follow up by "}
                        {formatEventDate(r.follow_up_at)}
                      </p>
                    )}
                    <p className="text-xs text-ink-muted mt-1">
                      → {targetHref.startsWith("/orgs") ? "Organization" : "Contact"}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
