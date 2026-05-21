-- Add an array `tags` column to organizations for ad-hoc affiliations like
-- "AZ AI Alliance", "Steering Committee", etc. Mirrors the existing
-- contacts.role_tags shape so the same parser/UI patterns apply.

alter table organizations
  add column if not exists tags text[] not null default '{}';

create index if not exists organizations_tags_idx
  on organizations using gin (tags);
