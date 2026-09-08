import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { typography, radius, spacing, useTheme, ThemePalette } from '@/theme';

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  accent?: string;
}

export default function MetricCard({
  label,
  value,
  unit,
  accent,
}: MetricCardProps) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const accentColor = accent ?? palette.onBackground;
  return (
    <View style={styles.card}>
      <Text style={[typography.labelSm as any, styles.label]}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={[typography.metricMd as any, { color: accentColor }]}>
          {value}
        </Text>
        {unit && (
          <Text style={[typography.bodySm as any, styles.unit]}>{unit}</Text>
        )}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: colors.glass.surface,
      borderWidth: 1,
      borderColor: colors.glass.border,
      borderRadius: radius.md,
      padding: spacing.sm,
      gap: 4,
    },
    label: {
      color: colors.onSurfaceVariant,
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
    },
    unit: {
      color: colors.outline,
    },
  });