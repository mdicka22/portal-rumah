-- PERBAIKAN FINAL SINKRONISASI PORTAL RUMAH
-- Jalankan setelah supabase-setup.sql. Tidak menghapus data yang sudah ada.

create or replace function public.is_family_member(target_family text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.family_members fm
    where fm.family_id::text = target_family::text
      and fm.user_id::text = auth.uid()::text
  )
$$;

create or replace function public.is_family_member(target_family uuid)
returns boolean
language sql stable security definer set search_path = public
as $$ select public.is_family_member(target_family::text) $$;

-- Pastikan pembuat keluarga juga tercatat sebagai anggota/pemilik.
insert into public.family_members(family_id,user_id,display_name,role)
select f.id,f.created_by,'Pemilik Keluarga','owner'
from public.families f
where not exists (
  select 1 from public.family_members fm
  where fm.family_id::text=f.id::text and fm.user_id::text=f.created_by::text
)
on conflict on constraint family_members_pkey do nothing;

alter table public.family_records drop constraint if exists family_records_record_type_check;
alter table public.family_records add constraint family_records_record_type_check
check (record_type in ('agenda','shopping','health','bill','vehicle','home','place','emergency'));

drop policy if exists "members read family" on public.families;
create policy "members read family" on public.families for select to authenticated
using (public.is_family_member(id::text) or created_by::text=auth.uid()::text);
drop policy if exists "owners update family name" on public.families;
create policy "owners update family name" on public.families for update to authenticated
using (
  exists (
    select 1 from public.family_members fm
    where fm.family_id::text=public.families.id::text
      and fm.user_id::text=auth.uid()::text
      and fm.role='owner'
  )
) with check (
  exists (
    select 1 from public.family_members fm
    where fm.family_id::text=public.families.id::text
      and fm.user_id::text=auth.uid()::text
      and fm.role='owner'
  )
);

drop policy if exists "user reads memberships" on public.family_members;
create policy "user reads memberships" on public.family_members for select to authenticated
using (user_id::text=auth.uid()::text or public.is_family_member(family_id::text));
drop policy if exists "users update own membership name" on public.family_members;
create policy "users update own membership name" on public.family_members for update to authenticated
using (user_id::text=auth.uid()::text)
with check (user_id::text=auth.uid()::text);

revoke update on public.family_members from authenticated;
grant update(display_name) on public.family_members to authenticated;
revoke update on public.families from authenticated;
grant update(name) on public.families to authenticated;
revoke update on public.family_documents from authenticated;
grant update(file_name,category) on public.family_documents to authenticated;

drop policy if exists "members read records" on public.family_records;
create policy "members read records" on public.family_records for select to authenticated
using (public.is_family_member(family_id::text));
drop policy if exists "members create records" on public.family_records;
create policy "members create records" on public.family_records for insert to authenticated
with check (public.is_family_member(family_id::text) and created_by::text=auth.uid()::text);
drop policy if exists "members update records" on public.family_records;
create policy "members update records" on public.family_records for update to authenticated
using (public.is_family_member(family_id::text)) with check (public.is_family_member(family_id::text));
drop policy if exists "creator deletes records" on public.family_records;
drop policy if exists "members delete records" on public.family_records;
create policy "members delete records" on public.family_records for delete to authenticated
using (public.is_family_member(family_id::text));

drop policy if exists "members read documents" on public.family_documents;
create policy "members read documents" on public.family_documents for select to authenticated
using (public.is_family_member(family_id::text));
drop policy if exists "members upload documents" on public.family_documents;
create policy "members upload documents" on public.family_documents for insert to authenticated
with check (public.is_family_member(family_id::text) and uploaded_by::text=auth.uid()::text);
drop policy if exists "members rename documents" on public.family_documents;
create policy "members rename documents" on public.family_documents for update to authenticated
using (public.is_family_member(family_id::text))
with check (public.is_family_member(family_id::text));
drop policy if exists "uploader deletes documents" on public.family_documents;
create policy "uploader deletes documents" on public.family_documents for delete to authenticated
using (uploaded_by::text=auth.uid()::text);

-- File arsip bersifat privat, tetapi dapat dibuka oleh seluruh anggota
-- keluarga yang sama melalui tautan aman sementara.
insert into storage.buckets(id,name,public)
values ('family-documents','family-documents',false)
on conflict (id) do update set public=false;
drop policy if exists "members read document files" on storage.objects;
create policy "members read document files" on storage.objects for select to authenticated
using (
  bucket_id='family-documents'
  and public.is_family_member((storage.foldername(name))[1]::text)
);
drop policy if exists "members upload document files" on storage.objects;
create policy "members upload document files" on storage.objects for insert to authenticated
with check (
  bucket_id='family-documents'
  and public.is_family_member((storage.foldername(name))[1]::text)
);

drop policy if exists "members read messages" on public.family_messages;
create policy "members read messages" on public.family_messages for select to authenticated
using (public.is_family_member(family_id::text));
drop policy if exists "members send messages" on public.family_messages;
create policy "members send messages" on public.family_messages for insert to authenticated
with check (public.is_family_member(family_id::text) and sender_id::text=auth.uid()::text);

drop policy if exists "members read notifications" on public.family_notifications;
create policy "members read notifications" on public.family_notifications for select to authenticated
using (public.is_family_member(family_id::text));
drop policy if exists "members write notifications" on public.family_notifications;
create policy "members write notifications" on public.family_notifications for insert to authenticated
with check (public.is_family_member(family_id::text) and actor_id::text=auth.uid()::text);

