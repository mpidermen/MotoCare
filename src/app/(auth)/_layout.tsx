import { Stack } from 'expo-router';

// Grup (auth): halaman untuk pengguna yang belum login (login dan register). Tanpa header.
// Nama grup dalam kurung tidak muncul di URL, jadi alamatnya tetap /login dan /register.
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
