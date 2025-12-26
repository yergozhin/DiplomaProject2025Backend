alter table fights
  add column if not exists fighter_a_profile_id uuid references fighter_profiles(id) on delete cascade,
  add column if not exists fighter_b_profile_id uuid references fighter_profiles(id) on delete cascade;

create index if not exists idx_fights_fighter_a_profile_id on fights(fighter_a_profile_id);
create index if not exists idx_fights_fighter_b_profile_id on fights(fighter_b_profile_id);

alter table events
  add column if not exists plo_profile_id uuid references plo_profiles(id) on delete cascade;

create index if not exists idx_events_plo_profile_id on events(plo_profile_id);

alter table offers
  add column if not exists fighter_profile_id uuid references fighter_profiles(id) on delete cascade,
  add column if not exists plo_profile_id uuid references plo_profiles(id) on delete cascade;

create index if not exists idx_offers_fighter_profile_id on offers(fighter_profile_id);
create index if not exists idx_offers_plo_profile_id on offers(plo_profile_id);

alter table fighter_verifications
  add column if not exists fighter_profile_id uuid references fighter_profiles(id) on delete cascade;

create index if not exists idx_fighter_verifications_fighter_profile_id on fighter_verifications(fighter_profile_id);

