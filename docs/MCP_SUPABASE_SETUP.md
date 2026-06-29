# Connect Supabase via MCP

This repo is connected to Supabase project **`project team directory`** (`tgenbkuikazblpzkogvm`).

## Status

| Check | Result |
|-------|--------|
| MCP project access | `project team directory` (`tgenbkuikazblpzkogvm`) |
| Tables | `project_categories`, `team_members` |
| Storage bucket | `team-member-photos` |
| Local verification | `npm run verify:supabase` → ALL CHECKS PASSED |

## MCP configuration

Project-scoped MCP URL (in `.mcp.json`):

```text
https://mcp.supabase.com/mcp?project_ref=tgenbkuikazblpzkogvm&features=database,development,debugging,storage,docs
```

If tools stop working, re-authenticate in **Cursor Settings → Tools & MCP → Supabase**.

## Useful MCP commands

Ask Cursor to run:

- `list_tables` — inspect schema
- `apply_migration` — apply SQL from `supabase/migrations/`
- `get_publishable_keys` — refresh anon key for `.env.local`
- `get_logs` — debug API or storage errors

## Local environment

`.env.local` should match the connected project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tgenbkuikazblpzkogvm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from get_publishable_keys>
```

Verify anytime:

```bash
npm run verify:supabase
```

## Files

| File | Purpose |
|------|---------|
| `.mcp.json` | Cursor MCP server config with project scope |
| `supabase/.temp/project-ref` | Linked Supabase project ref |
| `supabase/config.toml` | Local Supabase config including storage bucket |
