-- Track project edits for recency sorting.

alter table project_categories
  add column if not exists updated_at timestamptz;

update project_categories
  set updated_at = created_at
  where updated_at is null;

alter table project_categories
  alter column updated_at set default now();
