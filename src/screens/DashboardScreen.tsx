import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { typography, spacing, radius, useTheme, ThemePalette } from '@/theme';
import GlassCard from '@/components/GlassCard';
import KineticGauge from '@/components/KineticGauge';
import MetricCard from '@/components/MetricCard';
import EnergyBarChart from '@/components/EnergyBarChart';
import ConnectionBanner from '@/components/ConnectionBanner';
import PressableButton from '@/components/PressableButton';
import SegmentedControl from '@/components/SegmentedControl';
import SmartAlertBanner, { SmartAlert } from '@/components/SmartAlertBanner';
import WeeklyStepsChart from '@/components/WeeklyStepsChart';
import { useDevice } from '@/store/DeviceProvider';
import { useSettings } from '@/store/SettingsProvider';
import { useStepHistory } from '@/hooks/useStepHistory';
import { hapticFeedback } from '@/utils/haptics';
import { PowerRange } from '@/utils/deviceModel';

type Range = PowerRange;

const RANGE_OPTIONS: { label: string; value: Range }[] = [
  { label: '1H', value: '1H' },
  { label: '24H', value: '24H' },
  { label: 'Week', value: 'W' },
];

const AXIS_LABELS: Record<Range, [string, string, string]> = {
  '1H': ['-60m', '-30m', 'Now'],
  '24H': ['00:00', '12:00', 'Now'],
  W: ['Mon', 'Thu', 'Today'],
};

const DAILY_STEP_GOAL = 10000;

