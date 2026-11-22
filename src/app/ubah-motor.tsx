import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MerekPicker } from '@/components/motocare/merek-picker';
import { MotoColors, StatusColors } from '@/constants/motocare-theme';
import { useMotoCare } from '@/context/motocare-context';
import { formatKm } from '@/data/motocare';

// Halaman /ubah-motor (tampil sebagai modal): mengubah nama, merek, dan kilometer motor
export default function UbahMotorScreen() {
  const insets = useSafeAreaInsets();
  const { motor, riwayat, ubahMotor, hapusMotor } = useMotoCare();
  const [loading, setLoading] = useState(false);
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false);

  // useState diisi dengan data motor yang sekarang
  const [nama, setNama] = useState(motor.nama);
  const [merek, setMerek] = useState(motor.merek);
  const [model, setModel] = useState(motor.model ?? ''); // Modul 3: model diketik manual
  const [kilometer, setKilometer] = useState(String(motor.kilometerSaatIni));

  // Kilometer motor tidak boleh lebih kecil dari servis tertinggi yang sudah tercatat
  const kilometerMinimum = riwayat.reduce((maks, r) => Math.max(maks, r.kilometer), 0);

  // Pesan error yang tampil di layar. Alert.alert tidak muncul di web, jadi pesannya juga ditulis di halaman.
  const [pesanError, setPesanError] = useState('');

  const tampilkanError = (judul: string, pesan: string) => {
    setPesanError(`${judul}: ${pesan}`);
    Alert.alert(judul, pesan);
  };

  const simpan = async () => {
    if (loading) return; // cegah klik ganda
    setPesanError('');
    const angka = Number(kilometer.replace(/\D/g, ''));

    if (nama.trim() === '' || merek.trim() === '') {
      tampilkanError('Data belum lengkap', 'Nama motor dan merek wajib diisi.');
      return;
    }
    if (kilometer.trim() === '' || Number.isNaN(angka)) {
      tampilkanError('Kilometer tidak valid', 'Masukkan angka kilometer yang benar.');
      return;
    }
    if (angka < kilometerMinimum) {
      tampilkanError(
        'Kilometer terlalu kecil',
        `Riwayat servis sudah tercatat sampai ${formatKm(kilometerMinimum)} km, jadi kilometer motor tidak boleh lebih kecil.`,
      );
      return;
    }

    setLoading(true);
    try {
      await ubahMotor({ nama: nama.trim(), merek: merek.trim(), model: model.trim(), kilometerSaatIni: angka });
      router.back();
    } catch (e) {
      setPesanError(e instanceof Error ? e.message : 'Gagal menyimpan data motor.');
      setLoading(false);
    }
  };

  // DELETE: perlu ditekan dua kali supaya tidak terhapus tanpa sengaja (riwayat servisnya ikut terhapus)
  const hapus = async () => {
    if (loading) return;
    if (!konfirmasiHapus) {
      setKonfirmasiHapus(true);
      return;
    }
    setLoading(true);
    try {
      await hapusMotor();
      router.back();
    } catch (e) {
      setPesanError(e instanceof Error ? e.message : 'Gagal menghapus motor.');
      setKonfirmasiHapus(false);
      setLoading(false);
    }
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

      {/* Modul 3: daftar merek dari External API. Memilih merek mengisi kolom Merek di atas */}
      <MerekPicker merekTerpilih={merek} onPilih={setMerek} />

      <Text style={styles.label}>Model (opsional)</Text>
      <TextInput
        value={model}
        onChangeText={setModel}
        placeholder="Contoh: Vario 150"
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

      {pesanError !== '' && (
        <View style={styles.kotakError}>
          <Text style={styles.kotakErrorText}>{pesanError}</Text>
        </View>
      )}

      <Pressable
        style={[styles.tombol, loading && { opacity: 0.6 }]}
        onPress={simpan}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={MotoColors.onNavy} />
        ) : (
          <Text style={styles.tombolText}>Simpan Data Motor</Text>
        )}
      </Pressable>
      <Pressable style={styles.tombolSekunder} onPress={() => router.back()} disabled={loading}>
        <Text style={styles.tombolSekunderText}>Batal</Text>
      </Pressable>
      <Pressable style={styles.tombolHapus} onPress={hapus} disabled={loading}>
        <Text style={styles.tombolHapusText}>
          {konfirmasiHapus ? 'Tekan lagi untuk menghapus motor dan riwayatnya' : 'Hapus Motor'}
        </Text>
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
  tombolSekunderText: {
    color: MotoColors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
});
