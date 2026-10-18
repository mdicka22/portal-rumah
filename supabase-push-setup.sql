-- NOTIFIKASI PUSH (v2) — jalankan di SQL Editor Supabase project Portal Rumah.
-- Aman dijalankan ulang; versi lama langsung diperbarui. Syarat:
--   1. Edge Function "push-notify" sudah di-deploy (versi terbaru: push-notify-edge-function.ts).
--   2. Secret bernama portal_push_trigger_secret ada di Supabase Vault.
--      Nilainya HARUS sama dengan PUSH_TRIGGER_SECRET pada Edge Function.
--
-- Yang baru di v2: nama pengirim di judul notifikasi, notifikasi untuk belanja,
-- Ho Jak, dan keuangan (selain chat, tugas, agenda), bisa dibisukan per jenis
-- dan per perangkat (kolom muted), serta fungsi uji send_test_push().

create extension if not exists pg_net;
create extension if not exists supabase_vault with schema vault;

-- Tempat menyimpan "alamat" push tiap perangkat per anggota keluarga.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz not null default now()
);
-- Jenis notifikasi yang dibisukan di perangkat ini, contoh: {chat,keuangan}
alter table public.push_subscriptions add column if not exists muted text[] not null default '{}';
alter table public.push_subscriptions enable row level security;
drop policy if exists "users manage own push subscription" on public.push_subscriptions;
create policy "users manage own push subscription" on public.push_subscriptions
for all to authenticated
using (user_id::text = auth.uid()::text)
with check (user_id::text = auth.uid()::text and public.is_family_member(family_id::text));

-- Nama tampilan anggota, dipakai sebagai judul notifikasi.
create or replace function public.push_actor_name(fam uuid, uid uuid)
returns text
language sql stable security definer set search_path = public
as $$
  select coalesce((select nullif(btrim(display_name), '') from public.family_members
                   where family_id = fam and user_id = uid limit 1), 'Keluarga')
$$;

-- Dipanggil tiap ada baris baru; meneruskan ke Edge Function untuk dikirim sebagai push.
create or replace function public.notify_family_push()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  event_type text;
  event_title text;
  event_body text;
  actor uuid;
  actor_name text;
begin
  if TG_TABLE_NAME = 'family_messages' then
    actor := NEW.sender_id; actor_name := public.push_actor_name(NEW.family_id, actor);
    event_type := 'chat'; event_title := actor_name; event_body := left(NEW.message, 140);
  elsif TG_TABLE_NAME = 'family_tasks' then
    actor := NEW.created_by; actor_name := public.push_actor_name(NEW.family_id, actor);
    event_type := 'tugas'; event_title := actor_name || ' memberi tugas'; event_body := NEW.title;
  elsif TG_TABLE_NAME = 'family_records' and NEW.record_type = 'agenda' then
    actor := NEW.created_by; actor_name := public.push_actor_name(NEW.family_id, actor);
    event_type := 'agenda'; event_title := actor_name || ' menambah agenda'; event_body := NEW.title;
  elsif TG_TABLE_NAME = 'family_records' and NEW.record_type = 'shopping' then
    actor := NEW.created_by; actor_name := public.push_actor_name(NEW.family_id, actor);
    event_type := 'belanja'; event_title := actor_name || ' menambah belanjaan'; event_body := NEW.title;
  elsif TG_TABLE_NAME = 'family_trips' then
    actor := NEW.created_by; actor_name := public.push_actor_name(NEW.family_id, actor);
    event_type := 'hojak'; event_title := actor_name || ' membuat Ho Jak'; event_body := NEW.title;
  elsif TG_TABLE_NAME = 'family_transactions' then
    -- Transaksi hasil impor dari RuangKas lama tidak perlu memberi notifikasi.
    if NEW.legacy_id is not null then return NEW; end if;
    actor := NEW.created_by; actor_name := public.push_actor_name(NEW.family_id, actor);
    event_type := 'keuangan';
    event_title := actor_name || ' mencatat ' || case when NEW.type = 'income' then 'pemasukan' else 'pengeluaran' end;
    event_body := NEW.title;
  else
    return NEW;
  end if;

  perform net.http_post(
    url := 'https://jmsoifzcrvjulzdzyqhr.supabase.co/functions/v1/push-notify',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'x-push-secret',(
        select btrim(decrypted_secret, E' \t\n\r\"''') from vault.decrypted_secrets
        where name='portal_push_trigger_secret'
        order by created_at desc limit 1
      )
    ),
    body := jsonb_build_object(
      'family_id', NEW.family_id,
      'actor_id', actor,
      'type', event_type,
      'title', event_title,
      'body', event_body,
      'sender', actor_name
    )
  );
  return NEW;
end;
$$;

-- Pasang trigger hanya pada tabel yang sudah ada.
do $$
declare
  t record;
begin
  for t in select * from (values
    ('family_messages','trg_notify_chat'),
    ('family_tasks','trg_notify_tasks'),
    ('family_records','trg_notify_agenda'),
    ('family_trips','trg_notify_trips'),
    ('family_transactions','trg_notify_transactions')
  ) as v(tbl, trg)
  loop
    if to_regclass('public.' || t.tbl) is not null then
      execute format('drop trigger if exists %I on public.%I', t.trg, t.tbl);
      execute format('create trigger %I after insert on public.%I for each row execute function public.notify_family_push()', t.trg, t.tbl);
    end if;
  end loop;
end $$;

-- Uji ujung-ke-ujung: dipanggil dari Profil > Notifikasi > "Kirim notifikasi uji".
-- Mengirim satu notifikasi ke semua perangkat milik pengguna yang memanggil.
create or replace function public.send_test_push()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  fam uuid;
begin
  if auth.uid() is null then raise exception 'Belum masuk'; end if;
  select family_id into fam from public.push_subscriptions where user_id = auth.uid() limit 1;
  if fam is null then
    return jsonb_build_object('ok', false, 'reason', 'Perangkat ini belum terdaftar. Aktifkan notifikasi dulu.');
  end if;
  perform net.http_post(
    url := 'https://jmsoifzcrvjulzdzyqhr.supabase.co/functions/v1/push-notify',
    headers := jsonb_build_object(
      'Content-Type','application/json',
      'x-push-secret',(
        select btrim(decrypted_secret, E' \t\n\r\"''') from vault.decrypted_secrets
        where name='portal_push_trigger_secret'
        order by created_at desc limit 1
      )
    ),
    body := jsonb_build_object(
      'family_id', fam,
      'target_user_id', auth.uid(),
      'type', 'test',
      'title', 'Notifikasi uji Portal Rumah',
      'body', 'Kalau ini muncul, notifikasi dari server berfungsi.',
      'sender', 'Portal Rumah'
    )
  );
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.send_test_push() from public;
grant execute on function public.send_test_push() to authenticated;
