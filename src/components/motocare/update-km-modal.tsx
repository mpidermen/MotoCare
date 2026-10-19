import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput } from 'react-native';

import { SheetModal } from '@/components/motocare/sheet-modal';
import { MotoColors } from '@/constants/motocare-theme';
import { formatKm } from '@/data/motocare';

type UpdateKmModalProps = {
  visible: boolean;
  kilometerSaatIni: number;
  onClose: () => void;
  onSimpan: (kilometerBaru: number) => void;
};

export function UpdateKmModal({ visible, kilometerSaatIni, onClose, onSimpan }: UpdateKmModalProps) {
  const [input, setInput] = useState('');

  const simpan = () => {
    const angka = Number(input.replace(/\D/g, ''));

    if (input.trim() === '' || Number.isNaN(angka)) {
      Alert.alert('Kilometer tidak valid', 'Masukkan angka kilometer yang benar.');
      return;
    }
    if (angka < kilometerSaatIni) {
      Alert.alert(
        'Kilometer terlalu kecil',
        `Kilometer baru tidak boleh lebih kecil dari ${formatKm(kilometerSaatIni)} km.`,
      );
      return;
    }

    onSimpan(angka);
    setInput('');
  };

  const tutup = () => {
    setInput('');
    onClose();
  };

  return (
    <SheetModal visible={visible} judul="Perbarui Kilometer" onClose={tutup}>
      <Text style={styles.label}>Kilometer saat ini: {formatKm(kilometerSaatIni)} km</Text>
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder="Contoh: 12600"
        placeholderTextColor={MotoColors.textSecondary}
        keyboardType="numeric"
        style={styles.input}
      />
      <Pressable style={styles.tombol} onPress={simpan}>
        <Text style={styles.tombolText}>Simpan Kilometer</Text>
      </Pressable>
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: MotoColors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: MotoColors.border,
    backgroundColor: MotoColors.background,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
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
});
