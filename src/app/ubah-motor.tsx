import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MotoColors } from '@/constants/motocare-theme';
import { useMotoCare } from '@/context/motocare-context';
import { formatKm } from '@/data/motocare';

// Halaman /ubah-motor (tampil sebagai modal): mengubah nama, merek, dan kilometer motor
export default function UbahMotorScreen() {
  const insets = useSafeAreaInsets();
  const { motor, riwayat, ubahMotor } = useMotoCare();

  // useState diisi dengan data motor yang sekarang
  const [nama, setNama] = useState(motor.nama);
  const [merek, setMerek] = useState(motor.merek);
  const [kilometer, setKilometer] = useState(String(motor.kilometerSaatIni));

  // Kilometer motor tidak boleh lebih kecil dari servis tertinggi yang sudah tercatat
  const kilometerMinimum = riwayat.reduce((maks, r) => Math.max(maks, r.kilometer), 0);

  const simpan = () => {
    const angka = Number(kilometer.replace(/\D/g, ''));

    if (nama.trim() === '' || merek.trim() === '') {
      Alert.alert('Data belum lengkap', 'Nama motor dan merek wajib diisi.');
      return;
    }
    if (kilometer.trim() === '' || Number.isNaN(angka)) {
      Alert.alert('Kilometer tidak valid', 'Masukkan angka kilometer yang benar.');
      return;
    }
    if (angka < kilometerMinimum) {
      Alert.alert(
        'Kilometer terlalu kecil',
        `Riwayat servis sudah tercatat sampai ${formatKm(kilometerMinimum)} km, jadi kilometer motor tidak boleh lebih kecil.`,
      );
      return;
    }

    ubahMotor({ nama: nama.trim(), merek: merek.trim(), kilometerSaatIni: angka });
    router.back();
  };

  return (
    <ScrollView
      style={styles.layar}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.konten, { paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.label}>Nama motor</Text>
      <TextInput
        value={nama}
        onChangeText={setNama}
        placeholder="Contoh: Honda Vario 150"
        placeholderTextColor={MotoColors.textSecondary}
        style={styles.input}
      />

      <Text style={styles.label}>Merek</Text>
      <TextInput
        value={merek}
        onChangeText={setMerek}
        placeholder="Contoh: Honda"
        placeholderTextColor={MotoColors.textSecondary}
        style={styles.input}
      />

      <Text style={styles.label}>Kilometer saat ini</Text>
      <TextInput
        value={kilometer}
        onChangeText={setKilometer}
        placeholder="Contoh: 12450"
        placeholderTextColor={MotoColors.textSecondary}
        keyboardType="numeric"
        style={styles.input}
      />

      <Pressable style={styles.tombol} onPress={simpan}>
        <Text style={styles.tombolText}>Simpan Data Motor</Text>
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
