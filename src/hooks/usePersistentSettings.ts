import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SettingsToggles = Record<
  'haptic' | 'notifications' | 'data' | 'ambient',
  boolean
>;

const STORAGE_KEY = 'kv.settings.toggles.v1';

const DEFAULT_TOGGLES: SettingsToggles = {
  haptic: true,
  notifications: false,
  data: true,
  ambient: true,
};

export function usePersistentSettings() {
  const [toggles, setToggles] = useState<SettingsToggles>(DEFAULT_TOGGLES);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && mounted) {
          setToggles({ ...DEFAULT_TOGGLES, ...JSON.parse(raw) });
        }
      } catch {
        // ignore corrupt/absent storage, fall back to defaults
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const setToggle = (key: keyof SettingsToggles, value: boolean) => {
    setToggles((prev) => {
      const next = { ...prev, [key]: value };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  return { toggles, setToggle, ready };
}