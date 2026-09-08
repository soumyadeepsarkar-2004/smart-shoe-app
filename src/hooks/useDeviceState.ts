import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DeviceState,
  LedConfig,
  PowerRange,
  Telemetry,
} from '@/utils/deviceModel';

const LED_STORAGE_KEY = 'kv.device.led.v1';
const NAME_STORAGE_KEY = 'kv.device.name.v1';

const INITIAL: DeviceState = {
  connectionState: 'connected',
  name: 'KV-01 Runner',
  battery: {
    percent: 68,
    energyWh: 0.87,
    capacityWh: 1.1,
    charging: true,
  },
  telemetry: {
    voltageV: 4.2,
    currentMA: 120,
    outputPowerW: 0.5,
    status: 'harvesting',
  },
  led: {
    colorKey: 'volt',
    brightness: 0.8,
    pattern: 'pulse',
  },
  stepCount: 8421,
  powerSeries: {
    '1H': [0.31, 0.42, 0.38, 0.5, 0.44, 0.47, 0.51, 0.4, 0.34, 0.45, 0.49, 0.5],
    '24H': [0.12, 0.2, 0.35, 0.28, 0.44, 0.5, 0.31, 0.22],
    W: [0.3, 0.42, 0.38, 0.46, 0.35, 0.51, 0.44],
  },
};

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

const rollStatus = (connected: boolean): Telemetry['status'] => {
  if (!connected) return 'idle';
  const roll = Math.random();
  if (roll < 0.01) return 'error';
  if (roll < 0.09) return 'idle';
  return 'harvesting';
};

const rotateSeries = (series: number[][], next: number[]) =>
  series.map((entry, index) => {
    const value = next[index];
    const shifted = entry.slice(1);
    shifted.push(value);
    return shifted;
  });

export function useDeviceState() {
  const [state, setState] = useState<DeviceState>(INITIAL);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(LED_STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<LedConfig>;
          setState((prev) => ({
            ...prev,
            led: { ...prev.led, ...saved },
          }));
        }
      } catch {
        // ignore corrupt storage, keep defaults
      }
      try {
        const name = await AsyncStorage.getItem(NAME_STORAGE_KEY);
        if (name) {
          setState((prev) => ({ ...prev, name }));
        }
      } catch {
        // ignore, keep default name
      }
    })();
  }, []);

  useEffect(() => {
    timer.current = setInterval(() => {
      setState((prev) => {
        const connected = prev.connectionState === 'connected';
        const nextPowerW = connected ? randomBetween(0.35, 0.55) : 0;
        const nextCurrentMA = connected
          ? randomBetween(90, 140)
          : randomBetween(0, 4);
        const telemetry: Telemetry = {
          voltageV: connected ? randomBetween(4.1, 4.3) : 0.1,
          currentMA: nextCurrentMA,
          outputPowerW: nextPowerW,
          status: rollStatus(connected),
        };
        return {
          ...prev,
          telemetry,
          stepCount: connected
            ? prev.stepCount + Math.floor(randomBetween(1, 8))
            : prev.stepCount,
          battery: {
            ...prev.battery,
            charging: connected,
            energyWh: connected
              ? Math.min(
                  prev.battery.capacityWh,
                  prev.battery.energyWh + randomBetween(0.001, 0.003)
                )
              : prev.battery.energyWh,
            percent: connected
              ? Math.min(
                  100,
                  prev.battery.percent + randomBetween(0.001, 0.008)
                )
              : Math.max(0, prev.battery.percent - randomBetween(0.001, 0.004)),
          },
          powerSeries: rotateSeries(
            [prev.powerSeries['1H'], prev.powerSeries['24H'], prev.powerSeries.W],
            [
              connected ? randomBetween(0.3, 0.55) : 0,
              connected ? randomBetween(0.2, 0.5) : 0,
              connected ? randomBetween(0.25, 0.48) : 0,
            ]
          ).reduce(
            (acc, entry, index) => {
              const key: PowerRange[] = ['1H', '24H', 'W'];
              acc[key[index]] = entry;
              return acc;
            },
            { '1H': [], '24H': [], W: [] } as DeviceState['powerSeries']
          ),
        };
      });
    }, 1800);

    return () => {
      if (timer.current) clearInterval(timer.current);
      if (connectTimer.current) clearTimeout(connectTimer.current);
    };
  }, []);

  const updateLed = (led: Partial<DeviceState['led']>) => {
    setState((prev) => {
      const next = { ...prev, led: { ...prev.led, ...led } };
      AsyncStorage.setItem(LED_STORAGE_KEY, JSON.stringify(next.led)).catch(
        () => {}
      );
      return next;
    });
  };

  const connect = () => {
    setState((prev) => ({
      ...prev,
      connectionState: 'connecting',
      telemetry: { ...prev.telemetry, status: 'idle' },
    }));
    if (connectTimer.current) clearTimeout(connectTimer.current);
    connectTimer.current = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        connectionState: 'connected',
        battery: { ...prev.battery, charging: true },
      }));
    }, 1400);
  };

  const disconnect = () => {
    if (connectTimer.current) clearTimeout(connectTimer.current);
    setState((prev) => ({
      ...prev,
      connectionState: 'disconnected',
      battery: { ...prev.battery, charging: false },
    }));
  };

  const pair = (name: string) => {
    setState((prev) => ({
      ...prev,
      name,
      connectionState: 'connecting',
    }));
    AsyncStorage.setItem(NAME_STORAGE_KEY, name).catch(() => {});
    if (connectTimer.current) clearTimeout(connectTimer.current);
    connectTimer.current = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        connectionState: 'connected',
        battery: { ...prev.battery, charging: true },
      }));
    }, 1400);
  };

  return { state, updateLed, connect, disconnect, pair };
}