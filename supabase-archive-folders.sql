-- Jalankan di SQL Editor Supabase. Aman dijalankan ulang, tidak menghapus
-- dokumen yang sudah ada (dokumen lama otomatis masuk "Tanpa Folder").

create table if not exists public.family_document_folders (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(family_id, name)
);
alter table public.family_document_folders enable row level security;

drop policy if exists "members read folders" on public.family_document_folders;
create policy "members read folders" on public.family_document_folders for select to authenticated
using (public.is_family_member(family_id::text));
drop policy if exists "members create folders" on public.family_document_folders;
create policy "members create folders" on public.family_document_folders for insert to authenticated
with check (public.is_family_member(family_id::text) and created_by::text=auth.uid()::text);
drop policy if exists "members rename folders" on public.family_document_folders;
create policy "members rename folders" on public.family_document_folders for update to authenticated
using (public.is_family_member(family_id::text)) with check (public.is_family_member(family_id::text));
drop policy if exists "members delete folders" on public.family_document_folders;
create policy "members delete folders" on public.family_document_folders for delete to authenticated
using (public.is_family_member(family_id::text));

-- Tiap dokumen bisa nempel ke satu folder (atau tanpa folder = null).
-- Kalau foldernya dihapus, dokumen di dalamnya otomatis balik ke "Tanpa Folder"
-- (bukan ikut terhapus).
alter table public.family_documents add column if not exists folder_id uuid
  references public.family_document_folders(id) on delete set null;

-- Kolom folder_id perlu diizinkan ikut di-update (kolom lain sudah diizinkan
-- sebelumnya lewat supabase-complete-sync-fix.sql).
revoke update on public.family_documents from authenticated;
grant update(file_name,category,folder_id) on public.family_documents to authenticated;

-- Ikut disertakan saat app narik semua data keluarga sekaligus.
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
    'folders',coalesce((select jsonb_agg(to_jsonb(fo) order by fo.name) from public.family_document_folders fo where fo.family_id::text=target_family),'[]'::jsonb),
    'activity',coalesce((select jsonb_agg(to_jsonb(a) order by a.created_at desc) from public.family_activity a where a.family_id::text=target_family),'[]'::jsonb)
  );
end $$;

-- Ikut disiarkan lewat realtime supaya folder baru langsung muncul di HP lain.
do $$ begin
  alter publication supabase_realtime add table public.family_document_folders;
exception when duplicate_object then null;
end $$;
