import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui/page-header";
import { EventSeriesForm } from "@/components/forms/event-series-form";
import { DeleteSeriesButton } from "./delete-series-button";
import { updateEventSeries } from "../../actions";
import type { EventSeries } from "@/lib/db/types";

export const metadata = { title: "Edit series · AIEE Coalition Tracker" };

export default async function EditEventSeriesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("event_series")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const s = data as EventSeries;

  const boundUpdate = updateEventSeries.bind(null, id);

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={`Edit ${s.name}`}
        actions={<DeleteSeriesButton id={s.id} name={s.name} />}
      />
      <Card className="p-6">
        <EventSeriesForm
          action={boundUpdate}
          initial={s}
          cancelHref="/events/series"
          submitLabel="Save changes"
        />
      </Card>
    </div>
  );
}
