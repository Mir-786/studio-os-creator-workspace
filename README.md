# Studio OS — Creator Workspace

A Notion-inspired workspace starter built with Next.js App Router, React, TypeScript, Tailwind CSS v4, Framer Motion, and Lucide icons.

## Included
- Creator dashboard with project/task/script metrics
- YouTube and Instagram project boards
- Video project creation and stage updates
- Script library and editable script editor (hook, main script, CTA)
- Content calendar view
- Idea bank cards that can be turned into projects
- Responsive sidebar, search, toast notifications, motion, and localStorage persistence

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## Deploy to Vercel
1. Push this folder to a GitHub repository.
2. Import the repository in Vercel.
3. Keep the framework preset as Next.js and deploy.

## Important starter limitations
This version stores data in the current browser via localStorage. It does not yet have accounts, shared team workspaces, cloud persistence, real calendar syncing, uploads, or connected AI generation. For production, add authentication (e.g. Auth.js or Clerk), a database (e.g. Supabase/Postgres), file storage, and a server-side AI route. Never expose an AI API key in client-side code.
