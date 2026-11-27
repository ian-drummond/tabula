-- Tabula: initial schema.
-- One table holds every record, mirroring the collections of the original Tabula artifact
-- (items, people, colls, events/topics, imgs, props, caps, views, orgs, meta).
-- `data` is the full record as JSON (Markdown text lives in fields like data.detail),
-- and the fields the app filters on are generated columns so they can be indexed.

create table public.records (
  owner      uuid        not null default auth.uid() references auth.users(id) on delete cascade,
  coll       text        not null check (coll ~ '^[a-z_]{2,20}$'),
  id         text        not null,
  data       jsonb       not null default '{}'::jsonb,
  -- promoted fields (read-only, derived from data)
  kind       text generated always as (data->>'kind') stored,
  day        text generated always as (data->>'date') stored,
  due        text generated always as (data->>'due') stored,
  status     text generated always as (data->>'status') stored,
  sphere     text generated always as (data->>'sphere') stored,
  title      text generated always as (coalesce(data->>'text', data->>'name')) stored,
  body_md    text generated always as (data->>'detail') stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (owner, coll, id)
);

create index records_coll_day   on public.records (owner, coll, day);
create index records_coll_upd   on public.records (owner, coll, updated_at desc);
create index records_items_kind on public.records (owner, kind, status) where coll = 'items';
create index records_search     on public.records using gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(body_md,'')));

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;
create trigger records_touch before update on public.records
  for each row execute function public.touch_updated_at();

alter table public.records enable row level security;
create policy "owner reads"   on public.records for select using (owner = auth.uid());
create policy "owner inserts" on public.records for insert with check (owner = auth.uid());
create policy "owner updates" on public.records for update using (owner = auth.uid()) with check (owner = auth.uid());
create policy "owner deletes" on public.records for delete using (owner = auth.uid());

-- live updates across devices
alter publication supabase_realtime add table public.records;

-- GitHub sync bookkeeping (written only by Edge Functions with the service role)
create table public.sync_state (
  owner       uuid primary key references auth.users(id) on delete cascade,
  repo        text,
  branch      text default 'main',
  last_sha    text,
  last_push   timestamptz,
  last_pull   timestamptz,
  hashes      jsonb not null default '{}'::jsonb   -- record key -> content hash at last sync
);
alter table public.sync_state enable row level security;
create policy "owner reads sync" on public.sync_state for select using (owner = auth.uid());

-- Images: private bucket, one folder per user (images/<uid>/<image id>.jpg)
insert into storage.buckets (id, name, public) values ('images', 'images', false)
  on conflict (id) do nothing;
create policy "own images read"   on storage.objects for select using (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own images write"  on storage.objects for insert with check (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own images update" on storage.objects for update using (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own images delete" on storage.objects for delete using (bucket_id = 'images' and (storage.foldername(name))[1] = auth.uid()::text);
