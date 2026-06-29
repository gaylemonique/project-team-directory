-- Supabase Storage bucket for team member profile photos

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'team-member-photos',
  'team-member-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

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
