// Service API MotoCare: semua urusan jaringan ada di file ini.
// Halaman / komponen tidak perlu tahu cara fetch bekerja, mereka cukup memanggil ambilMerekMotor().
//
// API yang dipakai: NHTSA vPIC (gratis, tanpa API key)
// https://vpic.nhtsa.dot.gov/api/

// ---------- Interface ----------

// Satu item di dalam "Results" (bentuk ASLI dari API, nama field mengikuti API)
export interface NhtsaMakeItem {
  MakeId: number;
  MakeName: string;
  VehicleTypeId: number;
  VehicleTypeName: string;
}

// Seluruh response API
export interface NhtsaMakesResponse {
  Count: number;
  Message: string;
  SearchCriteria: string;
  Results: NhtsaMakeItem[];
}

// Bentuk yang dipakai di dalam aplikasi MotoCare (lebih sederhana, nama field bahasa Indonesia)
export interface MerekMotor {
  id: number;
  nama: string;
}

// ---------- Pengaturan ----------

const URL_MEREK_MOTOR =
  'https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/motorcycle?format=json';

// Kalau server belum menjawab sampai batas ini, anggap gagal supaya loading tidak berputar selamanya
const BATAS_WAKTU_MS = 8000;

// ---------- Promise buatan sendiri (custom Promise) ----------

// Membungkus Promise lain dengan batas waktu.
// - resolve(hasil)  : dipanggil kalau Promise asli selesai LEBIH DULU dari batas waktu
// - reject(galat)   : dipanggil kalau Promise asli gagal, ATAU batas waktu habis lebih dulu
// Salah satu pasti terjadi (kalau tidak selesai, timer akan reject), jadi Promise ini tidak mungkin menggantung.
export function denganBatasWaktu<T>(janji: Promise<T>, batasMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Server terlalu lama menjawab (lebih dari ${batasMs / 1000} detik).`));
    }, batasMs);

    // .then(berhasil, gagal): timer dihentikan di kedua jalur supaya tidak berjalan sia-sia
    janji.then(
      (hasil) => {
        clearTimeout(timer);
        resolve(hasil);
      },
      (galat: unknown) => {
        clearTimeout(timer);
        reject(galat);
      },
    );
  });
}

// ---------- Memeriksa & memetakan response ----------

function isRecord(nilai: unknown): nilai is Record<string, unknown> {
  return typeof nilai === 'object' && nilai !== null;
}

// Type guard: true hanya kalau nilai benar-benar berbentuk NhtsaMakeItem
function isNhtsaMakeItem(nilai: unknown): nilai is NhtsaMakeItem {
  return (
    isRecord(nilai) &&
    typeof nilai.MakeId === 'number' &&
    typeof nilai.MakeName === 'string' &&
    typeof nilai.VehicleTypeId === 'number' &&
    typeof nilai.VehicleTypeName === 'string'
  );
}

// Mengubah JSON mentah (unknown) menjadi daftar MerekMotor yang aman dipakai UI.
// - Struktur tidak sesuai (tidak ada array Results) -> lempar error
// - Item yang rusak atau namanya kosong dilewati, nama kembar digabung
export function petakanMerek(json: unknown): MerekMotor[] {
  const mentah = isRecord(json) ? json.Results : undefined;
  if (!Array.isArray(mentah)) {
    throw new Error('Format data dari server tidak sesuai.');
  }

  const item: unknown[] = mentah;
  const sudahAda = new Set<string>();
  const daftar: MerekMotor[] = [];

  for (const data of item) {
    if (!isNhtsaMakeItem(data)) continue;

    const nama = data.MakeName.trim();
    const kunci = nama.toUpperCase();
    if (nama === '' || sudahAda.has(kunci)) continue;

    sudahAda.add(kunci);
    daftar.push({ id: data.MakeId, nama });
  }

  return daftar.sort((a, b) => a.nama.localeCompare(b.nama));
}

// ---------- Fungsi async ----------

// Custom async function (async/await): mengunduh lalu memetakan data.
// fetch() adalah operasi async bawaan (pre-built), hasilnya ditunggu dengan await.
async function unduhMerek(): Promise<MerekMotor[]> {
  const response = await fetch(URL_MEREK_MOTOR);

  // fetch TIDAK otomatis error untuk status 404 / 500, jadi dicek manual lewat response.ok
  if (!response.ok) {
    throw new Error(`Server menjawab dengan kode ${response.status}.`);
  }

  const json: unknown = await response.json();
  return petakanMerek(json);
}

// Fungsi yang dipanggil oleh hook / UI: unduh + batas waktu + pesan error yang mudah dibaca
export async function ambilMerekMotor(): Promise<MerekMotor[]> {
  try {
    return await denganBatasWaktu(unduhMerek(), BATAS_WAKTU_MS);
  } catch (error) {
    // fetch yang gagal karena tidak ada internet melempar TypeError
    if (error instanceof TypeError) {
      throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
    }
    // response.json() gagal membaca isi yang bukan JSON melempar SyntaxError
    if (error instanceof SyntaxError) {
      throw new Error('Data dari server tidak bisa dibaca.');
    }
    throw error instanceof Error ? error : new Error('Terjadi kesalahan yang tidak diketahui.');
  }
}
