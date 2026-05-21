-- Seed data. Run AFTER 0001_init.sql.
--
-- Add real AIEE staff emails here, lowercase. Anyone not in this table will be
-- denied sign-in even with a valid magic link. You can also add/remove rows
-- from the admin screen once the app is up.

insert into staff_allowlist (email, display_name) values
  ('replace-me@nau.edu', 'Replace Me')
on conflict (email) do nothing;
