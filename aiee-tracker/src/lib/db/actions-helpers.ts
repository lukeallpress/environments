import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "./types";

// Resolves the signed-in user. Redirects to /login if there isn't one — the
// proxy should have already done this, but server actions can be called from
// edge cases.
export async function getCurrentUserOrRedirect() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export function fieldError(fields: Record<string, string>): FormState {
  return { ok: false, fieldErrors: fields };
}

export function generalError(message: string): FormState {
  return { ok: false, error: message };
}

// Convert a FormData entry to a trimmed string, or null when blank.
export function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed === "" ? null : trimmed;
}

// Like str(), but throws if required and missing. Use in actions paired with
// fieldError().
export function requireStr(formData: FormData, key: string): string | null {
  return str(formData, key);
}

// Parse the role_tags comma/space-separated input into a clean array.
export function parseTags(input: string | null): string[] {
  if (!input) return [];
  return Array.from(
    new Set(
      input
        .split(/[,\n]/)
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}
