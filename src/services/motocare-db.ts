import { supabase } from '@/lib/supabase';
import {
  cariIkon,
  type AturanServis,
  type DataMotor,
  type DataServis,
  type Motor,
  type RiwayatServis,
} from '@/data/motocare';

// CODELAB 5: semua pembacaan dan penulisan data MotoCare ke Supabase (PostgreSQL) ada di file ini.
// Context (motocare-context.tsx) yang memanggil fungsi-fungsi ini; halaman tidak langsung ke database.
//
// Keamanan: kolom user_id diisi otomatis database (DEFAULT auth.uid()) dan Row Level Security
// (supabase/schema.sql) hanya mengizinkan pengguna membaca/mengubah baris miliknya sendiri.
// Jadi tidak perlu menulis filter user_id di sini.

// ---------- Bentuk baris di database (snake_case) ----------

interface MotorRow {
  id: string;
  nama: string;
  merek: string;
  model: string | null;
  kilometer_saat_ini: number;
}

interface RiwayatRow {
  id: number;
  motor_id: string;
  jenis: string;
  tanggal: string; // 'YYYY-MM-DD'
  kilometer: number;
  catatan: string;
}

interface AturanRow {
  jenis: string;
  interval_km: number;
}

// ---------- Pengubah baris database <-> tipe aplikasi (camelCase) ----------

const keMotor = (r: MotorRow): Motor => ({
  id: r.id,
  nama: r.nama,
  merek: r.merek,
  model: r.model ?? undefined,
  kilometerSaatIni: r.kilometer_saat_ini,
});

const keRiwayat = (r: RiwayatRow): RiwayatServis => ({
  id: r.id,
  motorId: r.motor_id,
  jenis: r.jenis,
  tanggal: r.tanggal,
  kilometer: r.kilometer,
  catatan: r.catatan,
});

const keAturan = (r: AturanRow): AturanServis => ({
  jenis: r.jenis,
  intervalKm: r.interval_km,
  ikon: cariIkon(r.jenis),
});

// ---------- Penanganan error ----------

interface GalatSupabase {
  message: string;
  code?: string;
}

// Mengubah error Supabase/PostgreSQL menjadi pesan yang mudah dipahami
function buatError(galat: GalatSupabase): Error {
  const pesan = galat.message.toLowerCase();

  if (galat.code === 'PGRST205' || galat.code === '42P01' || pesan.includes('schema cache')) {
    return new Error('Tabel database belum dibuat. Jalankan supabase/schema.sql di Supabase SQL Editor.');
  }
  if (galat.code === '42501' || pesan.includes('row-level security')) {
    return new Error('Akses ditolak oleh keamanan database (RLS). Pastikan Anda sudah login.');
  }
  if (pesan.includes('fetch') || pesan.includes('network')) {
    return new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
  }
  return new Error(`Gagal memproses data: ${galat.message}`);
}

// ---------- SELECT ----------

export async function ambilDaftarMotor(): Promise<Motor[]> {
  const { data, error } = await supabase
    .from('motors')
    .select('id, nama, merek, model, kilometer_saat_ini')
    .order('created_at', { ascending: true })
    .returns<MotorRow[]>();
  if (error) throw buatError(error);
  return data.map(keMotor);
}

// Semua riwayat milik pengguna (semua motor); context yang menyaring per motor aktif
export async function ambilSemuaRiwayat(): Promise<RiwayatServis[]> {
  const { data, error } = await supabase
    .from('riwayat_servis')
    .select('id, motor_id, jenis, tanggal, kilometer, catatan')
    .order('tanggal', { ascending: false })
    .returns<RiwayatRow[]>();
  if (error) throw buatError(error);
  return data.map(keRiwayat);
}

export async function ambilAturan(): Promise<AturanServis[]> {
  const { data, error } = await supabase
    .from('aturan_servis')
    .select('jenis, interval_km')
    .order('id', { ascending: true })
    .returns<AturanRow[]>();
  if (error) throw buatError(error);
  return data.map(keAturan);
}

// ---------- INSERT ----------

export async function simpanMotorBaru(data: DataMotor): Promise<Motor> {
  const { data: baris, error } = await supabase
    .from('motors')
    .insert({
      nama: data.nama,
      merek: data.merek,
      model: data.model ? data.model : null,
      kilometer_saat_ini: data.kilometerSaatIni,
    })
    .select('id, nama, merek, model, kilometer_saat_ini')
    .single<MotorRow>();
  if (error) throw buatError(error);
  return keMotor(baris);
}

export async function simpanServisBaru(motorId: string, data: DataServis): Promise<RiwayatServis> {
  const { data: baris, error } = await supabase
    .from('riwayat_servis')
    .insert({
      motor_id: motorId,
      jenis: data.jenis,
      tanggal: data.tanggal,
      kilometer: data.kilometer,
      catatan: data.catatan,
    })
    .select('id, motor_id, jenis, tanggal, kilometer, catatan')
    .single<RiwayatRow>();
  if (error) throw buatError(error);
  return keRiwayat(baris);
}

// ---------- UPDATE ----------

export async function perbaruiMotor(id: string, data: DataMotor): Promise<void> {
  const { error } = await supabase
    .from('motors')
    .update({
      nama: data.nama,
      merek: data.merek,
      model: data.model ? data.model : null,
      kilometer_saat_ini: data.kilometerSaatIni,
    })
    .eq('id', id);
  if (error) throw buatError(error);
}

export async function perbaruiKilometer(id: string, kilometer: number): Promise<void> {
  const { error } = await supabase.from('motors').update({ kilometer_saat_ini: kilometer }).eq('id', id);
  if (error) throw buatError(error);
}

// ---------- DELETE ----------

export async function hapusMotorDb(id: string): Promise<void> {
  // Riwayat servis motor ini ikut terhapus otomatis (ON DELETE CASCADE di schema.sql)
  const { error } = await supabase.from('motors').delete().eq('id', id);
  if (error) throw buatError(error);
}

export async function hapusServisDb(id: number): Promise<void> {
  const { error } = await supabase.from('riwayat_servis').delete().eq('id', id);
  if (error) throw buatError(error);
}
