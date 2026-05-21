"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteInteraction } from "../actions";

export function DeleteInteractionButton({ id }: { id: string }) {
  const [pending, setPending] = useState(false);
  return (
    <form
      action={async (formData) => {
        if (!window.confirm("Delete this interaction? This can't be undone.")) return;
        setPending(true);
        await deleteInteraction(formData);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="danger" disabled={pending}>
        {pending ? "Deleting…" : "Delete"}
      </Button>
    </form>
  );
}
