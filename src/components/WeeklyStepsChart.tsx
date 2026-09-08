import { useMemo } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { typography, radius, spacing, useTheme, ThemePalette } from '@/theme';
import { DailyRecord, isoDay } from '@/hooks/useStepHistory';

interface WeeklyStepsChartProps {
  records: DailyRecord[];
  style?: ViewStyle;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const weekdayLabel = (date: string) => {
  const d = new Date(`${date}T00:00:00`);
  return WEEKDAY_SHORT[d.getDay()];
};

export default function WeeklyStepsChart({
  records,
  style,
}: WeeklyStepsChartProps) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

  const week = useMemo(() => {
    const today = isoDay(new Date());
    const days: { date: string; steps: number; energyWh: number; peakW: number }[] = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const key = isoDay(new Date(Date.now() - offset * DAY_MS));
      const found = records.find((r) => r.date === key);
      days.push(
        found ?? { date: key, steps: 0, energyWh: 0, peakW: 0 }
      );
    }
    const total = days.reduce((sum, d) => sum + d.steps, 0);
    const maxSteps = Math.max(1, ...days.map((d) => d.steps));
    return { days, total, maxSteps, today };
  }, [records]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={[typography.labelSm as any, styles.totalLabel]}>
          Total steps
        </Text>
        <Text style={[typography.metricLg as any, styles.totalValue]}>
          {week.total.toLocaleString()}
        </Text>
      </View>

      <View style={styles.chart}>
        {week.days.map((day) => {
          const isToday = day.date === week.today;
          const isMax = day.steps === week.maxSteps && day.steps > 0;
          const heightPercent = Math.max(6, (day.steps / week.maxSteps) * 100);
          return (
            <View key={day.date} style={styles.col}>
              <View style={styles.barArea}>
                {isToday && (
                  <View style={styles.barValue}>
                    <Text style={[typography.labelSm as any, styles.barValueText]}>
                      {isMax ? day.steps.toLocaleString() : ''}
                    </Text>
                  </View>
                )}
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: isToday
                        ? palette.brand.volt
                        : isMax
                        ? palette.brand.cyan
                        : palette.chartBar,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  typography.labelSm as any,
                  styles.dayLabel,
                  isToday && styles.dayLabelActive,
                ]}
              >
                {weekdayLabel(day.date)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      gap: spacing.sm,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
    },
    totalLabel: {
      color: colors.outline,
    },
    totalValue: {
      color: colors.brand.volt,
      fontVariant: ['tabular-nums'],
    },
    chart: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 120,
      gap: spacing.xxs,
    },
    col: {
      flex: 1,
      alignItems: 'center',
      gap: 6,
    },
    barArea: {
      flex: 1,
      width: '100%',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    bar: {
      width: '55%',
      borderRadius: radius.sm,
      minHeight: 6,
    },
    barValue: {
      position: 'absolute',
      top: 0,
      backgroundColor: colors.brand.volt,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: radius.sm,
    },
    barValueText: {
      color: colors.obsidian,
    },
    dayLabel: {
      color: colors.outline,
    },
    dayLabelActive: {
      color: colors.onBackground,
      fontWeight: '700' as const,
    },
  });