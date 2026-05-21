"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Select } from "@/components/ui/field";
import type { FormState, Interaction } from "@/lib/db/types";
import { INTERACTION_CHANNELS } from "@/lib/db/types";
import { toDatetimeLocalInput } from "@/lib/format";

type OrgOpt = { id: string; name: string };
type ContactOpt = { id: string; first_name: string; last_name: string; org_name: string | null };

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  orgs: OrgOpt[];
  contacts: ContactOpt[];
  initial?: Partial<Interaction>;
  initialTargetValue?: string; // "org:uuid" or "contact:uuid"
  cancelHref: string;
  submitLabel: string;
};

const INITIAL: FormState = { ok: true };

export function InteractionForm({
  action,
  orgs,
  contacts,
  initial = {},
  initialTargetValue,
  cancelHref,
  submitLabel,
}: Props) {
  const [state, formAction] = useActionState(action, INITIAL);

  const targetDefault =
    initialTargetValue ??
    (initial.target_type && initial.target_id
      ? `${initial.target_type}:${initial.target_id}`
      : "");

  // Default occurred_at: current row, or now() rounded to the minute.
  const occurredDefault =
    toDatetimeLocalInput(initial.occurred_at) ||
    toDatetimeLocalInput(new Date().toISOString());

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-danger">
          {state.error}
        </div>
      )}

      <Field
        label="With"
        htmlFor="target"
        required
        hint="Pick the org or contact this touchpoint was with."
        error={state.fieldErrors?.target}
      >
        <Select id="target" name="target" required defaultValue={targetDefault} autoFocus>
          <option value="">— Select —</option>
          <optgroup label="Organizations">
            {orgs.map((o) => (
              <option key={o.id} value={`org:${o.id}`}>
                {o.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Contacts">
            {contacts.map((c) => (
              <option key={c.id} value={`contact:${c.id}`}>
                {c.first_name} {c.last_name}
                {c.org_name ? ` — ${c.org_name}` : ""}
              </option>
            ))}
          </optgroup>
        </Select>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="When"
          htmlFor="occurred_at"
          required
          error={state.fieldErrors?.occurred_at}
        >
          <Input
            id="occurred_at"
            name="occurred_at"
            type="datetime-local"
            required
            defaultValue={occurredDefault}
          />
        </Field>
        <Field label="Channel" htmlFor="channel" required>
          <Select
            id="channel"
            name="channel"
            required
            defaultValue={initial.channel ?? "in-person"}
          >
            {INTERACTION_CHANNELS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="Summary"
        htmlFor="summary"
        required
        hint="What happened? Anything memorable from the conversation."
        error={state.fieldErrors?.summary}
      >
        <Textarea
          id="summary"
          name="summary"
          rows={5}
          required
          defaultValue={initial.summary ?? ""}
        />
      </Field>

      <Field
        label="Follow up by"
        htmlFor="follow_up_at"
        hint="Optional — set a date and this'll show up on the dashboard's follow-up list."
      >
        <Input
          id="follow_up_at"
          name="follow_up_at"
          type="datetime-local"
          defaultValue={toDatetimeLocalInput(initial.follow_up_at)}
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
