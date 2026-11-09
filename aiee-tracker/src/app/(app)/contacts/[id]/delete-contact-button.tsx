"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteContact } from "../actions";

export function DeleteContactButton({ id, name }: { id: string; name: string }) {
  const [pending, setPending] = useState(false);

  return (
    <form
      action={async (formData) => {
        const ok = window.confirm(`Delete contact "${name}"? This can't be undone.`);
        if (!ok) return;
        setPending(true);
        await deleteContact(formData);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="danger" disabled={pending}>
        {pending ? "Deleting…" : "Delete"}
      </Button>
    </form>
  );
}
