"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteEvent } from "../actions";

export function DeleteEventButton({ id, name }: { id: string; name: string }) {
  const [pending, setPending] = useState(false);
  return (
    <form
      action={async (formData) => {
        const ok = window.confirm(
          `Delete event "${name}"? Attendance records will also be removed. This can't be undone.`
        );
        if (!ok) return;
        setPending(true);
        await deleteEvent(formData);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="danger" disabled={pending}>
        {pending ? "Deleting…" : "Delete"}
      </Button>
    </form>
  );
}
