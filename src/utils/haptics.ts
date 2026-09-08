import * as Haptics from 'expo-haptics';
import { SettingsToggles } from '@/hooks/usePersistentSettings';

const enabled = (settings?: SettingsToggles | null) =>
  settings?.haptic ?? true;

export const hapticFeedback = (
  settings?: SettingsToggles | null,
  type: 'light' | 'medium' | 'success' | 'warning' = 'light'
) => {
  if (!enabled(settings)) return;
  switch (type) {
    case 'medium':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      break;
    case 'success':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
      break;
    case 'warning':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(
        () => {}
      );
      break;
    default:
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
};