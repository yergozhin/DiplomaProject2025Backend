update fights f
set fighter_a_profile_id = fp.id
from fighter_profiles fp
where f.fighter_a_id = fp.user_id
  and f.fighter_a_profile_id is null;

update fights f
set fighter_b_profile_id = fp.id
from fighter_profiles fp
where f.fighter_b_id = fp.user_id
  and f.fighter_b_profile_id is null;

update events e
set plo_profile_id = pp.id
from plo_profiles pp
where e.plo_id = pp.user_id
  and e.plo_profile_id is null;

update offers o
set fighter_profile_id = fp.id
from fighter_profiles fp
where o.fighter_id = fp.user_id
  and o.fighter_profile_id is null;

update offers o
set plo_profile_id = pp.id
from plo_profiles pp
where o.plo_id = pp.user_id
  and o.plo_profile_id is null;

update fighter_verifications fv
set fighter_profile_id = fp.id
from fighter_profiles fp
where fv.fighter_id = fp.user_id
  and fv.fighter_profile_id is null;

