import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import {
  aturanServis as aturanBawaan,
  type AturanServis,
  type DataMotor,
  type DataServis,
  type Motor,
  type RiwayatServis,
} from '@/data/motocare';
import {
  ambilAturan,
  ambilDaftarMotor,
  ambilSemuaRiwayat,
  hapusMotorDb,
  hapusServisDb,
  perbaruiKilometer,
  perbaruiMotor,
  simpanMotorBaru,
  simpanServisBaru,
} from '@/services/motocare-db';

// Context menyimpan data motor & riwayat milik pengguna yang sedang login, diambil dari Supabase.
// Semua halaman membacanya lewat useMotoCare() tanpa prop drilling.
//
// OPTIMISTIC UI: saat pengguna menambah/mengubah/menghapus, tampilan langsung diperbarui lebih dulu,
// baru data dikirim ke Supabase. Kalau pengiriman GAGAL, tampilan dikembalikan (rollback) dan
// error dilempar supaya halaman bisa menampilkan pesannya.

// Dipakai saat pengguna belum punya motor, supaya halaman tidak perlu memeriksa null di mana-mana.
// Halaman yang butuh motor memakai `adaMotor` untuk tahu apakah motornya nyata.
const MOTOR_KOSONG: Motor = { id: '', nama: '', merek: '', kilometerSaatIni: 0 };

type MotoCareContextType = {
  motor: Motor; // motor yang sedang dipilih (MOTOR_KOSONG kalau belum punya motor)
  adaMotor: boolean;
  daftarMotor: Motor[];
  riwayat: RiwayatServis[]; // riwayat milik motor yang sedang dipilih
  aturan: AturanServis[];
  isLoading: boolean; // true saat pertama kali mengambil data
  isRefreshing: boolean; // true saat pull-to-refresh
  error: string | null; // pesan error kalau pengambilan data gagal
  muatUlang: () => Promise<void>;
  pilihMotor: (id: string) => void;
  tambahMotor: (data: DataMotor) => Promise<void>;
  ubahMotor: (data: DataMotor) => Promise<void>;
  ubahKilometer: (kilometerBaru: number) => Promise<void>;
  hapusMotor: () => Promise<void>;
  tambahServis: (data: DataServis) => Promise<void>;
  hapusServis: (id: number) => Promise<void>;
};

const MotoCareContext = createContext<MotoCareContextType | null>(null);

function pesanDari(galat: unknown): string {
  return galat instanceof Error ? galat.message : 'Terjadi kesalahan yang tidak diketahui.';
}

