"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteEventSeries } from "../../actions";

export function DeleteSeriesButton({ id, name }: { id: string; name: string }) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async (formData) => {
        const ok = window.confirm(
          `Delete series "${name}"? Existing events in this series will become unassigned (not deleted).`
        );
        if (!ok) return;
        setPending(true);
        await deleteEventSeries(formData);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="danger" disabled={pending}>
        {pending ? "Deleting…" : "Delete series"}
      </Button>
    </form>
  );
}
