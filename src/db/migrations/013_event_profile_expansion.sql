alter table events add column if not exists event_name text;
alter table events add column if not exists event_description text;
alter table events add column if not exists venue_name text;
alter table events add column if not exists venue_address text;
alter table events add column if not exists city text;
alter table events add column if not exists country text;
alter table events add column if not exists venue_capacity integer;
alter table events add column if not exists poster_image text;
alter table events add column if not exists ticket_link text;
alter table events add column if not exists status text default 'draft';
alter table events add column if not exists created_at timestamptz default now();
alter table events add column if not exists updated_at timestamptz default now();

update events
set created_at = coalesce(created_at, now()),
    updated_at = coalesce(updated_at, now()),
    status = coalesce(status, 'draft');


