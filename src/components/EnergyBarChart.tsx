import { useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { typography, radius, shadow, useTheme, ThemePalette } from '@/theme';

interface EnergyBarChartProps {
  data: number[];
  labels?: [string, string, string];
  unit?: string;
  style?: ViewStyle;
}

export default function EnergyBarChart({
  data,
  labels = ['00:00', '12:00', 'Now'],
  unit = 'W',
  style,
}: EnergyBarChartProps) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const max = Math.max(...data, 1);
  return (
    <View style={[styles.container, style]}>
      <View style={styles.bars}>
        {data.map((value, index) => {
          const isMax = value === max && value > 0;
          const heightPercent = Math.max(8, (value / max) * 100);
          return (
            <View key={index} style={styles.barCol}>
              {isMax && (
                <View style={styles.tooltip}>
                  <Text style={[typography.labelSm as any, styles.tooltipText]}>
                    {value.toFixed(2)} {unit}
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.bar,
                  {
                    height: `${heightPercent}%`,
                    backgroundColor: isMax
                      ? palette.brand.volt
                      : palette.chartBar,
                  },
                  isMax && shadow.energized,
                ]}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.axis}>
        <Text style={[typography.labelSm as any, styles.axisText]}>
          {labels[0]}
        </Text>
        <Text style={[typography.labelSm as any, styles.axisText]}>
          {labels[1]}
        </Text>
        <Text style={[typography.labelSm as any, styles.axisText]}>
          {labels[2]}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      gap: 8,
    },
    bars: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 120,
      gap: 6,
    },
    barCol: {
      flex: 1,
      height: '100%',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    bar: {
      width: '100%',
      borderRadius: radius.sm,
      minHeight: 6,
    },
    tooltip: {
      position: 'absolute',
      top: 0,
      backgroundColor: colors.brand.volt,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: radius.sm,
      marginBottom: 4,
    },
    tooltipText: {
      color: colors.obsidian,
    },
    axis: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    axisText: {
      color: colors.outline,
    },
  });