-- Project Team Directory schema
-- Run this migration in your Supabase sandbox project (SQL Editor or supabase db push).

create table if not exists project_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  team_lead text,
  created_at timestamptz default now()
);

create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  project_category_id uuid references project_categories(id) on delete set null,
  name text not null,
  role text not null,
  photo_url text,
  project_assignment text,
  favorite_stack text,
  current_focus text,
  learning_goal text,
  fun_fact text,
  profile_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table project_categories enable row level security;
alter table team_members enable row level security;

create policy "Allow public read on project_categories"
  on project_categories for select
  using (true);

create policy "Allow public read on team_members"
  on team_members for select
  using (true);

create policy "Allow public insert on team_members"
  on team_members for insert
  with check (true);

create policy "Allow public update on team_members"
  on team_members for update
  using (true)
  with check (true);

create policy "Allow public delete on team_members"
  on team_members for delete
  using (true);

insert into project_categories (name, description, team_lead)
values
  ('HR Systems', 'Attendance, leave management, payroll, employee records, and HRIS core features.', 'Lawrence P. Babelonia'),
  ('Website / Landing Pages', 'Marketing websites, landing pages, and public-facing web experiences.', null),
  ('Automation / Internal Tools', 'Internal dashboards, workflow tools, and operational automation.', null),
  ('Mobile App', 'Mobile-first features and app experiences.', null),
  ('DevOps / Infrastructure', 'Deployment, server management, CI/CD, monitoring, and infrastructure.', null),
  ('QA / Testing', 'Manual testing, automated testing, bug reports, and quality assurance.', null),
  ('Design / UI', 'User interface design, component systems, and product experience.', null)
on conflict (name) do nothing;
