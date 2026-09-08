import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type SettingsToggles = Record<
  'haptic' | 'notifications' | 'data' | 'ambient',
  boolean
>;

const TOGGLES_STORAGE_KEY = 'kv.settings.toggles.v1';
const STEP_GOAL_STORAGE_KEY = 'kv.settings.stepgoal.v1';
const WEIGHT_STORAGE_KEY = 'kv.settings.weight.v1';

const DEFAULT_TOGGLES: SettingsToggles = {
  haptic: true,
  notifications: false,
  data: true,
  ambient: true,
};

export function usePersistentSettings() {
  const [toggles, setToggles] = useState<SettingsToggles>(DEFAULT_TOGGLES);
  const [stepGoal, setStepGoalInternal] = useState<number>(10000);
  const [weightKg, setWeightKgInternal] = useState<number>(70);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [rawToggles, rawGoal, rawWeight] = await Promise.all([
          AsyncStorage.getItem(TOGGLES_STORAGE_KEY),
          AsyncStorage.getItem(STEP_GOAL_STORAGE_KEY),
          AsyncStorage.getItem(WEIGHT_STORAGE_KEY),
        ]);
        if (mounted) {
          if (rawToggles) {
            setToggles({ ...DEFAULT_TOGGLES, ...JSON.parse(rawToggles) });
          }
          if (rawGoal) {
            const parsedGoal = parseInt(rawGoal, 10);
            if (!isNaN(parsedGoal) && parsedGoal > 0) setStepGoalInternal(parsedGoal);
          }
          if (rawWeight) {
            const parsedWeight = parseInt(rawWeight, 10);
            if (!isNaN(parsedWeight) && parsedWeight > 0) setWeightKgInternal(parsedWeight);
          }
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
      AsyncStorage.setItem(TOGGLES_STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const setStepGoal = (goal: number) => {
    setStepGoalInternal(goal);
    AsyncStorage.setItem(STEP_GOAL_STORAGE_KEY, goal.toString()).catch(() => {});
  };

  const setWeightKg = (weight: number) => {
    setWeightKgInternal(weight);
    AsyncStorage.setItem(WEIGHT_STORAGE_KEY, weight.toString()).catch(() => {});
  };

  return { toggles, stepGoal, weightKg, setToggle, setStepGoal, setWeightKg, ready };
}