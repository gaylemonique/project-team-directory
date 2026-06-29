-- Allow editing project categories from the landing page.

create policy "Allow public update on project_categories"
  on project_categories for update
  using (true)
  with check (true);
