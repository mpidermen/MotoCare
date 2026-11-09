import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { SheetModal } from '@/components/motocare/sheet-modal';
import { MotoColors, StatusColors } from '@/constants/motocare-theme';
import { formatKm } from '@/data/motocare';

type UpdateKmModalProps = {
  visible: boolean;
  kilometerSaatIni: number;
  onClose: () => void;
  onSimpan: (kilometerBaru: number) => void;
};

export function UpdateKmModal({ visible, kilometerSaatIni, onClose, onSimpan }: UpdateKmModalProps) {
  const [input, setInput] = useState('');

  // Pesan error yang tampil di layar. Alert.alert tidak muncul di web, jadi pesannya juga ditulis di panel.
  const [pesanError, setPesanError] = useState('');

  const tampilkanError = (judul: string, pesan: string) => {
    setPesanError(`${judul}: ${pesan}`);
    Alert.alert(judul, pesan);
  };

  const simpan = () => {
    setPesanError('');
    const angka = Number(input.replace(/\D/g, ''));

    if (input.trim() === '' || Number.isNaN(angka)) {
      tampilkanError('Kilometer tidak valid', 'Masukkan angka kilometer yang benar.');
      return;
    }
    if (angka < kilometerSaatIni) {
      tampilkanError(
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
    setPesanError('');
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
      {pesanError !== '' && (
        <View style={styles.kotakError}>
          <Text style={styles.kotakErrorText}>{pesanError}</Text>
        </View>
      )}
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
});
