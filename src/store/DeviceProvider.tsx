import { createContext, ReactNode, useContext } from 'react';
import { DeviceState } from '@/utils/deviceModel';
import { useDeviceState } from '@/hooks/useDeviceState';

interface DeviceContextValue {
  state: DeviceState;
  updateLed: (led: Partial<DeviceState['led']>) => void;
  connect: () => void;
  disconnect: () => void;
  pair: (name: string) => void;
}

const DeviceContext = createContext<DeviceContextValue | null>(null);

export function DeviceProvider({ children }: { children: ReactNode }) {
  const device = useDeviceState();
  return (
    <DeviceContext.Provider value={device}>{children}</DeviceContext.Provider>
  );
}

export function useDevice(): DeviceContextValue {
  const ctx = useContext(DeviceContext);
  if (!ctx) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return ctx;
}