-- Jalankan di SQL Editor Supabase. Aman dijalankan ulang.
-- Sebelumnya cuma yang upload dokumen yang bisa hapus; sekarang semua
-- anggota keluarga bisa hapus (konsisten dengan agenda/tugas/belanja yang
-- sudah bisa dihapus siapa saja).

drop policy if exists "uploader deletes documents" on public.family_documents;
drop policy if exists "members delete documents" on public.family_documents;
create policy "members delete documents" on public.family_documents for delete to authenticated
using (public.is_family_member(family_id::text));

-- File fisiknya di Storage juga perlu izin DELETE terpisah (RLS tabel dan
-- RLS storage itu dua hal beda), sebelumnya belum pernah diizinkan sama sekali.
drop policy if exists "members delete document files" on storage.objects;
create policy "members delete document files" on storage.objects for delete to authenticated
using (
  bucket_id='family-documents'
  and public.is_family_member((storage.foldername(name))[1]::text)
);
