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

export async function createOrganization(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { supabase, user } = await getCurrentUserOrRedirect();

  const name = str(formData, "name");
  if (!name) return fieldError({ name: "Name is required." });

  const { data, error } = await supabase
    .from("organizations")
    .insert({
      name,
      type: str(formData, "type"),
      district: str(formData, "district"),
      county: str(formData, "county"),
      address: str(formData, "address"),
      website: str(formData, "website"),
      status: str(formData, "status") ?? "active",
      tags: parseTags(str(formData, "tags")),
      notes: str(formData, "notes"),
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return generalError(error.message);

  revalidatePath("/orgs");
  redirect(`/orgs/${data.id}`);
}

export async function updateOrganization(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { supabase } = await getCurrentUserOrRedirect();

  const name = str(formData, "name");
  if (!name) return fieldError({ name: "Name is required." });

  const { error } = await supabase
    .from("organizations")
    .update({
      name,
      type: str(formData, "type"),
      district: str(formData, "district"),
      county: str(formData, "county"),
      address: str(formData, "address"),
      website: str(formData, "website"),
      status: str(formData, "status") ?? "active",
      tags: parseTags(str(formData, "tags")),
      notes: str(formData, "notes"),
    })
    .eq("id", id);

  if (error) return generalError(error.message);

  revalidatePath("/orgs");
  revalidatePath(`/orgs/${id}`);
  redirect(`/orgs/${id}`);
}

export async function deleteOrganization(formData: FormData): Promise<void> {
  const { supabase } = await getCurrentUserOrRedirect();
  const id = String(formData.get("id"));
  if (!id) return;

  const { error } = await supabase.from("organizations").delete().eq("id", id);
  if (error) {
    throw new Error(`Failed to delete organization: ${error.message}`);
  }
  revalidatePath("/orgs");
  redirect("/orgs");
}
