create table if not exists profiles (
  user_id text primary key,
  display_name text not null default '',
  role text not null default 'member',
  plan text not null default 'free',
  checks_used integer not null default 0,
  checks_period text not null default '',
  store_history boolean not null default true,
  share_high_risk boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists checks (
  id text primary key,
  user_id text not null,
  kind text not null,
  verdict text not null,
  score integer not null,
  title text not null,
  summary text not null,
  reasons text not null default '[]',
  actions text not null default '[]',
  uncertainty text not null default '',
  source text not null default 'rules',
  excerpt text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists checks_user_created_idx on checks (user_id, created_at desc);

create table if not exists families (
  id text primary key,
  name text not null,
  owner_id text not null,
  invite_code text not null unique,
  verification_phrase_hash text,
  created_at timestamptz not null default now()
);

create table if not exists family_members (
  family_id text not null references families (id) on delete cascade,
  user_id text not null,
  role text not null default 'member',
  label text not null default '',
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create unique index if not exists family_members_user_idx on family_members (user_id);
create index if not exists family_members_family_idx on family_members (family_id);

create table if not exists family_alerts (
  id text primary key,
  family_id text not null references families (id) on delete cascade,
  user_id text not null,
  check_id text,
  headline text not null,
  detail text not null,
  created_at timestamptz not null default now()
);

create index if not exists family_alerts_family_idx on family_alerts (family_id, created_at desc);

create table if not exists watched_domains (
  id text primary key,
  user_id text not null,
  domain text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists watched_domains_user_domain_idx on watched_domains (user_id, domain);

create table if not exists education_articles (
  slug text primary key,
  title text not null,
  category text not null,
  body text not null,
  minutes integer not null default 3,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);
