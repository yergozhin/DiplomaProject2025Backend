create table if not exists fighter_rankings (
    id uuid primary key default uuid_generate_v4(),
    fighter_id uuid not null references fighter_profiles(id) on delete cascade,
    weight_class_id uuid not null references weight_classes(id) on delete cascade,
    ranking_position integer,
    ranking_points numeric default 0,
    ranking_date date not null,
    unique(fighter_id, weight_class_id, ranking_date)
);

create table if not exists fighter_injuries (
    id uuid primary key default uuid_generate_v4(),
    fighter_id uuid not null references fighter_profiles(id) on delete cascade,
    injury_type text not null,
    injury_description text,
    injury_date date,
    recovery_status text check (recovery_status in ('recovering', 'cleared', 'ongoing')),
    medical_notes text,
    updated_at timestamptz default now()
);

create table if not exists medical_clearances (
    id uuid primary key default uuid_generate_v4(),
    fighter_id uuid not null references fighter_profiles(id) on delete cascade,
    clearance_date date not null,
    expiration_date date,
    cleared_by text,
    clearance_type text check (clearance_type in ('pre-fight', 'post-fight', 'annual', 'emergency')),
    notes text
);

create table if not exists plo_event_statistics (
    id uuid primary key default uuid_generate_v4(),
    plo_id uuid not null references plo_profiles(id) on delete cascade,
    total_events integer default 0,
    completed_events integer default 0,
    total_fights_organized integer default 0,
    statistics_date date not null,
    unique(plo_id, statistics_date)
);

create table if not exists event_locations (
    id uuid primary key default uuid_generate_v4(),
    event_id uuid not null unique references events(id) on delete cascade,
    venue_name text,
    venue_address text,
    city text,
    country text,
    venue_capacity integer,
    updated_at timestamptz default now()
);

create table if not exists event_metadata (
    id uuid primary key default uuid_generate_v4(),
    event_id uuid not null unique references events(id) on delete cascade,
    poster_image text,
    ticket_link text,
    updated_at timestamptz default now()
);

create table if not exists event_categories (
    id uuid primary key default uuid_generate_v4(),
    name text not null unique,
    description text
);

create table if not exists event_category_assignments (
    id uuid primary key default uuid_generate_v4(),
    event_id uuid not null references events(id) on delete cascade,
    category_id uuid not null references event_categories(id) on delete cascade,
    unique(event_id, category_id)
);

create table if not exists event_status_history (
    id uuid primary key default uuid_generate_v4(),
    event_id uuid not null references events(id) on delete cascade,
    status text not null check (status in ('draft', 'published', 'cancelled', 'rejected', 'completed')),
    changed_by uuid references users(id) on delete set null,
    change_reason text,
    changed_at timestamptz default now()
);

create table if not exists event_sponsors (
    id uuid primary key default uuid_generate_v4(),
    event_id uuid not null references events(id) on delete cascade,
    sponsor_name text not null,
    sponsor_logo text,
    sponsorship_level text check (sponsorship_level in ('platinum', 'gold', 'silver', 'bronze')),
    sponsorship_amount numeric
);

create table if not exists fight_history (
    id uuid primary key default uuid_generate_v4(),
    fight_id uuid not null references fights(id) on delete cascade,
    status text not null,
    changed_by uuid references users(id) on delete set null,
    change_reason text,
    changed_at timestamptz default now()
);

create table if not exists fight_results (
    id uuid primary key default uuid_generate_v4(),
    fight_id uuid not null unique references fights(id) on delete cascade,
    winner_id uuid references fighter_profiles(id) on delete set null,
    result_type text check (result_type in ('knockout', 'technical_knockout', 'submission', 'decision', 'draw', 'no_contest', 'disqualification')),
    round_ended integer,
    time_ended time,
    judge_scores jsonb
);

create table if not exists fight_statistics (
    id uuid primary key default uuid_generate_v4(),
    fight_id uuid not null references fights(id) on delete cascade,
    fighter_id uuid not null references fighter_profiles(id) on delete cascade,
    strikes_landed integer default 0,
    strikes_attempted integer default 0,
    takedowns_landed integer default 0,
    takedowns_attempted integer default 0,
    submission_attempts integer default 0,
    control_time_seconds integer default 0,
    unique(fight_id, fighter_id)
);

create table if not exists fight_contracts (
    id uuid primary key default uuid_generate_v4(),
    fight_id uuid not null references fights(id) on delete cascade,
    fighter_id uuid not null references fighter_profiles(id) on delete cascade,
    contract_amount numeric not null,
    currency text not null default 'USD',
    contract_signed boolean default false,
    contract_signed_at timestamptz,
    contract_terms text,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(fight_id, fighter_id)
);

create table if not exists offer_responses (
    id uuid primary key default uuid_generate_v4(),
    offer_id uuid not null references offers(id) on delete cascade,
    fighter_id uuid not null references fighter_profiles(id) on delete cascade,
    amount numeric not null,
    currency text not null default 'USD',
    status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
    responded_at timestamptz,
    unique(offer_id, fighter_id)
);

create index if not exists idx_fighter_rankings_fighter_id on fighter_rankings(fighter_id);
create index if not exists idx_fighter_rankings_weight_class_id on fighter_rankings(weight_class_id);
create index if not exists idx_fighter_injuries_fighter_id on fighter_injuries(fighter_id);
create index if not exists idx_medical_clearances_fighter_id on medical_clearances(fighter_id);
create index if not exists idx_plo_event_statistics_plo_id on plo_event_statistics(plo_id);
create index if not exists idx_event_locations_event_id on event_locations(event_id);
create index if not exists idx_event_metadata_event_id on event_metadata(event_id);
create index if not exists idx_event_category_assignments_event_id on event_category_assignments(event_id);
create index if not exists idx_event_category_assignments_category_id on event_category_assignments(category_id);
create index if not exists idx_event_status_history_event_id on event_status_history(event_id);
create index if not exists idx_event_sponsors_event_id on event_sponsors(event_id);
create index if not exists idx_fight_history_fight_id on fight_history(fight_id);
create index if not exists idx_fight_results_fight_id on fight_results(fight_id);
create index if not exists idx_fight_statistics_fight_id on fight_statistics(fight_id);
create index if not exists idx_fight_statistics_fighter_id on fight_statistics(fighter_id);
create index if not exists idx_fight_contracts_fight_id on fight_contracts(fight_id);
create index if not exists idx_fight_contracts_fighter_id on fight_contracts(fighter_id);
create index if not exists idx_offer_responses_offer_id on offer_responses(offer_id);
create index if not exists idx_offer_responses_fighter_id on offer_responses(fighter_id);

