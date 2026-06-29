# Supabase Setup

This app uses a **Supabase sandbox project** with the public anon key only. Do not use or expose the service role key.

## 1. Create tables and seed data

Apply the migration in `supabase/migrations/20260629000000_init_team_directory.sql` using one of:

- **Supabase Dashboard:** SQL Editor → paste and run the migration file.
- **Supabase CLI:** `supabase link` then `supabase db push`.

The migration creates:

- `project_categories` — seeded with seven project categories
- `team_members` — stores team member profiles
- Row Level Security policies for anonymous read/write (no auth required for this internal demo)

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in your sandbox project values from **Project Settings → API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000/team-directory](http://localhost:3000/team-directory).

## Tables

### `project_categories`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| name | text | Unique category name |
| description | text | Optional |
| team_lead | text | Optional |
| created_at | timestamptz | Default now |

### `team_members`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| project_category_id | uuid | FK → project_categories, ON DELETE SET NULL |
| name | text | Required |
| role | text | Required |
| photo_url | text | Optional URL |
| project_assignment | text | Optional |
| favorite_stack | text | Optional |
| current_focus | text | Optional |
| learning_goal | text | Optional |
| fun_fact | text | Optional |
| profile_url | text | Optional GitHub/LinkedIn URL |
| created_at | timestamptz | Default now |
| updated_at | timestamptz | Default now |
