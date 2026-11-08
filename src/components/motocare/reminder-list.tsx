import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusChip } from '@/components/motocare/status-chip';
import { CardShadow, MotoColors, StatusColors } from '@/constants/motocare-theme';
import { formatKm, type Pengingat } from '@/data/motocare';

type ReminderListProps = {
  pengingat: Pengingat[];
  onPilih?: (jenis: string) => void; // dipanggil saat satu pengingat ditekan
};

function teksSisa(p: Pengingat): string {
  if (p.sisaKm === null || p.targetKm === null) {
    return 'Catat servis pertama untuk mulai menghitung.';
  }
  const target = `Target ${formatKm(p.targetKm)} km`;
  if (p.sisaKm >= 0) return `${target} · sisa ${formatKm(p.sisaKm)} km`;
  return `${target} · lewat ${formatKm(-p.sisaKm)} km`;
}

export function ReminderList({ pengingat, onPilih }: ReminderListProps) {
  return (
    <View style={styles.daftar}>
      {pengingat.map((p) => {
        const warna = StatusColors[p.status];
        return (
          <Pressable
            key={p.jenis}
            disabled={!onPilih}
            onPress={() => onPilih?.(p.jenis)}
            style={({ pressed }) => [styles.card, pressed && styles.ditekan]}>
            <View style={styles.baris}>
              <View style={[styles.ikon, { backgroundColor: warna.bg }]}>
                <MaterialCommunityIcons name={p.ikon} size={22} color={warna.fg} />
              </View>
              <View style={styles.teks}>
                <Text style={styles.jenis}>{p.jenis}</Text>
                <Text style={styles.detail}>{teksSisa(p)}</Text>
              </View>
            </View>

            {/* Progress bar: seberapa banyak interval kilometer sudah terpakai */}
            <View style={styles.barLatar}>
              <View
                style={[
                  styles.barIsi,
                  { width: `${Math.round(p.progress * 100)}%`, backgroundColor: warna.bar },
                ]}
              />
            </View>

            <StatusChip status={p.status} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  daftar: {
    gap: 12,
  },
  card: {
    backgroundColor: MotoColors.card,
    borderRadius: 20,
    padding: 16,
    gap: 12,
    ...CardShadow,
  },
  ditekan: {
    opacity: 0.85,
  },
  baris: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ikon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teks: {
    flex: 1,
  },
  jenis: {
    fontSize: 16,
    fontWeight: '700',
    color: MotoColors.text,
  },
  detail: {
    fontSize: 14,
    color: MotoColors.textSecondary,
    marginTop: 2,
    lineHeight: 20,
  },
  barLatar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: MotoColors.border,
    overflow: 'hidden',
  },
  barIsi: {
    height: 8,
    borderRadius: 4,
  },
});
