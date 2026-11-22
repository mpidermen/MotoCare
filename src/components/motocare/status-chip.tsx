import { StyleSheet, Text, View } from 'react-native';

import { StatusColors } from '@/constants/motocare-theme';
import { LABEL_STATUS, type StatusServis } from '@/data/motocare';

type StatusChipProps = {
  status: StatusServis;
};

// Label kecil berwarna untuk menampilkan status servis
export function StatusChip({ status }: StatusChipProps) {
  const warna = StatusColors[status];

  return (
    <View style={[styles.chip, { backgroundColor: warna.bg }]}>
      <View style={[styles.dot, { backgroundColor: warna.bar }]} />
      <Text style={[styles.text, { color: warna.fg }]}>{LABEL_STATUS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
