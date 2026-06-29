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

Visit [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run verify:supabase
```

## Route

- `/` — create, browse, filter, edit, and delete team member profiles

## Requirements

See [PRD_Project_Team_Directory.md](PRD_Project_Team_Directory.md) for the full product specification.

## Supabase MCP

Connect Cursor to your sandbox with [docs/MCP_SUPABASE_SETUP.md](docs/MCP_SUPABASE_SETUP.md). The repo includes `.mcp.json` scoped to project ref `tgenbkuikazblpzkogvm`.

## Vercel deployment

Production: https://project-team-directory.vercel.app

See [docs/VERCEL_DEPLOYMENT.md](docs/VERCEL_DEPLOYMENT.md) for Git sync behavior and required environment variables.

## Submit a pull request

1. Ensure checks pass locally:

```bash
npm run lint
npm run build
npm run verify:supabase
```

2. Push your branch:

```bash
git push -u origin feature/project-team-directory
```

3. Open a PR on GitHub:
   - [Compare `feature/project-team-directory` → `main`](https://github.com/gaylemonique/project-team-directory/compare/main...feature/project-team-directory?expand=1)
   - If `main` does not exist yet, create it in GitHub **Settings → Branches** or when prompted during PR creation.
   - Use [PR_BODY.md](PR_BODY.md) as the PR description starting point.
