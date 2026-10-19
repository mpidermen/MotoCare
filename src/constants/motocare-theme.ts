import type { StatusServis } from '@/data/motocare';

// Palet warna MotoCare: navy sebagai warna utama, biru sebagai aksen.
// Hijau / oranye / merah HANYA dipakai untuk status servis.
export const MotoColors = {
  navy: '#0B1B33',
  navyLight: '#16315C',
  background: '#F3F5F9',
  card: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E3E8F0',
  accent: '#2563EB',
  accentSoft: '#DBEAFE',
  onNavy: '#FFFFFF',
  onNavyMuted: '#9FB3D1',
} as const;

// Warna tiap status servis (teks, latar chip, dan warna progress bar)
export const StatusColors: Record<StatusServis, { fg: string; bg: string; bar: string }> = {
  aman: { fg: '#15803D', bg: '#DCFCE7', bar: '#22C55E' },
  segera: { fg: '#C2410C', bg: '#FFEDD5', bar: '#F97316' },
  perlu: { fg: '#B91C1C', bg: '#FEE2E2', bar: '#EF4444' },
  belum: { fg: '#475569', bg: '#E2E8F0', bar: '#94A3B8' },
};

// Jarak antar elemen supaya konsisten di semua komponen
export const Gap = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

// Shadow halus untuk card (iOS pakai shadow*, Android pakai elevation)
export const CardShadow = {
  shadowColor: '#0B1B33',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.07,
  shadowRadius: 12,
  elevation: 3,
} as const;
