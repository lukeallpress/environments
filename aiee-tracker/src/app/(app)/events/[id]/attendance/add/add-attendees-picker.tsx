"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { addAttendees } from "../../../actions";

type Row = {
  id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  email: string | null;
  organizations: { id: string; name: string } | null;
};

export function AddAttendeesPicker({
  eventId,
  rows,
  alreadyAttendingIds,
}: {
  eventId: string;
  rows: Row[];
  alreadyAttendingIds: string[];
}) {
  const router = useRouter();
  const existingSet = new Set(alreadyAttendingIds);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();

  function toggle(id: string) {
    if (existingSet.has(id)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllEligible() {
    setSelected(new Set(rows.filter((r) => !existingSet.has(r.id)).map((r) => r.id)));
  }

  function clear() {
    setSelected(new Set());
  }

  function submit() {
    if (selected.size === 0) return;
    startTransition(async () => {
      await addAttendees(eventId, Array.from(selected));
      router.push(`/events/${eventId}`);
    });
  }

  const eligibleCount = rows.filter((r) => !existingSet.has(r.id)).length;

  return (
    <div>
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-surface-muted/50 text-xs">
        <span className="text-ink-muted">
          {selected.size} selected · {eligibleCount} eligible · {existingSet.size} already attending
        </span>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={selectAllEligible}
            className="font-medium text-nau-navy hover:underline disabled:text-ink-muted disabled:no-underline"
            disabled={eligibleCount === 0}
          >
            Select all
          </button>
          <button
            type="button"
            onClick={clear}
            className="font-medium text-ink-muted hover:text-nau-navy"
            disabled={selected.size === 0}
          >
            Clear
          </button>
        </div>
      </div>

      <ul className="divide-y divide-border">
        {rows.map((c) => {
          const already = existingSet.has(c.id);
          const isSelected = selected.has(c.id);
          return (
            <li key={c.id}>
              <label
                className={`flex items-start gap-3 p-4 cursor-pointer ${
                  already
                    ? "opacity-50 cursor-not-allowed"
                    : isSelected
                      ? "bg-nau-navy-50"
                      : "hover:bg-nau-navy-50/40"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={already}
                  onChange={() => toggle(c.id)}
                  className="mt-1 h-4 w-4 rounded border-border text-nau-navy focus:ring-nau-gold"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-nau-navy">
                    {c.first_name} {c.last_name}
                    {already && (
                      <span className="ml-2 text-xs font-normal text-ink-muted">
                        (already attending)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink-muted mt-0.5 truncate">
                    {[c.title, c.organizations?.name].filter(Boolean).join(" · ") ||
                      c.email ||
                      "—"}
                  </p>
                </div>
              </label>
            </li>
          );
        })}
      </ul>

      {/* Sticky save bar — keeps the action one tap away on long mobile lists. */}
      <div className="sticky bottom-0 bg-surface border-t border-border p-3 flex items-center justify-end gap-3">
        <span className="text-xs text-ink-muted">
          {selected.size} attendee{selected.size === 1 ? "" : "s"} to add
        </span>
        <Button onClick={submit} disabled={pending || selected.size === 0}>
          {pending ? "Adding…" : `Add ${selected.size || ""} attendee${selected.size === 1 ? "" : "s"}`}
        </Button>
      </div>
    </div>
  );
}
