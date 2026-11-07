create table if not exists scam_reports (
  id text primary key,
  user_id text not null,
  kind text not null,
  normalized text not null,
  display text not null,
  category text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists scam_reports_user_key_idx
  on scam_reports (user_id, kind, normalized);

create index if not exists scam_reports_lookup_idx
  on scam_reports (kind, normalized, created_at desc);
