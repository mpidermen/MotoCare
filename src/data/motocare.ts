import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

// ---------- Tipe data ----------

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export interface Motor {
  nama: string;
  merek: string;
  kilometerSaatIni: number;
}

export interface RiwayatServis {
  id: number;
  jenis: string;
  tanggal: string; // format 'YYYY-MM-DD'
  kilometer: number;
  catatan: string;
}

// Aturan interval: tiap jenis servis diulang setiap sekian kilometer
export interface AturanServis {
  jenis: string;
  intervalKm: number;
  ikon: IconName;
}

export type StatusServis = 'aman' | 'segera' | 'perlu' | 'belum';

export interface Pengingat {
  jenis: string;
  ikon: IconName;
  intervalKm: number;
  servisTerakhirKm: number | null; // null = belum pernah tercatat
  targetKm: number | null;
  sisaKm: number | null; // negatif = sudah lewat
  progress: number; // 0..1, seberapa jauh interval sudah terpakai
  status: StatusServis;
}

// ---------- DATA CONTOH ----------
// Data di bawah ini hanya contoh. Ganti dengan data motor & riwayat milik kelompok.
// Nilai intervalKm juga contoh; sesuaikan dengan buku manual motor.

export const dataMotor: Motor = {
  nama: 'Honda Vario 150',
  merek: 'Honda',
  kilometerSaatIni: 0,
};

export const aturanServis: AturanServis[] = [
  { jenis: 'Ganti Oli Mesin', intervalKm: 3000, ikon: 'oil' },
  { jenis: 'Ganti Oli Gardan', intervalKm: 8000, ikon: 'cog' },
  { jenis: 'Servis CVT', intervalKm: 8000, ikon: 'engine' },
  { jenis: 'Ganti Busi', intervalKm: 12000, ikon: 'flash' },
];

export const dataRiwayat: RiwayatServis[] = [
  {
    id: 1,
    jenis: 'Ganti Oli Mesin',
    tanggal: '2026-08-22',
    kilometer: 9800,
    catatan: 'Oli 0,8 liter, filter oli dibersihkan.',
  },
  {
    id: 2,
    jenis: 'Ganti Oli Mesin',
    tanggal: '2026-05-10',
    kilometer: 6700,
    catatan: 'Servis rutin di bengkel resmi.',
  },
  {
    id: 3,
    jenis: 'Servis CVT',
    tanggal: '2026-05-10',
    kilometer: 6700,
    catatan: 'Bersihkan CVT, cek roller dan belt.',
  },
  {
    id: 4,
    jenis: 'Ganti Oli Gardan',
    tanggal: '2026-02-14',
    kilometer: 4200,
    catatan: 'Ganti oli gardan 100 ml.',
  },
  {
    id: 5,
    jenis: 'Ganti Busi',
    tanggal: '2026-02-14',
    kilometer: 4200,
    catatan: 'Busi lama sudah aus.',
  },
];

// ---------- Fungsi bantuan ----------

// Batas "Segera Servis": sisa kilometer sampai target servis
export const BATAS_SEGERA_KM = 500;

const NAMA_BULAN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

