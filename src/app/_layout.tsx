import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { MotoColors } from '@/constants/motocare-theme';
import { MotoCareProvider } from '@/context/motocare-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />

      {/* Provider membungkus Stack, jadi semua halaman bisa memakai data MotoCare */}
      <MotoCareProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: MotoColors.navy },
            headerTintColor: MotoColors.onNavy,
            headerTitleStyle: { fontWeight: '700' },
            contentStyle: { backgroundColor: MotoColors.background },
          }}>
          {/* Dashboard punya header sendiri di dalam halaman, jadi header Stack disembunyikan */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="riwayat/index" options={{ title: 'Riwayat Servis' }} />
          <Stack.Screen name="riwayat/[id]" options={{ title: 'Detail Servis' }} />
          <Stack.Screen
            name="tambah-servis"
            options={{ title: 'Tambah Servis', presentation: 'modal' }}
          />
          <Stack.Screen
            name="ubah-motor"
            options={{ title: 'Ubah Data Motor', presentation: 'modal' }}
          />
        </Stack>
      </MotoCareProvider>
    </ThemeProvider>
  );
}
