import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';

// CODELAB 4: status login global. Semua halaman cukup memanggil: const { user, isLoading } = useAuth();
type AuthContextType = {
  session: Session | null; // sesi login (null = belum login)
  user: User | null; // data pengguna dari sesi
  isLoading: boolean; // true selama aplikasi masih memeriksa sesi tersimpan di SecureStore
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let aktif = true;

    // 1. Saat aplikasi pertama dibuka: minta Supabase membaca sesi tersimpan (dari SecureStore)
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!aktif) return;
        if (error) console.warn('Gagal membaca sesi:', error.message);
        setSession(data.session);
      })
      .catch((galat: unknown) => {
        console.warn('Gagal membaca sesi:', galat);
      })
      .finally(() => {
        if (aktif) setIsLoading(false); // pemeriksaan awal selesai, guard boleh mengarahkan halaman
      });

    // 2. Berlangganan perubahan sesi: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, dst.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, sesiBaru) => {
      setSession(sesiBaru);
      setIsLoading(false);
    });

    // 3. Pembersihan: berhenti berlangganan saat provider dilepas (mencegah subscription ganda)
    return () => {
      aktif = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus dipakai di dalam <AuthProvider>.');
  }
  return context;
}
