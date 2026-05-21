import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui/page-header";
import { EventForm } from "@/components/forms/event-form";
import { createEvent } from "../actions";

export const metadata = { title: "New event · AIEE Coalition Tracker" };

export default async function NewEventPage() {
  const supabase = await createClient();
  const { data: series } = await supabase
    .from("event_series")
    .select("id, name")
    .order("name");

  return (
    <div className="max-w-3xl">
      <PageHeader title="New event" />
      <Card className="p-6">
        <EventForm
          action={createEvent}
          series={series ?? []}
          cancelHref="/events"
          submitLabel="Create event"
        />
      </Card>
    </div>
  );
}
