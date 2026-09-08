import { createContext, ReactNode, useContext } from 'react';
import {
  SettingsToggles,
  usePersistentSettings,
} from '@/hooks/usePersistentSettings';

interface SettingsContextValue {
  toggles: SettingsToggles;
  stepGoal: number;
  weightKg: number;
  strideCm: number;
  shoeSize: string;
  ready: boolean;
  setToggle: (key: keyof SettingsToggles, value: boolean) => void;
  setStepGoal: (goal: number) => void;
  setWeightKg: (weight: number) => void;
  setStrideCm: (stride: number) => void;
  setShoeSize: (size: string) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settings = usePersistentSettings();
  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}