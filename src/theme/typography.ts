import { TextStyle } from 'react-native';

export interface TypeStyle extends TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
  lineHeight: number;
  letterSpacing?: number;
}

export const typography = {
  displayLg: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 44,
    fontWeight: '800',
    lineHeight: 52,
    letterSpacing: -0.03 * 44,
  } as TypeStyle,
  displayLgMobile: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
    letterSpacing: -0.02 * 34,
  } as TypeStyle,
  headlineLg: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 38,
    letterSpacing: -0.02 * 32,
  } as TypeStyle,
  headlineLgMobile: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.015 * 26,
  } as TypeStyle,
  headlineMd: {
    fontFamily: 'PlusJakartaSans_700Bold',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: -0.01 * 22,
  } as TypeStyle,
  headlineSm: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  } as TypeStyle,
  metricXl: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 44,
    letterSpacing: -0.04 * 40,
    fontVariant: ['tabular-nums'],
  } as TypeStyle,
  metricLg: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
    letterSpacing: -0.03 * 28,
    fontVariant: ['tabular-nums'],
  } as TypeStyle,
  metricMd: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: -0.02 * 20,
    fontVariant: ['tabular-nums'],
  } as TypeStyle,
  bodyLg: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  } as TypeStyle,
  bodyMd: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } as TypeStyle,
  bodySm: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } as TypeStyle,
  labelMd: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.04 * 12,
    textTransform: 'uppercase',
  } as TypeStyle,
  labelSm: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.06 * 10,
    textTransform: 'uppercase',
  } as TypeStyle,
} as const;

export type TypographyToken = keyof typeof typography;
