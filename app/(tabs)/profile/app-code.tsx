import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Lock, RefreshCcw, ShieldCheck } from 'lucide-react-native';

export default function AppCodeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { setNewPin, resetPin, pinLength, verifyPin } = useAuth();

  const [currentPin, setCurrentPin] = useState<string>('');
  const [newPin, setNewPinValue] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const isValidLength = useCallback(
    (value: string) => value.length === pinLength,
    [pinLength]
  );

  const canSubmit = useMemo(() => {
    return (
      isValidLength(currentPin) &&
      isValidLength(newPin) &&
      isValidLength(confirmPin) &&
      newPin === confirmPin
    );
  }, [confirmPin, currentPin, isValidLength, newPin]);

  const handleSave = useCallback(async () => {
    if (saving) return;

    if (!/^(\d)+$/.test(currentPin) || !/^(\d)+$/.test(newPin) || !/^(\d)+$/.test(confirmPin)) {
      Alert.alert('Invalid PIN', `PIN must be ${pinLength} digits.`);
      return;
    }

    if (!isValidLength(currentPin) || !isValidLength(newPin) || !isValidLength(confirmPin)) {
      Alert.alert('Invalid PIN', `PIN must be ${pinLength} digits.`);
      return;
    }

    if (newPin !== confirmPin) {
      Alert.alert('PIN mismatch', 'New PIN and Confirm PIN do not match.');
      return;
    }

    console.log('[AppCode] Save pressed');
    setSaving(true);
    try {
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      const ok = verifyPin(currentPin);
      if (!ok) {
        Alert.alert('Incorrect current PIN', 'Please enter your current PIN correctly.');
        return;
      }

      const updated = await setNewPin(newPin);
      if (!updated) {
        Alert.alert('Could not update', 'Something went wrong while saving your new PIN. Please try again.');
        return;
      }

      Alert.alert('Updated', 'Your app code has been updated.', [
        {
          text: 'Done',
          onPress: () => {
            router.back();
          },
        },
      ]);
    } finally {
      setSaving(false);
    }
  }, [confirmPin, currentPin, isValidLength, newPin, pinLength, router, saving, setNewPin, verifyPin]);

  const handleReset = useCallback(async () => {
    console.log('[AppCode] Reset to default pressed');
    Alert.alert('Reset App Code', 'Reset your app code to default?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          if (Platform.OS !== 'web') {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
          const ok = await resetPin();
          if (ok) {
            setCurrentPin('');
            setNewPinValue('');
            setConfirmPin('');
            Alert.alert('Reset', 'App code reset to default.');
          } else {
            Alert.alert('Failed', 'Could not reset app code. Try again.');
          }
        },
      },
    ]);
  }, [resetPin]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: 'rgba(65,132,243,0.10)' }]}>
          <ShieldCheck size={22} color={colors.tint} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>App Code</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Change your {pinLength}-digit PIN used to unlock the app.</Text>
      </View>

      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Current PIN</Text>
          <TextInput
            value={currentPin}
            onChangeText={setCurrentPin}
            placeholder="••••"
            placeholderTextColor={colors.tabIconDefault}
            keyboardType={Platform.OS === 'web' ? 'default' : 'number-pad'}
            secureTextEntry
            maxLength={pinLength}
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            testID="app-code-current"
          />
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>New PIN</Text>
          <TextInput
            value={newPin}
            onChangeText={setNewPinValue}
            placeholder="••••"
            placeholderTextColor={colors.tabIconDefault}
            keyboardType={Platform.OS === 'web' ? 'default' : 'number-pad'}
            secureTextEntry
            maxLength={pinLength}
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            testID="app-code-new"
          />
        </View>

        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Confirm PIN</Text>
          <TextInput
            value={confirmPin}
            onChangeText={setConfirmPin}
            placeholder="••••"
            placeholderTextColor={colors.tabIconDefault}
            keyboardType={Platform.OS === 'web' ? 'default' : 'number-pad'}
            secureTextEntry
            maxLength={pinLength}
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            testID="app-code-confirm"
          />
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.tint, opacity: canSubmit && !saving ? 1 : 0.5 }]}
          onPress={handleSave}
          disabled={!canSubmit || saving}
          activeOpacity={0.9}
          testID="app-code-save"
        >
          <Lock size={18} color="#fff" />
          <Text style={styles.primaryButtonText}>{saving ? 'Saving…' : 'Update App Code'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: colors.border }]}
          onPress={handleReset}
          activeOpacity={0.9}
          testID="app-code-reset"
        >
          <RefreshCcw size={18} color={colors.text} />
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Reset to default</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 14,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  row: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  primaryButton: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 10,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
