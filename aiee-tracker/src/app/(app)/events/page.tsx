import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card, EmptyState, PageHeader } from "@/components/ui/page-header";
import { formatEventWhen } from "@/lib/format";
import type { Event } from "@/lib/db/types";

export const metadata = { title: "Events · AIEE Coalition Tracker" };

type Row = Pick<Event, "id" | "name" | "starts_at" | "ends_at" | "location" | "format"> & {
  event_series: { id: string; name: string } | null;
  event_attendance: { count: number }[];
};

export default async function EventsPage() {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const [upcomingRes, pastRes] = await Promise.all([
    supabase
      .from("events")
      .select(
        "id, name, starts_at, ends_at, location, format, event_series:series_id ( id, name ), event_attendance(count)"
      )
      .gte("starts_at", nowIso)
      .order("starts_at", { ascending: true }),
    supabase
      .from("events")
      .select(
        "id, name, starts_at, ends_at, location, format, event_series:series_id ( id, name ), event_attendance(count)"
      )
      .lt("starts_at", nowIso)
      .order("starts_at", { ascending: false })
      .limit(20),
  ]);

  const upcoming = (upcomingRes.data ?? []) as unknown as Row[];
  const past = (pastRes.data ?? []) as unknown as Row[];
  const error = upcomingRes.error || pastRes.error;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Events"
        subtitle="Coalition convenings, summits, and one-off touchpoints."
        actions={
          <>
            <LinkButton variant="secondary" href="/events/series">
              Manage series
            </LinkButton>
            <LinkButton href="/events/new">+ New event</LinkButton>
          </>
        }
      />

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-danger">
          Failed to load events: {error.message}
        </div>
      )}

      <Section title="Upcoming" rows={upcoming} emptyTitle="No upcoming events" />
      <Section title="Past (last 20)" rows={past} emptyTitle="No past events" />
    </div>
  );
}

function Section({
  title,
  rows,
  emptyTitle,
}: {
  title: string;
  rows: Row[];
  emptyTitle: string;
}) {
  return (
    <section>
      <h2 className="text-lg section-rule inline-block mb-3">{title}</h2>
      {rows.length === 0 ? (
        <EmptyState title={emptyTitle} />
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {rows.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/events/${e.id}`}
                  className="block p-4 sm:p-5 hover:bg-nau-navy-50/40 active:bg-nau-navy-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-nau-navy truncate">{e.name}</p>
                      <p className="text-xs text-ink-muted mt-1">
                        {formatEventWhen(e.starts_at, e.ends_at)}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                        {e.event_series && <Badge>{e.event_series.name}</Badge>}
                        {e.format && <Badge tone="accent">{e.format}</Badge>}
                        {e.location && <span className="truncate">{e.location}</span>}
                      </div>
                    </div>
                    <div className="text-right text-xs text-ink-muted whitespace-nowrap">
                      {(e.event_attendance?.[0]?.count ?? 0)} attendees
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </section>
  );
}
