alter table offers add column if not exists status text not null default 'pending' check (status in ('pending','accepted','rejected'));

