# Project Team Directory

Internal team directory built with Next.js, Supabase, and Tailwind CSS.

## Quick start

1. Apply the Supabase migration — see [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md).
2. Copy `.env.local.example` to `.env.local` and add your sandbox Supabase URL and anon key.
3. Install and run:

```bash
npm install
npm run dev
```

Visit [http://localhost:3000/team-directory](http://localhost:3000/team-directory).

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run verify:supabase
```

## Route

- `/team-directory` — create, browse, filter, edit, and delete team member profiles

## Requirements

See [PRD_Project_Team_Directory.md](PRD_Project_Team_Directory.md) for the full product specification.
