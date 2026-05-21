-- Seed data. Run AFTER 0001_init.sql.
--
-- Add real AIEE staff emails here. Emails MUST be lowercase and untrimmed
-- (the staff_allowlist_email_normalized check constraint enforces this).
-- Anyone not in this table will be denied sign-in even with a valid magic
-- link. You can also add/remove rows from the admin screen once that lands.

insert into staff_allowlist (email, display_name)
values
  (lower(trim('replace-me@nau.edu')), 'Replace Me')
on conflict (email) do nothing;
