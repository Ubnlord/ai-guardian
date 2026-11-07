alter table profiles add column if not exists avatar text not null default '';
alter table profiles add column if not exists country text not null default '';
alter table profiles add column if not exists locale text not null default 'en';
