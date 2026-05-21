// Hand-written row types matching the Supabase schema. Eventually swap for
// types generated via `supabase gen types typescript` once we wire up the CLI.

export type OrgStatus = "active" | "inactive" | "prospect";
export type ContactStatus = "active" | "inactive";

export type Organization = {
  id: string;
  name: string;
  type: string | null;
  district: string | null;
  county: string | null;
  address: string | null;
  website: string | null;
  status: OrgStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export type Contact = {
  id: string;
  org_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  role_tags: string[];
  status: ContactStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

// Enum lists used by selects.
export const ORG_TYPES = [
  "district",
  "charter",
  "nonprofit",
  "agency",
  "industry",
  "other",
] as const;

export const ORG_STATUSES: { value: OrgStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "prospect", label: "Prospect" },
  { value: "inactive", label: "Inactive" },
];

export const CONTACT_STATUSES: { value: ContactStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export type FormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};
