"use client";

import { Button } from "@/components/ui/button";
import { deleteOrganization } from "../actions";
import { useState } from "react";

export function DeleteOrgButton({ id, name }: { id: string; name: string }) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async (formData) => {
        const ok = window.confirm(
          `Delete "${name}"? This will also delete all of its contacts. This can't be undone.`
        );
        if (!ok) return;
        setPending(true);
        await deleteOrganization(formData);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="danger" disabled={pending}>
        {pending ? "Deleting…" : "Delete"}
      </Button>
    </form>
  );
}
