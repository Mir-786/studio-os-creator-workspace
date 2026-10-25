-- Studio OS: private per-user cloud sync payload.
-- Run this file in Supabase Dashboard > SQL Editor.
create table if not exists public.workspace_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload jsonb not null default '{"projects": [], "tasks": [], "scripts": []}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.workspace_data enable row level security;

drop policy if exists "Users can read their own workspace" on public.workspace_data;
create policy "Users can read their own workspace"
  on public.workspace_data for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own workspace" on public.workspace_data;
create policy "Users can insert their own workspace"
  on public.workspace_data for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own workspace" on public.workspace_data;
create policy "Users can update their own workspace"
  on public.workspace_data for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
