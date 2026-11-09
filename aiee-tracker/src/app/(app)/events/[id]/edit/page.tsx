import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui/page-header";
import { EventForm } from "@/components/forms/event-form";
import { updateEvent } from "../../actions";
import type { Event } from "@/lib/db/types";

export const metadata = { title: "Edit event · AIEE Coalition Tracker" };

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: event }, { data: series }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).maybeSingle(),
    supabase.from("event_series").select("id, name").order("name"),
  ]);

  if (!event) notFound();
  const e = event as Event;
  const boundUpdate = updateEvent.bind(null, id);

  return (
    <div className="max-w-3xl">
      <PageHeader title={`Edit ${e.name}`} />
      <Card className="p-6">
        <EventForm
          action={boundUpdate}
          initial={e}
          series={series ?? []}
          cancelHref={`/events/${id}`}
          submitLabel="Save changes"
        />
      </Card>
    </div>
  );
}
