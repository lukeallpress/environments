"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  fieldError,
  generalError,
  getCurrentUserOrRedirect,
  str,
} from "@/lib/db/actions-helpers";
import type { AttendanceStatus, FormState } from "@/lib/db/types";

// datetime-local inputs come as "YYYY-MM-DDTHH:MM" with no timezone. We
// interpret them as the user's local time and convert to an ISO string with
// timezone offset for storage as timestamptz.
function toIsoLocal(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export async function createEvent(
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { supabase, user } = await getCurrentUserOrRedirect();

  const name = str(formData, "name");
  const startsAtRaw = str(formData, "starts_at");
  const errors: Record<string, string> = {};
  if (!name) errors.name = "Required.";
  if (!startsAtRaw) errors.starts_at = "Required.";
  if (Object.keys(errors).length) return fieldError(errors);

  const { data, error } = await supabase
    .from("events")
    .insert({
      name: name!,
      starts_at: toIsoLocal(startsAtRaw),
      ends_at: toIsoLocal(str(formData, "ends_at")),
      series_id: str(formData, "series_id"),
      format: str(formData, "format"),
      location: str(formData, "location"),
      description: str(formData, "description"),
      notes: str(formData, "notes"),
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return generalError(error.message);

  revalidatePath("/events");
  redirect(`/events/${data.id}`);
}

export async function updateEvent(
  id: string,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { supabase } = await getCurrentUserOrRedirect();

  const name = str(formData, "name");
  const startsAtRaw = str(formData, "starts_at");
  const errors: Record<string, string> = {};
  if (!name) errors.name = "Required.";
  if (!startsAtRaw) errors.starts_at = "Required.";
  if (Object.keys(errors).length) return fieldError(errors);

  const { error } = await supabase
    .from("events")
    .update({
      name: name!,
      starts_at: toIsoLocal(startsAtRaw),
      ends_at: toIsoLocal(str(formData, "ends_at")),
      series_id: str(formData, "series_id"),
      format: str(formData, "format"),
      location: str(formData, "location"),
      description: str(formData, "description"),
      notes: str(formData, "notes"),
    })
    .eq("id", id);

  if (error) return generalError(error.message);

  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  redirect(`/events/${id}`);
}

export async function deleteEvent(formData: FormData): Promise<void> {
  const { supabase } = await getCurrentUserOrRedirect();
  const id = String(formData.get("id"));
  if (!id) return;
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete event: ${error.message}`);
  revalidatePath("/events");
  redirect("/events");
}

// ---------- attendance --------------------------------------------------

export async function addAttendees(
  eventId: string,
  contactIds: string[]
): Promise<void> {
  const { supabase, user } = await getCurrentUserOrRedirect();
  if (contactIds.length === 0) return;

  const rows = contactIds.map((contact_id) => ({
    event_id: eventId,
    contact_id,
    status: "invited" as AttendanceStatus,
    recorded_by: user.id,
  }));

  // Upsert so re-adding an existing contact doesn't error out, just leaves them
  // at their current status.
  const { error } = await supabase
    .from("event_attendance")
    .upsert(rows, { onConflict: "event_id,contact_id", ignoreDuplicates: true });
  if (error) throw new Error(error.message);

  revalidatePath(`/events/${eventId}`);
}

export async function setAttendanceStatus(
  eventId: string,
  contactId: string,
  status: AttendanceStatus
): Promise<void> {
  const { supabase, user } = await getCurrentUserOrRedirect();
  const { error } = await supabase
    .from("event_attendance")
    .update({ status, recorded_by: user.id })
    .eq("event_id", eventId)
    .eq("contact_id", contactId);
  if (error) throw new Error(error.message);
  revalidatePath(`/events/${eventId}`);
}

export async function removeAttendee(formData: FormData): Promise<void> {
  const { supabase } = await getCurrentUserOrRedirect();
  const eventId = String(formData.get("event_id"));
  const contactId = String(formData.get("contact_id"));
  if (!eventId || !contactId) return;

  const { error } = await supabase
    .from("event_attendance")
    .delete()
    .eq("event_id", eventId)
    .eq("contact_id", contactId);
  if (error) throw new Error(error.message);
  revalidatePath(`/events/${eventId}`);
}
