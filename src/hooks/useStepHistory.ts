import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DailyRecord {
  date: string;
  steps: number;
  energyWh: number;
  peakW: number;
}

const STORAGE_KEY = 'kv.daily.history.v1';
const DAY_MS = 24 * 60 * 60 * 1000;

export const isoDay = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const seedRecords = (): DailyRecord[] => {
  const now = new Date();
  const seeded: DailyRecord[] = [];
  for (let offset = 6; offset >= 1; offset -= 1) {
    const d = new Date(now.getTime() - offset * DAY_MS);
    seeded.push({
      date: isoDay(d),
      steps: 4200 + Math.round(Math.random() * 5600),
      energyWh: Math.round((0.3 + Math.random() * 0.7) * 100) / 100,
      peakW: Math.round((0.34 + Math.random() * 0.26) * 100) / 100,
    });
  }
  return seeded;
};

const mergeRecord = (
  prev: DailyRecord | undefined,
  rec: Omit<DailyRecord, 'date'>
): DailyRecord => ({
  date: isoDay(new Date()),
  steps: Math.max(prev?.steps ?? 0, rec.steps),
  energyWh: Math.max(prev?.energyWh ?? 0, rec.energyWh),
  peakW: Math.max(prev?.peakW ?? 0, rec.peakW),
});

export function useStepHistory() {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [ready, setReady] = useState(false);
  const recordsRef = useRef<DailyRecord[]>([]);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as DailyRecord[];
          recordsRef.current = parsed.filter(
            (r) => typeof r.date === 'string' && typeof r.steps === 'number'
          );
        } else {
          recordsRef.current = seedRecords();
        }
      } catch {
        recordsRef.current = seedRecords();
      }
      const todayKey = isoDay(new Date());
      if (recordsRef.current[recordsRef.current.length - 1]?.date !== todayKey) {
        recordsRef.current = [
          ...recordsRef.current,
          { date: todayKey, steps: 0, energyWh: 0, peakW: 0 },
        ];
      }
      setRecords([...recordsRef.current]);
      setReady(true);
    })();
  }, []);

  const persist = useCallback(() => {
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recordsRef.current)).catch(
        () => {}
      );
    }, 400);
  }, []);

  const noteDay = useCallback(
    (rec: Omit<DailyRecord, 'date'>) => {
      if (!ready) return;
      const todayKey = isoDay(new Date());
      let changed = false;
      recordsRef.current = recordsRef.current.map((r) => {
        if (r.date !== todayKey) return r;
        const merged = mergeRecord(r, rec);
        if (
          merged.steps === r.steps &&
          merged.energyWh === r.energyWh &&
          merged.peakW === r.peakW
        ) {
          return r;
        }
        changed = true;
        return merged;
      });
      if (!changed) return;
      setRecords([...recordsRef.current]);
      persist();
    },
    [ready, persist]
  );

  return { records, ready, noteDay };
}