drop policy if exists "members read tasks" on public.family_tasks;
create policy "members read tasks" on public.family_tasks for select to authenticated
using (public.is_family_member(family_id::text));
drop policy if exists "members create tasks" on public.family_tasks;
create policy "members create tasks" on public.family_tasks for insert to authenticated
with check (public.is_family_member(family_id::text) and created_by::text=auth.uid()::text);
drop policy if exists "members update tasks" on public.family_tasks;
create policy "members update tasks" on public.family_tasks for update to authenticated
using (public.is_family_member(family_id::text)) with check (public.is_family_member(family_id::text));
drop policy if exists "members delete tasks" on public.family_tasks;
create policy "members delete tasks" on public.family_tasks for delete to authenticated
using (public.is_family_member(family_id::text));

-- Status baca notifikasi disimpan per pengguna, sehingga lonceng hanya
-- menampilkan kabar baru yang belum dibuka oleh akun tersebut.
create table if not exists public.family_notification_reads (
  notification_id uuid not null references public.family_notifications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (notification_id,user_id)
);
alter table public.family_notification_reads enable row level security;
drop policy if exists "users read own notification status" on public.family_notification_reads;
create policy "users read own notification status" on public.family_notification_reads
for select to authenticated using (user_id::text=auth.uid()::text);
drop policy if exists "users mark family notifications read" on public.family_notification_reads;
create policy "users mark family notifications read" on public.family_notification_reads
for insert to authenticated with check (
  user_id::text=auth.uid()::text and exists (
    select 1 from public.family_notifications n
    where n.id::text=notification_id::text
      and public.is_family_member(n.family_id::text)
  )
);

-- Profil pengguna disimpan di cloud agar foto yang sama muncul di perangkat lain.
create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  avatar_path text,
  updated_at timestamptz not null default now()
);
alter table public.user_profiles enable row level security;
drop policy if exists "users read own profile" on public.user_profiles;
create policy "users read own profile" on public.user_profiles for select to authenticated
using (user_id::text=auth.uid()::text);
drop policy if exists "users create own profile" on public.user_profiles;
create policy "users create own profile" on public.user_profiles for insert to authenticated
with check (user_id::text=auth.uid()::text);
drop policy if exists "users update own profile" on public.user_profiles;
create policy "users update own profile" on public.user_profiles for update to authenticated
using (user_id::text=auth.uid()::text) with check (user_id::text=auth.uid()::text);

insert into storage.buckets(id,name,public)
values ('family-avatars','family-avatars',false)
on conflict (id) do update set public=false;
drop policy if exists "users read own avatar" on storage.objects;
create policy "users read own avatar" on storage.objects for select to authenticated
using (bucket_id='family-avatars' and (storage.foldername(name))[1]::text=auth.uid()::text);
drop policy if exists "users upload own avatar" on storage.objects;
create policy "users upload own avatar" on storage.objects for insert to authenticated
with check (bucket_id='family-avatars' and (storage.foldername(name))[1]::text=auth.uid()::text);
drop policy if exists "users update own avatar" on storage.objects;
create policy "users update own avatar" on storage.objects for update to authenticated
using (bucket_id='family-avatars' and (storage.foldername(name))[1]::text=auth.uid()::text)
with check (bucket_id='family-avatars' and (storage.foldername(name))[1]::text=auth.uid()::text);

-- Satu pembacaan konsisten untuk semua modul. Fungsi ini memeriksa bahwa
-- pemanggil benar-benar anggota sebelum mengembalikan data keluarga.
create or replace function public.get_family_bundle(target_family text)
returns jsonb
language plpgsql stable security definer set search_path=public
as $$
begin
  if auth.uid() is null or not public.is_family_member(target_family) then
    raise exception 'Bukan anggota keluarga ini';
  end if;
  return jsonb_build_object(
    'members',coalesce((select jsonb_agg(to_jsonb(m) order by m.joined_at) from public.family_members m where m.family_id::text=target_family),'[]'::jsonb),
    'records',coalesce((select jsonb_agg(to_jsonb(r) order by r.created_at desc) from public.family_records r where r.family_id::text=target_family),'[]'::jsonb),
    'tasks',coalesce((select jsonb_agg(to_jsonb(t) order by t.created_at desc) from public.family_tasks t where t.family_id::text=target_family),'[]'::jsonb),
    'messages',coalesce((select jsonb_agg(to_jsonb(m) order by m.created_at) from public.family_messages m where m.family_id::text=target_family),'[]'::jsonb),
    'documents',coalesce((select jsonb_agg(to_jsonb(d) order by d.created_at desc) from public.family_documents d where d.family_id::text=target_family),'[]'::jsonb),
    'activity',coalesce((select jsonb_agg(to_jsonb(a) order by a.created_at desc) from public.family_activity a where a.family_id::text=target_family),'[]'::jsonb)
  );
end $$;

create or replace function public.join_family(code text, member_name text)
returns table(family_id uuid, family_name text)
language plpgsql security definer set search_path=public
as $$
declare found_family_id uuid; found_family_name text;
begin
  if auth.uid() is null then raise exception 'Login diperlukan'; end if;
  select f.id,f.name into found_family_id,found_family_name
  from public.families f where f.invite_code=upper(trim(code));
  if found_family_id is null then raise exception 'Kode keluarga tidak ditemukan'; end if;
  insert into public.family_members(family_id,user_id,display_name,role)
  values(found_family_id,auth.uid(),member_name,'member')
  on conflict on constraint family_members_pkey do update
  set display_name=excluded.display_name;
  return query select found_family_id,found_family_name;
end $$;

grant execute on function public.is_family_member(uuid) to authenticated;
grant execute on function public.is_family_member(text) to authenticated;
grant execute on function public.get_family_bundle(text) to authenticated;
grant execute on function public.join_family(text,text) to authenticated;
