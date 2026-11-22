-- =====================================================================
-- MotoCare - Modul 4: skema database Supabase (PostgreSQL) + Row Level Security
-- Cara pakai: Supabase Dashboard > SQL Editor > New query > tempel seluruh isi file ini > Run.
-- Aman dijalankan ulang (memakai IF NOT EXISTS / DROP ... IF EXISTS).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. TABEL
-- Semua tabel punya kolom user_id yang terhubung ke auth.users (akun login).
-- DEFAULT auth.uid() = otomatis diisi dengan id pengguna yang sedang login.
-- ON DELETE CASCADE = kalau akun / motor dihapus, data turunannya ikut terhapus.
-- ---------------------------------------------------------------------

-- Profil pengguna (1 baris per akun). Dibuat otomatis oleh trigger di bagian 3.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  nama       text not null default '',
  created_at timestamptz not null default now()
);

-- Motor milik pengguna (satu akun boleh punya banyak motor).
create table if not exists public.motors (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nama               text not null check (char_length(btrim(nama)) > 0),
  merek              text not null check (char_length(btrim(merek)) > 0),
  model              text,
  kilometer_saat_ini integer not null default 0 check (kilometer_saat_ini >= 0),
  created_at         timestamptz not null default now()
);

-- Riwayat servis. motor_id menghubungkan servis ke motornya (foreign key).
create table if not exists public.riwayat_servis (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  motor_id   uuid not null references public.motors (id) on delete cascade,
  jenis      text not null,
  tanggal    date not null,
  kilometer  integer not null check (kilometer >= 0),
  catatan    text not null default '',
  created_at timestamptz not null default now()
);

-- Aturan pengingat servis: tiap jenis servis diulang setiap sekian kilometer.
-- Status pengingat (Aman / Segera / Perlu Servis) dihitung aplikasi dari aturan ini + riwayat.
create table if not exists public.aturan_servis (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  jenis       text not null,
  interval_km integer not null check (interval_km > 0),
  unique (user_id, jenis)
);

-- Index supaya pencarian per pengguna / per motor cepat
create index if not exists motors_user_id_idx         on public.motors (user_id);
create index if not exists riwayat_servis_user_id_idx on public.riwayat_servis (user_id);
create index if not exists riwayat_servis_motor_id_idx on public.riwayat_servis (motor_id);
create index if not exists aturan_servis_user_id_idx  on public.aturan_servis (user_id);

-- ---------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY (RLS)
-- RLS membuat DATABASE sendiri yang membatasi akses: pengguna hanya bisa melihat dan mengubah
-- baris miliknya (auth.uid() = user_id). Ini berlaku walaupun kode aplikasi dibobol / diubah.
-- (select auth.uid()) ditulis begitu supaya dihitung sekali per query (lebih cepat).
-- ---------------------------------------------------------------------

alter table public.profiles       enable row level security;
alter table public.motors         enable row level security;
alter table public.riwayat_servis enable row level security;
alter table public.aturan_servis  enable row level security;

-- Hak akses dasar untuk pengguna yang sudah login (role "authenticated").
-- Hak ini hanya "pintu masuk"; baris mana yang boleh disentuh tetap ditentukan oleh policy RLS di bawah.
-- Role "anon" (belum login) sengaja TIDAK diberi hak apa pun.
grant select, insert, update, delete
  on public.profiles, public.motors, public.riwayat_servis, public.aturan_servis
  to authenticated;

-- ---- profiles (kuncinya kolom id) ----
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_delete_own" on public.profiles;

create policy "profiles_select_own" on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "profiles_delete_own" on public.profiles for delete to authenticated
  using ((select auth.uid()) = id);

-- ---- motors ----
drop policy if exists "motors_select_own" on public.motors;
drop policy if exists "motors_insert_own" on public.motors;
drop policy if exists "motors_update_own" on public.motors;
drop policy if exists "motors_delete_own" on public.motors;

create policy "motors_select_own" on public.motors for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "motors_insert_own" on public.motors for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "motors_update_own" on public.motors for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "motors_delete_own" on public.motors for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---- riwayat_servis ----
-- Untuk INSERT / UPDATE, motor yang dituju juga harus milik pengguna yang sama.
drop policy if exists "riwayat_select_own" on public.riwayat_servis;
drop policy if exists "riwayat_insert_own" on public.riwayat_servis;
drop policy if exists "riwayat_update_own" on public.riwayat_servis;
drop policy if exists "riwayat_delete_own" on public.riwayat_servis;

create policy "riwayat_select_own" on public.riwayat_servis for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "riwayat_insert_own" on public.riwayat_servis for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.motors m where m.id = motor_id and m.user_id = (select auth.uid()))
  );
create policy "riwayat_update_own" on public.riwayat_servis for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.motors m where m.id = motor_id and m.user_id = (select auth.uid()))
  );
create policy "riwayat_delete_own" on public.riwayat_servis for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---- aturan_servis ----
drop policy if exists "aturan_select_own" on public.aturan_servis;
drop policy if exists "aturan_insert_own" on public.aturan_servis;
drop policy if exists "aturan_update_own" on public.aturan_servis;
drop policy if exists "aturan_delete_own" on public.aturan_servis;

create policy "aturan_select_own" on public.aturan_servis for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "aturan_insert_own" on public.aturan_servis for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "aturan_update_own" on public.aturan_servis for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "aturan_delete_own" on public.aturan_servis for delete to authenticated
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------
-- 3. TRIGGER: saat akun baru dibuat (Sign Up), otomatis isi profil dan aturan servis bawaan.
-- Nama diambil dari metadata yang dikirim aplikasi (options.data.nama).
-- SECURITY DEFINER = fungsi berjalan dengan hak pemilik, jadi bisa menulis walau RLS aktif.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nama)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nama', ''))
  on conflict (id) do nothing;

  insert into public.aturan_servis (user_id, jenis, interval_km) values
    (new.id, 'Ganti Oli Mesin', 3000),
    (new.id, 'Ganti Oli Gardan', 8000),
    (new.id, 'Servis CVT', 8000),
    (new.id, 'Ganti Busi', 12000)
  on conflict (user_id, jenis) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 4. ISI UNTUK AKUN YANG SUDAH ADA (yang dibuat sebelum skema ini dijalankan)
-- ---------------------------------------------------------------------
insert into public.profiles (id, nama)
select u.id, coalesce(u.raw_user_meta_data ->> 'nama', '')
from auth.users u
on conflict (id) do nothing;

insert into public.aturan_servis (user_id, jenis, interval_km)
select u.id, a.jenis, a.interval_km
from auth.users u
cross join (values
  ('Ganti Oli Mesin', 3000),
  ('Ganti Oli Gardan', 8000),
  ('Servis CVT', 8000),
  ('Ganti Busi', 12000)
) as a (jenis, interval_km)
on conflict (user_id, jenis) do nothing;
