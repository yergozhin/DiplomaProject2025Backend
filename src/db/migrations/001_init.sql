create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('fighter','plo','spectator'))
);

create table if not exists fighters (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  weight_class text not null
);

create table if not exists fights (
  id uuid primary key default uuid_generate_v4(),
  fighter_a_id uuid not null references fighters(id) on delete cascade,
  fighter_b_id uuid not null references fighters(id) on delete cascade,
  status text not null check (status in ('requested','accepted','scheduled','deleted'))
);

create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  starts_at timestamptz not null
);

create table if not exists offers (
  id uuid primary key default uuid_generate_v4(),
  fight_id uuid not null references fights(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade
);


