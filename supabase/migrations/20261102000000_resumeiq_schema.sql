create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resume_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_title text not null default 'Untitled role',
  overall_score smallint not null check (overall_score between 0 and 100),
  findings jsonb not null,
  resume_text text not null,
  job_description text not null,
  created_at timestamptz not null default now()
);
create index if not exists resume_analyses_user_created_idx on public.resume_analyses(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.resume_analyses enable row level security;
revoke all on public.profiles from anon;
revoke all on public.resume_analyses from anon;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.resume_analyses to authenticated;

create policy "Users can read their own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Users can create their own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "Users can update their own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Users can delete their own profile" on public.profiles for delete to authenticated using ((select auth.uid()) = id);

create policy "Users can read their own analyses" on public.resume_analyses for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can create their own analyses" on public.resume_analyses for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own analyses" on public.resume_analyses for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete their own analyses" on public.resume_analyses for delete to authenticated using ((select auth.uid()) = user_id);

