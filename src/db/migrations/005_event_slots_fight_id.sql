alter table event_slots add column if not exists fight_id uuid references fights(id) on delete set null;

