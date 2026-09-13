-- Jalankan file INI saja di Supabase SQL Editor untuk mengaktifkan chat dan notifikasi.
-- Aman untuk struktur lama yang menyimpan ID anggota sebagai text.

create or replace function public.is_family_member(target_family uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists(
    select 1 from public.family_members
    where family_id::text = target_family::text
      and user_id::text = auth.uid()::text
  )
$$;

create table if not exists public.family_notifications (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.family_messages (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  message text not null check (char_length(message) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.family_notifications enable row level security;
alter table public.family_messages enable row level security;

drop policy if exists "members read notifications" on public.family_notifications;
create policy "members read notifications" on public.family_notifications
for select to authenticated using (public.is_family_member(family_id));
drop policy if exists "members write notifications" on public.family_notifications;
create policy "members write notifications" on public.family_notifications
for insert to authenticated with check (public.is_family_member(family_id) and actor_id = auth.uid());

drop policy if exists "members read messages" on public.family_messages;
create policy "members read messages" on public.family_messages
for select to authenticated using (public.is_family_member(family_id));
drop policy if exists "members send messages" on public.family_messages;
create policy "members send messages" on public.family_messages
for insert to authenticated with check (public.is_family_member(family_id) and sender_id = auth.uid());

do $$ begin
  alter publication supabase_realtime add table public.family_notifications;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.family_messages;
exception when duplicate_object then null;
end $$;
