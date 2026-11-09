import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui/page-header";
import { OrgForm } from "@/components/forms/org-form";
import { updateOrganization } from "../../actions";
import type { Organization } from "@/lib/db/types";

export const metadata = { title: "Edit organization · AIEE Coalition Tracker" };

export default async function EditOrgPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!org) notFound();
  const o = org as Organization;

  // Bind id into the server action.
  const boundUpdate = updateOrganization.bind(null, id);

  return (
    <div className="max-w-3xl">
      <PageHeader title={`Edit ${o.name}`} />
      <Card className="p-6">
        <OrgForm
          action={boundUpdate}
          initial={o}
          cancelHref={`/orgs/${id}`}
          submitLabel="Save changes"
        />
      </Card>
    </div>
  );
}
