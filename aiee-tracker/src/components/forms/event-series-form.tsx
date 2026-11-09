"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import type { EventSeries, FormState } from "@/lib/db/types";
import { SERIES_CADENCES } from "@/lib/db/types";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: Partial<EventSeries>;
  cancelHref: string;
  submitLabel: string;
};

const INITIAL: FormState = { ok: true };

export function EventSeriesForm({
  action,
  initial = {},
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
        label="Series name"
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
          placeholder="Monthly Coalition Convening"
        />
      </Field>

      <Field label="Cadence" htmlFor="cadence">
        <Select id="cadence" name="cadence" defaultValue={initial.cadence ?? ""}>
          <option value="">— Select —</option>
          {SERIES_CADENCES.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Description" htmlFor="description">
        <Textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={initial.description ?? ""}
        />
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
