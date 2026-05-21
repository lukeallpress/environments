import { Card, PageHeader } from "@/components/ui/page-header";
import { InteractionForm } from "@/components/forms/interaction-form";
import { loadTargetOptions } from "@/lib/db/target-options";
import { createInteraction } from "../actions";

export const metadata = { title: "Log interaction · AIEE Coalition Tracker" };

export default async function NewInteractionPage({
  searchParams,
}: {
  searchParams: Promise<{ org_id?: string; contact_id?: string }>;
}) {
  const { org_id, contact_id } = await searchParams;
  const { orgs, contacts } = await loadTargetOptions();

  // Pre-fill target if the FAB / link came with context (e.g. from an org page).
  let initialTargetValue: string | undefined;
  if (contact_id) initialTargetValue = `contact:${contact_id}`;
  else if (org_id) initialTargetValue = `org:${org_id}`;

  // Where to return on cancel — prefer the prefilled target, else the list.
  const cancelHref = contact_id
    ? `/contacts/${contact_id}`
    : org_id
      ? `/orgs/${org_id}`
      : "/interactions";

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Log interaction"
        subtitle="A touchpoint, a conversation, anything worth remembering."
      />
      <Card className="p-6">
        <InteractionForm
          action={createInteraction}
          orgs={orgs}
          contacts={contacts}
          initialTargetValue={initialTargetValue}
          cancelHref={cancelHref}
          submitLabel="Save interaction"
        />
      </Card>
    </div>
  );
}
