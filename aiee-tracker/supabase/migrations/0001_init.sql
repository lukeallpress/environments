-- AIEE Coalition Tracker — initial schema.
-- Conventions:
--   * uuid primary keys, generated server-side
--   * timestamptz for all time columns
--   * created_at / updated_at on every row, plus a trigger to maintain updated_at
--   * row-level security ON for every table; staff (allowlisted users) can do
--     everything, anon cannot do anything

create extension if not exists "pgcrypto";

-- ---------- helpers --------------------------------------------------------

create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- core tables ----------------------------------------------------

create table staff_allowlist (
  email text primary key,
  display_name text,
  added_by uuid references auth.users(id),
  added_at timestamptz not null default now()
);

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text,                   -- district / charter / nonprofit / agency / industry / other
  district text,
  county text,
  address text,
  website text,
  status text not null default 'active', -- active / inactive / prospect
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);
create index on organizations (lower(name));
create index on organizations (county);
create index on organizations (district);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  title text,
  role_tags text[] not null default '{}', -- e.g. {"superintendent","board-member"}
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);
create index on contacts (org_id);
create index on contacts (lower(last_name), lower(first_name));
create index on contacts using gin (role_tags);

create table event_series (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  cadence text,                 -- one-off / monthly / quarterly / annual / other
  owner_user_id uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table events (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references event_series(id) on delete set null,
  name text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  format text,                  -- in-person / virtual / hybrid
  description text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);
create index on events (starts_at desc);
create index on events (series_id);

create table event_attendance (
  event_id uuid not null references events(id) on delete cascade,
  contact_id uuid not null references contacts(id) on delete cascade,
  status text not null default 'invited',  -- invited / registered / attended / no-show / declined
  role_at_event text,                       -- attendee / speaker / host / panelist / ...
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  recorded_by uuid references auth.users(id),
  primary key (event_id, contact_id)
);
create index on event_attendance (contact_id);
create index on event_attendance (status);

create table interactions (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('org','contact')),
  target_id uuid not null,
  occurred_at timestamptz not null default now(),
  channel text not null,        -- in-person / video / phone / email / text / other
  summary text not null,
  follow_up_at timestamptz,
  authored_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on interactions (target_type, target_id, occurred_at desc);
create index on interactions (follow_up_at) where follow_up_at is not null;

create table tags (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  color text                    -- optional hex
);

create table tag_links (
  tag_id uuid not null references tags(id) on delete cascade,
  target_type text not null check (target_type in ('org','contact','event')),
  target_id uuid not null,
  primary key (tag_id, target_type, target_id)
);
create index on tag_links (target_type, target_id);

create table audit_log (
  id bigserial primary key,
  actor uuid references auth.users(id),
  action text not null,         -- insert / update / delete
  table_name text not null,
  row_id text,
  diff jsonb,
  at timestamptz not null default now()
);
create index on audit_log (table_name, row_id);
create index on audit_log (actor, at desc);

-- Engagement scoring weights — editable from the admin screen later, so the
-- formula stays out of the code.
create table engagement_weights (
  key text primary key,
  value numeric not null,
  description text
);

insert into engagement_weights (key, value, description) values
  ('interaction.in-person', 5,  'Points per in-person meeting'),
  ('interaction.video',     3,  'Points per video call'),
  ('interaction.phone',     2,  'Points per phone call'),
  ('interaction.email',     1,  'Points per email exchange'),
  ('interaction.text',      0.5,'Points per text or quick touch'),
  ('event.multi-day',      10,  'Points per multi-day convening attended'),
  ('event.half-day-plus',   5,  'Points per half-day+ in-person event attended'),
  ('event.virtual',         3,  'Points per virtual event attended'),
  ('event.no-show',        -1,  'Penalty for invited-but-no-show'),
  ('decay.half-life-days', 180, 'Time-decay half-life, in days');

-- ---------- updated_at triggers --------------------------------------------

do $$
declare t text;
begin
  foreach t in array array[
    'organizations','contacts','event_series','events',
    'event_attendance','interactions'
  ] loop
    execute format(
      'create trigger %I_set_updated_at before update on %I for each row execute function set_updated_at();',
      t, t
    );
  end loop;
end $$;

-- ---------- staff check function ------------------------------------------
-- Defined here, after staff_allowlist exists, because SQL-language function
-- bodies are validated against the catalog at CREATE time.

create or replace function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from staff_allowlist sa
    where sa.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------- row-level security --------------------------------------------

alter table staff_allowlist     enable row level security;
alter table organizations       enable row level security;
alter table contacts            enable row level security;
alter table event_series        enable row level security;
alter table events              enable row level security;
alter table event_attendance    enable row level security;
alter table interactions        enable row level security;
alter table tags                enable row level security;
alter table tag_links           enable row level security;
alter table audit_log           enable row level security;
alter table engagement_weights  enable row level security;

-- Staff-only access on everything. (One role for now; tighten later if needed.)
do $$
declare t text;
begin
  foreach t in array array[
    'staff_allowlist','organizations','contacts','event_series','events',
    'event_attendance','interactions','tags','tag_links','audit_log',
    'engagement_weights'
  ] loop
    execute format($f$
      create policy "%1$s_staff_select" on %1$I for select to authenticated using (is_staff());
      create policy "%1$s_staff_insert" on %1$I for insert to authenticated with check (is_staff());
      create policy "%1$s_staff_update" on %1$I for update to authenticated using (is_staff()) with check (is_staff());
      create policy "%1$s_staff_delete" on %1$I for delete to authenticated using (is_staff());
    $f$, t);
  end loop;
end $$;
