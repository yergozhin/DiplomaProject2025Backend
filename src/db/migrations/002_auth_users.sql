alter table users drop constraint if exists users_email_key;
alter table users drop constraint if exists users_role_check;
create unique index if not exists users_email_role_unique on users(email, role);

