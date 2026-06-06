import { Card, PageHeader } from "@/components/ui/page-header";
import { EventSeriesForm } from "@/components/forms/event-series-form";
import { createEventSeries } from "../actions";

export const metadata = { title: "New event series · AIEE Coalition Tracker" };

export default function NewEventSeriesPage() {
  return (
    <div className="max-w-2xl">
      <PageHeader title="New event series" />
      <Card className="p-6">
        <EventSeriesForm
          action={createEventSeries}
          cancelHref="/events/series"
          submitLabel="Create series"
        />
      </Card>
    </div>
  );
}
