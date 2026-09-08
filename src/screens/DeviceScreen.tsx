import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { typography, spacing, useTheme, ThemePalette } from '@/theme';
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

      <GlassCard title="Shoe Link">
        <Text style={[typography.headlineSm as any, styles.deviceName]}>
          {state.name}
        </Text>
        <PressableButton
          title={connected ? 'Disconnect' : 'Connect'}
          variant={connected ? 'destructive' : 'primary'}
          disabled={state.connectionState === 'connecting'}
          onPress={onConnectPress}
        />
        <PressableButton
          title="Scan for shoes"
          variant="glass"
          onPress={() => {
            hapticFeedback(toggles, 'light');
            setScannerVisible(true);
          }}
        />
        {state.connectionState === 'connecting' && (
          <Text style={[typography.bodySm as any, styles.connectingHint]}>
            Establishing link with the sole module…
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
  });