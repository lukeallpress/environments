-- Make staff_allowlist email matching case-insensitive and trim-tolerant.
--
-- The original is_staff() function lowercased the caller's JWT email but
-- compared against staff_allowlist.email as stored. If a row was inserted
-- with any uppercase or surrounding whitespace, the policy returned false
-- for an otherwise valid user. This migration:
--   1. Normalizes any existing rows to trim()ed lowercase.
--   2. Adds a CHECK constraint so future rows are stored normalized.
--   3. Rewrites is_staff() to compare case-insensitively on both sides
--      (defense in depth even with the constraint).

update staff_allowlist
   set email = lower(trim(email))
 where email <> lower(trim(email));

alter table staff_allowlist drop constraint if exists staff_allowlist_email_normalized;
alter table staff_allowlist
  add constraint staff_allowlist_email_normalized
  check (email = lower(email) and email = trim(email));

create or replace function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from staff_allowlist sa
    where lower(sa.email) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
  );
$$;
