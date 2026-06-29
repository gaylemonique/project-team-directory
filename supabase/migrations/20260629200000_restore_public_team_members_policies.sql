-- Restore open anon CRUD policies for the demo team directory app.
-- Remote project had owner-based policies that block unauthenticated updates (HTTP 406).

drop policy if exists "Authenticated users can insert team_members" on team_members;
drop policy if exists "Owners can update team_members" on team_members;
drop policy if exists "Owners can delete team_members" on team_members;
drop policy if exists "Allow public insert on team_members" on team_members;
drop policy if exists "Allow public update on team_members" on team_members;
drop policy if exists "Allow public delete on team_members" on team_members;

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
