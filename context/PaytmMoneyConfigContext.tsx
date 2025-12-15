import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

import type { PaytmMoneyConfig } from '@/services/paytmMoneyService';

const STORAGE_KEY = 'paytmMoneyConfig.v1';

type StoredConfig = {
  baseUrl?: string;
  accessToken?: string;
  apiKey?: string;
  apiSecret?: string;
};

function sanitizeConfig(config: PaytmMoneyConfig): PaytmMoneyConfig {
  return {
    baseUrl: config.baseUrl?.trim() ? config.baseUrl.trim() : undefined,
    accessToken: config.accessToken?.trim() ? config.accessToken.trim() : undefined,
    apiKey: config.apiKey?.trim() ? config.apiKey.trim() : undefined,
    apiSecret: config.apiSecret?.trim() ? config.apiSecret.trim() : undefined,
  };
}

export const [PaytmMoneyConfigProvider, usePaytmMoneyConfig] = createContextHook(() => {
  const [config, setConfigState] = useState<PaytmMoneyConfig>({});
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!mounted) return;

        if (!raw) {
          setIsLoaded(true);
          return;
        }

        const parsed = JSON.parse(raw) as StoredConfig;
        const next: PaytmMoneyConfig = sanitizeConfig({
          baseUrl: parsed?.baseUrl,
          accessToken: parsed?.accessToken,
          apiKey: parsed?.apiKey,
          apiSecret: parsed?.apiSecret,
        });

        setConfigState(next);
        setIsLoaded(true);
      } catch (e) {
        console.log('[PaytmMoneyConfig] Load failed', e);
        setIsLoaded(true);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const persist = useCallback(async (next: PaytmMoneyConfig) => {
    try {
      const stored: StoredConfig = {
        baseUrl: next.baseUrl,
        accessToken: next.accessToken,
        apiKey: next.apiKey,
        apiSecret: next.apiSecret,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    } catch (e) {
      console.log('[PaytmMoneyConfig] Persist failed', e);
    }
  }, []);

  const setConfig = useCallback(
    (next: PaytmMoneyConfig) => {
      const sanitized = sanitizeConfig(next);
      setConfigState(sanitized);
      persist(sanitized);
    },
    [persist],
  );

  const clearConfig = useCallback(() => {
    setConfigState({});
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
  }, []);

  const isConfigured = useMemo(() => Boolean(config.baseUrl && config.accessToken), [config.baseUrl, config.accessToken]);

  return {
    config,
    isLoaded,
    isConfigured,
    setConfig,
    clearConfig,
  };
});
