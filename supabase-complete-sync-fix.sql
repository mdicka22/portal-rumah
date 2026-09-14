-- PERBAIKAN FINAL SINKRONISASI PORTAL RUMAH
-- Jalankan setelah supabase-setup.sql. Tidak menghapus data yang sudah ada.

create or replace function public.is_family_member(target_family uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.family_members fm
    where fm.family_id::text = target_family::text
      and fm.user_id::text = auth.uid()::text
  )
$$;

-- Pastikan pembuat keluarga juga tercatat sebagai anggota/pemilik.
insert into public.family_members(family_id,user_id,display_name,role)
select f.id,f.created_by,'Pemilik Keluarga','owner'
from public.families f
where not exists (
  select 1 from public.family_members fm
  where fm.family_id::text=f.id::text and fm.user_id::text=f.created_by::text
)
on conflict on constraint family_members_pkey do nothing;

drop policy if exists "members read family" on public.families;
create policy "members read family" on public.families for select to authenticated
using (public.is_family_member(id) or created_by::text=auth.uid()::text);

drop policy if exists "user reads memberships" on public.family_members;
create policy "user reads memberships" on public.family_members for select to authenticated
using (user_id::text=auth.uid()::text or public.is_family_member(family_id));

drop policy if exists "members read records" on public.family_records;
create policy "members read records" on public.family_records for select to authenticated
using (public.is_family_member(family_id));
drop policy if exists "members create records" on public.family_records;
create policy "members create records" on public.family_records for insert to authenticated
with check (public.is_family_member(family_id) and created_by::text=auth.uid()::text);
drop policy if exists "members update records" on public.family_records;
create policy "members update records" on public.family_records for update to authenticated
using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));
drop policy if exists "creator deletes records" on public.family_records;
create policy "creator deletes records" on public.family_records for delete to authenticated
using (created_by::text=auth.uid()::text);

drop policy if exists "members read documents" on public.family_documents;
create policy "members read documents" on public.family_documents for select to authenticated
using (public.is_family_member(family_id));
drop policy if exists "members upload documents" on public.family_documents;
create policy "members upload documents" on public.family_documents for insert to authenticated
with check (public.is_family_member(family_id) and uploaded_by::text=auth.uid()::text);
drop policy if exists "uploader deletes documents" on public.family_documents;
create policy "uploader deletes documents" on public.family_documents for delete to authenticated
using (uploaded_by::text=auth.uid()::text);

drop policy if exists "members read messages" on public.family_messages;
create policy "members read messages" on public.family_messages for select to authenticated
using (public.is_family_member(family_id));
drop policy if exists "members send messages" on public.family_messages;
create policy "members send messages" on public.family_messages for insert to authenticated
with check (public.is_family_member(family_id) and sender_id::text=auth.uid()::text);

drop policy if exists "members read notifications" on public.family_notifications;
create policy "members read notifications" on public.family_notifications for select to authenticated
using (public.is_family_member(family_id));
drop policy if exists "members write notifications" on public.family_notifications;
create policy "members write notifications" on public.family_notifications for insert to authenticated
with check (public.is_family_member(family_id) and actor_id::text=auth.uid()::text);

drop policy if exists "members read tasks" on public.family_tasks;
create policy "members read tasks" on public.family_tasks for select to authenticated
using (public.is_family_member(family_id));
drop policy if exists "members create tasks" on public.family_tasks;
create policy "members create tasks" on public.family_tasks for insert to authenticated
with check (public.is_family_member(family_id) and created_by::text=auth.uid()::text);
drop policy if exists "members update tasks" on public.family_tasks;
create policy "members update tasks" on public.family_tasks for update to authenticated
using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));

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
grant execute on function public.join_family(text,text) to authenticated;
