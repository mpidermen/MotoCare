import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// CODELAB 1: penyimpanan token terenkripsi (Keychain iOS / Keystore Android).
// Tiga fungsi utama sesuai modul: saveAuthToken, getAuthToken, deleteAuthToken.
// Dipakai oleh Supabase client (lib/supabase.ts) untuk menyimpan sesi login.
//
// Catatan 1: SecureStore membatasi ukuran satu nilai (sekitar 2048 byte), sedangkan sesi Supabase
// (access token + refresh token + data user) bisa lebih besar. Jadi nilai yang panjang dipecah
// menjadi beberapa potongan: "<key>.0", "<key>.1", ... dan jumlahnya disimpan di "<key>.count".
// Catatan 2: SecureStore tidak tersedia di web, jadi di web dipakai localStorage (hanya untuk
// pengujian di browser). Di Android/iOS token tetap hanya disimpan di SecureStore.
// AsyncStorage TIDAK dipakai untuk token.

const UKURAN_POTONGAN = 1500; // karakter per potongan, aman di bawah batas 2048 byte

const kunciJumlah = (key: string) => `${key}.count`;
const kunciPotongan = (key: string, index: number) => `${key}.${index}`;

const pakaiWeb = Platform.OS === 'web';

// localStorage hanya ada di browser (tidak ada saat render statis di server)
const penyimpananWeb = () => (typeof window !== 'undefined' ? window.localStorage : null);

// 1. Simpan token
export async function saveAuthToken(key: string, token: string): Promise<void> {
  if (pakaiWeb) {
    penyimpananWeb()?.setItem(key, token);
    return;
  }

  // Hapus potongan lama dulu supaya tidak ada sisa jika token baru lebih pendek
  await deleteAuthToken(key);

  const jumlah = Math.ceil(token.length / UKURAN_POTONGAN);
  for (let i = 0; i < jumlah; i++) {
    const potongan = token.slice(i * UKURAN_POTONGAN, (i + 1) * UKURAN_POTONGAN);
    await SecureStore.setItemAsync(kunciPotongan(key, i), potongan);
  }
  await SecureStore.setItemAsync(kunciJumlah(key), String(jumlah));
}

// 2. Ambil token (null = belum ada / sudah dihapus)
export async function getAuthToken(key: string): Promise<string | null> {
  if (pakaiWeb) {
    return penyimpananWeb()?.getItem(key) ?? null;
  }

  const teksJumlah = await SecureStore.getItemAsync(kunciJumlah(key));
  if (teksJumlah === null) return null;

  const jumlah = Number(teksJumlah);
  let hasil = '';
  for (let i = 0; i < jumlah; i++) {
    const potongan = await SecureStore.getItemAsync(kunciPotongan(key, i));
    if (potongan === null) return null; // data rusak: anggap tidak ada sesi
    hasil += potongan;
  }
  return hasil;
}

// 3. Hapus token (dipakai saat logout)
export async function deleteAuthToken(key: string): Promise<void> {
  if (pakaiWeb) {
    penyimpananWeb()?.removeItem(key);
    return;
  }

  const teksJumlah = await SecureStore.getItemAsync(kunciJumlah(key));
  const jumlah = teksJumlah === null ? 0 : Number(teksJumlah);
  for (let i = 0; i < jumlah; i++) {
    await SecureStore.deleteItemAsync(kunciPotongan(key, i));
  }
  await SecureStore.deleteItemAsync(kunciJumlah(key));
}