export default function DashboardScreen() {
  const { state, connect } = useDevice();
  const { toggles, stepGoal, weightKg } = useSettings();
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [range, setRange] = useState<Range>('24H');
  const { records: history, ready: historyReady, noteDay } = useStepHistory();

  const [workoutActive, setWorkoutActive] = useState(false);
  const [workoutSeconds, setWorkoutSeconds] = useState(0);

  useEffect(() => {
    if (!workoutActive) return;
    const timer = setInterval(() => {
      setWorkoutSeconds((sec) => sec + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [workoutActive]);

  const toggleWorkout = () => {
    if (workoutActive) {
      hapticFeedback(toggles, 'success');
      const mins = Math.floor(workoutSeconds / 60);
      const secs = workoutSeconds % 60;
      const energyHarvested = ((workoutSeconds * 0.0003) + 0.02).toFixed(2);
      Alert.alert(
        'Workout Completed! ⚡',
        `Duration: ${mins}m ${secs}s\nEnergy Harvested: +${energyHarvested} Wh\nAvg Cadence: 162 SPM\nGreat job keeping your stride charged!`
      );
      setWorkoutActive(false);
      setWorkoutSeconds(0);
    } else {
      hapticFeedback(toggles, 'medium');
      setWorkoutSeconds(0);
      setWorkoutActive(true);
    }
  };

  const formatWorkoutTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!historyReady) return;
    noteDay({
      steps: state.stepCount,
      energyWh: state.battery.energyWh,
      peakW: state.telemetry.outputPowerW,
    });
  }, [
    historyReady,
    noteDay,
    state.stepCount,
    state.battery.energyWh,
    state.telemetry.outputPowerW,
  ]);

  const smartAlert: SmartAlert | null = toggles.notifications
    ? state.connectionState === 'disconnected'
      ? {
          kind: 'danger',
          title: 'Shoe link lost',
          message: 'Live telemetry paused. Reconnect the shoe to resume.',
          actionLabel: 'Reconnect',
          onAction: connect,
        }
      : state.telemetry.status === 'error'
      ? {
          kind: 'danger',
          title: 'Circuit error',
          message: 'A sensor fault was detected. Check the shoe diagnostics.',
        }
      : null
    : null;

  const goalPercent = Math.min(100, (state.stepCount / stepGoal) * 100);
  const distanceKm = (state.stepCount * 0.00078).toFixed(2);
  const caloriesKcal = Math.round(state.stepCount * 0.04 * (weightKg / 70));
  const activeMinutes = Math.round(state.stepCount / 110);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRows}>
        <View style={styles.headerTop}>
          <View style={styles.brandIconWrap}>
            <FontAwesome5 name="bolt" size={20} color={palette.brand.volt} />
          </View>
          <View style={styles.headerTitleBlock}>
            <Text style={[typography.displayLgMobile as any, styles.title]}>
              Kinetic Volt
            </Text>
            <Text style={[typography.labelSm as any, styles.headerSubtitle]}>
              PIEZO TELEMETRY · COCKPIT
            </Text>
          </View>
        </View>
        <ConnectionBanner
          state={state.connectionState}
          deviceName={state.name}
        />
      </View>

      <SmartAlertBanner alert={smartAlert} />

      <GlassCard elevated style={styles.gaugeCard}>
        <KineticGauge
          percent={state.battery.percent}
          energyWh={state.battery.energyWh.toFixed(2)}
          capacityWh={state.battery.capacityWh.toFixed(1)}
          status={state.telemetry.status}
        />
      </GlassCard>

      <View style={styles.metricsRow}>
        <MetricCard
          label="Voltage"
          value={state.telemetry.voltageV.toFixed(1)}
          unit="V"
        />
        <MetricCard
          label="Current"
          value={Math.round(state.telemetry.currentMA).toString()}
          unit="mA"
        />
        <MetricCard
          label="Output"
          value={state.telemetry.outputPowerW.toFixed(2)}
          unit="W"
          accent={palette.brand.volt}
        />
      </View>

      <GlassCard title="Step Progress & Movement">
        <View style={styles.stepHeaderRow}>
          <View>
            <Text style={[typography.metricXl as any, styles.steps]}>
              {state.stepCount.toLocaleString()}
            </Text>
            <Text style={[typography.bodySm as any, styles.caption]}>
              Target: {stepGoal.toLocaleString()} steps ·{' '}
              {Math.round(goalPercent)}%
            </Text>
          </View>
          <View style={styles.stridePill}>
            <FontAwesome5 name="running" size={14} color={palette.brand.volt} />
            <Text style={[typography.labelSm as any, styles.stridePillText]}>
              {state.connectionState === 'connected' ? 'PACING' : 'REST'}
            </Text>
          </View>
        </View>

        <View style={styles.goalTrack}>
          <View style={[styles.goalFill, { width: `${goalPercent}%` }]} />
        </View>

        <View style={styles.fitnessStatsGrid}>
          <View style={styles.fitnessChip}>
            <Text style={[typography.labelSm as any, styles.fitnessLabel]}>DISTANCE</Text>
            <Text style={[typography.metricMd as any, styles.fitnessValue]}>
              {distanceKm} <Text style={[typography.bodySm as any, styles.fitnessUnit]}>km</Text>
            </Text>
          </View>
          <View style={styles.fitnessChip}>
            <Text style={[typography.labelSm as any, styles.fitnessLabel]}>CALORIES</Text>
            <Text style={[typography.metricMd as any, styles.fitnessValue]}>
              {caloriesKcal} <Text style={[typography.bodySm as any, styles.fitnessUnit]}>kcal</Text>
            </Text>
          </View>
          <View style={styles.fitnessChip}>
            <Text style={[typography.labelSm as any, styles.fitnessLabel]}>ACTIVE TIME</Text>
            <Text style={[typography.metricMd as any, styles.fitnessValue]}>
              {activeMinutes} <Text style={[typography.bodySm as any, styles.fitnessUnit]}>min</Text>
            </Text>
          </View>
        </View>
      </GlassCard>

      <GlassCard title="Live Workout Tracking">
        <View style={styles.workoutHeaderRow}>
          <View style={styles.workoutStatusBlock}>
            <View
              style={[
                styles.workoutStatusDot,
                { backgroundColor: workoutActive ? palette.brand.volt : palette.outline },
              ]}
            />
            <Text style={[typography.headlineSm as any, styles.workoutTitle]}>
              {workoutActive ? 'Session Active' : 'Ready to Track'}
            </Text>
          </View>
          <Text style={[typography.metricMd as any, styles.workoutTimer]}>
            {formatWorkoutTimer(workoutSeconds)}
          </Text>
        </View>

        <View style={styles.workoutMetricsRow}>
          <View style={styles.workoutMetricChip}>
            <Text style={[typography.labelSm as any, styles.workoutLabel]}>PACE</Text>
            <Text style={[typography.metricMd as any, styles.workoutVal]}>
              {workoutActive && state.connectionState === 'connected' ? '5:24' : '—'}
            </Text>
            <Text style={[typography.labelSm as any, styles.workoutUnit]}>min/km</Text>
          </View>
          <View style={styles.workoutMetricChip}>
            <Text style={[typography.labelSm as any, styles.workoutLabel]}>SESSION HARVEST</Text>
            <Text style={[typography.metricMd as any, { color: palette.brand.volt, fontSize: 16 }]}>
              {workoutActive ? `+${((workoutSeconds * 0.0003) + 0.02).toFixed(2)}` : '0.00'}
            </Text>
            <Text style={[typography.labelSm as any, styles.workoutUnit]}>Wh</Text>
          </View>
          <View style={styles.workoutMetricChip}>
            <Text style={[typography.labelSm as any, styles.workoutLabel]}>CADENCE</Text>
            <Text style={[typography.metricMd as any, styles.workoutVal]}>
              {workoutActive && state.connectionState === 'connected' ? '162' : '0'}
            </Text>
            <Text style={[typography.labelSm as any, styles.workoutUnit]}>SPM</Text>
          </View>
        </View>

        <View style={styles.workoutActionRow}>
          <PressableButton
            title={workoutActive ? 'Finish Workout' : 'Start Outdoor Run'}
            variant={workoutActive ? 'destructive' : 'primary'}
            onPress={toggleWorkout}
          />
        </View>
      </GlassCard>

      <GlassCard title="This Week">
        <WeeklyStepsChart records={history} />
      </GlassCard>

      <GlassCard title="Energy Harvested">
        <SegmentedControl<Range>
          options={RANGE_OPTIONS}
          value={range}
          onChange={setRange}
        />
        <EnergyBarChart
          data={state.powerSeries[range]}
          labels={AXIS_LABELS[range]}
        />
      </GlassCard>
    </ScrollView>
  );
}

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: spacing.screenPaddingMobile,
      paddingBottom: spacing.contentBottomPadding,
      gap: spacing.md,
    },
    headerRows: {
      gap: spacing.sm,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    brandIconWrap: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.iconVoltTint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitleBlock: {
      flex: 1,
    },
    title: {
      color: colors.onBackground,
    },
    headerSubtitle: {
      color: colors.brand.cyan,
      letterSpacing: 1,
      fontSize: 9,
      marginTop: 2,
    },
    gaugeCard: {
      alignItems: 'center',
    },
    metricsRow: {
      flexDirection: 'row',
      gap: spacing.cardGap,
    },
    steps: {
      color: colors.brand.volt,
      fontVariant: ['tabular-nums'],
    },
    caption: {
      color: colors.outline,
    },
    stepHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    stridePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.iconVoltTint,
      borderColor: colors.brand.volt,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: radius.full,
    },
    stridePillText: {
      color: colors.brand.volt,
      fontSize: 10,
    },
    goalTrack: {
      height: 8,
      borderRadius: radius.full,
      backgroundColor: colors.track,
      overflow: 'hidden',
      marginTop: 2,
    },
    goalFill: {
      height: '100%',
      borderRadius: radius.full,
      backgroundColor: colors.brand.volt,
    },
    fitnessStatsGrid: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    fitnessChip: {
      flex: 1,
      backgroundColor: colors.track,
      borderRadius: radius.md,
      padding: spacing.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.glass.border,
    },
    fitnessLabel: {
      color: colors.outline,
      fontSize: 9,
      marginBottom: 3,
    },
    fitnessValue: {
      color: colors.onBackground,
      fontSize: 16,
    },
    fitnessUnit: {
      color: colors.outline,
      fontSize: 11,
    },
    workoutHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    workoutStatusBlock: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    workoutStatusDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    workoutTitle: {
      color: colors.onBackground,
    },
    workoutTimer: {
      color: colors.brand.cyan,
      fontVariant: ['tabular-nums'],
    },
    workoutMetricsRow: {
      flexDirection: 'row',
      gap: spacing.cardGap,
      marginTop: spacing.xs,
    },
    workoutMetricChip: {
      flex: 1,
      backgroundColor: colors.track,
      borderRadius: radius.md,
      padding: spacing.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.glass.border,
    },
    workoutLabel: {
      color: colors.outline,
      fontSize: 9,
      marginBottom: 3,
    },
    workoutVal: {
      color: colors.onBackground,
      fontSize: 16,
    },
    workoutUnit: {
      color: colors.outline,
      fontSize: 11,
    },
    workoutActionRow: {
      marginTop: spacing.xs,
    },
  });