import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
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

// Halaman /tambah-motor (modal): menambah motor baru ke akun yang sedang login.
// Satu akun boleh punya banyak motor.
export default function TambahMotorScreen() {
  const insets = useSafeAreaInsets();
  const { tambahMotor } = useMotoCare();

  const [nama, setNama] = useState('');
  const [merek, setMerek] = useState('');
  const [model, setModel] = useState('');
  const [kilometer, setKilometer] = useState('');
  const [loading, setLoading] = useState(false);
  const [pesanError, setPesanError] = useState('');

  const simpan = async () => {
    if (loading) return; // cegah klik ganda
    setPesanError('');
    const angka = Number(kilometer.replace(/\D/g, ''));

    if (nama.trim() === '' || merek.trim() === '') {
      setPesanError('Data belum lengkap: nama motor dan merek wajib diisi.');
      return;
    }
    if (kilometer.trim() === '' || Number.isNaN(angka)) {
      setPesanError('Kilometer tidak valid: masukkan angka kilometer yang benar.');
      return;
    }

    setLoading(true);
    try {
      await tambahMotor({
        nama: nama.trim(),
        merek: merek.trim(),
        model: model.trim(),
        kilometerSaatIni: angka,
      });
      router.back();
    } catch (e) {
      setPesanError(e instanceof Error ? e.message : 'Gagal menambah motor.');
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
        editable={!loading}
        style={styles.input}
      />

      <Text style={styles.label}>Merek</Text>
      <TextInput
        value={merek}
        onChangeText={setMerek}
        placeholder="Contoh: Honda"
        placeholderTextColor={MotoColors.textSecondary}
        editable={!loading}
        style={styles.input}
      />
      <MerekPicker merekTerpilih={merek} onPilih={setMerek} />

      <Text style={styles.label}>Model (opsional)</Text>
      <TextInput
        value={model}
        onChangeText={setModel}
        placeholder="Contoh: Vario 150"
        placeholderTextColor={MotoColors.textSecondary}
        editable={!loading}
        style={styles.input}
      />

      <Text style={styles.label}>Kilometer saat ini</Text>
      <TextInput
        value={kilometer}
        onChangeText={setKilometer}
        placeholder="Contoh: 12450"
        placeholderTextColor={MotoColors.textSecondary}
        keyboardType="numeric"
        editable={!loading}
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
          <Text style={styles.tombolText}>Simpan Motor</Text>
        )}
      </Pressable>
      <Pressable style={styles.tombolSekunder} onPress={() => router.back()} disabled={loading}>
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
  tombolSekunderText: {
    color: MotoColors.accent,
    fontSize: 16,
    fontWeight: '700',
  },
});
