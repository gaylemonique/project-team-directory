# PRD: Project Team Directory

## 1. Purpose

Build a small internal Project Team Directory for team members to introduce themselves under the project category they belong to. The project should demonstrate clean full-stack execution with Next.js, Supabase, Tailwind CSS, TypeScript, thoughtful UI states, correct database structure, and professional Git/PR workflow.

Primary route: `/team-directory`

Target delivery: end of day, June 29, 2026.

## 2. Tech Stack

- Next.js with App Router
- TypeScript
- Tailwind CSS
- Supabase, using a sandbox project only
- Git branch and pull request workflow

Do not use or expose a Supabase service role key.

## 3. User Experience Goals

- The page should feel like a clean internal tool, not a marketing page.
- Users should be able to add, browse, filter, edit, and delete profiles without confusion.
- The interface must clearly handle loading, empty, error, validation, and confirmation states.
- Layout must be responsive across mobile and desktop.
- Photo upload is not required. Use a pasteable photo URL and show a placeholder avatar when blank or unavailable.

## 4. Core Route

Create the page at:

```text
/team-directory
```

The page should include:

- Header
- Short description
- Project category filter
- Create/edit team member form
- Team member profile cards
- Empty state
- Loading state
- Error state

## 5. Data Model

Use two Supabase tables.

### 5.1 `project_categories`

```sql
create table project_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  team_lead text,
  created_at timestamptz default now()
);
```

### 5.2 `team_members`

```sql
create table team_members (
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
```

### 5.3 Seed Categories

```sql
insert into project_categories (name, description, team_lead)
values
('HR Systems', 'Attendance, leave management, payroll, employee records, and HRIS core features.', 'Lawrence P. Babelonia'),
('Website / Landing Pages', 'Marketing websites, landing pages, and public-facing web experiences.', null),
('Automation / Internal Tools', 'Internal dashboards, workflow tools, and operational automation.', null),
('Mobile App', 'Mobile-first features and app experiences.', null),
('DevOps / Infrastructure', 'Deployment, server management, CI/CD, monitoring, and infrastructure.', null),
('QA / Testing', 'Manual testing, automated testing, bug reports, and quality assurance.', null),
('Design / UI', 'User interface design, component systems, and product experience.', null);
```

## 6. Environment Variables

Create `.env.local.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Local `.env.local` should use only sandbox Supabase credentials and must not be committed.

## 7. Functional Requirements

### 7.1 Create Team Member

Users can create a new team member profile.

Required fields:

- Name
- Role
- Project Category

Optional fields:

- Photo URL
- Project Assignment
- Favorite Tech Stack
- Current Focus
- Learning Goal / One Thing I Want to Learn
- Fun Fact
- GitHub or LinkedIn Profile URL

Validation:

- Required fields must be present.
- Profile URL and Photo URL should be validated as URLs when provided.
- Show user-friendly validation messages.
- Prevent duplicate submissions while saving.

### 7.2 View Team Members

Users can view all team members as clean profile cards.

Each card should show:

- Photo or placeholder avatar
- Name
- Role
- Project Category
- Project Assignment, if present
- Favorite Tech Stack, if present
- Current Focus, if present
- Learning Goal, if present
- Fun Fact, if present
- GitHub or LinkedIn link, if present
- Edit action
- Delete action

If no members exist, show:

```text
No team members added yet.
Create the first profile to start building the project directory.
```

### 7.3 Edit Team Member

Each profile card must have an Edit action.

Expected behavior:

- Selecting Edit loads the member data into the form or opens a modal/drawer.
- User can update any editable field.
- Saving persists changes to Supabase.
- UI refreshes without requiring a page reload.
- User can cancel edit mode.

### 7.4 Delete Team Member

Each profile card must have a Delete action.

Before deletion, show a confirmation prompt:

```text
Are you sure you want to delete this team member profile?
```

Expected behavior:

- Confirm deletes the row from Supabase.
- Cancel preserves the profile.
- UI refreshes without requiring a page reload.
- Show an error message if deletion fails.

### 7.5 Filter by Project Category

Users can filter team members by category.

Filters:

- All
- HR Systems
- Website / Landing Pages
- Automation / Internal Tools
- Mobile App
- DevOps / Infrastructure
- QA / Testing
- Design / UI

Expected behavior:

- `All` shows every member.
- Selecting a category shows only members in that category.
- Empty filtered results should show a helpful empty state.

## 8. Suggested File Structure

This can be adjusted if the implementation is cleaner, but start here:

```text
app/
  team-directory/
    page.tsx
components/
  team-directory/
    TeamDirectoryHeader.tsx
    ProjectCategoryFilter.tsx
    TeamMemberForm.tsx
    TeamMemberCard.tsx
    EmptyState.tsx
lib/
  supabase/
    client.ts
types/
  team-directory.ts
