import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ServiceHistory } from '@/components/motocare/service-history';
import { MotoColors } from '@/constants/motocare-theme';
import { useMotoCare } from '@/context/motocare-context';
import { aturanServis, urutkanRiwayat } from '@/data/motocare';

// Halaman /riwayat : daftar semua riwayat servis dengan filter jenis servis
export default function RiwayatScreen() {
  const insets = useSafeAreaInsets();
  const { riwayat } = useMotoCare();

  // Filter disimpan di parameter route (/riwayat?jenis=...), bukan di state
  const { jenis } = useLocalSearchParams<{ jenis?: string }>();

  const daftarFilter = ['Semua', ...aturanServis.map((a) => a.jenis)];
  const riwayatUrut = urutkanRiwayat(riwayat);
  const riwayatTampil = jenis ? riwayatUrut.filter((r) => r.jenis === jenis) : riwayatUrut;

  // router.setParams: mengubah parameter pada halaman yang sama, tanpa berpindah halaman
  const pilihFilter = (nama: string) => {
    router.setParams({ jenis: nama === 'Semua' ? '' : nama });
  };

  return (
    <ScrollView
      style={styles.layar}
      contentContainerStyle={[styles.konten, { paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.label}>Filter jenis servis</Text>
      <View style={styles.chipBaris}>
        {daftarFilter.map((nama) => {
          const aktif = nama === 'Semua' ? !jenis : nama === jenis;
          return (
            <Pressable
              key={nama}
              onPress={() => pilihFilter(nama)}
              style={[styles.chip, aktif && styles.chipAktif]}>
              <Text style={[styles.chipText, aktif && styles.chipTextAktif]}>{nama}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.jumlah}>{riwayatTampil.length} servis ditemukan</Text>

      <ServiceHistory
        riwayat={riwayatTampil}
        onPilih={(id) => router.push({ pathname: '/riwayat/[id]', params: { id: String(id) } })}
      />

      <Pressable
        style={({ pressed }) => [styles.tombol, pressed && styles.ditekan]}
        onPress={() => router.push('/tambah-servis')}>
        <Text style={styles.tombolText}>Tambah Servis</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  layar: {
    flex: 1,
    backgroundColor: MotoColors.background,
  },
  konten: {
    padding: 20,
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: MotoColors.text,
  },
  chipBaris: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: MotoColors.card,
    borderWidth: 1,
    borderColor: MotoColors.border,
  },
  chipAktif: {
    backgroundColor: MotoColors.accent,
    borderColor: MotoColors.accent,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: MotoColors.text,
  },
  chipTextAktif: {
    color: MotoColors.onNavy,
  },
  jumlah: {
    fontSize: 14,
    color: MotoColors.textSecondary,
  },
  tombol: {
    backgroundColor: MotoColors.accent,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  tombolText: {
    color: MotoColors.onNavy,
    fontSize: 16,
    fontWeight: '700',
  },
  ditekan: {
    opacity: 0.8,
  },
});
