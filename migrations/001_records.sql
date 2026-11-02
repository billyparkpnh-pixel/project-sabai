-- Apply through the Supabase SQL editor or psql before setting DATABASE_URL.
-- Public browsers have NO table privileges. Only the server DB role accesses data.
create table if not exists public.records (
 kind text not null check (kind in ('content','orders','donations','contacts','audit')),
 id text not null,
 data jsonb not null,
 created_at timestamptz not null default now(),
 primary key (kind,id)
);
create index if not exists records_created on public.records(kind,created_at desc);
alter table public.records enable row level security;
revoke all on public.records from anon, authenticated;
-- No public RLS policies: deny by default. Do not expose DATABASE_URL to browsers.
-- Set app_metadata.role='admin' using a trusted Supabase admin operation;
-- user_metadata is never trusted for authorization.
