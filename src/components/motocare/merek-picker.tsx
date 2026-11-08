import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { MotoColors } from '@/constants/motocare-theme';
import { useMerekMotor } from '@/hooks/use-merek-motor';

type MerekPickerProps = {
  merekTerpilih: string; // isi kolom Merek saat ini, dipakai untuk menandai chip yang aktif
  onPilih: (nama: string) => void;
};

// Merek yang ditampilkan lebih dulu. Hanya yang ADA di data API yang akan muncul.
const MEREK_POPULER = ['HONDA', 'YAMAHA', 'SUZUKI', 'KAWASAKI', 'VESPA', 'PIAGGIO', 'KTM', 'DUCATI'];

// Total merek dari API sekitar 1.700, jadi yang ditampilkan dibatasi
const BATAS_TAMPIL = 12;

// Pemilih merek dari External API (NHTSA vPIC): ada loading, error + coba lagi, dan pencarian
export function MerekPicker({ merekTerpilih, onPilih }: MerekPickerProps) {
  const { daftar, loading, error, cobaLagi } = useMerekMotor();
  const [kata, setKata] = useState('');

  const kunci = kata.trim().toUpperCase();

  // Kolom pencarian kosong -> merek populer; diisi -> semua merek yang mengandung kata itu
  const cocok = useMemo(() => {
    if (kunci === '') {
      const populer = daftar.filter((m) => MEREK_POPULER.includes(m.nama.toUpperCase()));
      return populer.length > 0 ? populer : daftar;
    }
    return daftar.filter((m) => m.nama.toUpperCase().includes(kunci));
  }, [daftar, kunci]);

  const tampil = cocok.slice(0, BATAS_TAMPIL);

  const judul = (
    <Text style={styles.judul}>Pilih merek dari katalog</Text>
  );

  if (loading) {
    return (
      <View style={styles.kotak}>
        {judul}
        <View style={styles.tengah}>
          <ActivityIndicator color={MotoColors.accent} />
          <Text style={styles.info}>Memuat daftar merek...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.kotak}>
        {judul}
        <Text style={styles.error}>{error}</Text>
        <Text style={styles.info}>Anda tetap bisa mengetik merek secara manual di kolom Merek.</Text>
        <Pressable
          style={({ pressed }) => [styles.tombolUlang, pressed && styles.ditekan]}
          onPress={cobaLagi}>
          <Text style={styles.tombolUlangText}>Coba lagi</Text>
        </Pressable>
      </View>
    );
  }

  if (daftar.length === 0) {
    return (
      <View style={styles.kotak}>
        {judul}
        <Text style={styles.info}>Server tidak mengirim data merek. Ketik merek secara manual.</Text>
        <Pressable
          style={({ pressed }) => [styles.tombolUlang, pressed && styles.ditekan]}
          onPress={cobaLagi}>
          <Text style={styles.tombolUlangText}>Coba lagi</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.kotak}>
      {judul}
      <TextInput
        value={kata}
        onChangeText={setKata}
        placeholder="Cari merek, contoh: Yamaha"
        placeholderTextColor={MotoColors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />

      <Text style={styles.info}>
        {kunci === ''
          ? 'Merek populer'
          : `${cocok.length} merek cocok${cocok.length > BATAS_TAMPIL ? ` (menampilkan ${BATAS_TAMPIL})` : ''}`}
      </Text>

      {tampil.length === 0 ? (
        <Text style={styles.info}>Merek tidak ditemukan. Anda bisa mengetik manual di kolom Merek.</Text>
      ) : (
        <View style={styles.chipBaris}>
          {tampil.map((merek) => {
            const aktif = merek.nama.toUpperCase() === merekTerpilih.trim().toUpperCase();
            return (
              <Pressable
                key={merek.id}
                onPress={() => onPilih(merek.nama)}
                style={[styles.chip, aktif && styles.chipAktif]}>
                <Text style={[styles.chipText, aktif && styles.chipTextAktif]}>{merek.nama}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <Text style={styles.sumber}>Sumber data: NHTSA vPIC (basis data kendaraan AS)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kotak: {
    backgroundColor: MotoColors.card,
    borderWidth: 1,
    borderColor: MotoColors.border,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  judul: {
    fontSize: 14,
    fontWeight: '700',
    color: MotoColors.text,
  },
  tengah: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  info: {
    fontSize: 13,
    color: MotoColors.textSecondary,
  },
  error: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B91C1C',
  },
  input: {
    borderWidth: 1,
    borderColor: MotoColors.border,
    backgroundColor: MotoColors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: MotoColors.text,
  },
  chipBaris: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: MotoColors.background,
    borderWidth: 1,
    borderColor: MotoColors.border,
  },
  chipAktif: {
    backgroundColor: MotoColors.accent,
    borderColor: MotoColors.accent,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: MotoColors.text,
  },
  chipTextAktif: {
    color: MotoColors.onNavy,
  },
  tombolUlang: {
    alignSelf: 'flex-start',
    backgroundColor: MotoColors.accentSoft,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tombolUlangText: {
    color: MotoColors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  ditekan: {
    opacity: 0.8,
  },
  sumber: {
    fontSize: 11,
    color: MotoColors.textSecondary,
  },
});
