-- Allow creating new project categories from the team directory form.

create policy "Allow public insert on project_categories"
  on project_categories for insert
  with check (true);
