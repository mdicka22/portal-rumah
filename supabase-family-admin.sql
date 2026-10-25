-- KELOLA KELUARGA: ganti kode undangan, keluarkan anggota, keluar dari keluarga.
-- Jalankan di SQL Editor Supabase project Portal Rumah. Aman dijalankan ulang.
-- Syarat: tabel families dan family_members dari supabase-setup.sql.
-- Semua fungsi memeriksa peran di sisi server, jadi tidak bisa dipakai orang yang tidak berhak.

-- Pemilik membuat kode undangan baru; kode lama langsung tidak berlaku.
create or replace function public.regenerate_invite_code(target_family uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_code text;
  attempts int := 0;
begin
  if auth.uid() is null then raise exception 'Login diperlukan'; end if;
  if not exists (
    select 1 from public.family_members
    where family_id = target_family and user_id = auth.uid() and role = 'owner'
  ) then
    raise exception 'Hanya pemilik keluarga yang bisa mengganti kode undangan';
  end if;
  loop
    new_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    begin
      update public.families set invite_code = new_code where id = target_family;
      exit;
    exception when unique_violation then
      attempts := attempts + 1;
      if attempts > 5 then raise; end if;
    end;
  end loop;
  return new_code;
end;
$$;

-- Pemilik mengeluarkan anggota (bukan dirinya sendiri / pemilik lain).
create or replace function public.remove_family_member(target_family uuid, target_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Login diperlukan'; end if;
  if not exists (
    select 1 from public.family_members
    where family_id = target_family and user_id = auth.uid() and role = 'owner'
  ) then
    raise exception 'Hanya pemilik keluarga yang bisa mengeluarkan anggota';
  end if;
  if target_user = auth.uid() then raise exception 'Pemilik tidak bisa mengeluarkan dirinya sendiri'; end if;
  if exists (
    select 1 from public.family_members
    where family_id = target_family and user_id = target_user and role = 'owner'
  ) then
    raise exception 'Pemilik keluarga tidak bisa dikeluarkan';
  end if;
  delete from public.family_members where family_id = target_family and user_id = target_user;
  -- Perangkatnya tidak lagi menerima notifikasi keluarga ini.
  if to_regclass('public.push_subscriptions') is not null then
    execute 'delete from public.push_subscriptions where family_id = $1 and user_id = $2' using target_family, target_user;
  end if;
end;
$$;

-- Anggota keluar sendiri dari keluarga. Pemilik tidak bisa keluar (supaya keluarga tidak tanpa pemilik).
create or replace function public.leave_family(target_family uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Login diperlukan'; end if;
  if not exists (
    select 1 from public.family_members where family_id = target_family and user_id = auth.uid()
  ) then
    raise exception 'Kamu bukan anggota keluarga ini';
  end if;
  if exists (
    select 1 from public.family_members
    where family_id = target_family and user_id = auth.uid() and role = 'owner'
  ) then
    raise exception 'Pemilik keluarga tidak bisa keluar. Keluarkan dulu anggota lain atau hubungi pengelola.';
  end if;
  delete from public.family_members where family_id = target_family and user_id = auth.uid();
  if to_regclass('public.push_subscriptions') is not null then
    execute 'delete from public.push_subscriptions where family_id = $1 and user_id = $2' using target_family, auth.uid();
  end if;
end;
$$;

revoke all on function public.regenerate_invite_code(uuid) from public;
revoke all on function public.remove_family_member(uuid, uuid) from public;
revoke all on function public.leave_family(uuid) from public;
grant execute on function public.regenerate_invite_code(uuid) to authenticated;
grant execute on function public.remove_family_member(uuid, uuid) to authenticated;
grant execute on function public.leave_family(uuid) to authenticated;
