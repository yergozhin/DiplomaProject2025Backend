create table if not exists weight_classes (
    id uuid primary key default uuid_generate_v4(),
    name text not null unique,
    min_weight_kg numeric,
    max_weight_kg numeric,
    description text,
    created_at timestamptz default now()
);

create table if not exists fighter_profiles (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null unique references users(id) on delete cascade,
    first_name text,
    last_name text,
    nickname text,
    profile_picture text,
    bio text,
    status text,
    profile_created_at timestamptz default now(),
    profile_updated_at timestamptz default now()
);

create table if not exists fighter_physical_attributes (
    id uuid primary key default uuid_generate_v4(),
    fighter_id uuid not null unique references fighter_profiles(id) on delete cascade,
    date_of_birth date,
    gender text,
    height integer,
    reach integer,
    weight_class_id uuid references weight_classes(id) on delete set null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists fighter_contact_info (
    id uuid primary key default uuid_generate_v4(),
    fighter_id uuid not null unique references fighter_profiles(id) on delete cascade,
    phone_number text,
    country text,
    city text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists fighter_records (
    id uuid primary key default uuid_generate_v4(),
    fighter_id uuid not null unique references fighter_profiles(id) on delete cascade,
    total_fights integer default 0 check (total_fights >= 0),
    wins integer default 0 check (wins >= 0),
    losses integer default 0 check (losses >= 0),
    draws integer default 0 check (draws >= 0),
    awards text,
    record_confirmed boolean default false,
    record_confirmed_at timestamptz,
    record_confirmed_by uuid references users(id) on delete set null,
    record_admin_notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists plo_profiles (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null unique references users(id) on delete cascade,
    league_name text not null,
    owner_first_name text,
    owner_last_name text,
    logo text,
    description text,
    founded_date date,
    social_media_links text,
    plo_status text not null default 'unverified' check (plo_status in ('unverified', 'verified')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create table if not exists plo_contact_info (
    id uuid primary key default uuid_generate_v4(),
    plo_id uuid not null unique references plo_profiles(id) on delete cascade,
    phone_number text,
    website text,
    country text,
    city text,
    address text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

create index if not exists idx_weight_classes_name on weight_classes(name);
create index if not exists idx_fighter_profiles_user_id on fighter_profiles(user_id);
create index if not exists idx_fighter_physical_attributes_fighter_id on fighter_physical_attributes(fighter_id);
create index if not exists idx_fighter_physical_attributes_weight_class_id on fighter_physical_attributes(weight_class_id);
create index if not exists idx_fighter_contact_info_fighter_id on fighter_contact_info(fighter_id);
create index if not exists idx_fighter_records_fighter_id on fighter_records(fighter_id);
create index if not exists idx_plo_profiles_user_id on plo_profiles(user_id);
create index if not exists idx_plo_profiles_status on plo_profiles(plo_status);
create index if not exists idx_plo_contact_info_plo_id on plo_contact_info(plo_id);

