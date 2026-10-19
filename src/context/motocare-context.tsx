import { createContext, useContext, useState, type ReactNode } from 'react';

import { dataMotor, dataRiwayat, type Motor, type RiwayatServis } from '@/data/motocare';

// Context dipakai supaya data motor & riwayat bisa dibaca dan diubah dari semua halaman
// tanpa harus dikirim lewat props satu per satu (menghindari prop drilling).
type MotoCareContextType = {
  motor: Motor;
  riwayat: RiwayatServis[];
  ubahMotor: (motorBaru: Motor) => void;
  ubahKilometer: (kilometerBaru: number) => void;
  tambahServis: (servisBaru: Omit<RiwayatServis, 'id'>) => void;
};

const MotoCareContext = createContext<MotoCareContextType | null>(null);

export function MotoCareProvider({ children }: { children: ReactNode }) {
  // Data hanya tersimpan di memori, akan kembali ke data awal saat aplikasi ditutup.
  const [motor, setMotor] = useState<Motor>(dataMotor);
  const [riwayat, setRiwayat] = useState<RiwayatServis[]>(dataRiwayat);

  const ubahMotor = (motorBaru: Motor) => {
    setMotor(motorBaru);
  };

  const ubahKilometer = (kilometerBaru: number) => {
    setMotor({ ...motor, kilometerSaatIni: kilometerBaru });
  };

  const tambahServis = (servisBaru: Omit<RiwayatServis, 'id'>) => {
    const idBaru = riwayat.reduce((maks, r) => Math.max(maks, r.id), 0) + 1;
    setRiwayat([...riwayat, { id: idBaru, ...servisBaru }]);
  };

  return (
    <MotoCareContext.Provider value={{ motor, riwayat, ubahMotor, ubahKilometer, tambahServis }}>
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
