create index if not exists idx_fighter_profiles_user_id on fighter_profiles(user_id);
create index if not exists idx_plo_profiles_user_id on plo_profiles(user_id);
create index if not exists idx_fighter_physical_attributes_fighter_id on fighter_physical_attributes(fighter_id);
create index if not exists idx_fighter_contact_info_fighter_id on fighter_contact_info(fighter_id);
create index if not exists idx_fighter_records_fighter_id on fighter_records(fighter_id);
create index if not exists idx_plo_contact_info_plo_id on plo_contact_info(plo_id);
create index if not exists idx_fights_fighter_a_profile_id on fights(fighter_a_profile_id);
create index if not exists idx_fights_fighter_b_profile_id on fights(fighter_b_profile_id);
create index if not exists idx_events_plo_profile_id on events(plo_profile_id);
create index if not exists idx_offers_fighter_profile_id on offers(fighter_profile_id);
create index if not exists idx_offers_plo_profile_id on offers(plo_profile_id);
create index if not exists idx_fighter_verifications_fighter_profile_id on fighter_verifications(fighter_profile_id);

