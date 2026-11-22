import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { MotoColors } from '@/constants/motocare-theme';
import { AuthProvider, useAuth } from '@/context/auth-context';
import { MotoCareProvider } from '@/context/motocare-context';

SplashScreen.preventAutoHideAsync();

// CODELAB 4: Route Guard. Komponen ini membaca status login dari AuthContext dan
// mengarahkan pengguna sesuai aturan:
//  1. Masih loading                  -> jangan redirect (tunggu pemeriksaan sesi selesai)
//  2. Belum login, bukan di (auth)   -> arahkan ke /login
//  3. Sudah login, masih di (auth)   -> arahkan ke dashboard /
//  4. Logout                         -> session jadi null, otomatis kembali ke aturan nomor 2
function RootNavigator() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const diGrupAuth = (segments as string[])[0] === '(auth)';

  useEffect(() => {
    if (isLoading) return; // aturan 1

    if (!session && !diGrupAuth) {
      router.replace('/login'); // aturan 2 dan 4
    } else if (session && diGrupAuth) {
      router.replace('/'); // aturan 3
    }
  }, [session, isLoading, diGrupAuth, router]);

  // Selama loading atau menunggu redirect, tampilkan spinner di atas Stack.
  // Ini mencegah halaman privat sempat terlihat sekilas (flicker) sebelum dialihkan.
  const sedangMengalihkan = isLoading || (!session && !diGrupAuth) || (!!session && diGrupAuth);

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: MotoColors.navy },
          headerTintColor: MotoColors.onNavy,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: MotoColors.background },
        }}>
        {/* Halaman login dan register (grup route (auth)) */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        {/* Dashboard punya header sendiri di dalam halaman, jadi header Stack disembunyikan */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="riwayat/index" options={{ title: 'Riwayat Servis' }} />
        <Stack.Screen name="riwayat/[id]" options={{ title: 'Detail Servis' }} />
        <Stack.Screen
          name="tambah-servis"
          options={{ title: 'Tambah Servis', presentation: 'modal' }}
        />
        <Stack.Screen
          name="tambah-motor"
          options={{ title: 'Tambah Motor', presentation: 'modal' }}
        />
        <Stack.Screen
          name="ubah-motor"
          options={{ title: 'Ubah Data Motor', presentation: 'modal' }}
        />
      </Stack>

      {sedangMengalihkan && (
        <View style={styles.pemuatan}>
          <ActivityIndicator size="large" color={MotoColors.accent} />
        </View>
      )}
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />

      {/* AuthProvider paling luar: status login bisa dibaca semua halaman dan oleh route guard */}
      <AuthProvider>
        <AuthedApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

// key = id pengguna: saat ganti akun, data MotoCare di memori ikut di-reset
// supaya data akun lain tidak terbawa.
function AuthedApp() {
  const { user } = useAuth();
  return (
    <MotoCareProvider key={user?.id ?? 'tamu'}>
      <RootNavigator />
    </MotoCareProvider>
  );
}

const styles = StyleSheet.create({
  pemuatan: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: MotoColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
