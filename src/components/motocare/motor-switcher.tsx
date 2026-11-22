import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { MotoColors } from '@/constants/motocare-theme';
import type { Motor } from '@/data/motocare';

type MotorSwitcherProps = {
  daftarMotor: Motor[];
  motorAktifId: string;
  onPilih: (id: string) => void;
  onTambah: () => void;
};

// Baris pilihan motor di dashboard: satu akun boleh punya banyak motor.
// Menekan satu motor menjadikannya motor aktif (kartu, pengingat, dan riwayat ikut berganti).
export function MotorSwitcher({ daftarMotor, motorAktifId, onPilih, onTambah }: MotorSwitcherProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.baris}>
      {daftarMotor.map((m) => {
        const aktif = m.id === motorAktifId;
        return (
          <Pressable
            key={m.id}
            onPress={() => onPilih(m.id)}
            style={[styles.chip, aktif && styles.chipAktif]}>
            <Text style={[styles.chipText, aktif && styles.chipTextAktif]}>{m.nama}</Text>
          </Pressable>
        );
      })}
      <Pressable onPress={onTambah} style={[styles.chip, styles.chipTambah]}>
        <Ionicons name="add" size={16} color={MotoColors.accent} />
        <Text style={styles.chipTambahText}>Tambah Motor</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  baris: {
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: MotoColors.card,
    borderWidth: 1,
    borderColor: MotoColors.border,
  },
  chipAktif: {
    backgroundColor: MotoColors.navy,
    borderColor: MotoColors.navy,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: MotoColors.text,
  },
  chipTextAktif: {
    color: MotoColors.onNavy,
  },
  chipTambah: {
    backgroundColor: MotoColors.accentSoft,
    borderColor: MotoColors.accentSoft,
  },
  chipTambahText: {
    fontSize: 14,
    fontWeight: '700',
    color: MotoColors.accent,
  },
});
