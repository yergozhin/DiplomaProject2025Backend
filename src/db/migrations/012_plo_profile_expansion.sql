alter table users add column if not exists league_name text;
alter table users add column if not exists owner_first_name text;
alter table users add column if not exists owner_last_name text;
alter table users add column if not exists phone_number text;
alter table users add column if not exists website text;
alter table users add column if not exists country text;
alter table users add column if not exists city text;
alter table users add column if not exists address text;
alter table users add column if not exists description text;
alter table users add column if not exists logo text;
alter table users add column if not exists founded_date date;
alter table users add column if not exists social_media_links text;
alter table users add column if not exists created_at timestamptz default now();
alter table users add column if not exists updated_at timestamptz default now();

update users
set created_at = coalesce(created_at, now()),
    updated_at = coalesce(updated_at, now())
where created_at is null or updated_at is null;


