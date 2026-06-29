# Deploy on Vercel

## How Git sync works

Vercel deploys automatically when you push to GitHub:

| Branch | Deployment type |
|--------|-----------------|
| `main` | **Production** → https://project-team-directory.vercel.app |
| `feature/*` | **Preview** → unique preview URL per commit |

Pushing only to a feature branch updates a **preview**, not production. Merge to `main` to update the live site.

## Required environment variables

The app needs Supabase public keys at build and runtime. Add these in **Vercel → project-team-directory → Settings → Environment Variables**:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://tgenbkuikazblpzkogvm.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your sandbox anon key from Supabase → Project Settings → API |

Enable for **Production**, **Preview**, and **Development**.

After adding variables, redeploy:

- **Deployments → … → Redeploy** on the latest deployment, or
- Push a new commit to `main`

## CLI alternative

```bash
npx vercel link
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel --prod
```

Pull env vars locally:

```bash
npx vercel env pull .env.local
```

## Verify production

1. Open https://project-team-directory.vercel.app/team-directory
2. Categories should load (not stuck on "Loading team directory...")
3. Create a profile and upload a photo

## Project links

- **Vercel dashboard:** https://vercel.com/chis-projects-ecd0aa7d/project-team-directory
- **GitHub repo:** https://github.com/gaylemonique/project-team-directory