```

If the repo is not initialized yet, scaffold a new Next.js project in the current workspace using TypeScript and Tailwind CSS.

## 9. Supabase Integration Requirements

- Add a browser Supabase client in `lib/supabase/client.ts`.
- Read `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Fetch categories from `project_categories`.
- Fetch members from `team_members`, including related `project_categories` data.
- Insert, update, and delete `team_members`.
- Keep client-side errors visible to users in a concise way.
- Do not hardcode Supabase credentials.
- Do not use the service role key.

## 10. UI Requirements

- Use a practical internal-tool layout.
- Use readable spacing, typography, and contrast.
- Use form controls that are easy to scan.
- Cards should be compact but complete.
- Use responsive grids for cards.
- Use clear affordances for Edit and Delete.
- Prefer semantic HTML and accessible labels.
- Ensure text does not overflow buttons, cards, or narrow mobile layouts.
- Use placeholder avatar initials or a neutral avatar block when no photo is provided.

## 11. Loading, Empty, Error, and Validation States

Required states:

- Initial page loading while Supabase data loads
- Empty state when no members exist
- Empty filtered state when no members match the active category
- Error state when categories or members fail to load
- Field-level or form-level validation errors
- Saving state for create/update
- Deleting state or disabled delete action while delete is pending

## 12. Acceptance Criteria

- Next.js app is created.
- Tailwind CSS is configured.
- TypeScript is used.
- Supabase client is configured.
- `.env.local.example` exists.
- `project_categories` table is documented and created in Supabase.
- `team_members` table is documented and created in Supabase.
- Seed categories are available in Supabase.
- User can create a team member profile.
- User can view team member profiles.
- User can edit team member profiles.
- User can delete team member profiles after confirmation.
- User can filter by project category.
- Member photo URL displays when provided.
- Placeholder avatar displays when no photo is provided.
- Empty state exists.
- Loading state exists.
- Error state exists.
- Basic validation exists.
- Layout is responsive.
- Work is completed on a Git branch.
- Pull request is submitted with a useful description.

## 13. Implementation Checklist for Cursor

1. Inspect the current repository. If it is empty, scaffold a Next.js app with TypeScript and Tailwind CSS in the workspace root.
2. Create or switch to branch `feature/project-team-directory`.
3. Add `.env.local.example` with required Supabase public variables.
4. Add Supabase setup docs or migrations for the two required tables and seed data.
5. Implement `lib/supabase/client.ts`.
6. Add shared TypeScript types for project categories and team members.
7. Build `/team-directory`.
8. Fetch categories and team members from Supabase.
9. Implement category filtering.
10. Implement create form with validation.
11. Implement profile cards.
12. Implement edit flow.
13. Implement delete flow with confirmation.
14. Add loading, empty, error, validation, saving, and deleting states.
15. Polish responsive UI.
16. Run lint/build checks.
17. Make clear commits.
18. Open a pull request.

## 14. Testing Checklist

Manual tests:

- App starts locally without undocumented steps.
- `/team-directory` loads successfully.
- Missing Supabase env vars show a useful failure or setup is documented.
- Categories load from Supabase.
- Empty member list shows the required empty state.
- Create fails when required fields are missing.
- Create succeeds with only required fields.
- Create succeeds with all optional fields.
- Photo URL displays when valid.
- Placeholder avatar displays when photo is blank.
- Filter `All` shows all members.
- Each category filter shows only matching members.
- Edit updates a profile correctly.
- Cancel edit leaves profile unchanged.
- Delete cancel leaves profile unchanged.
- Delete confirm removes profile.
- Supabase errors are visible and do not crash the app.
- Layout works on mobile and desktop widths.
- No browser console errors during normal CRUD flow.

Recommended commands:

```bash
npm run lint
npm run build
```

Use the package manager generated by the scaffold if it differs from npm.

## 15. Pull Request Description Template

```markdown
## What I built

- Built the Project Team Directory at `/team-directory`.
- Added full create, read, update, delete, and category filtering.

## How I structured the app

- Page:
- Components:
- Supabase client:
- Types:

## How the CRUD flow works

- Create:
- Read:
- Update:
- Delete:

## How Supabase is used

- Tables:
- Relationship:
- Environment variables:

## What was challenging

-

## What I would improve next

-

## Testing

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] Manual CRUD flow verified
- [ ] Responsive layout checked
```

## 16. Non-Goals

- Authentication is not required.
- Supabase Storage upload is not required.
- Production deployment is not required.
- Complex role-based access control is not required for this one-day task.
- Advanced search and sorting are not required.

## 17. Definition of Done

The project is done when a reviewer can clone the branch, configure sandbox Supabase env vars, run the app locally, visit `/team-directory`, complete the full CRUD flow, filter by project category, see polished states for loading/empty/error/validation, and review a clear pull request before the deadline.
