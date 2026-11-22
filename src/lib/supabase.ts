import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { deleteAuthToken, getAuthToken, saveAuthToken } from '@/lib/secure-token';

// CODELAB 2: satu Supabase client untuk seluruh aplikasi (singleton).
// Halaman lain cukup: import { supabase } from '@/lib/supabase';

// URL dan Anon Key dibaca dari file .env (tidak ditulis di kode). Awalan EXPO_PUBLIC_ wajib
// supaya Expo menyertakan nilainya ke dalam aplikasi.
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (SUPABASE_URL === '' || SUPABASE_ANON_KEY === '') {
  throw new Error(
    'EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY belum diisi. Salin .env.example menjadi .env, isi dengan data project Supabase, lalu jalankan ulang Expo (npx expo start -c).',
  );
}

// Adapter: menghubungkan Supabase ke SecureStore. Supabase memanggil getItem/setItem/removeItem
// sendiri setiap kali sesi dibuat, diperbarui, atau dihapus.
const SecureStoreAdapter = {
  getItem: (key: string) => getAuthToken(key),
  setItem: (key: string, value: string) => saveAuthToken(key, value),
  removeItem: (key: string) => deleteAuthToken(key),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: SecureStoreAdapter, // sesi disimpan terenkripsi, bertahan setelah aplikasi ditutup
    autoRefreshToken: true, // token akses diperbarui otomatis memakai refresh token
    persistSession: true,
    detectSessionInUrl: false, // di aplikasi mobile tidak ada sesi lewat URL
  },
});

// Di HP, hentikan pembaruan token saat aplikasi di background dan lanjutkan saat kembali dibuka
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (status) => {
    if (status === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
