alter table offers drop constraint if exists offers_event_id_fkey;
drop table if exists offer_responses cascade;
drop table if exists offers cascade;

create table if not exists offers (
  id uuid primary key default uuid_generate_v4(),
  fight_id uuid not null references fights(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  event_slot_id uuid not null references event_slots(id) on delete cascade,
  fighter_id uuid not null references users(id) on delete cascade,
  plo_id uuid not null references users(id) on delete cascade,
  created_at timestamptz default now()
);

