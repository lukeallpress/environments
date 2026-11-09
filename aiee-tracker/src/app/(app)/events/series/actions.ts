"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  fieldError,
  generalError,
  getCurrentUserOrRedirect,
  str,
} from "@/lib/db/actions-helpers";
import type { FormState } from "@/lib/db/types";

export async function createEventSeries(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { supabase, user } = await getCurrentUserOrRedirect();

  const name = str(formData, "name");
  if (!name) return fieldError({ name: "Required." });

  const { error } = await supabase.from("event_series").insert({
    name,
    cadence: str(formData, "cadence"),
    description: str(formData, "description"),
    owner_user_id: user.id,
  });

  if (error) return generalError(error.message);

  revalidatePath("/events");
  revalidatePath("/events/series");
  redirect(`/events/series`);
}

export async function updateEventSeries(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { supabase } = await getCurrentUserOrRedirect();

  const name = str(formData, "name");
  if (!name) return fieldError({ name: "Required." });

  const { error } = await supabase
    .from("event_series")
    .update({
      name,
      cadence: str(formData, "cadence"),
      description: str(formData, "description"),
    })
    .eq("id", id);

  if (error) return generalError(error.message);

  revalidatePath("/events");
  revalidatePath("/events/series");
  redirect("/events/series");
}

export async function deleteEventSeries(formData: FormData): Promise<void> {
  const { supabase } = await getCurrentUserOrRedirect();
  const id = String(formData.get("id"));
  if (!id) return;

  // Events FK is ON DELETE SET NULL, so events under this series will become
  // unassigned rather than deleted.
  const { error } = await supabase.from("event_series").delete().eq("id", id);
  if (error) {
    throw new Error(`Failed to delete series: ${error.message}`);
  }
  revalidatePath("/events");
  revalidatePath("/events/series");
  redirect("/events/series");
}
