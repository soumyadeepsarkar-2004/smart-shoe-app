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
  });