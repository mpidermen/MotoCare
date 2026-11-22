import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LastServiceCard } from '@/components/motocare/last-service-card';
import { MotorCard } from '@/components/motocare/motor-card';
import { MotorSwitcher } from '@/components/motocare/motor-switcher';
import { ReminderList } from '@/components/motocare/reminder-list';
import { ServiceHistory } from '@/components/motocare/service-history';
import { UpdateKmModal } from '@/components/motocare/update-km-modal';
import { MotoColors, StatusColors } from '@/constants/motocare-theme';
import { useAuth } from '@/context/auth-context';
import { useMotoCare } from '@/context/motocare-context';
import {
  cariServisTerakhir,
  hitungPengingat,
  hitungStatusKeseluruhan,
  urutkanPengingat,
  urutkanRiwayat,
} from '@/data/motocare';
import { keluar } from '@/services/auth-service';

// Dashboard hanya menampilkan beberapa riwayat terbaru; sisanya ada di halaman /riwayat
const JUMLAH_RIWAYAT_RINGKAS = 3;

// Sapaan berdasarkan jam (0-23)
function buatSapaan(jam: number): string {
  if (jam < 11) return 'Selamat pagi';
  if (jam < 15) return 'Selamat siang';
  if (jam < 18) return 'Selamat sore';
  return 'Selamat malam';
}

