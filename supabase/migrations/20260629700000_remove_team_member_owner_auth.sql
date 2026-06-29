-- Remove auth requirement for creating team member profiles.
-- The owner trigger blocked anonymous inserts with "Authentication required to create a profile".

drop trigger if exists team_members_set_owner on public.team_members;
drop function if exists public.set_team_member_owner();
