create table if not exists favorites (
  id         uuid        primary key default gen_random_uuid(),
  user_id    text        not null,
  title      text,
  author     text,
  cover_url  text,
  ol_key     text,
  created_at timestamptz not null default now()
);
