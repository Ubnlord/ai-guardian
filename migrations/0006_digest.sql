-- Weekly risk digest: opt-out flag + a per-user unsubscribe token.
--
-- The digest is ON by default (it is the product's retention loop), so the column
-- is `digest_opt_out` rather than `digest_opt_in`: a missing row means "send it".
-- The token is what makes one-click unsubscribe possible from an email client
-- without a session cookie, and it is per-user so it can be rotated.

alter table profiles add column if not exists digest_opt_out boolean not null default false;
alter table profiles add column if not exists digest_token text not null default '';
alter table profiles add column if not exists digest_sent_at timestamptz;

create index if not exists profiles_digest_idx on profiles (digest_opt_out, digest_sent_at);
