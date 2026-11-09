import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, EmptyState, PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { EventSeries } from "@/lib/db/types";

export const metadata = { title: "Event series · AIEE Coalition Tracker" };

type Row = EventSeries & { events: { count: number }[] };

export default async function EventSeriesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_series")
    .select("*, events(count)")
    .order("name");

  const rows = (data ?? []) as unknown as Row[];

  return (
    <div>
      <PageHeader
        title="Event series"
        subtitle="Group recurring events under a series — monthly convenings, annual summits, etc."
        actions={
          <>
            <LinkButton variant="secondary" href="/events">
              ← Back to events
            </LinkButton>
            <LinkButton href="/events/series/new">+ New series</LinkButton>
          </>
        }
      />

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-danger mb-4">
          Failed to load series: {error.message}
        </div>
      )}

      {!error && rows.length === 0 && (
        <EmptyState
          title="No event series yet"
          body="A series groups recurring events. Add one to organize your calendar."
          action={
            <LinkButton href="/events/series/new">+ Add the first series</LinkButton>
          }
        />
      )}

      {!error && rows.length > 0 && (
        <Card>
          <ul className="divide-y divide-border">
            {rows.map((s) => {
              const count = s.events?.[0]?.count ?? 0;
              return (
                <li key={s.id} className="p-4 sm:p-5 flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/events/series/${s.id}/edit`}
                      className="font-medium text-nau-navy hover:underline"
                    >
                      {s.name}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                      {s.cadence && <Badge>{s.cadence}</Badge>}
                      <span>{count} {count === 1 ? "event" : "events"}</span>
                    </div>
                    {s.description && (
                      <p className="text-sm text-ink-muted mt-2 whitespace-pre-wrap">
                        {s.description}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/events/series/${s.id}/edit`}
                    className="text-sm font-medium text-nau-navy hover:underline"
                  >
                    Edit
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
