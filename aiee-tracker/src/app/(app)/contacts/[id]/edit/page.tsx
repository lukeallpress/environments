import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui/page-header";
import { ContactForm } from "@/components/forms/contact-form";
import { updateContact } from "../../actions";
import type { Contact } from "@/lib/db/types";

export const metadata = { title: "Edit contact · AIEE Coalition Tracker" };

export default async function EditContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: contact } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!contact) notFound();
  const c = contact as Contact;

  const boundUpdate = updateContact.bind(null, id);

  return (
    <div className="max-w-3xl">
      <PageHeader title={`Edit ${c.first_name} ${c.last_name}`} />
      <Card className="p-6">
        <ContactForm
          action={boundUpdate}
          initial={c}
          cancelHref={`/contacts/${id}`}
          submitLabel="Save changes"
        />
      </Card>
    </div>
  );
}
