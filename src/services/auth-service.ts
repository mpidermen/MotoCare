import type { AuthError } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

// CODELAB 3: fungsi autentikasi (Sign Up, Sign In, Sign Out) + validasi form.
// Halaman login/register cukup memanggil fungsi di file ini, jadi halaman tetap ringkas.

export const PASSWORD_MINIMAL = 6;

// ---------- Validasi form (mengembalikan pesan error, atau null kalau valid) ----------

export function validasiNama(nama: string): string | null {
  if (nama.trim() === '') return 'Nama wajib diisi.';
  return null;
}

export function validasiEmail(email: string): string | null {
  const bersih = email.trim(); // .trim(): buang spasi yang sering ikut dari autocomplete keyboard
  if (bersih === '') return 'Email wajib diisi.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bersih)) return 'Format email tidak valid.';
  return null;
}

export function validasiPassword(password: string): string | null {
  if (password === '') return 'Kata sandi wajib diisi.';
  if (password.length < PASSWORD_MINIMAL) {
    return `Kata sandi minimal ${PASSWORD_MINIMAL} karakter.`;
  }
  return null;
}

// ---------- Pesan error yang mudah dipahami ----------

// Pesan dari Supabase berbahasa Inggris, diubah menjadi bahasa Indonesia yang jelas
function terjemahkanError(error: AuthError): string {
  const pesan = error.message.toLowerCase();

  if (pesan.includes('invalid login credentials')) return 'Email atau kata sandi salah.';
  if (pesan.includes('already registered') || pesan.includes('already been registered')) {
    return 'Email ini sudah terdaftar. Silakan masuk.';
  }
  if (pesan.includes('password should be at least')) {
    return `Kata sandi minimal ${PASSWORD_MINIMAL} karakter.`;
  }
  if (pesan.includes('email not confirmed')) {
    return 'Email belum dikonfirmasi. Cek kotak masuk email Anda.';
  }
  if (pesan.includes('rate limit') || pesan.includes('too many requests')) {
    return 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.';
  }
  if (pesan.includes('invalid email') || pesan.includes('unable to validate email')) {
    return 'Format email tidak valid.';
  }
  if (pesan.includes('fetch') || pesan.includes('network')) {
    return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
  }
  return `Terjadi kesalahan: ${error.message}`;
}

// ---------- Fungsi autentikasi ----------

// Sign Up: nama pemilik disimpan sebagai metadata user (user_metadata.nama).
// Mengembalikan true kalau pengguna langsung masuk. Kalau "Confirm email" di Supabase aktif,
// sesi belum ada sampai email dikonfirmasi, dan hasilnya false.
export async function daftar(nama: string, email: string, password: string): Promise<boolean> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { nama: nama.trim() } },
  });
  if (error) throw new Error(terjemahkanError(error));
  return data.session !== null;
}

// Sign In: kalau berhasil, Supabase menyimpan sesi ke SecureStore dan AuthContext otomatis
// mendapat kabar lewat onAuthStateChange.
export async function masuk(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw new Error(terjemahkanError(error));
}

// Sign Out: membatalkan sesi dan menghapus token dari penyimpanan perangkat
export async function keluar(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(terjemahkanError(error));
}
