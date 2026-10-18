-- HO JAK (bahasa Aceh: "pergi ke mana") — ceklis perlengkapan untuk tiap tujuan:
-- ke rumah sakit, liburan, luar kota, dll. Dipakai bersama seluruh anggota keluarga.
-- Jalankan di SQL Editor Supabase project Portal Rumah. Aman dijalankan ulang,
-- tidak menghapus data yang sudah ada. Syarat: fungsi is_family_member sudah ada
-- (dari supabase-complete-sync-fix.sql).

create table if not exists public.family_trips (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  kind text not null default 'custom',
  trip_date date,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists family_trips_family_idx on public.family_trips (family_id, created_at desc);
alter table public.family_trips enable row level security;

drop policy if exists "members read trips" on public.family_trips;
create policy "members read trips" on public.family_trips for select to authenticated
using (public.is_family_member(family_id::text));
drop policy if exists "members create trips" on public.family_trips;
create policy "members create trips" on public.family_trips for insert to authenticated
with check (public.is_family_member(family_id::text) and created_by::text = auth.uid()::text);
drop policy if exists "members update trips" on public.family_trips;
create policy "members update trips" on public.family_trips for update to authenticated
using (public.is_family_member(family_id::text)) with check (public.is_family_member(family_id::text));
drop policy if exists "members delete trips" on public.family_trips;
create policy "members delete trips" on public.family_trips for delete to authenticated
using (public.is_family_member(family_id::text));

create table if not exists public.family_trip_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.family_trips(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  label text not null,
  checked boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists family_trip_items_trip_idx on public.family_trip_items (trip_id, position);
alter table public.family_trip_items enable row level security;

drop policy if exists "members read trip items" on public.family_trip_items;
create policy "members read trip items" on public.family_trip_items for select to authenticated
using (public.is_family_member(family_id::text));
drop policy if exists "members create trip items" on public.family_trip_items;
create policy "members create trip items" on public.family_trip_items for insert to authenticated
with check (public.is_family_member(family_id::text));
drop policy if exists "members update trip items" on public.family_trip_items;
create policy "members update trip items" on public.family_trip_items for update to authenticated
using (public.is_family_member(family_id::text)) with check (public.is_family_member(family_id::text));
drop policy if exists "members delete trip items" on public.family_trip_items;
create policy "members delete trip items" on public.family_trip_items for delete to authenticated
using (public.is_family_member(family_id::text));

grant select, insert, update, delete on public.family_trips to authenticated;
grant select, insert, update, delete on public.family_trip_items to authenticated;

-- Perubahan langsung terlihat di HP anggota lain.
do $$ begin alter publication supabase_realtime add table public.family_trips; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.family_trip_items; exception when duplicate_object then null; end $$;
