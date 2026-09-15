-- Jalankan SETELAH kamu deploy Edge Function "push-notify" (lihat file
-- push-notify-edge-function.ts). URL function-nya sudah diisi otomatis
-- untuk project kamu (jmsoifzcrvjulzdzyqhr).
-- Buat secret bernama portal_push_trigger_secret di Supabase Vault.
-- Nilainya HARUS sama dengan PUSH_TRIGGER_SECRET pada Edge Function.

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
alter table public.push_subscriptions enable row level security;
drop policy if exists "users manage own push subscription" on public.push_subscriptions;
create policy "users manage own push subscription" on public.push_subscriptions
for all to authenticated
using (user_id::text = auth.uid()::text)
with check (user_id::text = auth.uid()::text and public.is_family_member(family_id::text));

-- Fungsi yang dipanggil tiap ada baris baru di chat / tugas / agenda,
-- lalu meneruskan ke Edge Function buat dikirim sebagai push notification.
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
begin
  if TG_TABLE_NAME = 'family_messages' then
    event_type := 'chat'; event_title := 'Pesan baru di Portal Rumah'; event_body := left(NEW.message, 120); actor := NEW.sender_id;
  elsif TG_TABLE_NAME = 'family_tasks' then
    event_type := 'tugas'; event_title := 'Tugas baru untuk keluarga'; event_body := NEW.title; actor := NEW.created_by;
  elsif TG_TABLE_NAME = 'family_records' and NEW.record_type = 'agenda' then
    event_type := 'agenda'; event_title := 'Agenda baru ditambahkan'; event_body := NEW.title; actor := NEW.created_by;
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
      'body', event_body
    )
  );
  return NEW;
end;
$$;

drop trigger if exists trg_notify_chat on public.family_messages;
create trigger trg_notify_chat after insert on public.family_messages
for each row execute function public.notify_family_push();

drop trigger if exists trg_notify_tasks on public.family_tasks;
create trigger trg_notify_tasks after insert on public.family_tasks
for each row execute function public.notify_family_push();

drop trigger if exists trg_notify_agenda on public.family_records;
create trigger trg_notify_agenda after insert on public.family_records
for each row execute function public.notify_family_push();
