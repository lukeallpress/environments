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

// ---------- Phase 2: events & attendance ---------------------------------

export type EventFormat = "in-person" | "virtual" | "hybrid";
export type AttendanceStatus =
  | "invited"
  | "registered"
  | "attended"
  | "no-show"
  | "declined";

export type EventSeries = {
  id: string;
  name: string;
  description: string | null;
  cadence: string | null;
  owner_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Event = {
  id: string;
  series_id: string | null;
  name: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  format: EventFormat | null;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
};

export type EventAttendance = {
  event_id: string;
  contact_id: string;
  status: AttendanceStatus;
  role_at_event: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  recorded_by: string | null;
};

export const EVENT_FORMATS: { value: EventFormat; label: string }[] = [
  { value: "in-person", label: "In person" },
  { value: "virtual", label: "Virtual" },
  { value: "hybrid", label: "Hybrid" },
];

export const ATTENDANCE_STATUSES: {
  value: AttendanceStatus;
  label: string;
  short: string;
}[] = [
  { value: "invited", label: "Invited", short: "Inv" },
  { value: "registered", label: "Registered", short: "Reg" },
  { value: "attended", label: "Attended", short: "Att" },
  { value: "no-show", label: "No-show", short: "NS" },
  { value: "declined", label: "Declined", short: "Dec" },
];

export const SERIES_CADENCES = [
  "one-off",
  "monthly",
  "quarterly",
  "annual",
  "other",
] as const;
