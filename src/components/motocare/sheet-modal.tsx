import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { MotoColors } from '@/constants/motocare-theme';

type SheetModalProps = {
  visible: boolean;
  judul: string;
  onClose: () => void;
  children: ReactNode;
};

// Panel yang muncul dari bawah layar, dipakai oleh form tambah servis & perbarui kilometer
export function SheetModal({ visible, judul, onClose, children }: SheetModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.latar}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Area gelap di atas panel: ketuk untuk menutup */}
        <Pressable style={styles.areaTutup} onPress={onClose} />

        <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.judul}>{judul}</Text>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={styles.tombolTutup}
              accessibilityLabel="Tutup">
              <Ionicons name="close" size={20} color={MotoColors.textSecondary} />
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.isi}>
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  latar: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(11,27,51,0.55)',
  },
  areaTutup: {
    flex: 1,
  },
  panel: {
    backgroundColor: MotoColors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  judul: {
    fontSize: 20,
    fontWeight: '700',
    color: MotoColors.text,
  },
  tombolTutup: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: MotoColors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  isi: {
    gap: 16,
  },
});
