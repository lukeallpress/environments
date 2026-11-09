"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  fieldError,
  generalError,
  getCurrentUserOrRedirect,
  str,
} from "@/lib/db/actions-helpers";
import type { FormState, InteractionTargetType } from "@/lib/db/types";

// datetime-local → ISO with timezone for timestamptz storage.
function toIsoLocal(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

// Form sends target as "org:uuid" or "contact:uuid"; split it.
function parseTarget(
  raw: string | null
): { target_type: InteractionTargetType; target_id: string } | null {
  if (!raw) return null;
  const [type, id] = raw.split(":");
  if ((type !== "org" && type !== "contact") || !id) return null;
  return { target_type: type, target_id: id };
}

function revalidateForTarget(target_type: InteractionTargetType, target_id: string) {
  revalidatePath("/interactions");
  if (target_type === "org") revalidatePath(`/orgs/${target_id}`);
  if (target_type === "contact") revalidatePath(`/contacts/${target_id}`);
}

export async function createInteraction(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { supabase, user } = await getCurrentUserOrRedirect();

  const target = parseTarget(str(formData, "target"));
  const summary = str(formData, "summary");
  const occurredAtRaw = str(formData, "occurred_at");
  const errors: Record<string, string> = {};
  if (!target) errors.target = "Pick an organization or contact.";
  if (!summary) errors.summary = "Summary is required.";
  if (!occurredAtRaw) errors.occurred_at = "Required.";
  if (Object.keys(errors).length) return fieldError(errors);

  const { data, error } = await supabase
    .from("interactions")
    .insert({
      target_type: target!.target_type,
      target_id: target!.target_id,
      occurred_at: toIsoLocal(occurredAtRaw),
      channel: str(formData, "channel") ?? "other",
      summary: summary!,
      follow_up_at: toIsoLocal(str(formData, "follow_up_at")),
      authored_by: user.id,
    })
    .select("id")
    .single();

  if (error) return generalError(error.message);

  revalidateForTarget(target!.target_type, target!.target_id);
  redirect(`/interactions/${data.id}`);
}

export async function updateInteraction(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { supabase } = await getCurrentUserOrRedirect();

  const target = parseTarget(str(formData, "target"));
  const summary = str(formData, "summary");
  const occurredAtRaw = str(formData, "occurred_at");
  const errors: Record<string, string> = {};
  if (!target) errors.target = "Pick an organization or contact.";
  if (!summary) errors.summary = "Summary is required.";
  if (!occurredAtRaw) errors.occurred_at = "Required.";
  if (Object.keys(errors).length) return fieldError(errors);

  const { error } = await supabase
    .from("interactions")
    .update({
      target_type: target!.target_type,
      target_id: target!.target_id,
      occurred_at: toIsoLocal(occurredAtRaw),
      channel: str(formData, "channel") ?? "other",
      summary: summary!,
      follow_up_at: toIsoLocal(str(formData, "follow_up_at")),
    })
    .eq("id", id);

  if (error) return generalError(error.message);

  revalidateForTarget(target!.target_type, target!.target_id);
  revalidatePath(`/interactions/${id}`);
  redirect(`/interactions/${id}`);
}

export async function deleteInteraction(formData: FormData): Promise<void> {
  const { supabase } = await getCurrentUserOrRedirect();
  const id = String(formData.get("id"));
  if (!id) return;

  // Read first so we can revalidate the right target path.
  const { data: existing } = await supabase
    .from("interactions")
    .select("target_type, target_id")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("interactions").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (existing) {
    revalidateForTarget(
      existing.target_type as InteractionTargetType,
      existing.target_id
    );
  } else {
    revalidatePath("/interactions");
  }
  redirect("/interactions");
}

export async function clearFollowUp(formData: FormData): Promise<void> {
  const { supabase } = await getCurrentUserOrRedirect();
  const id = String(formData.get("id"));
  if (!id) return;

  const { data: existing } = await supabase
    .from("interactions")
    .select("target_type, target_id")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("interactions")
    .update({ follow_up_at: null })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard");
  revalidatePath("/interactions");
  if (existing) {
    revalidateForTarget(
      existing.target_type as InteractionTargetType,
      existing.target_id
    );
  }
}