export default function Index() {
  const insets = useSafeAreaInsets();
  const {
    motor,
    adaMotor,
    daftarMotor,
    riwayat,
    aturan,
    isLoading,
    isRefreshing,
    error,
    muatUlang,
    pilihMotor,
    ubahKilometer,
  } = useMotoCare();
  const { user } = useAuth();

  // Nama pemilik diambil dari metadata yang disimpan saat daftar; kalau tidak ada, pakai "Pengendara"
  const namaPemilik =
    typeof user?.user_metadata?.nama === 'string' && user.user_metadata.nama !== ''
      ? user.user_metadata.nama
      : 'Pengendara';

  // Sign Out: setelah sesi dihapus, route guard otomatis mengarahkan ke /login
  const keluarAkun = async () => {
    try {
      await keluar();
    } catch (e) {
      Alert.alert('Gagal keluar', e instanceof Error ? e.message : 'Coba lagi.');
    }
  };

  // useState: sapaan dan status modal perbarui kilometer
  const [sapaan, setSapaan] = useState('Halo');
  const [modalKm, setModalKm] = useState(false);

  // useEffect dengan [] : dijalankan sekali setelah render pertama untuk mengisi sapaan sesuai jam
  useEffect(() => {
    setSapaan(buatSapaan(new Date().getHours()));
  }, []);

  // Semua angka di bawah dihitung dari data context, jadi otomatis ikut berubah
  const riwayatUrut = urutkanRiwayat(riwayat);
  const servisTerakhir = cariServisTerakhir(riwayat);
  const pengingat = urutkanPengingat(hitungPengingat(motor.kilometerSaatIni, riwayat, aturan));
  const statusKeseluruhan = hitungStatusKeseluruhan(pengingat);

  // router.push: membuka halaman baru di atas stack, bisa kembali dengan router.back()
  const bukaTambahServis = (jenis?: string) => {
    router.push({ pathname: '/tambah-servis', params: jenis ? { jenis } : {} });
  };

  const bukaDetail = (id: number) => {
    router.push({ pathname: '/riwayat/[id]', params: { id: String(id) } });
  };

  return (
    <View style={styles.layar}>
      <ScrollView
        contentContainerStyle={[
          styles.konten,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        // Pull-to-refresh: tarik ke bawah untuk mengambil ulang data dari Supabase
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={muatUlang} />}>
        <View style={styles.kolom}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.sapaan}>{sapaan}, {namaPemilik}!</Text>
              <Text style={styles.brand}>MotoCare</Text>
            </View>
            <View style={styles.headerKanan}>
              <Pressable
                onPress={keluarAkun}
                hitSlop={8}
                style={styles.tombolKeluar}
                accessibilityLabel="Keluar dari akun">
                <Ionicons name="log-out-outline" size={22} color={MotoColors.textSecondary} />
              </Pressable>
              <View style={styles.logo}>
                <MaterialCommunityIcons name="motorbike" size={24} color={MotoColors.accent} />
              </View>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.tengah}>
              <ActivityIndicator size="large" color={MotoColors.accent} />
              <Text style={styles.infoKosong}>Memuat data motor...</Text>
            </View>
          ) : error !== null && !adaMotor ? (
            <View style={styles.kotakError}>
              <Text style={styles.kotakErrorText}>{error}</Text>
              <Pressable onPress={muatUlang} style={styles.tombolUlang}>
                <Text style={styles.tombolUlangText}>Coba lagi</Text>
              </Pressable>
            </View>
          ) : !adaMotor ? (
            <View style={styles.tengah}>
              <MaterialCommunityIcons name="motorbike" size={48} color={MotoColors.accent} />
              <Text style={styles.judulSeksi}>Belum ada motor</Text>
              <Text style={styles.infoKosong}>Tambahkan motor pertama Anda untuk mulai mencatat servis.</Text>
              <Pressable
                style={[styles.aksi, styles.aksiUtama, styles.aksiLebar]}
                onPress={() => router.push('/tambah-motor')}>
                <Ionicons name="add-circle" size={20} color={MotoColors.onNavy} />
                <Text style={styles.aksiTextUtama}>Tambah Motor</Text>
              </Pressable>
            </View>
          ) : (
            <>
          {/* Gagal memuat ulang saat data lama masih ada */}
          {error !== null && (
            <View style={styles.kotakError}>
              <Text style={styles.kotakErrorText}>{error}</Text>
            </View>
          )}

          {/* Pilih motor aktif (satu akun boleh punya banyak motor) */}
          <MotorSwitcher
            daftarMotor={daftarMotor}
            motorAktifId={motor.id}
            onPilih={pilihMotor}
            onTambah={() => router.push('/tambah-motor')}
          />

          {/* Kartu motor: ikon pensil membuka halaman /ubah-motor */}
          <MotorCard
            motor={motor}
            pengingat={pengingat}
            statusKeseluruhan={statusKeseluruhan}
            onEdit={() => router.push('/ubah-motor')}
          />

          {/* Tombol aksi */}
          <View style={styles.aksiBaris}>
            <Pressable
              style={({ pressed }) => [styles.aksi, styles.aksiUtama, pressed && styles.ditekan]}
              onPress={() => bukaTambahServis()}>
              <Ionicons name="add-circle" size={20} color={MotoColors.onNavy} />
              <Text style={styles.aksiTextUtama}>Tambah Servis</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.aksi, styles.aksiSekunder, pressed && styles.ditekan]}
              onPress={() => setModalKm(true)}>
              <Ionicons name="speedometer" size={20} color={MotoColors.accent} />
              <Text style={styles.aksiTextSekunder}>Perbarui KM</Text>
            </Pressable>
          </View>

          {/* Servis terakhir */}
          <Text style={styles.judulSeksi}>Servis Terakhir</Text>
          <LastServiceCard servis={servisTerakhir} kilometerSaatIni={motor.kilometerSaatIni} />

          {/* Pengingat servis: menekan satu pengingat membuka form tambah servis dengan jenis terpilih */}
          <Text style={styles.judulSeksi}>Pengingat Servis</Text>
          <ReminderList pengingat={pengingat} onPilih={bukaTambahServis} />

          {/* Riwayat servis */}
          <View style={styles.judulBaris}>
            <Text style={[styles.judulSeksi, styles.tanpaMargin]}>Riwayat Servis</Text>
            <Pressable onPress={() => router.push('/riwayat')} hitSlop={8}>
              <Text style={styles.link}>Lihat Semua Riwayat</Text>
            </Pressable>
          </View>
          <ServiceHistory
            riwayat={riwayatUrut.slice(0, JUMLAH_RIWAYAT_RINGKAS)}
            onPilih={bukaDetail}
          />
            </>
          )}
        </View>
      </ScrollView>

      <UpdateKmModal
        visible={modalKm}
        kilometerSaatIni={motor.kilometerSaatIni}
        onClose={() => setModalKm(false)}
        onSimpan={async (kilometerBaru) => {
          await ubahKilometer(kilometerBaru); // gagal = error tampil di panel, panel tetap terbuka
          setModalKm(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  layar: {
    flex: 1,
    backgroundColor: MotoColors.background,
  },
  konten: {
    paddingHorizontal: 20,
    // Di web, konten dipusatkan supaya tidak melebar di layar besar
    alignItems: Platform.OS === 'web' ? 'center' : undefined,
  },
  kolom: {
    width: '100%',
    maxWidth: 560,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sapaan: {
    fontSize: 14,
    color: MotoColors.textSecondary,
    fontWeight: '500',
  },
  brand: {
    fontSize: 26,
    fontWeight: '800',
    color: MotoColors.navy,
  },
  headerKanan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tombolKeluar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: MotoColors.card,
    borderWidth: 1,
    borderColor: MotoColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: MotoColors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aksiBaris: {
    flexDirection: 'row',
    gap: 12,
  },
  aksi: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  aksiUtama: {
    backgroundColor: MotoColors.accent,
  },
  aksiSekunder: {
    backgroundColor: MotoColors.card,
    borderWidth: 1,
    borderColor: MotoColors.border,
  },
  aksiTextUtama: {
    color: MotoColors.onNavy,
    fontSize: 15,
    fontWeight: '700',
  },
  aksiTextSekunder: {
    color: MotoColors.accent,
    fontSize: 15,
    fontWeight: '700',
  },
  ditekan: {
    opacity: 0.8,
  },
  judulSeksi: {
    fontSize: 18,
    fontWeight: '700',
    color: MotoColors.text,
    marginTop: 8,
  },
  judulBaris: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  tanpaMargin: {
    marginTop: 0,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: MotoColors.accent,
  },
  tengah: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 48,
  },
  infoKosong: {
    fontSize: 14,
    color: MotoColors.textSecondary,
    textAlign: 'center',
  },
  aksiLebar: {
    alignSelf: 'stretch',
    flex: 0,
  },
  kotakError: {
    backgroundColor: StatusColors.perlu.bg,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  kotakErrorText: {
    color: StatusColors.perlu.fg,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  tombolUlang: {
    alignSelf: 'flex-start',
    backgroundColor: MotoColors.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tombolUlangText: {
    color: StatusColors.perlu.fg,
    fontWeight: '700',
  },
});
