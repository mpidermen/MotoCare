import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusChip } from '@/components/motocare/status-chip';
import { MotoColors } from '@/constants/motocare-theme';
import { formatKm, type Motor, type Pengingat, type StatusServis } from '@/data/motocare';

type MotorCardProps = {
  motor: Motor;
  pengingat: Pengingat[];
  statusKeseluruhan: StatusServis;
  onEdit: () => void;
};

// Ringkasan singkat kondisi perawatan, dihitung dari daftar pengingat
function buatRingkasan(pengingat: Pengingat[]): string {
  const jumlahPerlu = pengingat.filter((p) => p.status === 'perlu').length;
  const jumlahSegera = pengingat.filter((p) => p.status === 'segera').length;

  if (jumlahPerlu > 0 && jumlahSegera > 0) {
    return `${jumlahPerlu} servis sudah lewat target, ${jumlahSegera} segera jatuh tempo.`;
  }
  if (jumlahPerlu > 0) return `${jumlahPerlu} servis sudah lewat target kilometer.`;
  if (jumlahSegera > 0) return `${jumlahSegera} servis segera jatuh tempo.`;
  if (pengingat.some((p) => p.status === 'aman')) return 'Semua perawatan masih dalam batas aman.';
  return 'Belum ada riwayat servis untuk dihitung.';
}

// Kartu utama dashboard: nama motor, kilometer besar, dan status perawatan
export function MotorCard({ motor, pengingat, statusKeseluruhan, onEdit }: MotorCardProps) {
  return (
    <View style={styles.card}>
      {/* Lingkaran dekorasi di latar kartu */}
      <View style={styles.glowBesar} />
      <View style={styles.glowKecil} />

      <View style={styles.baris}>
        <View style={styles.kolomKiri}>
          <View style={styles.merekBaris}>
            <Text style={styles.merek}>{motor.merek.toUpperCase()}</Text>
            <Pressable
              onPress={onEdit}
              hitSlop={10}
              style={styles.tombolEdit}
              accessibilityLabel="Ubah data motor">
              <MaterialCommunityIcons name="pencil" size={14} color={MotoColors.onNavy} />
            </Pressable>
          </View>
          <Text style={styles.nama}>{motor.nama}</Text>
          <StatusChip status={statusKeseluruhan} />
        </View>
        <View style={styles.ikonWrapper}>
          <MaterialCommunityIcons name="scooter" size={64} color={MotoColors.onNavy} />
        </View>
      </View>

      <Text style={styles.kmLabel}>Kilometer saat ini</Text>
      <View style={styles.kmBaris}>
        <Text style={styles.kmAngka}>{formatKm(motor.kilometerSaatIni)}</Text>
        <Text style={styles.kmSatuan}>km</Text>
      </View>

      <View style={styles.ringkasanBox}>
        <MaterialCommunityIcons name="wrench-outline" size={18} color={MotoColors.onNavyMuted} />
        <Text style={styles.ringkasanText}>{buatRingkasan(pengingat)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: MotoColors.navy,
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden',
    shadowColor: MotoColors.navy,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  glowBesar: {
    position: 'absolute',
    top: -70,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: MotoColors.navyLight,
    opacity: 0.8,
  },
  glowKecil: {
    position: 'absolute',
    bottom: -50,
    left: -40,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: MotoColors.accent,
    opacity: 0.18,
  },
  baris: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  kolomKiri: {
    flex: 1,
    gap: 6,
  },
  merekBaris: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tombolEdit: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  merek: {
    color: MotoColors.onNavyMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  nama: {
    color: MotoColors.onNavy,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  ikonWrapper: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kmLabel: {
    color: MotoColors.onNavyMuted,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 20,
  },
  kmBaris: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  kmAngka: {
    color: MotoColors.onNavy,
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 52,
  },
  kmSatuan: {
    color: MotoColors.onNavyMuted,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  ringkasanBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  ringkasanText: {
    flex: 1,
    color: MotoColors.onNavyMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
