import { useEffect, useState } from 'react';

import { ambilMerekMotor, type MerekMotor } from '@/services/vehicle-api';

// Hook: mengambil daftar merek motor dari API saat komponen pertama kali tampil.
// Mengembalikan 3 keadaan (daftar / loading / error) dan fungsi cobaLagi untuk mengulang.
export function useMerekMotor() {
  const [daftar, setDaftar] = useState<MerekMotor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Setiap angka ini bertambah, useEffect di bawah berjalan lagi (dipakai tombol "Coba lagi")
  const [percobaan, setPercobaan] = useState(0);

  useEffect(() => {
    // Penanda supaya state tidak diubah kalau komponen sudah ditutup sebelum API menjawab
    let dibatalkan = false;

    setLoading(true);
    setError(null);

    // ambilMerekMotor() mengembalikan Promise, hasilnya diproses dengan .then()
    ambilMerekMotor()
      .then((hasil) => {
        if (!dibatalkan) setDaftar(hasil);
      })
      .catch((galat: unknown) => {
        if (!dibatalkan) {
          setError(galat instanceof Error ? galat.message : 'Terjadi kesalahan yang tidak diketahui.');
        }
      })
      .finally(() => {
        if (!dibatalkan) setLoading(false);
      });

    // Cleanup: dijalankan saat komponen ditutup atau sebelum useEffect berjalan lagi
    return () => {
      dibatalkan = true;
    };
  }, [percobaan]);

  const cobaLagi = () => setPercobaan((n) => n + 1);

  return { daftar, loading, error, cobaLagi };
}
