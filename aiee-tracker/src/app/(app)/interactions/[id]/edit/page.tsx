import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui/page-header";
import { InteractionForm } from "@/components/forms/interaction-form";
import { loadTargetOptions } from "@/lib/db/target-options";
import { updateInteraction } from "../../actions";
import type { Interaction } from "@/lib/db/types";

export const metadata = { title: "Edit interaction · AIEE Coalition Tracker" };

export default async function EditInteractionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("interactions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const i = data as Interaction;

  const { orgs, contacts } = await loadTargetOptions();
  const boundUpdate = updateInteraction.bind(null, id);

  return (
    <div className="max-w-3xl">
      <PageHeader title="Edit interaction" />
      <Card className="p-6">
        <InteractionForm
          action={boundUpdate}
          orgs={orgs}
          contacts={contacts}
          initial={i}
          cancelHref={`/interactions/${id}`}
          submitLabel="Save changes"
        />
      </Card>
    </div>
  );
}