export function MotoCareProvider({ children }: { children: ReactNode }) {
  const [daftarMotor, setDaftarMotor] = useState<Motor[]>([]);
  const [semuaRiwayat, setSemuaRiwayat] = useState<RiwayatServis[]>([]);
  const [aturan, setAturan] = useState<AturanServis[]>(aturanBawaan);
  const [motorAktifId, setMotorAktifId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Penghitung untuk id sementara (data yang belum dikonfirmasi database)
  const penghitung = useRef(0);
  // Penanda provider masih terpasang, supaya setState tidak dipanggil setelah dilepas
  const terpasang = useRef(true);

  // SELECT: ambil motor, riwayat, dan aturan sekaligus (paralel dengan Promise.all)
  const muatData = useCallback(async () => {
    try {
      const [motorDb, riwayatDb, aturanDb] = await Promise.all([
        ambilDaftarMotor(),
        ambilSemuaRiwayat(),
        ambilAturan(),
      ]);
      if (!terpasang.current) return;
      setDaftarMotor(motorDb);
      setSemuaRiwayat(riwayatDb);
      if (aturanDb.length > 0) setAturan(aturanDb);
      // Pertahankan motor yang sedang dipilih kalau masih ada; kalau tidak, pilih yang pertama
      setMotorAktifId((lama) => (motorDb.some((m) => m.id === lama) ? lama : (motorDb[0]?.id ?? '')));
      setError(null);
    } catch (galat) {
      if (terpasang.current) setError(pesanDari(galat));
    }
  }, []);

  // Dipanggil sekali saat provider dipasang (setelah login)
  useEffect(() => {
    terpasang.current = true;
    muatData().finally(() => {
      if (terpasang.current) setIsLoading(false);
    });
    return () => {
      terpasang.current = false;
    };
  }, [muatData]);

  // Pull-to-refresh / tombol "Coba lagi"
  const muatUlang = async () => {
    setIsRefreshing(true);
    await muatData();
    if (terpasang.current) setIsRefreshing(false);
  };

  const motor = daftarMotor.find((m) => m.id === motorAktifId) ?? daftarMotor[0] ?? MOTOR_KOSONG;
  const adaMotor = motor.id !== '';
  const riwayat = semuaRiwayat.filter((r) => r.motorId === motor.id);

  const periksaAdaMotor = () => {
    if (!adaMotor) throw new Error('Belum ada motor. Tambahkan motor terlebih dahulu.');
  };

  // INSERT motor
  const tambahMotor = async (data: DataMotor) => {
    const idSementara = `sementara-${++penghitung.current}`;
    const aktifSebelumnya = motorAktifId;

    setDaftarMotor((prev) => [...prev, { id: idSementara, ...data }]); // 1. tampilkan dulu
    setMotorAktifId(idSementara);
    try {
      const motorDb = await simpanMotorBaru(data); // 2. kirim ke Supabase
      setDaftarMotor((prev) => prev.map((m) => (m.id === idSementara ? motorDb : m)));
      setMotorAktifId((id) => (id === idSementara ? motorDb.id : id));
    } catch (galat) {
      setDaftarMotor((prev) => prev.filter((m) => m.id !== idSementara)); // 3. gagal: rollback
      setMotorAktifId(aktifSebelumnya);
      throw galat;
    }
  };

  // UPDATE data motor
  const ubahMotor = async (data: DataMotor) => {
    periksaAdaMotor();
    const sebelumnya = motor;
    setDaftarMotor((prev) => prev.map((m) => (m.id === sebelumnya.id ? { ...m, ...data } : m)));
    try {
      await perbaruiMotor(sebelumnya.id, data);
    } catch (galat) {
      setDaftarMotor((prev) => prev.map((m) => (m.id === sebelumnya.id ? sebelumnya : m)));
      throw galat;
    }
  };

  // UPDATE kilometer (odometer manual)
  const ubahKilometer = async (kilometerBaru: number) => {
    periksaAdaMotor();
    const sebelumnya = motor;
    setDaftarMotor((prev) =>
      prev.map((m) => (m.id === sebelumnya.id ? { ...m, kilometerSaatIni: kilometerBaru } : m)),
    );
    try {
      await perbaruiKilometer(sebelumnya.id, kilometerBaru);
    } catch (galat) {
      setDaftarMotor((prev) =>
        prev.map((m) =>
          m.id === sebelumnya.id ? { ...m, kilometerSaatIni: sebelumnya.kilometerSaatIni } : m,
        ),
      );
      throw galat;
    }
  };

  // DELETE motor (riwayat servisnya ikut terhapus di database)
  const hapusMotor = async () => {
    periksaAdaMotor();
    const motorDihapus = motor;
    const riwayatDihapus = semuaRiwayat.filter((r) => r.motorId === motorDihapus.id);

    setDaftarMotor((prev) => prev.filter((m) => m.id !== motorDihapus.id));
    setSemuaRiwayat((prev) => prev.filter((r) => r.motorId !== motorDihapus.id));
    try {
      await hapusMotorDb(motorDihapus.id);
    } catch (galat) {
      setDaftarMotor((prev) => [...prev, motorDihapus]); // rollback
      setSemuaRiwayat((prev) => [...prev, ...riwayatDihapus]);
      setMotorAktifId(motorDihapus.id);
      throw galat;
    }
  };

  // INSERT servis
  const tambahServis = async (data: DataServis) => {
    periksaAdaMotor();
    const motorId = motor.id;
    const idSementara = -(++penghitung.current); // id negatif = belum dikonfirmasi database

    setSemuaRiwayat((prev) => [...prev, { id: idSementara, motorId, ...data }]);
    try {
      const servisDb = await simpanServisBaru(motorId, data);
      setSemuaRiwayat((prev) => prev.map((r) => (r.id === idSementara ? servisDb : r)));
    } catch (galat) {
      setSemuaRiwayat((prev) => prev.filter((r) => r.id !== idSementara)); // rollback
      throw galat;
    }
  };

  // DELETE servis
  const hapusServis = async (id: number) => {
    const servisDihapus = semuaRiwayat.find((r) => r.id === id);
    if (!servisDihapus) return;

    setSemuaRiwayat((prev) => prev.filter((r) => r.id !== id));
    try {
      await hapusServisDb(id);
    } catch (galat) {
      setSemuaRiwayat((prev) => [...prev, servisDihapus]); // rollback
      throw galat;
    }
  };

  return (
    <MotoCareContext.Provider
      value={{
        motor,
        adaMotor,
        daftarMotor,
        riwayat,
        aturan,
        isLoading,
        isRefreshing,
        error,
        muatUlang,
        pilihMotor: setMotorAktifId,
        tambahMotor,
        ubahMotor,
        ubahKilometer,
        hapusMotor,
        tambahServis,
        hapusServis,
      }}>
      {children}
    </MotoCareContext.Provider>
  );
}

// Hook kecil supaya halaman cukup menulis: const { motor, riwayat } = useMotoCare();
export function useMotoCare(): MotoCareContextType {
  const context = useContext(MotoCareContext);
  if (!context) {
    throw new Error('useMotoCare harus dipakai di dalam <MotoCareProvider>.');
  }
  return context;
}
