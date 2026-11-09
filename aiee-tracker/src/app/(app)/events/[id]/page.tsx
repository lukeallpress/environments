import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, PageHeader } from "@/components/ui/page-header";
import { formatEventWhen } from "@/lib/format";
import { AttendanceSection } from "./attendance-section";
import { DeleteEventButton } from "./delete-event-button";
import type { AttendanceStatus, Event } from "@/lib/db/types";

export const metadata = { title: "Event · AIEE Coalition Tracker" };

type EventWithSeries = Event & { event_series: { id: string; name: string } | null };

export type AttendanceRow = {
  contact_id: string;
  status: AttendanceStatus;
  role_at_event: string | null;
  contacts: {
    id: string;
    first_name: string;
    last_name: string;
    title: string | null;
    organizations: { id: string; name: string } | null;
  } | null;
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: event, error: eventError }, { data: attendance }] =
    await Promise.all([
      supabase
        .from("events")
        .select("*, event_series:series_id ( id, name )")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("event_attendance")
        .select(
          "contact_id, status, role_at_event, contacts ( id, first_name, last_name, title, organizations:org_id ( id, name ) )"
        )
        .eq("event_id", id),
    ]);

  if (eventError) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-danger">
        Failed to load event: {eventError.message}
      </div>
    );
  }
  if (!event) notFound();
  const e = event as unknown as EventWithSeries;
  const rows = (attendance ?? []) as unknown as AttendanceRow[];

  // Sort by last name in JS — the join makes ORDER BY awkward.
  rows.sort((a, b) => {
    const an = a.contacts?.last_name ?? "";
    const bn = b.contacts?.last_name ?? "";
    return an.localeCompare(bn);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={e.name}
        subtitle={
          <span className="inline-flex flex-wrap items-center gap-2 text-sm text-ink-muted">
            <span>{formatEventWhen(e.starts_at, e.ends_at)}</span>
            {e.event_series && (
              <Link
                href={`/events/series/${e.event_series.id}/edit`}
                className="hover:text-nau-navy hover:underline"
              >
                <Badge>{e.event_series.name}</Badge>
              </Link>
            )}
            {e.format && <Badge tone="accent">{e.format}</Badge>}
          </span>
        }
        actions={
          <>
            <LinkButton variant="secondary" href={`/events/${e.id}/edit`}>
              Edit
            </LinkButton>
            <DeleteEventButton id={e.id} name={e.name} />
          </>
        }
      />

      {(e.location || e.description) && (
        <Card className="p-5 space-y-3">
          {e.location && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-muted">Location</dt>
              <dd className="text-sm text-ink mt-0.5">{e.location}</dd>
            </div>
          )}
          {e.description && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-muted">Description</dt>
              <dd className="text-sm text-ink mt-0.5 whitespace-pre-wrap">{e.description}</dd>
            </div>
          )}
        </Card>
      )}

      <AttendanceSection eventId={e.id} rows={rows} />
    </div>
  );
}
