alter table offers add column if not exists amount numeric not null default 0;
alter table offers add column if not exists currency text not null default 'USD';

