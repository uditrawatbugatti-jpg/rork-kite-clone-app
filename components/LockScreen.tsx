import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Animated,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Fingerprint, Delete } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';

const PIN_LENGTH = 4;

export default function LockScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { verifyPin, authenticateWithBiometrics, hasBiometrics } = useAuth();
  
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shakeAnimation] = useState(new Animated.Value(0));

  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [shakeAnimation]);

  const handleNumberPress = (num: string) => {
    if (pin.length < PIN_LENGTH) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      setPin(prev => prev + num);
    }
  };

  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setPin(prev => prev.slice(0, -1));
  };

  const handleBiometricAuth = useCallback(async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await authenticateWithBiometrics();
  }, [authenticateWithBiometrics]);

  useEffect(() => {
    if (hasBiometrics && Platform.OS !== 'web') {
      setTimeout(() => {
        handleBiometricAuth();
      }, 500);
    }
  }, [hasBiometrics, handleBiometricAuth]);

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      const isCorrect = verifyPin(pin);
      if (!isCorrect) {
        setError(true);
        triggerShake();
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 500);
      } else {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    }
  }, [pin, verifyPin, triggerShake]);

  const renderPinDots = () => (
    <Animated.View style={[styles.pinDotsContainer, { transform: [{ translateX: shakeAnimation }] }]}>
      {[...Array(PIN_LENGTH)].map((_, index) => (
        <View
          key={index}
          style={[
            styles.pinDot,
            {
              backgroundColor: index < pin.length 
                ? (error ? colors.danger : '#FF6B00') 
                : 'transparent',
              borderColor: error ? colors.danger : '#FF6B00',
            },
          ]}
        />
      ))}
    </Animated.View>
  );

  const renderKeypad = () => {
    const keys = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['biometric', '0', 'delete'],
    ];

    return (
      <View style={styles.keypad}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key) => {
              if (key === 'biometric') {
                return (
                  <TouchableOpacity
                    key={key}
                    style={styles.keyButton}
                    onPress={handleBiometricAuth}
                    disabled={!hasBiometrics || Platform.OS === 'web'}
                  >
                    {hasBiometrics && Platform.OS !== 'web' ? (
                      <Fingerprint size={28} color="#FF6B00" />
                    ) : (
                      <View style={styles.emptyKey} />
                    )}
                  </TouchableOpacity>
                );
              }
              if (key === 'delete') {
                return (
                  <TouchableOpacity
                    key={key}
                    style={styles.keyButton}
                    onPress={handleDelete}
                  >
                    <Delete size={28} color={colors.text} />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.keyButton, styles.numberKey]}
                  onPress={() => handleNumberPress(key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.keyText, { color: colors.text }]}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/soi55xvkbh5i3sevf9q4x' }}
            style={styles.kiteLogo}
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Kite</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter your PIN to continue
        </Text>
      </View>

      {renderPinDots()}

      {error && (
        <Text style={[styles.errorText, { color: colors.danger }]}>
          Incorrect PIN
        </Text>
      )}

      {renderKeypad()}

      {hasBiometrics && Platform.OS !== 'web' && (
        <Text style={[styles.biometricHint, { color: colors.textSecondary }]}>
          Tap fingerprint icon to use biometrics
        </Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoContainer: {
    marginBottom: 16,
  },
  kiteLogo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 40,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: -20,
    marginBottom: 20,
  },
  keypad: {
    paddingHorizontal: 40,
    gap: 16,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  keyButton: {
    width: 75,
    height: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberKey: {
    borderRadius: 40,
  },
  keyText: {
    fontSize: 32,
    fontWeight: '400' as const,
  },
  emptyKey: {
    width: 28,
    height: 28,
  },
  biometricHint: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
  },
});
