# Studio OS — Creator Workspace

A responsive creator workspace for YouTube and Instagram production built with Next.js App Router, React, TypeScript, Tailwind CSS v4, Framer Motion, Lucide React, and optional Supabase cloud sync.

## Features
- Creator dashboard
- YouTube / Instagram video projects and metadata
- Production board with drag-and-drop stages
- Reusable script templates and editable script library
- Shot list and editing checklist
- Month-based publishing calendar
- Thumbnail URL preview, source, title, description/caption, and tags
- Supabase email/password auth and per-user cloud workspace payload
- Local browser cache for convenience

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.

To type-check:
```bash
npm run typecheck
```
To build:
```bash
npm run build
```

## Enable cross-device sync
1. Create a project at https://supabase.com/.
2. Run `supabase/schema.sql` in Supabase Dashboard → SQL Editor.
3. Copy your Supabase Project URL and anon/public key.
4. Create `.env.local` from `.env.local.example` and fill in both values.
5. Add the same environment variables to Vercel Project Settings → Environment Variables.
6. Redeploy and sign in with the same account on every device.

Never put a Supabase service-role key in browser code or a `NEXT_PUBLIC_*` variable.

## Deployment
Import this folder's Git repository into Vercel. Framework preset should be Next.js. Set the two Supabase environment variables if cloud sync is desired.

## Important
The build environment here could not complete a dependency install, so the full project has been packaged with the React drag/drop event types corrected, but it has not been verified by a successful remote Vercel build in this session. If Vercel reports a different error after deploying, use the new build log to identify it.
