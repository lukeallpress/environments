"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import type { Contact, FormState } from "@/lib/db/types";
import { CONTACT_STATUSES } from "@/lib/db/types";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  initial?: Partial<Contact>;
  cancelHref: string;
  submitLabel: string;
};

const INITIAL: FormState = { ok: true };

export function ContactForm({ action, initial = {}, cancelHref, submitLabel }: Props) {
  const [state, formAction] = useActionState(action, INITIAL);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="First name"
          htmlFor="first_name"
          required
          error={state.fieldErrors?.first_name}
        >
          <Input
            id="first_name"
            name="first_name"
            required
            defaultValue={initial.first_name ?? ""}
            autoFocus
          />
        </Field>
        <Field
          label="Last name"
          htmlFor="last_name"
          required
          error={state.fieldErrors?.last_name}
        >
          <Input
            id="last_name"
            name="last_name"
            required
            defaultValue={initial.last_name ?? ""}
          />
        </Field>
      </div>

      <Field label="Title" htmlFor="title">
        <Input
          id="title"
          name="title"
          placeholder="Superintendent, Board Chair, …"
          defaultValue={initial.title ?? ""}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Email" htmlFor="email" error={state.fieldErrors?.email}>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            defaultValue={initial.email ?? ""}
          />
        </Field>
        <Field label="Phone" htmlFor="phone">
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            defaultValue={initial.phone ?? ""}
          />
        </Field>
      </div>

      <Field
        label="Role tags"
        htmlFor="role_tags"
        hint="Comma-separated. e.g. superintendent, board-member"
      >
        <Input
          id="role_tags"
          name="role_tags"
          defaultValue={(initial.role_tags ?? []).join(", ")}
        />
      </Field>

      <Field label="Status" htmlFor="status">
        <Select
          id="status"
          name="status"
          defaultValue={initial.status ?? "active"}
        >
          {CONTACT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
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
