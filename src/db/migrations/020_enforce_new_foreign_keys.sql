alter table fights
  alter column fighter_a_profile_id set not null,
  alter column fighter_b_profile_id set not null;

alter table events
  alter column plo_profile_id set not null;

alter table offers
  alter column fighter_profile_id set not null,
  alter column plo_profile_id set not null;

alter table fighter_verifications
  alter column fighter_profile_id set not null;

