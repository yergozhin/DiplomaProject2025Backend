alter table events
  drop column if exists plo_id;

alter table offers
  drop column if exists fighter_id,
  drop column if exists plo_id;

alter table fighter_verifications
  drop column if exists fighter_id;

