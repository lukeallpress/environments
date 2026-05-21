"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import type { Event, EventSeries, FormState } from "@/lib/db/types";
import { EVENT_FORMATS } from "@/lib/db/types";
import { toDatetimeLocalInput } from "@/lib/format";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: Partial<Event>;
  series: Pick<EventSeries, "id" | "name">[];
  cancelHref: string;
  submitLabel: string;
};

const INITIAL: FormState = { ok: true };

export function EventForm({
  action,
  initial = {},
  series,
  cancelHref,
  submitLabel,
}: Props) {
  const [state, formAction] = useActionState(action, INITIAL);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      <Field
        label="Event name"
        htmlFor="name"
        required
        error={state.fieldErrors?.name}
      >
        <Input
          id="name"
          name="name"
          required
          autoFocus
          defaultValue={initial.name ?? ""}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Starts at"
          htmlFor="starts_at"
          required
          error={state.fieldErrors?.starts_at}
          hint="Local time (your browser timezone)"
        >
          <Input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            required
            defaultValue={toDatetimeLocalInput(initial.starts_at)}
          />
        </Field>
        <Field label="Ends at" htmlFor="ends_at" hint="Optional">
          <Input
            id="ends_at"
            name="ends_at"
            type="datetime-local"
            defaultValue={toDatetimeLocalInput(initial.ends_at)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Series" htmlFor="series_id">
          <Select
            id="series_id"
            name="series_id"
            defaultValue={initial.series_id ?? ""}
          >
            <option value="">— None —</option>
            {series.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Format" htmlFor="format">
          <Select id="format" name="format" defaultValue={initial.format ?? ""}>
            <option value="">— Select —</option>
            {EVENT_FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Location" htmlFor="location">
        <Input
          id="location"
          name="location"
          placeholder="Address, room, or video link"
          defaultValue={initial.location ?? ""}
        />
      </Field>

      <Field label="Description" htmlFor="description">
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initial.description ?? ""}
        />
      </Field>

      <Field label="Internal notes" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={3} defaultValue={initial.notes ?? ""} />
      </Field>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton label={submitLabel} />
        <Link
          href={cancelHref}
          className="text-sm font-medium text-ink-muted hover:text-nau-navy"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}
