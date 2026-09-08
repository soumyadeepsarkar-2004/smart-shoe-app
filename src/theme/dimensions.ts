import { Platform } from 'react-native';export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  screenPaddingMobile: 20,
  screenPaddingTablet: 32,
  cardGap: 12,
} as const;

export const radius = {
  sm: 4,
  default: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  energized: {
    shadowColor: '#CCFF00',
    shadowOpacity: 0.18,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 12 },
    elevation: 18,
  },
} as const;

export const isAndroid = Platform.OS === 'android';
