alter table users drop column if exists verification_links;
alter table users drop column if exists verification_contacts;

create table if not exists fighter_verifications (
  id uuid primary key default uuid_generate_v4(),
  fighter_id uuid not null references users(id) on delete cascade,
  type text not null check (type in ('link', 'contact', 'image')),
  value text not null,
  wins integer default 0 check (wins >= 0),
  losses integer default 0 check (losses >= 0),
  draws integer default 0 check (draws >= 0),
  awards text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  admin_id uuid references users(id) on delete set null,
  admin_note text,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);


