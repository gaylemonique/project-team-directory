## What I built

- Built the Project Team Directory at `/team-directory`.
- Added full create, read, update, delete, and category filtering.

## How I structured the app

- Page: `app/team-directory/page.tsx` renders `TeamDirectoryView`
- Components: `TeamDirectoryHeader`, `ProjectCategoryFilter`, `TeamMemberForm`, `TeamMemberCard`, `EmptyState` in `components/team-directory/`
- Supabase client: `lib/supabase/client.ts` using public anon key only
- Types: `types/team-directory.ts`

## How the CRUD flow works

- Create: validated form inserts into `team_members` and prepends the new card
- Read: categories and members load on mount with joined category data
- Update: Edit loads form state; save updates Supabase and refreshes the card in place
- Delete: confirmation dialog; confirm removes row and updates local state

## How Supabase is used

- Tables: `project_categories`, `team_members`
- Relationship: `team_members.project_category_id` references `project_categories`
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## What was challenging

- Handling all required UI states (loading, empty, filtered empty, validation, saving, deleting) in a single cohesive page without over-complicating the component tree.

## What I would improve next

- Server-side data fetching with optimistic updates and toast feedback for actions.

## Testing

- [x] `npm run lint`
- [x] `npm run build`
- [x] `npm run verify:supabase`
- [x] Manual CRUD flow verified against sandbox Supabase
- [x] Responsive layout checked