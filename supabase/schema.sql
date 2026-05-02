-- Timeline Studio — Events table
-- Run this in the Supabase SQL editor to create the table.

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  couple_name text not null,
  event_date text not null,
  venue text not null default '',
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for listing events sorted by most recent
create index if not exists events_updated_at_idx on events (updated_at desc);

-- Optional: RLS (disabled for prototype, enable for production)
-- alter table events enable row level security;
