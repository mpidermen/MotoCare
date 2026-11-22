import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CardShadow, MotoColors, StatusColors } from '@/constants/motocare-theme';
import { useMotoCare } from '@/context/motocare-context';
import { cariIkon, formatKm, formatTanggal, hitungJarakSejakServis } from '@/data/motocare';

// Dynamic route: /riwayat/1, /riwayat/2, dst. Nilai id diambil dari URL.
export default function DetailServisScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { motor, riwayat, hapusServis } = useMotoCare();
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false);
  const [menghapus, setMenghapus] = useState(false);
  const [pesanError, setPesanError] = useState('');

  const servis = riwayat.find((r) => r.id === Number(id));

  // router.canGoBack: cek dulu apakah ada halaman sebelumnya.
  // Kalau ada -> back(), kalau tidak (misal dibuka langsung lewat link) -> replace() ke daftar riwayat.
  const kembali = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/riwayat');
    }
  };

  // DELETE: perlu ditekan dua kali supaya tidak terhapus tanpa sengaja
  const hapus = async () => {
    if (!servis || menghapus) return;
    if (!konfirmasiHapus) {
      setKonfirmasiHapus(true);
      return;
    }
    setMenghapus(true);
    try {
      await hapusServis(servis.id);
      kembali();
    } catch (e) {
      setPesanError(e instanceof Error ? e.message : 'Gagal menghapus servis.');
      setKonfirmasiHapus(false);
      setMenghapus(false);
    }
  };

  // Saat sedang menghapus, data sudah hilang dari daftar: tampilkan spinner (bukan "tidak ditemukan")
  if (!servis && menghapus) {
    return (
      <View style={styles.kosong}>
        <ActivityIndicator color={MotoColors.accent} />
      </View>
    );
  }

  if (!servis) {
    return (
      <View style={styles.kosong}>
        <Text style={styles.kosongJudul}>Data servis tidak ditemukan</Text>
        <Pressable style={styles.tombol} onPress={kembali}>
          <Text style={styles.tombolText}>Kembali</Text>
        </Pressable>
      </View>
    );
  }

  const jarak = hitungJarakSejakServis(motor.kilometerSaatIni, servis);

  return (
    <ScrollView
      style={styles.layar}
      contentContainerStyle={[styles.konten, { paddingBottom: insets.bottom + 24 }]}>
      {/* Mengubah judul header sesuai jenis servis yang sedang dibuka */}
      <Stack.Screen options={{ title: servis.jenis }} />

      <View style={styles.card}>
        <View style={styles.ikon}>
          <MaterialCommunityIcons name={cariIkon(servis.jenis)} size={32} color={MotoColors.accent} />
        </View>
        <Text style={styles.jenis}>{servis.jenis}</Text>
        <Text style={styles.tanggal}>{formatTanggal(servis.tanggal)}</Text>

        <View style={styles.baris}>
          <View style={styles.info}>
            <Text style={styles.infoLabel}>Saat servis</Text>
            <Text style={styles.infoNilai}>{formatKm(servis.kilometer)} km</Text>
          </View>
          <View style={styles.pemisah} />
          <View style={styles.info}>
            <Text style={styles.infoLabel}>Sejak servis</Text>
            <Text style={styles.infoNilai}>{formatKm(jarak)} km</Text>
          </View>
        </View>

        <Text style={styles.catatanLabel}>Catatan</Text>
        <Text style={styles.catatan}>
          {servis.catatan.length > 0 ? servis.catatan : 'Tidak ada catatan.'}
        </Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.tombol, pressed && styles.ditekan]}
        onPress={() =>
          router.push({ pathname: '/tambah-servis', params: { jenis: servis.jenis } })
        }>
        <Text style={styles.tombolText}>Catat Servis {servis.jenis} Lagi</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.tombolSekunder, pressed && styles.ditekan]}
        onPress={kembali}>
        <Text style={styles.tombolSekunderText}>Kembali</Text>
      </Pressable>

      {pesanError !== '' && (
        <View style={styles.kotakError}>
          <Text style={styles.kotakErrorText}>{pesanError}</Text>
        </View>
      )}
      <Pressable style={styles.tombolHapus} onPress={hapus} disabled={menghapus}>
        <Text style={styles.tombolHapusText}>
          {konfirmasiHapus ? 'Tekan lagi untuk menghapus servis ini' : 'Hapus Servis'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  kotakError: {
    backgroundColor: StatusColors.perlu.bg,
    borderRadius: 14,
    padding: 14,
  },
  kotakErrorText: {
    color: StatusColors.perlu.fg,
    fontSize: 14,
    fontWeight: '600',
  },
  tombolHapus: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: StatusColors.perlu.bg,
  },
  tombolHapusText: {
    color: StatusColors.perlu.fg,
    fontSize: 15,
    fontWeight: '700',
  },
  layar: {
    flex: 1,
    backgroundColor: MotoColors.background,
  },
  konten: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: MotoColors.card,
    borderRadius: 20,
    padding: 20,
    gap: 6,
    alignItems: 'center',
    ...CardShadow,
  },
  ikon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: MotoColors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  jenis: {
    fontSize: 22,
    fontWeight: '800',
    color: MotoColors.text,
    textAlign: 'center',
  },
  tanggal: {
    fontSize: 15,
    color: MotoColors.textSecondary,
    marginBottom: 12,
  },
  baris: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: MotoColors.background,
    borderRadius: 14,
    paddingVertical: 12,
  },
  info: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  infoLabel: {
    fontSize: 13,
    color: MotoColors.textSecondary,
  },
  infoNilai: {
    fontSize: 18,
    fontWeight: '700',
    color: MotoColors.text,
  },
  pemisah: {
    width: 1,
    height: 32,
    backgroundColor: MotoColors.border,
  },
  catatanLabel: {
    alignSelf: 'flex-start',
    fontSize: 14,
    fontWeight: '600',
    color: MotoColors.text,
    marginTop: 16,
  },
  catatan: {
    alignSelf: 'flex-start',
    fontSize: 15,
    lineHeight: 22,
    color: MotoColors.text,
  },
  tombol: {
    backgroundColor: MotoColors.accent,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  tombolText: {
    color: MotoColors.onNavy,
    fontSize: 16,
    fontWeight: '700',
  },
  tombolSekunder: {
    backgroundColor: MotoColors.card,
    borderWidth: 1,
    borderColor: MotoColors.border,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  tombolSekunderText: {
    color: MotoColors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
  ditekan: {
    opacity: 0.8,
  },
  kosong: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 20,
    backgroundColor: MotoColors.background,
  },
  kosongJudul: {
    fontSize: 16,
    color: MotoColors.textSecondary,
  },
});
