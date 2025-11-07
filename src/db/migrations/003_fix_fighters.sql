alter table users add column if not exists name text;
alter table users add column if not exists weight_class text;

drop table if exists fighters cascade;

alter table fights drop constraint if exists fights_fighter_a_id_fkey;
alter table fights drop constraint if exists fights_fighter_b_id_fkey;
alter table fights add constraint fights_fighter_a_id_fkey foreign key (fighter_a_id) references users(id) on delete cascade;
alter table fights add constraint fights_fighter_b_id_fkey foreign key (fighter_b_id) references users(id) on delete cascade;

