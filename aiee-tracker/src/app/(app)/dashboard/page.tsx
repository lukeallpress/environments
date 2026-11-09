import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatEventWhen } from "@/lib/format";

export const metadata = { title: "Dashboard · AIEE Coalition Tracker" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const nowIso = now.toISOString();
  const oneWeekAhead = new Date(now);
  oneWeekAhead.setDate(oneWeekAhead.getDate() + 7);
  const oneWeekIso = oneWeekAhead.toISOString();

  const [orgsRes, contactsRes, upcomingRes, nextEventsRes, followUpsRes] =
    await Promise.all([
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
      supabase
        .from("interactions")
        .select("id, target_type, target_id, follow_up_at, summary, channel")
        .not("follow_up_at", "is", null)
        .lte("follow_up_at", oneWeekIso)
        .order("follow_up_at", { ascending: true })
        .limit(10),
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

  type FollowUpRow = {
    id: string;
    target_type: "org" | "contact";
    target_id: string;
    follow_up_at: string;
    summary: string;
    channel: string;
  };
  const followUps = (followUpsRes.data ?? []) as FollowUpRow[];

  // Resolve target names for follow-ups in one batch each.
  const followOrgIds = followUps.filter((f) => f.target_type === "org").map((f) => f.target_id);
  const followContactIds = followUps
    .filter((f) => f.target_type === "contact")
    .map((f) => f.target_id);
  const [followOrgsRes, followContactsRes] = await Promise.all([
    followOrgIds.length
      ? supabase.from("organizations").select("id, name").in("id", followOrgIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    followContactIds.length
      ? supabase
          .from("contacts")
          .select("id, first_name, last_name")
          .in("id", followContactIds)
      : Promise.resolve({ data: [] as { id: string; first_name: string; last_name: string }[] }),
  ]);
  const followOrgNames = new Map(
    (followOrgsRes.data ?? []).map((o) => [o.id, o.name])
  );
  const followContactNames = new Map(
    (followContactsRes.data ?? []).map((c) => [c.id, `${c.first_name} ${c.last_name}`])
  );

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
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg section-rule inline-block">Needs follow-up</h2>
            <Link
              href="/interactions"
              className="text-sm font-medium text-nau-navy hover:underline"
            >
              All →
            </Link>
          </div>
          {followUps.length === 0 ? (
            <p className="text-sm text-ink-muted py-2">
              No follow-ups in the next 7 days.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {followUps.map((f) => {
                const overdue = new Date(f.follow_up_at) < new Date();
                const targetName =
                  f.target_type === "org"
                    ? followOrgNames.get(f.target_id) ?? "Unknown org"
                    : followContactNames.get(f.target_id) ?? "Unknown contact";
                return (
                  <li key={f.id}>
                    <Link
                      href={`/interactions/${f.id}`}
                      className="block py-3 hover:bg-nau-navy-50/30 -mx-2 px-2 rounded"
                    >
                      <p className="text-sm font-medium text-nau-navy truncate">
                        {targetName}
                      </p>
                      <p
                        className={`text-xs mt-0.5 ${
                          overdue ? "text-danger font-medium" : "text-ink-muted"
                        }`}
                      >
                        {overdue ? "Overdue — " : ""}
                        {formatEventWhen(f.follow_up_at)}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
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
