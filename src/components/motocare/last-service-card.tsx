import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { CardShadow, MotoColors } from '@/constants/motocare-theme';
import {
  cariIkon,
  formatKm,
  formatTanggal,
  hitungJarakSejakServis,
  type RiwayatServis,
} from '@/data/motocare';

type LastServiceCardProps = {
  servis: RiwayatServis | null;
  kilometerSaatIni: number;
};

// Satu kolom informasi kecil: label di atas, nilai di bawah
function InfoItem({ label, nilai }: { label: string; nilai: string }) {
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoNilai}>{nilai}</Text>
    </View>
  );
}

export function LastServiceCard({ servis, kilometerSaatIni }: LastServiceCardProps) {
  if (!servis) {
    return (
      <View style={styles.card}>
        <Text style={styles.kosong}>Belum ada servis yang tercatat.</Text>
      </View>
    );
  }

  const jarak = hitungJarakSejakServis(kilometerSaatIni, servis);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.ikon}>
          <MaterialCommunityIcons name={cariIkon(servis.jenis)} size={22} color={MotoColors.accent} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.jenis}>{servis.jenis}</Text>
          <Text style={styles.tanggal}>{formatTanggal(servis.tanggal)}</Text>
        </View>
      </View>

      <View style={styles.infoBaris}>
        <InfoItem label="Saat servis" nilai={`${formatKm(servis.kilometer)} km`} />
        <View style={styles.pemisah} />
        <InfoItem label="Sejak servis" nilai={`${formatKm(jarak)} km`} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: MotoColors.card,
    borderRadius: 20,
    padding: 16,
    gap: 16,
    ...CardShadow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ikon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: MotoColors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  jenis: {
    fontSize: 16,
    fontWeight: '700',
    color: MotoColors.text,
  },
  tanggal: {
    fontSize: 14,
    color: MotoColors.textSecondary,
    marginTop: 2,
  },
  infoBaris: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MotoColors.background,
    borderRadius: 14,
    paddingVertical: 12,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  infoLabel: {
    fontSize: 13,
    color: MotoColors.textSecondary,
  },
  infoNilai: {
    fontSize: 18,
    fontWeight: '700',
    color: MotoColors.text,
  },
  pemisah: {
    width: 1,
    height: 32,
    backgroundColor: MotoColors.border,
  },
  kosong: {
    fontSize: 14,
    color: MotoColors.textSecondary,
    textAlign: 'center',
  },
});
