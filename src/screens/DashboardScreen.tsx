import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { typography, spacing, radius, useTheme, ThemePalette } from '@/theme';
import GlassCard from '@/components/GlassCard';
import KineticGauge from '@/components/KineticGauge';
import MetricCard from '@/components/MetricCard';
import EnergyBarChart from '@/components/EnergyBarChart';
import ConnectionBanner from '@/components/ConnectionBanner';
import SegmentedControl from '@/components/SegmentedControl';
import SmartAlertBanner, { SmartAlert } from '@/components/SmartAlertBanner';
import WeeklyStepsChart from '@/components/WeeklyStepsChart';
import { useDevice } from '@/store/DeviceProvider';
import { useSettings } from '@/store/SettingsProvider';
import { useStepHistory } from '@/hooks/useStepHistory';
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
  const { toggles } = useSettings();
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [range, setRange] = useState<Range>('24H');
  const { records: history, ready: historyReady, noteDay } = useStepHistory();

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

  const goalPercent = Math.min(100, (state.stepCount / DAILY_STEP_GOAL) * 100);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRows}>
        <Text style={[typography.displayLgMobile as any, styles.title]}>
          Kinetic Volt
        </Text>
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

      <GlassCard title="Step Count">
        <Text style={[typography.metricXl as any, styles.steps]}>
          {state.stepCount.toLocaleString()}
        </Text>
        <Text style={[typography.bodySm as any, styles.caption]}>
          of {DAILY_STEP_GOAL.toLocaleString()} steps ·{' '}
          {Math.round(goalPercent)}%
        </Text>
        <View style={styles.goalTrack}>
          <View style={[styles.goalFill, { width: `${goalPercent}%` }]} />
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
      gap: spacing.md,
    },
    headerRows: {
      gap: spacing.sm,
    },
    title: {
      color: colors.onBackground,
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
  });