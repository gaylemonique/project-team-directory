-- Restore open anon storage policies for the demo team directory app.
-- Remote project had owner-based storage policies that require auth.uid() as the
-- upload folder, but the app uploads to {team_member_id}/{timestamp}.ext without auth.

drop policy if exists "Authenticated upload own team member photos" on storage.objects;
drop policy if exists "Authenticated update own team member photos" on storage.objects;
drop policy if exists "Authenticated delete own team member photos" on storage.objects;
drop policy if exists "Public read team member photos" on storage.objects;
drop policy if exists "Public upload team member photos" on storage.objects;
drop policy if exists "Public update team member photos" on storage.objects;
drop policy if exists "Public delete team member photos" on storage.objects;

create policy "Public read team member photos"
  on storage.objects for select
  using (bucket_id = 'team-member-photos');

create policy "Public upload team member photos"
  on storage.objects for insert
  with check (bucket_id = 'team-member-photos');

create policy "Public update team member photos"
  on storage.objects for update
  using (bucket_id = 'team-member-photos')
  with check (bucket_id = 'team-member-photos');

create policy "Public delete team member photos"
  on storage.objects for delete
  using (bucket_id = 'team-member-photos');
