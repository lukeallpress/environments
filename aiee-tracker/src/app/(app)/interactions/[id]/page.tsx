import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/button";
import { DeleteInteractionButton } from "./delete-interaction-button";
import { formatEventDate, formatEventTime } from "@/lib/format";
import { INTERACTION_CHANNELS } from "@/lib/db/types";
import type {
  Interaction,
  InteractionChannel,
} from "@/lib/db/types";

export const metadata = { title: "Interaction · AIEE Coalition Tracker" };

const CHANNEL_LABELS: Record<InteractionChannel, string> = Object.fromEntries(
  INTERACTION_CHANNELS.map((c) => [c.value, c.label])
) as Record<InteractionChannel, string>;

export default async function InteractionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("interactions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-danger">
        Failed to load interaction: {error.message}
      </div>
    );
  }
  if (!data) notFound();
  const i = data as Interaction;

  // Look up the target's display name.
  let targetName = "(unknown)";
  let targetHref = "/interactions";
  if (i.target_type === "org") {
    const { data: o } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", i.target_id)
      .maybeSingle();
    targetName = o?.name ?? "Unknown organization";
    targetHref = `/orgs/${i.target_id}`;
  } else if (i.target_type === "contact") {
    const { data: c } = await supabase
      .from("contacts")
      .select("first_name, last_name, organizations:org_id ( name )")
      .eq("id", i.target_id)
      .maybeSingle();
    if (c) {
      const org = c.organizations as unknown as { name: string } | null;
      targetName =
        `${c.first_name} ${c.last_name}` +
        (org?.name ? ` — ${org.name}` : "");
    } else {
      targetName = "Unknown contact";
    }
    targetHref = `/contacts/${i.target_id}`;
  }

  const overdue = i.follow_up_at && new Date(i.follow_up_at) < new Date();

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Interaction"
        subtitle={
          <span className="inline-flex items-center gap-2 text-sm">
            <Badge tone="accent">
              {CHANNEL_LABELS[i.channel] ?? i.channel}
            </Badge>
            <Link href={targetHref} className="text-ink-muted hover:text-nau-navy hover:underline">
              {targetName}
            </Link>
          </span>
        }
        actions={
          <>
            <LinkButton variant="secondary" href={`/interactions/${i.id}/edit`}>
              Edit
            </LinkButton>
            <DeleteInteractionButton id={i.id} />
          </>
        }
      />

      <Card className="p-5 space-y-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-muted">When</dt>
          <dd className="text-sm text-ink mt-0.5">
            {formatEventDate(i.occurred_at)} · {formatEventTime(i.occurred_at)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-muted">Summary</dt>
          <dd className="text-sm text-ink mt-0.5 whitespace-pre-wrap">{i.summary}</dd>
        </div>
        {i.follow_up_at && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-muted">Follow up</dt>
            <dd
              className={`text-sm mt-0.5 ${
                overdue ? "text-danger font-medium" : "text-ink"
              }`}
            >
              {overdue ? "Overdue — " : ""}
              {formatEventDate(i.follow_up_at)} · {formatEventTime(i.follow_up_at)}
            </dd>
          </div>
        )}
      </Card>
    </div>
  );
}
