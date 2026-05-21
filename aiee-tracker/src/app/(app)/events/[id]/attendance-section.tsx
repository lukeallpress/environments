"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { Card, EmptyState } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/button";
import { removeAttendee, setAttendanceStatus } from "../actions";
import { ATTENDANCE_STATUSES } from "@/lib/db/types";
import type { AttendanceStatus } from "@/lib/db/types";
import type { AttendanceRow } from "./page";

type FilterKey = "all" | AttendanceStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  ...ATTENDANCE_STATUSES.map((s) => ({ key: s.value, label: s.label })),
];

export function AttendanceSection({
  eventId,
  rows,
}: {
  eventId: string;
  rows: AttendanceRow[];
}) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [optimistic, setOptimistic] = useOptimistic(
    rows,
    (state, { contactId, status }: { contactId: string; status: AttendanceStatus }) =>
      state.map((r) =>
        r.contact_id === contactId ? { ...r, status } : r
      )
  );
  const [, startTransition] = useTransition();

  function changeStatus(contactId: string, status: AttendanceStatus) {
    startTransition(async () => {
      setOptimistic({ contactId, status });
      await setAttendanceStatus(eventId, contactId, status);
    });
  }

  const filtered =
    filter === "all" ? optimistic : optimistic.filter((r) => r.status === filter);

  // Tallies per status for the filter chips.
  const counts: Record<FilterKey, number> = {
    all: optimistic.length,
    invited: 0,
    registered: 0,
    attended: 0,
    "no-show": 0,
    declined: 0,
  };
  for (const r of optimistic) counts[r.status]++;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-lg section-rule inline-block">Attendance</h2>
        <LinkButton size="sm" href={`/events/${eventId}/attendance/add`}>
          + Add attendees
        </LinkButton>
      </div>

      {/* Filter chips — total counts visible in each. */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                active
                  ? "bg-nau-navy text-white border-nau-navy"
                  : "bg-surface text-ink-muted border-border hover:border-nau-navy/30"
              }`}
            >
              {f.label}
              <span className={`ml-1.5 ${active ? "text-nau-gold" : "text-ink-muted/70"}`}>
                {counts[f.key]}
              </span>
            </button>
          );
        })}
      </div>

      {optimistic.length === 0 ? (
        <EmptyState
          title="No attendees yet"
          body="Add the first attendees — staff, contacts, anyone you're tracking."
          action={
            <LinkButton size="sm" href={`/events/${eventId}/attendance/add`}>
              + Add attendees
            </LinkButton>
          }
        />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-ink-muted text-center py-6">
          No attendees match this filter.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map((r) => (
            <AttendanceRowItem
              key={r.contact_id}
              row={r}
              eventId={eventId}
              onStatusChange={changeStatus}
            />
          ))}
        </ul>
      )}
    </Card>
  );
}

function AttendanceRowItem({
  row,
  eventId,
  onStatusChange,
}: {
  row: AttendanceRow;
  eventId: string;
  onStatusChange: (contactId: string, status: AttendanceStatus) => void;
}) {
  const c = row.contacts;
  if (!c) return null;
  return (
    <li className="py-3">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <Link
            href={`/contacts/${c.id}`}
            className="font-medium text-nau-navy hover:underline"
          >
            {c.first_name} {c.last_name}
          </Link>
          <p className="text-xs text-ink-muted mt-0.5 truncate">
            {[c.title, c.organizations?.name].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        <form action={removeAttendee}>
          <input type="hidden" name="event_id" value={eventId} />
          <input type="hidden" name="contact_id" value={row.contact_id} />
          <button
            type="submit"
            aria-label={`Remove ${c.first_name} ${c.last_name}`}
            className="text-xs text-ink-muted hover:text-danger px-2 py-1 rounded"
            onClick={(e) => {
              if (!window.confirm(`Remove ${c.first_name} ${c.last_name} from this event?`)) {
                e.preventDefault();
              }
            }}
          >
            Remove
          </button>
        </form>
      </div>

      <div className="grid grid-cols-5 gap-1" role="group" aria-label="Attendance status">
        {ATTENDANCE_STATUSES.map((s) => {
          const active = row.status === s.value;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => !active && onStatusChange(row.contact_id, s.value)}
              className={`px-1 py-1.5 rounded text-xs font-medium border transition ${
                active
                  ? "bg-nau-navy text-white border-nau-navy"
                  : "bg-surface text-ink-muted border-border hover:border-nau-navy/30"
              }`}
              aria-pressed={active}
            >
              <span className="sm:hidden">{s.short}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </div>
    </li>
  );
}
