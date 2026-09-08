import { ReactNode, useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { typography, radius, spacing, shadow, useTheme, ThemePalette } from '@/theme';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  title?: string;
  elevated?: boolean;
  blurIntensity?: number;
}

export default function GlassCard({
  children,
  style,
  title,
  elevated = false,
  blurIntensity = 16,
}: GlassCardProps) {
  const { palette, mode } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  return (
    <View style={[styles.outer, elevated && styles.elevated, style]}>
      <View style={styles.inner}>
        <BlurView
          intensity={elevated ? Math.max(blurIntensity, 24) : blurIntensity}
          tint={mode === 'dark' ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        {title && (
          <Text style={[typography.labelSm as any, styles.title]}>{title}</Text>
        )}
        {children}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    outer: {
      borderRadius: radius.xl,
      ...shadow.card,
    },
    elevated: {
      ...shadow.energized,
    },
    inner: {
      backgroundColor:
        colors.kind === 'dark'
          ? 'rgba(255, 255, 255, 0.05)'
          : 'rgba(255, 255, 255, 0.85)',
      borderWidth: 1,
      borderColor: colors.glass.border,
      borderRadius: radius.xl,
      padding: spacing.md,
      gap: spacing.sm,
      overflow: 'hidden',
    },
    title: {
      color: colors.onSurfaceVariant,
      marginBottom: spacing.xxs,
    },
  });