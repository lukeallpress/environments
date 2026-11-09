import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, EmptyState, PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/button";
import { AddAttendeesPicker } from "./add-attendees-picker";

export const metadata = { title: "Add attendees · AIEE Coalition Tracker" };

export default async function AddAttendeesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { id } = await params;
  const { q } = await searchParams;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, name")
    .eq("id", id)
    .maybeSingle();
  if (!event) notFound();

  // Contacts already attending — used to dim/disable existing rows.
  const { data: existing } = await supabase
    .from("event_attendance")
    .select("contact_id")
    .eq("event_id", id);
  const existingSet = new Set((existing ?? []).map((r) => r.contact_id));

  // All contacts (optionally filtered by search query).
  let query = supabase
    .from("contacts")
    .select(
      "id, first_name, last_name, title, email, organizations:org_id ( id, name )"
    )
    .eq("status", "active")
    .order("last_name");
  if (q && q.trim()) {
    const term = `%${q.trim()}%`;
    query = query.or(
      `first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term}`
    );
  }
  const { data: contacts } = await query;

  type Row = {
    id: string;
    first_name: string;
    last_name: string;
    title: string | null;
    email: string | null;
    organizations: { id: string; name: string } | null;
  };
  const rows = (contacts ?? []) as unknown as Row[];

  return (
    <div className="space-y-4 max-w-3xl">
      <PageHeader
        title={`Add attendees`}
        subtitle={`Tap contacts to add them as invited to "${event.name}".`}
        actions={
          <LinkButton variant="secondary" href={`/events/${id}`}>
            ← Back to event
          </LinkButton>
        }
      />

      <form action={`/events/${id}/attendance/add`} className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name or email…"
          className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-nau-gold focus:border-nau-navy"
        />
        <button
          type="submit"
          className="rounded-md bg-nau-navy text-white px-4 py-2 text-sm font-medium hover:bg-nau-navy-700"
        >
          Search
        </button>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          title={q ? `No contacts match "${q}"` : "No active contacts"}
          body={q ? "Try a different search." : "Add contacts to organizations first."}
        />
      ) : (
        <Card className="p-0">
          <AddAttendeesPicker
            eventId={id}
            rows={rows}
            alreadyAttendingIds={Array.from(existingSet)}
          />
        </Card>
      )}
    </div>
  );
}
