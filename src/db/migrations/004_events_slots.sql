alter table events drop column if exists starts_at;
alter table events add column if not exists plo_id uuid references users(id) on delete cascade;
alter table events add column if not exists created_at timestamptz default now();

create table if not exists event_slots (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid not null references events(id) on delete cascade,
  start_time timestamptz not null
);

