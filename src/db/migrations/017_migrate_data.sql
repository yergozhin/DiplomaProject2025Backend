insert into weight_classes (name)
select distinct 
    coalesce(current_weight_class, weight_class) as name
from users
where role = 'fighter'
  and (current_weight_class is not null or weight_class is not null)
  and coalesce(current_weight_class, weight_class) not in (select name from weight_classes)
on conflict (name) do nothing;

insert into fighter_profiles (
    user_id,
    first_name,
    last_name,
    nickname,
    profile_picture,
    bio,
    status,
    profile_created_at,
    profile_updated_at
)
select 
    id as user_id,
    first_name,
    last_name,
    nickname,
    profile_picture,
    bio,
    status,
    coalesce(profile_created_at, created_at) as profile_created_at,
    coalesce(profile_updated_at, updated_at) as profile_updated_at
from users
where role = 'fighter'
  and id not in (select user_id from fighter_profiles where user_id is not null)
on conflict (user_id) do nothing;

insert into fighter_physical_attributes (
    fighter_id,
    date_of_birth,
    gender,
    height,
    reach,
    weight_class_id,
    created_at,
    updated_at
)
select 
    fp.id as fighter_id,
    u.date_of_birth,
    u.gender,
    u.height,
    u.reach,
    wc.id as weight_class_id,
    coalesce(u.profile_created_at, u.created_at) as created_at,
    coalesce(u.profile_updated_at, u.updated_at) as updated_at
from users u
inner join fighter_profiles fp on u.id = fp.user_id
left join weight_classes wc on wc.name = coalesce(u.current_weight_class, u.weight_class)
where u.role = 'fighter'
  and fp.id not in (select fighter_id from fighter_physical_attributes where fighter_id is not null)
on conflict (fighter_id) do nothing;

insert into fighter_contact_info (
    fighter_id,
    phone_number,
    country,
    city,
    created_at,
    updated_at
)
select 
    fp.id as fighter_id,
    u.phone_number,
    u.country,
    u.city,
    coalesce(u.profile_created_at, u.created_at) as created_at,
    coalesce(u.profile_updated_at, u.updated_at) as updated_at
from users u
inner join fighter_profiles fp on u.id = fp.user_id
where u.role = 'fighter'
  and fp.id not in (select fighter_id from fighter_contact_info where fighter_id is not null)
on conflict (fighter_id) do nothing;

insert into fighter_records (
    fighter_id,
    total_fights,
    wins,
    losses,
    draws,
    awards,
    record_confirmed,
    record_confirmed_at,
    record_confirmed_by,
    record_admin_notes,
    created_at,
    updated_at
)
select 
    fp.id as fighter_id,
    coalesce(u.total_fights, 0) as total_fights,
    coalesce(u.wins, 0) as wins,
    coalesce(u.losses, 0) as losses,
    coalesce(u.draws, 0) as draws,
    u.awards,
    coalesce(u.record_confirmed, false) as record_confirmed,
    u.record_confirmed_at,
    u.record_confirmed_by,
    u.record_admin_notes,
    coalesce(u.profile_created_at, u.created_at) as created_at,
    coalesce(u.profile_updated_at, u.updated_at) as updated_at
from users u
inner join fighter_profiles fp on u.id = fp.user_id
where u.role = 'fighter'
  and fp.id not in (select fighter_id from fighter_records where fighter_id is not null)
on conflict (fighter_id) do nothing;

insert into plo_profiles (
    user_id,
    league_name,
    owner_first_name,
    owner_last_name,
    logo,
    description,
    founded_date,
    social_media_links,
    plo_status,
    created_at,
    updated_at
)
select 
    id as user_id,
    coalesce(league_name, 'Unnamed League') as league_name,
    owner_first_name,
    owner_last_name,
    logo,
    description,
    founded_date,
    social_media_links,
    coalesce(plo_status, 'unverified') as plo_status,
    created_at,
    updated_at
from users
where role = 'plo'
  and id not in (select user_id from plo_profiles where user_id is not null)
on conflict (user_id) do nothing;

insert into plo_contact_info (
    plo_id,
    phone_number,
    website,
    country,
    city,
    address,
    created_at,
    updated_at
)
select 
    pp.id as plo_id,
    u.phone_number,
    u.website,
    u.country,
    u.city,
    u.address,
    u.created_at,
    u.updated_at
from users u
inner join plo_profiles pp on u.id = pp.user_id
where u.role = 'plo'
  and pp.id not in (select plo_id from plo_contact_info where plo_id is not null)
on conflict (plo_id) do nothing;