// 12450 -> "12.450"
export function formatKm(km: number): string {
  return Math.round(km).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// '2026-08-22' -> "22 Agu 2026"
export function formatTanggal(tanggal: string): string {
  const [tahun, bulan, hari] = tanggal.split('-').map(Number);
  return `${hari} ${NAMA_BULAN[bulan - 1]} ${tahun}`;
}

// Tanggal hari ini dalam format 'YYYY-MM-DD' (waktu lokal perangkat)
export function tanggalHariIni(): string {
  const sekarang = new Date();
  const bulan = String(sekarang.getMonth() + 1).padStart(2, '0');
  const hari = String(sekarang.getDate()).padStart(2, '0');
  return `${sekarang.getFullYear()}-${bulan}-${hari}`;
}

// Servis dengan tanggal paling baru (kalau tanggal sama, ambil kilometer terbesar)
export function cariServisTerakhir(riwayat: RiwayatServis[]): RiwayatServis | null {
  if (riwayat.length === 0) return null;
  return [...riwayat].sort((a, b) => {
    if (a.tanggal !== b.tanggal) return b.tanggal.localeCompare(a.tanggal);
    return b.kilometer - a.kilometer;
  })[0];
}

// Riwayat diurutkan dari yang terbaru
export function urutkanRiwayat(riwayat: RiwayatServis[]): RiwayatServis[] {
  return [...riwayat].sort((a, b) => {
    if (a.tanggal !== b.tanggal) return b.tanggal.localeCompare(a.tanggal);
    return b.kilometer - a.kilometer;
  });
}

// Jarak tempuh sejak servis terakhir = kilometer saat ini - kilometer saat servis
export function hitungJarakSejakServis(kilometerSaatIni: number, servis: RiwayatServis): number {
  return Math.max(0, kilometerSaatIni - servis.kilometer);
}

// Cari ikon untuk suatu jenis servis (default: kunci inggris)
export function cariIkon(jenis: string): IconName {
  const aturan = aturanServis.find((a) => a.jenis === jenis);
  return aturan ? aturan.ikon : 'wrench';
}

// Hitung pengingat untuk setiap aturan berdasarkan kilometer saat ini dan riwayat.
// Status dihitung dari data, bukan angka acak.
export function hitungPengingat(kilometerSaatIni: number, riwayat: RiwayatServis[]): Pengingat[] {
  return aturanServis.map((aturan) => {
    const servisJenisIni = riwayat.filter((r) => r.jenis === aturan.jenis);

    // Belum pernah tercatat -> tidak bisa menghitung target
    if (servisJenisIni.length === 0) {
      return {
        jenis: aturan.jenis,
        ikon: aturan.ikon,
        intervalKm: aturan.intervalKm,
        servisTerakhirKm: null,
        targetKm: null,
        sisaKm: null,
        progress: 0,
        status: 'belum' as StatusServis,
      };
    }

    const kmTerakhir = Math.max(...servisJenisIni.map((r) => r.kilometer));
    const targetKm = kmTerakhir + aturan.intervalKm;
    const sisaKm = targetKm - kilometerSaatIni;
    const progress = Math.min(1, Math.max(0, (kilometerSaatIni - kmTerakhir) / aturan.intervalKm));

    let status: StatusServis = 'aman';
    if (sisaKm <= 0) status = 'perlu';
    else if (sisaKm <= BATAS_SEGERA_KM) status = 'segera';

    return {
      jenis: aturan.jenis,
      ikon: aturan.ikon,
      intervalKm: aturan.intervalKm,
      servisTerakhirKm: kmTerakhir,
      targetKm,
      sisaKm,
      progress,
      status,
    };
  });
}

const URUTAN_STATUS: Record<StatusServis, number> = { perlu: 0, segera: 1, aman: 2, belum: 3 };

// Urutkan pengingat: yang paling mendesak tampil paling atas
export function urutkanPengingat(daftar: Pengingat[]): Pengingat[] {
  return [...daftar].sort((a, b) => {
    if (URUTAN_STATUS[a.status] !== URUTAN_STATUS[b.status]) {
      return URUTAN_STATUS[a.status] - URUTAN_STATUS[b.status];
    }
    return (a.sisaKm ?? Infinity) - (b.sisaKm ?? Infinity);
  });
}

// Status keseluruhan motor = status terburuk dari semua pengingat
export function hitungStatusKeseluruhan(daftar: Pengingat[]): StatusServis {
  if (daftar.some((p) => p.status === 'perlu')) return 'perlu';
  if (daftar.some((p) => p.status === 'segera')) return 'segera';
  if (daftar.some((p) => p.status === 'aman')) return 'aman';
  return 'belum';
}

export const LABEL_STATUS: Record<StatusServis, string> = {
  aman: 'Aman',
  segera: 'Segera Servis',
  perlu: 'Perlu Servis',
  belum: 'Belum Ada Data',
};
