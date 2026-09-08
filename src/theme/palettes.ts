export interface BrandColors {
  volt: string;
  cyan: string;
  purple: string;
  solar: string;
  white: string;
  danger: string;
  success: string;
}

export interface ThemePalette {
  kind: 'dark' | 'light';
  background: string;
  onBackground: string;
  surface: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  surfaceVariant: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  brand: BrandColors;
  obsidian: string;
  chalk: string;
  glass: { surface: string; border: string };
  track: string;
  ring: string;
  chartBar: string;
  swatchBorder: string;
  iconVoltTint: string;
}

const BRAND: BrandColors = {
  volt: '#CCFF00',
  cyan: '#00F0FF',
  purple: '#7000FF',
  solar: '#FF9F0A',
  white: '#FFFFFF',
  danger: '#FF3B30',
  success: '#30D158',
};

export const darkPalette: ThemePalette = {
  kind: 'dark',
  background: '#0D1117',
  onBackground: '#dfe2eb',
  surface: '#1c2026',
  surfaceContainerLow: '#181c22',
  surfaceContainer: '#1c2026',
  surfaceContainerHigh: '#262a31',
  onSurface: '#dfe2eb',
  onSurfaceVariant: '#c4c9ac',
  outline: '#8e9379',
  outlineVariant: '#444933',
  surfaceVariant: '#31353c',
  error: '#ffb4ab',
  onError: '#690005',
  errorContainer: '#93000a',
  onErrorContainer: '#ffdad6',
  brand: BRAND,
  obsidian: '#0D1117',
  chalk: '#F6F8FA',
  glass: {
    surface: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.10)',
  },
  track: 'rgba(255,255,255,0.08)',
  ring: 'rgba(255,255,255,0.08)',
  chartBar: 'rgba(255,255,255,0.10)',
  swatchBorder: 'rgba(255,255,255,0.2)',
  iconVoltTint: 'rgba(204,255,0,0.12)',
};

export const lightPalette: ThemePalette = {
  kind: 'light',
  background: '#F4F6F9',
  onBackground: '#1A1D21',
  surface: '#FFFFFF',
  surfaceContainerLow: '#F8FAFC',
  surfaceContainer: '#ECEEF2',
  surfaceContainerHigh: '#E3E7EC',
  onSurface: '#1A1D21',
  onSurfaceVariant: '#4B5563',
  outline: '#8A929E',
  outlineVariant: '#C7CED8',
  surfaceVariant: '#E2E6EB',
  error: '#B3261E',
  onError: '#FFFFFF',
  errorContainer: '#F9DEDC',
  onErrorContainer: '#410E0B',
  brand: BRAND,
  obsidian: '#0D1117',
  chalk: '#FFFFFF',
  glass: {
    surface: 'rgba(255,255,255,0.85)',
    border: 'rgba(0,0,0,0.04)',
  },
  track: 'rgba(0,0,0,0.06)',
  ring: 'rgba(0,0,0,0.08)',
  chartBar: 'rgba(0,0,0,0.08)',
  swatchBorder: 'rgba(0,0,0,0.10)',
  iconVoltTint: 'rgba(204,255,0,0.18)',
};

export type ThemeMode = 'light' | 'dark';