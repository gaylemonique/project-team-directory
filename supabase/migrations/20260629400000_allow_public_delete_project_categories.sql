-- Allow deleting project categories from the landing page.

create policy "Allow public delete on project_categories"
  on project_categories for delete
  using (true);
