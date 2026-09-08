import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { typography, spacing, radius, useTheme, ThemePalette } from '@/theme';
import GlassCard from '@/components/GlassCard';
import LedSwatches from '@/components/LedSwatches';
import PressableButton from '@/components/PressableButton';
import SegmentedControl from '@/components/SegmentedControl';
import ConnectionBanner from '@/components/ConnectionBanner';
import Slider from '@/components/Slider';
import DeviceScannerModal from '@/components/DeviceScannerModal';
import { useDevice } from '@/store/DeviceProvider';
import { useSettings } from '@/store/SettingsProvider';
import { hapticFeedback } from '@/utils/haptics';
import { DiscoveredDevice } from '@/utils/bleDiscovery';
import { LedPattern } from '@/utils/deviceModel';

const PATTERNS: { label: string; value: LedPattern }[] = [
  { label: 'Static', value: 'static' },
  { label: 'Pulse', value: 'pulse' },
  { label: 'Wave', value: 'wave' },
  { label: 'Energy', value: 'energy' },
];

export default function DeviceScreen() {
  const { state, updateLed, connect, disconnect, pair } = useDevice();
  const { toggles } = useSettings();
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [calibrating, setCalibrating] = useState(false);
  const [lacingTension, setLacingTension] = useState(75);
  const [lacingMode, setLacingMode] = useState<'relaxed' | 'commute' | 'athletic' | 'sprint'>('athletic');
  const [hapticMode, setHapticMode] = useState<'cadence' | 'heel_alert' | 'milestone' | 'off'>('cadence');
  const connected = state.connectionState === 'connected';

  const setLed = (patch: Partial<typeof state.led>) => {
    hapticFeedback(toggles, 'light');
    updateLed(patch);
  };

  const onConnectPress = () => {
    hapticFeedback(toggles, connected ? 'medium' : 'success');
    if (connected) disconnect();
    else connect();
  };

  const onPair = (device: DiscoveredDevice) => {
    hapticFeedback(toggles, 'success');
    setScannerVisible(false);
    pair(device.name);
  };

  const onCalibratePress = () => {
    if (calibrating || !connected) return;
    hapticFeedback(toggles, 'medium');
    setCalibrating(true);
    setTimeout(() => {
      setCalibrating(false);
      hapticFeedback(toggles, 'success');
    }, 1800);
  };

  const applyLacingPreset = (mode: 'relaxed' | 'commute' | 'athletic' | 'sprint') => {
    hapticFeedback(toggles, 'medium');
    setLacingMode(mode);
    const target = mode === 'relaxed' ? 30 : mode === 'commute' ? 55 : mode === 'athletic' ? 75 : 95;
    setLacingTension(target);
  };

  const adjustTensionDelta = (delta: number) => {
    hapticFeedback(toggles, 'light');
    setLacingTension((prev) => Math.min(100, Math.max(15, prev + delta)));
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRows}>
        <Text style={[typography.displayLgMobile as any, styles.title]}>
          Device
        </Text>
        <ConnectionBanner
          state={state.connectionState}
          deviceName={state.name}
        />
      </View>

      <GlassCard title="Hardware Link" elevated>
        <View style={styles.deviceCardHeader}>
          <View style={styles.deviceIconBadge}>
            <FontAwesome5 name="shoe-prints" size={20} color={palette.brand.volt} />
          </View>
          <View style={styles.deviceMeta}>
            <Text style={[typography.headlineSm as any, styles.deviceName]}>
              {state.name}
            </Text>
            <Text style={[typography.labelSm as any, styles.deviceSerial]}>
              MAC: 7E:A4:91:02:KV · BLE 5.3
            </Text>
          </View>
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: connected
                  ? 'rgba(48, 209, 88, 0.16)'
                  : 'rgba(255, 59, 48, 0.16)',
                borderColor: connected ? palette.brand.success : palette.brand.danger,
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: connected
                    ? palette.brand.success
                    : palette.brand.danger,
                },
              ]}
            />
            <Text
              style={[
                typography.labelSm as any,
                {
                  color: connected ? palette.brand.success : palette.brand.danger,
                  fontSize: 9,
                },
              ]}
            >
              {connected ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </View>
        </View>

        <View style={styles.hardwareStats}>
          <View style={styles.statBox}>
            <Text style={[typography.labelSm as any, styles.statLabel]}>CHARGE</Text>
            <View style={styles.statValueRow}>
              <Text style={[typography.metricMd as any, styles.statVal]}>
                {Math.round(state.battery.percent)}
              </Text>
              <Text style={[typography.labelSm as any, styles.statUnit]}>%</Text>
            </View>
          </View>
          <View style={styles.statBox}>
            <Text style={[typography.labelSm as any, styles.statLabel]}>SIGNAL</Text>
            <View style={styles.statValueRow}>
              <Text style={[typography.metricMd as any, styles.statVal]}>
                {connected ? '-62' : '—'}
              </Text>
              {connected && (
                <Text style={[typography.labelSm as any, styles.statUnit]}>dBm</Text>
              )}
            </View>
          </View>
          <View style={styles.statBox}>
            <Text style={[typography.labelSm as any, styles.statLabel]}>PIEZO</Text>
            <View style={styles.statValueRow}>
              <Text
                style={[
                  typography.metricMd as any,
                  styles.statVal,
                  { color: connected ? palette.brand.volt : palette.outline },
                ]}
              >
                {connected ? 'ACTIVE' : 'IDLE'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.deviceActions}>
          <PressableButton
            title={connected ? 'Disconnect Shoe' : 'Connect Shoe'}
            variant={connected ? 'destructive' : 'primary'}
            disabled={state.connectionState === 'connecting'}
            onPress={onConnectPress}
          />
          <PressableButton
            title="Scan for nearby footwear"
            variant="glass"
            onPress={() => {
              hapticFeedback(toggles, 'light');
              setScannerVisible(true);
            }}
          />
        </View>

        {state.connectionState === 'connecting' && (
          <Text style={[typography.bodySm as any, styles.connectingHint]}>
            Establishing encrypted BLE link with piezo sole…
          </Text>
        )}
      </GlassCard>

      {/* Dual Sole Sync & Independent Telemetry */}
      <GlassCard title="Dual Sole Sync & Balance">
        <View style={styles.dualSyncHeader}>
          <Text style={[typography.bodySm as any, styles.dualSyncSub]}>
            {connected ? '2.4 GHz Inter-Sole Link Active · Latency < 4ms' : 'Sole link standby'}
          </Text>
          <View style={styles.syncStatusBadge}>
            <Text style={[typography.labelSm as any, styles.syncStatusText]}>
              {connected ? 'SYNCHRONIZED' : 'OFFLINE'}
            </Text>
          </View>
        </View>

        <View style={styles.dualShoeRow}>
          {/* Left Shoe Card */}
          <View style={styles.shoeCard}>
            <View style={styles.shoeCardTop}>
              <View style={styles.shoeBadge}>
                <Text style={[typography.labelSm as any, styles.shoeBadgeText]}>LEFT (L)</Text>
              </View>
              <FontAwesome5 name="shoe-prints" size={14} color={palette.brand.cyan} />
            </View>
            <View style={styles.shoeMetrics}>
              <View style={styles.shoeMetricItem}>
                <Text style={[typography.labelSm as any, styles.shoeMetricLabel]}>BATTERY</Text>
                <Text style={[typography.metricMd as any, styles.shoeMetricVal]}>
                  {connected ? Math.round(state.battery.percent) : '—'}{connected ? '%' : ''}
                </Text>
              </View>
              <View style={styles.shoeMetricItem}>
                <Text style={[typography.labelSm as any, styles.shoeMetricLabel]}>HARVEST</Text>
                <Text style={[typography.metricMd as any, { color: palette.brand.cyan, fontSize: 13 }]}>
                  {connected ? (state.telemetry.outputPowerW * 0.49).toFixed(2) : '0.00'} W
                </Text>
              </View>
              <View style={styles.shoeMetricItem}>
                <Text style={[typography.labelSm as any, styles.shoeMetricLabel]}>TEMP</Text>
                <Text style={[typography.bodySm as any, styles.shoeMetricSub]}>
                  {connected ? '28.2°C' : '—'}
                </Text>
              </View>
            </View>
          </View>

          {/* Right Shoe Card */}
          <View style={styles.shoeCard}>
            <View style={styles.shoeCardTop}>
              <View style={[styles.shoeBadge, { backgroundColor: palette.iconVoltTint, borderColor: palette.brand.volt }]}>
                <Text style={[typography.labelSm as any, { color: palette.brand.volt, fontSize: 8 }]}>RIGHT (R)</Text>
              </View>
              <FontAwesome5 name="shoe-prints" size={14} color={palette.brand.volt} />
            </View>
            <View style={styles.shoeMetrics}>
              <View style={styles.shoeMetricItem}>
                <Text style={[typography.labelSm as any, styles.shoeMetricLabel]}>BATTERY</Text>
                <Text style={[typography.metricMd as any, styles.shoeMetricVal]}>
                  {connected ? Math.max(0, Math.round(state.battery.percent - 1)) : '—'}{connected ? '%' : ''}
                </Text>
              </View>
              <View style={styles.shoeMetricItem}>
                <Text style={[typography.labelSm as any, styles.shoeMetricLabel]}>HARVEST</Text>
                <Text style={[typography.metricMd as any, { color: palette.brand.volt, fontSize: 13 }]}>
                  {connected ? (state.telemetry.outputPowerW * 0.51).toFixed(2) : '0.00'} W
                </Text>
              </View>
              <View style={styles.shoeMetricItem}>
                <Text style={[typography.labelSm as any, styles.shoeMetricLabel]}>TEMP</Text>
                <Text style={[typography.bodySm as any, styles.shoeMetricSub]}>
                  {connected ? '28.5°C' : '—'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stride Balance Meter */}
        <View style={styles.balanceBlock}>
          <View style={styles.balanceLabelRow}>
            <Text style={[typography.labelSm as any, styles.balanceLabel]}>STRIDE HARVEST BALANCE</Text>
            <Text style={[typography.labelSm as any, styles.balanceVal]}>
              {connected ? '49% L · 51% R (Optimal)' : 'Standby'}
            </Text>
          </View>
          <View style={styles.balanceTrack}>
            <View style={[styles.balanceFillLeft, { width: connected ? '49%' : '50%', backgroundColor: palette.brand.cyan }]} />
            <View style={[styles.balanceFillRight, { width: connected ? '51%' : '50%', backgroundColor: palette.brand.volt }]} />
          </View>
        </View>
      </GlassCard>

      <GlassCard title="LED Customization">
        <LedSwatches
          selected={state.led.colorKey}
          onSelect={(colorKey) => setLed({ colorKey })}
        />
        <View style={styles.sliderBlock}>
          <Slider
            value={state.led.brightness}
            onChange={(brightness) => updateLed({ brightness })}
            onRelease={() => hapticFeedback(toggles, 'light')}
          />
        </View>
        <Text style={[typography.labelSm as any, styles.sliderLabel]}>
          Brightness · {Math.round(state.led.brightness * 100)}%
        </Text>
        <SegmentedControl<LedPattern>
          options={PATTERNS}
          value={state.led.pattern}
          onChange={(pattern) => setLed({ pattern })}
        />
      </GlassCard>

      {/* Motorized Fit & Auto-Lacing */}
      <GlassCard title="Motorized Fit & Auto-Lacing">
        <View style={styles.lacingHeader}>
          <View style={styles.lacingStatusCol}>
            <Text style={[typography.headlineSm as any, styles.lacingTitle]}>
              {lacingMode.toUpperCase()} TENSION
            </Text>
            <Text style={[typography.bodySm as any, styles.lacingSub]}>
              {lacingMode === 'relaxed'
                ? 'Casual slip-on · Minimal arch compression'
                : lacingMode === 'commute'
                ? 'Everyday walking · Balanced arch support'
                : lacingMode === 'athletic'
                ? 'Snug running lock · Minimized heel slippage'
                : 'Sprint lockdown · Maximum race rigidity'}
            </Text>
          </View>
          <Text style={[typography.metricMd as any, styles.lacingPercent]}>
            {lacingTension}%
          </Text>
        </View>

        <View style={styles.lacingTrack}>
          <View
            style={[
              styles.lacingFill,
              { width: `${lacingTension}%`, backgroundColor: palette.brand.volt },
            ]}
          />
        </View>

        <SegmentedControl<string>
          options={[
            { label: 'Relaxed', value: 'relaxed' },
            { label: 'Commute', value: 'commute' },
            { label: 'Athletic', value: 'athletic' },
            { label: 'Sprint', value: 'sprint' },
          ]}
          value={lacingMode}
          onChange={(val) => applyLacingPreset(val as any)}
        />

        <View style={styles.lacingAdjustRow}>
          <PressableButton
            title="Loosen (-5%)"
            variant="glass"
            style={{ flex: 1 }}
            disabled={!connected || lacingTension <= 15}
            onPress={() => adjustTensionDelta(-5)}
          />
          <PressableButton
            title="Tighten (+5%)"
            variant="primary"
            style={{ flex: 1 }}
            disabled={!connected || lacingTension >= 100}
            onPress={() => adjustTensionDelta(5)}
          />
        </View>
      </GlassCard>

      {/* Sole Haptic Guidance */}
      <GlassCard title="Sole Haptic Guidance">
        <Text style={[typography.bodyMd as any, styles.hapticDesc]}>
          Embedded piezoelectric tactile actuators deliver direct sensory cues to your feet during runs.
        </Text>
        <SegmentedControl<string>
          options={[
            { label: 'Cadence', value: 'cadence' },
            { label: 'Heel Alert', value: 'heel_alert' },
            { label: 'Milestone', value: 'milestone' },
            { label: 'Off', value: 'off' },
          ]}
          value={hapticMode}
          onChange={(val) => {
            hapticFeedback(toggles, 'light');
            setHapticMode(val as any);
          }}
        />
        <View style={styles.hapticInsightBox}>
          <FontAwesome5
            name={hapticMode === 'off' ? 'volume-mute' : 'vibrate'}
            size={13}
            color={palette.brand.cyan}
          />
          <Text style={[typography.bodySm as any, styles.hapticInsightText]}>
            {hapticMode === 'cadence'
              ? 'Rhythmic pulse assists in sustaining an optimal 165-175 SPM cadence.'
              : hapticMode === 'heel_alert'
              ? 'Short warning vibration alerts you whenever heavy heel strike impact is detected.'
              : hapticMode === 'milestone'
              ? 'Celebratory vibration burst marks every 1 km of distance or 0.1 Wh generated.'
              : 'Sole tactile actuators are silenced.'}
          </Text>
        </View>
      </GlassCard>

      <GlassCard title="Sole Sensors & Diagnostics">
        <View style={styles.diagHeader}>
          <Text style={[typography.bodyMd as any, styles.diagDesc]}>
            Real-time piezoelectric transducer and pressure array diagnostics.
          </Text>
        </View>

        <View style={styles.sensorGrid}>
          <View style={styles.sensorNode}>
            <View style={[styles.sensorIndicator, { backgroundColor: connected ? palette.brand.volt : palette.outline }]} />
            <Text style={[typography.labelSm as any, styles.sensorNodeLabel]}>HEEL PIEZO</Text>
            <View style={styles.statValueRow}>
              <Text style={[typography.metricMd as any, styles.sensorNodeVal]}>
                {connected ? state.telemetry.voltageV.toFixed(1) : '0.0'}
              </Text>
              <Text style={[typography.labelSm as any, styles.statUnit]}>V</Text>
            </View>
          </View>
          <View style={styles.sensorNode}>
            <View style={[styles.sensorIndicator, { backgroundColor: connected ? palette.brand.cyan : palette.outline }]} />
            <Text style={[typography.labelSm as any, styles.sensorNodeLabel]}>FOREFOOT HARVEST</Text>
            <View style={styles.statValueRow}>
              <Text style={[typography.metricMd as any, styles.sensorNodeVal]}>
                {connected ? (state.telemetry.outputPowerW * 0.6).toFixed(2) : '0.00'}
              </Text>
              <Text style={[typography.labelSm as any, styles.statUnit]}>W</Text>
            </View>
          </View>
          <View style={styles.sensorNode}>
            <View style={[styles.sensorIndicator, { backgroundColor: connected ? palette.brand.success : palette.outline }]} />
            <Text style={[typography.labelSm as any, styles.sensorNodeLabel]}>CORE TEMP</Text>
            <View style={styles.statValueRow}>
              <Text style={[typography.metricMd as any, styles.sensorNodeVal]}>
                {connected ? '28.4' : '—'}
              </Text>
              {connected && (
                <Text style={[typography.labelSm as any, styles.statUnit]}>°C</Text>
              )}
            </View>
          </View>
        </View>

        <PressableButton
          title={calibrating ? 'Calibrating Sole Piezo Sensors…' : 'Calibrate Sole Sensors'}
          variant="glass"
          disabled={!connected || calibrating}
          loading={calibrating}
          onPress={onCalibratePress}
        />
      </GlassCard>

      <DeviceScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onPair={onPair}
      />
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
    title: {
      color: colors.onBackground,
    },
    deviceName: {
      color: colors.onBackground,
    },
    deviceSerial: {
      color: colors.outline,
      fontSize: 10,
    },
    deviceCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    deviceIconBadge: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: colors.iconVoltTint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deviceMeta: {
      flex: 1,
      gap: 2,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: radius.full,
      borderWidth: 1,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 999,
    },
    hardwareStats: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    statBox: {
      flex: 1,
      backgroundColor: colors.track,
      borderRadius: radius.md,
      padding: spacing.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.glass.border,
    },
    statLabel: {
      color: colors.outline,
      fontSize: 9,
      marginBottom: 4,
      letterSpacing: 0.5,
    },
    statValueRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'center',
      gap: 2,
    },
    statVal: {
      color: colors.onBackground,
      fontSize: 16,
      textAlign: 'center',
    },
    statUnit: {
      color: colors.outline,
      fontSize: 10,
    },
    deviceActions: {
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    connectingHint: {
      color: colors.brand.cyan,
      textAlign: 'center',
    },
    sliderBlock: {
      marginTop: spacing.xs,
    },
    sliderLabel: {
      color: colors.onSurfaceVariant,
      textAlign: 'center',
    },
    diagHeader: {
      marginBottom: spacing.xxs,
    },
    diagDesc: {
      color: colors.onSurfaceVariant,
      lineHeight: 20,
    },
    sensorGrid: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginVertical: spacing.xs,
    },
    sensorNode: {
      flex: 1,
      backgroundColor: colors.track,
      borderRadius: radius.md,
      padding: spacing.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.glass.border,
      gap: 4,
    },
    sensorIndicator: {
      width: 6,
      height: 6,
      borderRadius: 999,
      marginBottom: 2,
    },
    sensorNodeLabel: {
      color: colors.outline,
      fontSize: 8,
      textAlign: 'center',
    },
    sensorNodeVal: {
      color: colors.onBackground,
      fontSize: 14,
    },
    dualSyncHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dualSyncSub: {
      color: colors.outline,
      flex: 1,
      fontSize: 11,
    },
    syncStatusBadge: {
      backgroundColor: 'rgba(48, 209, 88, 0.14)',
      borderColor: colors.brand.success,
      borderWidth: 1,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radius.full,
    },
    syncStatusText: {
      color: colors.brand.success,
      fontSize: 8,
    },
    dualShoeRow: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    shoeCard: {
      flex: 1,
      backgroundColor: colors.track,
      borderRadius: radius.md,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.glass.border,
      gap: 6,
    },
    shoeCardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    shoeBadge: {
      backgroundColor: 'rgba(0, 240, 255, 0.12)',
      borderColor: colors.brand.cyan,
      borderWidth: 1,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: radius.sm,
    },
    shoeBadgeText: {
      color: colors.brand.cyan,
      fontSize: 8,
    },
    shoeMetrics: {
      gap: 3,
    },
    shoeMetricItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
    },
    shoeMetricLabel: {
      color: colors.outline,
      fontSize: 8,
    },
    shoeMetricVal: {
      color: colors.onBackground,
      fontSize: 13,
    },
    shoeMetricSub: {
      color: colors.onSurfaceVariant,
      fontSize: 11,
    },
    balanceBlock: {
      gap: 4,
      marginTop: spacing.xs,
    },
    balanceLabelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    balanceLabel: {
      color: colors.outline,
      fontSize: 9,
    },
    balanceVal: {
      color: colors.brand.volt,
      fontSize: 10,
    },
    balanceTrack: {
      flexDirection: 'row',
      height: 6,
      borderRadius: radius.full,
      backgroundColor: colors.track,
      overflow: 'hidden',
    },
    balanceFillLeft: {
      height: '100%',
    },
    balanceFillRight: {
      height: '100%',
    },
    lacingHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    lacingStatusCol: {
      flex: 1,
      gap: 2,
    },
    lacingTitle: {
      color: colors.onBackground,
    },
    lacingSub: {
      color: colors.outline,
      lineHeight: 18,
    },
    lacingPercent: {
      color: colors.brand.volt,
    },
    lacingTrack: {
      height: 8,
      borderRadius: radius.full,
      backgroundColor: colors.track,
      overflow: 'hidden',
      marginVertical: spacing.xs,
    },
    lacingFill: {
      height: '100%',
      borderRadius: radius.full,
    },
    lacingAdjustRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    hapticDesc: {
      color: colors.onSurfaceVariant,
      lineHeight: 20,
    },
    hapticInsightBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: 'rgba(0, 240, 255, 0.08)',
      borderColor: 'rgba(0, 240, 255, 0.25)',
      borderWidth: 1,
      borderRadius: radius.md,
      padding: spacing.sm,
      marginTop: spacing.xs,
    },
    hapticInsightText: {
      flex: 1,
      color: colors.onSurfaceVariant,
      lineHeight: 18,
    },
  });