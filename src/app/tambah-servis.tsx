import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MotoColors, StatusColors } from '@/constants/motocare-theme';
import { useMotoCare } from '@/context/motocare-context';
import { aturanServis, formatKm, tanggalHariIni } from '@/data/motocare';

// Halaman /tambah-servis (tampil sebagai modal). Bisa dibuka dengan /tambah-servis?jenis=...
export default function TambahServisScreen() {
  const insets = useSafeAreaInsets();
  const { motor, riwayat, tambahServis } = useMotoCare();
  const { jenis: jenisDariRoute } = useLocalSearchParams<{ jenis?: string }>();

  // useState: nilai yang sedang diisi pengguna di form
  const [jenis, setJenis] = useState<string>(aturanServis[0].jenis);
  const [kilometer, setKilometer] = useState('');
  const [catatan, setCatatan] = useState('');

  // Kilometer servis tertinggi untuk JENIS yang sedang dipilih (0 = jenis ini belum pernah dicatat).
  // Servis baru jenis ini tidak boleh di bawah angka tersebut. Berubah otomatis saat jenis diganti.
  const kmTerakhirJenis = riwayat
    .filter((r) => r.jenis === jenis)
    .reduce((maks, r) => Math.max(maks, r.kilometer), 0);

  // useEffect: setiap parameter jenis dari route berubah, pilih jenis tersebut di form
  useEffect(() => {
    if (jenisDariRoute && aturanServis.some((a) => a.jenis === jenisDariRoute)) {
      setJenis(jenisDariRoute);
    }
  }, [jenisDariRoute]);

  // Pesan error yang tampil di layar. Alert.alert tidak muncul di web, jadi pesannya juga ditulis di halaman.
  const [pesanError, setPesanError] = useState('');

  const tampilkanError = (judul: string, pesan: string) => {
    setPesanError(`${judul}: ${pesan}`);
    Alert.alert(judul, pesan);
  };

  const simpan = () => {
    setPesanError('');

    // Kalau kolom kilometer dikosongkan, pakai kilometer motor saat ini
    const angka =
      kilometer.trim() === '' ? motor.kilometerSaatIni : Number(kilometer.replace(/\D/g, ''));

    if (Number.isNaN(angka) || angka <= 0) {
      tampilkanError('Kilometer tidak valid', 'Masukkan angka kilometer yang benar.');
      return;
    }
    if (angka > motor.kilometerSaatIni) {
      tampilkanError(
        'Kilometer terlalu besar',
        `Kilometer servis tidak boleh melebihi kilometer saat ini (${formatKm(motor.kilometerSaatIni)} km). Perbarui kilometer terlebih dahulu.`,
      );
      return;
    }

    if (angka < kmTerakhirJenis) {
      tampilkanError(
        'Kilometer terlalu kecil',
        `${jenis} terakhir tercatat di ${formatKm(kmTerakhirJenis)} km, jadi kilometer servis baru tidak boleh lebih kecil dari itu.`,
      );
      return;
    }

    tambahServis({ jenis, tanggal: tanggalHariIni(), kilometer: angka, catatan: catatan.trim() });
    router.back(); // tutup halaman ini dan kembali ke halaman sebelumnya
  };

  return (
    <ScrollView
      style={styles.layar}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.konten, { paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.label}>Jenis servis</Text>
      <View style={styles.chipBaris}>
        {aturanServis.map((aturan) => {
          const aktif = aturan.jenis === jenis;
          return (
            <Pressable
              key={aturan.jenis}
              onPress={() => setJenis(aturan.jenis)}
              style={[styles.chip, aktif && styles.chipAktif]}>
              <Text style={[styles.chipText, aktif && styles.chipTextAktif]}>{aturan.jenis}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Kilometer saat servis</Text>
      <TextInput
        value={kilometer}
        onChangeText={setKilometer}
        placeholder={`Kosongkan untuk ${formatKm(motor.kilometerSaatIni)} km`}
        placeholderTextColor={MotoColors.textSecondary}
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>Catatan (opsional)</Text>
      <TextInput
        value={catatan}
        onChangeText={setCatatan}
        placeholder="Contoh: ganti oli 0,8 liter"
        placeholderTextColor={MotoColors.textSecondary}
        style={styles.input}
      />

      <Text style={styles.info}>
        {kmTerakhirJenis > 0
          ? `Isi antara ${formatKm(kmTerakhirJenis)} km (${jenis} terakhir) dan ${formatKm(motor.kilometerSaatIni)} km (kilometer saat ini). `
          : ''}
        Tanggal servis otomatis diisi hari ini.
      </Text>

      {pesanError !== '' && (
        <View style={styles.kotakError}>
          <Text style={styles.kotakErrorText}>{pesanError}</Text>
        </View>
      )}

      <Pressable style={styles.tombol} onPress={simpan}>
        <Text style={styles.tombolText}>Simpan Servis</Text>
      </Pressable>
      <Pressable style={styles.tombolSekunder} onPress={() => router.back()}>
        <Text style={styles.tombolSekunderText}>Batal</Text>
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
    marginBottom: -8,
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
  input: {
    borderWidth: 1,
    borderColor: MotoColors.border,
    backgroundColor: MotoColors.card,
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
  info: {
    fontSize: 13,
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
});
