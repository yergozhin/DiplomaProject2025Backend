alter table users add column if not exists first_name text;
alter table users add column if not exists last_name text;
alter table users add column if not exists nickname text;
alter table users add column if not exists phone_number text;
alter table users add column if not exists date_of_birth date;
alter table users add column if not exists gender text;
alter table users add column if not exists current_weight_class text;
alter table users add column if not exists height integer;
alter table users add column if not exists reach integer;
alter table users add column if not exists country text;
alter table users add column if not exists city text;
alter table users add column if not exists status text;
alter table users add column if not exists profile_picture text;
alter table users add column if not exists bio text;
alter table users add column if not exists profile_created_at timestamptz default now();
alter table users add column if not exists profile_updated_at timestamptz default now();
alter table users add column if not exists verification_links text;
alter table users add column if not exists verification_contacts text;
alter table users add column if not exists total_fights integer default 0;
alter table users add column if not exists wins integer default 0;
alter table users add column if not exists losses integer default 0;
alter table users add column if not exists draws integer default 0;
alter table users add column if not exists awards text;
alter table users add column if not exists record_confirmed boolean default false;
alter table users add column if not exists record_confirmed_at timestamptz;
alter table users add column if not exists record_confirmed_by uuid references users(id) on delete set null;
alter table users add column if not exists record_admin_notes text;

update users
set current_weight_class = coalesce(current_weight_class, weight_class)
where role = 'fighter';

update users
set profile_created_at = coalesce(profile_created_at, now()),
    profile_updated_at = coalesce(profile_updated_at, now());

