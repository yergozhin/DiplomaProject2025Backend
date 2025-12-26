alter table users
  drop column if exists plo_status,
  drop column if exists league_name,
  drop column if exists owner_first_name,
  drop column if exists owner_last_name,
  drop column if exists website,
  drop column if exists address,
  drop column if exists description,
  drop column if exists logo,
  drop column if exists founded_date,
  drop column if exists social_media_links;

