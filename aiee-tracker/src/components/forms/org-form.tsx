"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import type { FormState, Organization } from "@/lib/db/types";
import { ORG_STATUSES, ORG_TYPES } from "@/lib/db/types";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: Partial<Organization>;
  cancelHref: string;
  submitLabel: string;
};

const INITIAL: FormState = { ok: true };

export function OrgForm({ action, initial = {}, cancelHref, submitLabel }: Props) {
  const [state, formAction] = useActionState(action, INITIAL);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      <Field
        label="Name"
        htmlFor="name"
        required
        error={state.fieldErrors?.name}
      >
        <Input
          id="name"
          name="name"
          required
          defaultValue={initial.name ?? ""}
          autoFocus
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Type" htmlFor="type" error={state.fieldErrors?.type}>
          <Select id="type" name="type" defaultValue={initial.type ?? ""}>
            <option value="">— Select —</option>
            {ORG_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Status" htmlFor="status" error={state.fieldErrors?.status}>
          <Select
            id="status"
            name="status"
            defaultValue={initial.status ?? "active"}
          >
            {ORG_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="District" htmlFor="district">
          <Input id="district" name="district" defaultValue={initial.district ?? ""} />
        </Field>
        <Field label="County" htmlFor="county">
          <Input id="county" name="county" defaultValue={initial.county ?? ""} />
        </Field>
      </div>

      <Field label="Website" htmlFor="website" error={state.fieldErrors?.website}>
        <Input
          id="website"
          name="website"
          type="url"
          inputMode="url"
          placeholder="https://"
          defaultValue={initial.website ?? ""}
        />
      </Field>

      <Field label="Address" htmlFor="address">
        <Input id="address" name="address" defaultValue={initial.address ?? ""} />
      </Field>

      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={4} defaultValue={initial.notes ?? ""} />
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
