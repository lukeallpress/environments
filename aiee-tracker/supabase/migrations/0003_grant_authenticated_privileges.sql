-- Grant table-level privileges to the authenticated role.
--
-- This was missing from 0001. Row-level security filters which ROWS an
-- authenticated user can see, but the role still needs table-level GRANTs
-- to touch the table at all. Without these, every authenticated query hits
-- "permission denied" before RLS even gets a chance to evaluate.
--
-- Idempotent: re-running is a no-op. (0001 has also been updated to include
-- these grants, so fresh installs don't need to apply 0003 separately, but
-- doing so is harmless.)

do $$
declare t text;
begin
  foreach t in array array[
    'staff_allowlist','organizations','contacts','event_series','events',
    'event_attendance','interactions','tags','tag_links','audit_log',
    'engagement_weights'
  ] loop
    execute format(
      'grant select, insert, update, delete on %I to authenticated;', t
    );
  end loop;
end $$;

-- bigserial columns rely on a sequence; INSERT needs USAGE on it.
grant usage, select on all sequences in schema public to authenticated;

-- Defense in depth — default privileges already allow this, but explicit
-- helps anyone reading the migration history.
grant execute on function is_staff() to authenticated;
