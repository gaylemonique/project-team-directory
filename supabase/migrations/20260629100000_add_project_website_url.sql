-- Add optional website link for each project area.

alter table project_categories
  add column if not exists website_url text;
