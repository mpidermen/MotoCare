import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CardShadow, MotoColors } from '@/constants/motocare-theme';
import { cariIkon, formatKm, formatTanggal, type RiwayatServis } from '@/data/motocare';

type ServiceHistoryProps = {
  riwayat: RiwayatServis[]; // sudah diurutkan dari yang terbaru
  onPilih?: (id: number) => void; // dipanggil saat satu item ditekan (untuk buka halaman detail)
};

// Riwayat servis dalam bentuk timeline: ikon + garis penghubung + kartu isi
export function ServiceHistory({ riwayat, onPilih }: ServiceHistoryProps) {
  if (riwayat.length === 0) {
    return (
      <View style={styles.kosongBox}>
        <Text style={styles.kosong}>Belum ada riwayat servis.</Text>
      </View>
    );
  }

  return (
    <View>
      {riwayat.map((item, index) => {
        const terakhir = index === riwayat.length - 1;
        return (
          <View key={item.id} style={styles.baris}>
            <View style={styles.kolomTimeline}>
              <View style={styles.ikon}>
                <MaterialCommunityIcons
                  name={cariIkon(item.jenis)}
                  size={18}
                  color={MotoColors.accent}
                />
              </View>
              {!terakhir && <View style={styles.garis} />}
            </View>

            <Pressable
              disabled={!onPilih}
              onPress={() => onPilih?.(item.id)}
              style={({ pressed }) => [
                styles.card,
                !terakhir && styles.jarakBawah,
                pressed && styles.ditekan,
              ]}>
              <Text style={styles.jenis}>{item.jenis}</Text>
              <Text style={styles.meta}>
                {formatTanggal(item.tanggal)} · {formatKm(item.kilometer)} km
              </Text>
              {item.catatan.length > 0 && <Text style={styles.catatan}>{item.catatan}</Text>}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  baris: {
    flexDirection: 'row',
    gap: 12,
  },
  kolomTimeline: {
    alignItems: 'center',
    width: 40,
  },
  ikon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MotoColors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  garis: {
    flex: 1,
    width: 2,
    backgroundColor: MotoColors.border,
    marginVertical: 4,
  },
  card: {
    flex: 1,
    backgroundColor: MotoColors.card,
    borderRadius: 16,
    padding: 14,
    gap: 4,
    ...CardShadow,
  },
  ditekan: {
    opacity: 0.85,
  },
  jarakBawah: {
    marginBottom: 12,
  },
  jenis: {
    fontSize: 16,
    fontWeight: '700',
    color: MotoColors.text,
  },
  meta: {
    fontSize: 14,
    color: MotoColors.textSecondary,
  },
  catatan: {
    fontSize: 14,
    color: MotoColors.text,
    lineHeight: 20,
    marginTop: 4,
  },
  kosongBox: {
    backgroundColor: MotoColors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  kosong: {
    fontSize: 14,
    color: MotoColors.textSecondary,
  },
});
