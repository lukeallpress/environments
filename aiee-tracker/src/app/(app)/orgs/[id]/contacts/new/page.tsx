import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui/page-header";
import { ContactForm } from "@/components/forms/contact-form";
import { createContact } from "@/app/(app)/contacts/actions";

export const metadata = { title: "New contact · AIEE Coalition Tracker" };

export default async function NewContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();

  if (!org) notFound();

  const boundCreate = createContact.bind(null, id);

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={`New contact at ${org.name}`}
        subtitle="Contacts belong to a single organization. If this person moves orgs, create a new contact at the new org."
      />
      <Card className="p-6">
        <ContactForm
          action={boundCreate}
          cancelHref={`/orgs/${id}`}
          submitLabel="Create contact"
        />
      </Card>
    </div>
  );
}
