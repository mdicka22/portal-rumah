-- Jalankan sekali di Supabase SQL Editor untuk Portal Rumah.
-- Struktur ini memakai Supabase Auth dan membatasi data per keluarga.

create extension if not exists pgcrypto;

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null default upper(substr(md5(random()::text), 1, 8)),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'member' check (role in ('owner','member')),
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
);

create table if not exists public.family_tasks (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  category text not null default 'Tugas',
  assigned_to uuid references auth.users(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete cascade,
  completed boolean not null default false,
  completed_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.families enable row level security;
alter table public.family_members enable row level security;
alter table public.family_tasks enable row level security;

create or replace function public.is_family_member(target_family uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.family_members where family_id::text=target_family::text and user_id::text=auth.uid()::text) $$;

drop policy if exists "members read family" on public.families;
create policy "members read family" on public.families for select to authenticated
using (public.is_family_member(id) or created_by=auth.uid());

drop policy if exists "user reads memberships" on public.family_members;
create policy "user reads memberships" on public.family_members for select to authenticated
using (user_id=auth.uid() or public.is_family_member(family_id));

drop policy if exists "members read tasks" on public.family_tasks;
create policy "members read tasks" on public.family_tasks for select to authenticated
using (public.is_family_member(family_id));

drop policy if exists "members create tasks" on public.family_tasks;
create policy "members create tasks" on public.family_tasks for insert to authenticated
with check (public.is_family_member(family_id) and created_by=auth.uid());

drop policy if exists "members update tasks" on public.family_tasks;
create policy "members update tasks" on public.family_tasks for update to authenticated
using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));

drop policy if exists "creator deletes tasks" on public.family_tasks;
create policy "creator deletes tasks" on public.family_tasks for delete to authenticated
using (created_by=auth.uid());

do $$ begin
  alter publication supabase_realtime add table public.family_tasks;
exception when duplicate_object then null;
end $$;

-- Fungsi aman untuk membuat keluarga dan bergabung memakai kode undangan.
create or replace function public.create_family(family_name text, member_name text)
returns table(family_id uuid, invite_code text)
language plpgsql security definer set search_path=public
as $$
declare new_id uuid; new_code text;
begin
  if auth.uid() is null then raise exception 'Login diperlukan'; end if;
  new_code := upper(substr(md5(random()::text || clock_timestamp()::text),1,8));
  insert into families(name,invite_code,created_by) values(family_name,new_code,auth.uid()) returning id into new_id;
  insert into family_members(family_id,user_id,display_name,role) values(new_id,auth.uid(),member_name,'owner');
  return query select new_id,new_code;
end $$;

create or replace function public.join_family(code text, member_name text)
returns table(family_id uuid, family_name text)
language plpgsql security definer set search_path=public
as $$
declare target_id uuid; target_name text;
begin
  if auth.uid() is null then raise exception 'Login diperlukan'; end if;
  select id,name into target_id,target_name from families where invite_code=upper(trim(code));
  if target_id is null then raise exception 'Kode keluarga tidak ditemukan'; end if;
  insert into family_members(family_id,user_id,display_name,role)
  values(target_id,auth.uid(),member_name,'member') on conflict(family_id,user_id) do nothing;
  return query select target_id,target_name;
end $$;

grant execute on function public.create_family(text,text) to authenticated;
grant execute on function public.join_family(text,text) to authenticated;

-- Arsip privat keluarga.
insert into storage.buckets (id,name,public) values ('family-documents','family-documents',false)
on conflict (id) do nothing;

create table if not exists public.family_documents (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  file_name text not null,
  file_path text not null unique,
  category text not null default 'Dokumen',
  file_size bigint not null default 0,
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.family_documents enable row level security;
drop policy if exists "members read documents" on public.family_documents;
create policy "members read documents" on public.family_documents for select to authenticated using (public.is_family_member(family_id));
drop policy if exists "members upload documents" on public.family_documents;
create policy "members upload documents" on public.family_documents for insert to authenticated with check (public.is_family_member(family_id) and uploaded_by=auth.uid());
drop policy if exists "uploader deletes documents" on public.family_documents;
create policy "uploader deletes documents" on public.family_documents for delete to authenticated using (uploaded_by=auth.uid());

drop policy if exists "members read document files" on storage.objects;
create policy "members read document files" on storage.objects for select to authenticated
using (bucket_id='family-documents' and public.is_family_member((storage.foldername(name))[1]::uuid));
drop policy if exists "members upload document files" on storage.objects;
create policy "members upload document files" on storage.objects for insert to authenticated
with check (bucket_id='family-documents' and public.is_family_member((storage.foldername(name))[1]::uuid));
drop policy if exists "uploader deletes document files" on storage.objects;
create policy "uploader deletes document files" on storage.objects as permissive for delete to authenticated using ((bucket_id = 'family-documents') and (owner_id::text = auth.uid()::text));

-- Satu sumber data bersama untuk agenda, belanja, kesehatan, tagihan,
-- kendaraan, kondisi rumah, dan lokasi keluarga.
create table if not exists public.family_records (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  record_type text not null check (record_type in ('agenda','shopping','health','bill','vehicle','home','place')),
  title text not null,
  detail jsonb not null default '{}'::jsonb,
  completed boolean not null default false,
  created_by uuid not null references auth.users(id) on delete cascade,
  completed_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.family_records enable row level security;
drop policy if exists "members read records" on public.family_records;
create policy "members read records" on public.family_records for select to authenticated using (public.is_family_member(family_id));
drop policy if exists "members create records" on public.family_records;
create policy "members create records" on public.family_records for insert to authenticated with check (public.is_family_member(family_id) and created_by=auth.uid());
drop policy if exists "members update records" on public.family_records;
create policy "members update records" on public.family_records for update to authenticated using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));
drop policy if exists "creator deletes records" on public.family_records;
create policy "creator deletes records" on public.family_records for delete to authenticated using (created_by=auth.uid());

create table if not exists public.family_activity (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);
alter table public.family_activity enable row level security;
drop policy if exists "members read activity" on public.family_activity;
create policy "members read activity" on public.family_activity for select to authenticated using (public.is_family_member(family_id));
drop policy if exists "members write activity" on public.family_activity;
create policy "members write activity" on public.family_activity for insert to authenticated with check (public.is_family_member(family_id) and actor_id=auth.uid());

do $$ begin alter publication supabase_realtime add table public.family_records; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.family_activity; exception when duplicate_object then null; end $$;

-- Notifikasi dan chat keluarga.
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
create policy "members read notifications" on public.family_notifications for select to authenticated using (public.is_family_member(family_id));
drop policy if exists "members write notifications" on public.family_notifications;
create policy "members write notifications" on public.family_notifications for insert to authenticated with check (public.is_family_member(family_id) and actor_id=auth.uid());
drop policy if exists "members read messages" on public.family_messages;
create policy "members read messages" on public.family_messages for select to authenticated using (public.is_family_member(family_id));
drop policy if exists "members send messages" on public.family_messages;
create policy "members send messages" on public.family_messages for insert to authenticated with check (public.is_family_member(family_id) and sender_id=auth.uid());
do $$ begin alter publication supabase_realtime add table public.family_notifications; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.family_messages; exception when duplicate_object then null; end $$;
