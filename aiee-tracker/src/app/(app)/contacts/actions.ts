"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  fieldError,
  generalError,
  getCurrentUserOrRedirect,
  parseTags,
  str,
} from "@/lib/db/actions-helpers";
import type { FormState } from "@/lib/db/types";

export async function createContact(
  orgId: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { supabase, user } = await getCurrentUserOrRedirect();

  const first_name = str(formData, "first_name");
  const last_name = str(formData, "last_name");
  const errors: Record<string, string> = {};
  if (!first_name) errors.first_name = "Required.";
  if (!last_name) errors.last_name = "Required.";
  if (Object.keys(errors).length) return fieldError(errors);

  const { data, error } = await supabase
    .from("contacts")
    .insert({
      org_id: orgId,
      first_name: first_name!,
      last_name: last_name!,
      title: str(formData, "title"),
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      role_tags: parseTags(str(formData, "role_tags")),
      status: str(formData, "status") ?? "active",
      notes: str(formData, "notes"),
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return generalError(error.message);

  revalidatePath(`/orgs/${orgId}`);
  revalidatePath("/contacts");
  redirect(`/contacts/${data.id}`);
}

export async function updateContact(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { supabase } = await getCurrentUserOrRedirect();

  const first_name = str(formData, "first_name");
  const last_name = str(formData, "last_name");
  const errors: Record<string, string> = {};
  if (!first_name) errors.first_name = "Required.";
  if (!last_name) errors.last_name = "Required.";
  if (Object.keys(errors).length) return fieldError(errors);

  const { data: updated, error } = await supabase
    .from("contacts")
    .update({
      first_name: first_name!,
      last_name: last_name!,
      title: str(formData, "title"),
      email: str(formData, "email"),
      phone: str(formData, "phone"),
      role_tags: parseTags(str(formData, "role_tags")),
      status: str(formData, "status") ?? "active",
      notes: str(formData, "notes"),
    })
    .eq("id", id)
    .select("org_id")
    .single();

  if (error) return generalError(error.message);

  revalidatePath(`/contacts/${id}`);
  revalidatePath("/contacts");
  if (updated?.org_id) revalidatePath(`/orgs/${updated.org_id}`);
  redirect(`/contacts/${id}`);
}

export async function deleteContact(formData: FormData): Promise<void> {
  const { supabase } = await getCurrentUserOrRedirect();
  const id = String(formData.get("id"));
  if (!id) return;

  const { data: existing } = await supabase
    .from("contacts")
    .select("org_id")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) {
    throw new Error(`Failed to delete contact: ${error.message}`);
  }
  revalidatePath("/contacts");
  if (existing?.org_id) {
    revalidatePath(`/orgs/${existing.org_id}`);
    redirect(`/orgs/${existing.org_id}`);
  }
  redirect("/contacts");
}
