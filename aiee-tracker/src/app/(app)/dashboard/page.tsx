import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatEventWhen } from "@/lib/format";

export const metadata = { title: "Dashboard · AIEE Coalition Tracker" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const [orgsRes, contactsRes, upcomingRes, nextEventsRes] = await Promise.all([
    supabase.from("organizations").select("*", { count: "exact", head: true }),
    supabase.from("contacts").select("*", { count: "exact", head: true }),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .gte("starts_at", nowIso),
    supabase
      .from("events")
      .select("id, name, starts_at, ends_at, location, event_series:series_id ( id, name )")
      .gte("starts_at", nowIso)
      .order("starts_at", { ascending: true })
      .limit(5),
  ]);

  type UpcomingRow = {
    id: string;
    name: string;
    starts_at: string;
    ends_at: string | null;
    location: string | null;
    event_series: { id: string; name: string } | null;
  };
  const nextEvents = (nextEventsRes.data ?? []) as unknown as UpcomingRow[];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Phase 2 is live: events and attendance. Interactions and engagement come next."
        actions={<LinkButton href="/orgs/new">+ New organization</LinkButton>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Organizations" value={orgsRes.count ?? 0} href="/orgs" />
        <StatCard label="Contacts" value={contactsRes.count ?? 0} href="/contacts" />
        <StatCard label="Upcoming events" value={upcomingRes.count ?? 0} href="/events" />
        <StatCard label="Engagement score" value="—" hint="Phase 4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg section-rule inline-block">Next up</h2>
            <Link
              href="/events"
              className="text-sm font-medium text-nau-navy hover:underline"
            >
              View all →
            </Link>
          </div>
          {nextEvents.length === 0 ? (
            <p className="text-sm text-ink-muted py-3">
              No events scheduled. <Link href="/events/new" className="text-nau-navy hover:underline">Add one →</Link>
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {nextEvents.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/events/${e.id}`}
                    className="block py-3 hover:bg-nau-navy-50/30 -mx-2 px-2 rounded"
                  >
                    <p className="font-medium text-nau-navy">{e.name}</p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {formatEventWhen(e.starts_at, e.ends_at)}
                      {e.location ? ` · ${e.location}` : ""}
                    </p>
                    {e.event_series && (
                      <div className="mt-1">
                        <Badge>{e.event_series.name}</Badge>
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="lg:col-span-1 p-5">
          <h2 className="text-lg section-rule inline-block mb-3">What&apos;s next</h2>
          <ul className="text-sm space-y-2 text-ink-muted list-disc pl-5">
            <li>Phase 3 — Interactions and the floating quick-add for after-meeting capture.</li>
            <li>Phase 4 — Engagement scoring, cooling/warming lists, trend charts.</li>
            <li>Phase 5 — Audit log viewer, tag management, polish.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  hint,
}: {
  label: string;
  value: string | number;
  href?: string;
  hint?: string;
}) {
  const inner = (
    <Card className="p-5">
      <p className="text-xs uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="text-3xl font-serif text-nau-navy mt-1">{value}</p>
      {hint && <p className="text-xs text-ink-muted mt-1">{hint}</p>}
    </Card>
  );
  return href ? (
    <Link href={href} className="block hover:[&>div]:bg-nau-navy-50/40 transition">
      {inner}
    </Link>
  ) : (
    inner
  );
}
