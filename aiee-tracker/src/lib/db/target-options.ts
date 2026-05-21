import { createClient } from "@/lib/supabase/server";

// Shared loader for the interaction form's "With" dropdown — orgs + contacts.
export async function loadTargetOptions() {
  const supabase = await createClient();
  const [orgsRes, contactsRes] = await Promise.all([
    supabase
      .from("organizations")
      .select("id, name")
      .eq("status", "active")
      .order("name"),
    supabase
      .from("contacts")
      .select("id, first_name, last_name, organizations:org_id ( name )")
      .eq("status", "active")
      .order("last_name"),
  ]);

  const orgs = (orgsRes.data ?? []).map((o) => ({ id: o.id, name: o.name }));
  const contacts = (contactsRes.data ?? []).map((c) => {
    const org = c.organizations as unknown as { name: string } | null;
    return {
      id: c.id,
      first_name: c.first_name,
      last_name: c.last_name,
      org_name: org?.name ?? null,
    };
  });

  return { orgs, contacts };
}
