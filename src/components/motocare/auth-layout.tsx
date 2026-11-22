import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardShadow, Gap, MotoColors, StatusColors } from '@/constants/motocare-theme';

type AuthLayoutProps = {
  judul: string;
  subjudul: string;
  children: ReactNode;
};

// Kerangka yang dipakai halaman login dan register: logo MotoCare di atas, form di dalam kartu putih
export function AuthLayout({ judul, subjudul, children }: AuthLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.layar}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.konten,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 },
        ]}>
        <View style={styles.kolom}>
          <View style={styles.logo}>
            <MaterialCommunityIcons name="motorbike" size={32} color={MotoColors.accent} />
          </View>
          <Text style={styles.brand}>MotoCare</Text>
          <Text style={styles.tagline}>Pengingat servis motor</Text>

          <View style={styles.kartu}>
            <Text style={styles.judul}>{judul}</Text>
            <Text style={styles.subjudul}>{subjudul}</Text>
            {children}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Gaya form yang dipakai bersama oleh login dan register (supaya tidak ditulis dua kali)
export const formStyles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: MotoColors.text,
    marginBottom: -8,
  },
  input: {
    borderWidth: 1,
    borderColor: MotoColors.border,
    backgroundColor: MotoColors.background,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: MotoColors.text,
  },
  kotakError: {
    backgroundColor: StatusColors.perlu.bg,
    borderRadius: 14,
    padding: 14,
  },
  kotakErrorText: {
    color: StatusColors.perlu.fg,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  kotakInfo: {
    backgroundColor: StatusColors.aman.bg,
    borderRadius: 14,
    padding: 14,
  },
  kotakInfoText: {
    color: StatusColors.aman.fg,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  tombol: {
    backgroundColor: MotoColors.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tombolNonaktif: {
    opacity: 0.6,
  },
  tombolText: {
    color: MotoColors.onNavy,
    fontSize: 16,
    fontWeight: '700',
  },
  tautan: {
    textAlign: 'center',
    fontSize: 14,
    color: MotoColors.textSecondary,
  },
  tautanAksen: {
    color: MotoColors.accent,
    fontWeight: '700',
  },
});

const styles = StyleSheet.create({
  layar: {
    flex: 1,
    backgroundColor: MotoColors.navy,
  },
  konten: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  kolom: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: MotoColors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    marginTop: Gap.md,
    fontSize: 28,
    fontWeight: '800',
    color: MotoColors.onNavy,
  },
  tagline: {
    fontSize: 14,
    color: MotoColors.onNavyMuted,
    marginBottom: Gap.xl,
  },
  kartu: {
    width: '100%',
    backgroundColor: MotoColors.card,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    ...CardShadow,
  },
  judul: {
    fontSize: 20,
    fontWeight: '800',
    color: MotoColors.text,
  },
  subjudul: {
    fontSize: 14,
    color: MotoColors.textSecondary,
    marginTop: -8,
  },
});
