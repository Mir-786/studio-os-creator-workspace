# Studio OS — Supabase cross-device sync setup

## Files in this update
- `app/page.tsx` — updated app with sign-in/sign-up and cloud sync
- `lib/supabase.ts` — Supabase browser client
- `supabase/schema.sql` — table and Row Level Security policies
- `.env.local.example` — required public environment variables template
- `package.json` — adds `@supabase/supabase-js`

## Setup
1. Create a project at https://supabase.com/.
2. In Supabase Dashboard → SQL Editor, run `supabase/schema.sql`.
3. Copy the Project URL and anon/public key from Project Settings → API.
4. Create `.env.local` in the project root based on `.env.local.example`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```
5. Run `npm install` again to install the new dependency.
6. In Vercel → Project → Settings → Environment Variables, add the same two variables for Production (and Preview if desired), then redeploy.
7. Open the site and create an account. Sign in with that same account on each device to access the same workspace.

## Notes
- The app stores each user's projects, tasks, and scripts in one JSONB payload row. RLS policies ensure users can only read/write their own row.
- Local browser storage remains as a convenience/cache, but authenticated cloud data is the source of truth after sign-in.
- Keep the anon/public key in `NEXT_PUBLIC_SUPABASE_ANON_KEY`; never add a Supabase service-role key to the browser or `NEXT_PUBLIC_*` variables.
- Supabase Auth email confirmation settings may require confirming the signup email before signing in.
