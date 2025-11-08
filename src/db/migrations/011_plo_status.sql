alter table users
  add column if not exists plo_status text
    constraint users_plo_status_check check (plo_status in ('unverified','verified'))
    default 'unverified';

update users
set plo_status = 'unverified'
where plo_status is null
  and role = 'plo';

