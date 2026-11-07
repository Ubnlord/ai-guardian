create table if not exists api_keys (
  id text primary key,
  user_id text not null,
  name text not null default 'Browser extension',
  prefix text not null,
  hash text not null unique,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at timestamptz
);

create index if not exists api_keys_user_idx on api_keys (user_id, created_at desc);
create index if not exists api_keys_hash_idx on api_keys (hash);
