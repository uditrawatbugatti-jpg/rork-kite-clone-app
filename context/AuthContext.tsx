import { useState, useEffect, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_PIN = '2598';
const PIN_STORAGE_KEY = 'auth_pin_v1';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasBiometrics, setHasBiometrics] = useState<boolean>(false);
  const [pin, setPin] = useState<string>(DEFAULT_PIN);

  const loadPin = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(PIN_STORAGE_KEY);
      if (stored && stored.length === 4) {
        setPin(stored);
        console.log('[Auth] Loaded PIN from storage');
      } else {
        setPin(DEFAULT_PIN);
        console.log('[Auth] Using default PIN');
      }
    } catch (error) {
      console.log('[Auth] PIN load error:', error);
      setPin(DEFAULT_PIN);
    }
  }, []);

  const checkBiometrics = useCallback(async () => {
    if (Platform.OS === 'web') {
      setHasBiometrics(false);
      return;
    }

    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setHasBiometrics(compatible && enrolled);
      console.log('[Auth] Biometrics available:', compatible && enrolled);
    } catch (error) {
      console.log('[Auth] Biometrics check error:', error);
      setHasBiometrics(false);
    }
  }, []);

  useEffect(() => {
    Promise.all([loadPin(), checkBiometrics()])
      .catch((error) => {
        console.log('[Auth] Init error:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [checkBiometrics, loadPin]);

  const verifyPin = useCallback(
    (attempt: string): boolean => {
      const isCorrect = attempt === pin;
      if (isCorrect) {
        setIsUnlocked(true);
      }
      return isCorrect;
    },
    [pin]
  );

  const setNewPin = useCallback(async (nextPin: string): Promise<boolean> => {
    if (!/^\d{4}$/.test(nextPin)) {
      return false;
    }

    try {
      await AsyncStorage.setItem(PIN_STORAGE_KEY, nextPin);
      setPin(nextPin);
      console.log('[Auth] PIN updated');
      return true;
    } catch (error) {
      console.log('[Auth] PIN update error:', error);
      return false;
    }
  }, []);

  const resetPin = useCallback(async (): Promise<boolean> => {
    try {
      await AsyncStorage.removeItem(PIN_STORAGE_KEY);
      setPin(DEFAULT_PIN);
      console.log('[Auth] PIN reset to default');
      return true;
    } catch (error) {
      console.log('[Auth] PIN reset error:', error);
      return false;
    }
  }, []);

  const authenticateWithBiometrics = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Kite',
        fallbackLabel: 'Use PIN',
        disableDeviceFallback: true,
      });

      if (result.success) {
        setIsUnlocked(true);
        return true;
      }
      return false;
    } catch (error) {
      console.log('[Auth] Biometric auth error:', error);
      return false;
    }
  }, []);

  const lock = useCallback(() => {
    setIsUnlocked(false);
  }, []);

  return {
    isUnlocked,
    isLoading,
    hasBiometrics,
    pinLength: 4 as const,
    verifyPin,
    authenticateWithBiometrics,
    setNewPin,
    resetPin,
    lock,
  };
});
