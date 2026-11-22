import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';

import { AuthLayout, formStyles as s } from '@/components/motocare/auth-layout';
import { MotoColors } from '@/constants/motocare-theme';
import { masuk, validasiEmail, validasiPassword } from '@/services/auth-service';

// Halaman /login. Kalau berhasil masuk, route guard di _layout.tsx otomatis mengarahkan ke dashboard.
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [pesanError, setPesanError] = useState('');

  const kirim = async () => {
    if (loading) return; // cegah permintaan ganda
    setPesanError('');

    const galat = validasiEmail(email) ?? validasiPassword(password);
    if (galat) {
      setPesanError(galat);
      return;
    }

    setLoading(true);
    try {
      await masuk(email, password);
    } catch (e) {
      setPesanError(e instanceof Error ? e.message : 'Gagal masuk. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout judul="Masuk" subjudul="Masuk untuk melihat data motor Anda.">
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
        onSubmitEditing={kirim}
        style={s.input}
      />

      {pesanError !== '' && (
        <View style={s.kotakError}>
          <Text style={s.kotakErrorText}>{pesanError}</Text>
        </View>
      )}

      <Pressable
        style={[s.tombol, loading && s.tombolNonaktif]}
        onPress={kirim}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color={MotoColors.onNavy} />
        ) : (
          <Text style={s.tombolText}>Masuk</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.replace('/register')} disabled={loading}>
        <Text style={s.tautan}>
          Belum punya akun? <Text style={s.tautanAksen}>Daftar</Text>
        </Text>
      </Pressable>
    </AuthLayout>
  );
}
