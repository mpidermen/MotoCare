import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { AuthLayout, formStyles as s } from '@/components/motocare/auth-layout';
import { MotoColors } from '@/constants/motocare-theme';
import { daftar, validasiEmail, validasiNama, validasiPassword } from '@/services/auth-service';

// Halaman /register. Kalau berhasil daftar, pengguna langsung masuk dan guard mengarahkan ke dashboard.
export default function RegisterScreen() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasi, setKonfirmasi] = useState('');
  const [loading, setLoading] = useState(false);
  const [pesanError, setPesanError] = useState('');
  const [pesanInfo, setPesanInfo] = useState('');

  const kirim = async () => {
    if (loading) return; // cegah permintaan ganda
    setPesanError('');
    setPesanInfo('');

    const galat =
      validasiNama(nama) ??
      validasiEmail(email) ??
      validasiPassword(password) ??
      (password !== konfirmasi ? 'Konfirmasi kata sandi tidak sama.' : null);
    if (galat) {
      setPesanError(galat);
      return;
    }

    setLoading(true);
    try {
      const langsungMasuk = await daftar(nama, email, password);
      if (!langsungMasuk) {
        // Hanya terjadi kalau "Confirm email" di Supabase masih aktif
        setPesanInfo('Akun dibuat. Cek email Anda untuk konfirmasi, lalu masuk.');
      }
    } catch (e) {
      setPesanError(e instanceof Error ? e.message : 'Gagal mendaftar. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout judul="Daftar" subjudul="Buat akun untuk menyimpan data motor Anda.">
      <Text style={s.label}>Nama pemilik</Text>
      <TextInput
        value={nama}
        onChangeText={setNama}
        placeholder="Contoh: Bagas"
        placeholderTextColor={MotoColors.textSecondary}
        autoCapitalize="words"
        editable={!loading}
        style={s.input}
      />

      <Text style={s.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="nama@email.com"
        placeholderTextColor={MotoColors.textSecondary}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
        style={s.input}
      />

      <Text style={s.label}>Kata sandi</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Minimal 6 karakter"
        placeholderTextColor={MotoColors.textSecondary}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
        style={s.input}
      />

      <Text style={s.label}>Ulangi kata sandi</Text>
      <TextInput
        value={konfirmasi}
        onChangeText={setKonfirmasi}
        placeholder="Ketik ulang kata sandi"
        placeholderTextColor={MotoColors.textSecondary}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
        onSubmitEditing={kirim}
        style={s.input}
      />

      {pesanError !== '' && (
        <View style={s.kotakError}>
          <Text style={s.kotakErrorText}>{pesanError}</Text>
        </View>
      )}
      {pesanInfo !== '' && (
        <View style={s.kotakInfo}>
          <Text style={s.kotakInfoText}>{pesanInfo}</Text>
        </View>
      )}

      <Pressable
        style={[s.tombol, loading && s.tombolNonaktif]}
        onPress={kirim}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={MotoColors.onNavy} />
        ) : (
          <Text style={s.tombolText}>Daftar</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.replace('/login')} disabled={loading}>
        <Text style={s.tautan}>
          Sudah punya akun? <Text style={s.tautanAksen}>Masuk</Text>
        </Text>
      </Pressable>
    </AuthLayout>
  );
}
