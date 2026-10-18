-- KEUANGAN KELUARGA (pengganti RuangKas yang terpisah)
-- Jalankan di SQL Editor Supabase project Portal Rumah. Aman dijalankan ulang,
-- tidak menghapus data yang sudah ada. Syarat: supabase-setup.sql dan
-- supabase-complete-sync-fix.sql sudah pernah dijalankan (fungsi is_family_member).

create table if not exists public.family_transactions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  type text not null check (type in ('income','expense')),
  title text not null,
  amount numeric(16,2) not null check (amount >= 0),
  person text not null default 'Bersama' check (person in ('Suami','Istri','Bersama')),
  category text not null,
  date date not null,
  note text not null default '',
  -- id transaksi di RuangKas lama; dipakai agar impor tidak menggandakan data
  legacy_id uuid,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (family_id, legacy_id)
);
create index if not exists family_transactions_family_date_idx
  on public.family_transactions (family_id, date desc, created_at desc);
alter table public.family_transactions enable row level security;

drop policy if exists "members read transactions" on public.family_transactions;
create policy "members read transactions" on public.family_transactions for select to authenticated
using (public.is_family_member(family_id::text));
drop policy if exists "members create transactions" on public.family_transactions;
create policy "members create transactions" on public.family_transactions for insert to authenticated
with check (public.is_family_member(family_id::text) and created_by::text = auth.uid()::text);
drop policy if exists "members delete transactions" on public.family_transactions;
create policy "members delete transactions" on public.family_transactions for delete to authenticated
using (public.is_family_member(family_id::text));

-- Target pengeluaran per kategori per bulan (month = 'YYYY-MM').
create table if not exists public.family_budgets (
  family_id uuid not null references public.families(id) on delete cascade,
  month text not null check (month ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  category text not null,
  amount numeric(16,2) not null check (amount > 0),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (family_id, month, category)
);
alter table public.family_budgets enable row level security;

drop policy if exists "members read budgets" on public.family_budgets;
create policy "members read budgets" on public.family_budgets for select to authenticated
using (public.is_family_member(family_id::text));
drop policy if exists "members create budgets" on public.family_budgets;
create policy "members create budgets" on public.family_budgets for insert to authenticated
with check (public.is_family_member(family_id::text));
drop policy if exists "members update budgets" on public.family_budgets;
create policy "members update budgets" on public.family_budgets for update to authenticated
using (public.is_family_member(family_id::text)) with check (public.is_family_member(family_id::text));
drop policy if exists "members delete budgets" on public.family_budgets;
create policy "members delete budgets" on public.family_budgets for delete to authenticated
using (public.is_family_member(family_id::text));

grant select, insert, delete on public.family_transactions to authenticated;
grant select, insert, update, delete on public.family_budgets to authenticated;

-- Tambahan (v2): transaksi bisa diedit, dan perubahan keuangan langsung tampil di HP lain.
drop policy if exists "members update transactions" on public.family_transactions;
create policy "members update transactions" on public.family_transactions for update to authenticated
using (public.is_family_member(family_id::text)) with check (public.is_family_member(family_id::text));
revoke update on public.family_transactions from authenticated;
grant update (type, title, amount, person, category, date, note) on public.family_transactions to authenticated;

do $$ begin alter publication supabase_realtime add table public.family_transactions; exception when duplicate_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.family_budgets; exception when duplicate_object then null; end $$;
