import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { FontAwesome5 } from '@expo/vector-icons';
import { typography, radius, spacing, useTheme, ThemePalette } from '@/theme';
import {
  DiscoveredDevice,
  ScanHandle,
  scanForDevices,
} from '@/utils/bleDiscovery';
import PressableButton from '@/components/PressableButton';

interface DeviceScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onPair: (device: DiscoveredDevice) => void;
}

export default function DeviceScannerModal({
  visible,
  onClose,
  onPair,
}: DeviceScannerModalProps) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [scanning, setScanning] = useState(true);
  const [devices, setDevices] = useState<DiscoveredDevice[]>([]);
  const scanRef = useRef<ScanHandle | null>(null);

  useEffect(() => {
    if (!visible) return;
    setScanning(true);
    setDevices([]);
    scanRef.current = scanForDevices((result) => {
      setScanning(false);
      setDevices(result);
    });
    return () => {
      scanRef.current?.stop();
    };
  }, [visible]);

  const restart = () => {
    setScanning(true);
    setDevices([]);
    scanRef.current?.stop();
    scanRef.current = scanForDevices((result) => {
      setScanning(false);
      setDevices(result);
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.sheet}>
          <BlurView
            intensity={36}
            tint={palette.kind === 'dark' ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.header}>
            <Text style={[typography.headlineMd as any, styles.headerTitle]}>
              Scan for shoes
            </Text>
            <TouchableOpacity onPress={onClose} accessibilityRole="button">
              <FontAwesome5 name="times" size={18} color={palette.outline} />
            </TouchableOpacity>
          </View>

          {scanning ? (
            <View style={styles.statusBox}>
              <ActivityIndicator color={palette.brand.volt} size="large" />
              <Text style={[typography.bodyMd as any, styles.statusText]}>
                Listening for BLE broadcasts…
              </Text>
            </View>
          ) : devices.length === 0 ? (
            <View style={styles.statusBox}>
              <Text style={[typography.bodyMd as any, styles.statusText]}>
                No shoes found.
              </Text>
              <PressableButton
                title="Scan again"
                variant="glass"
                onPress={restart}
              />
            </View>
          ) : (
            <View style={styles.list}>
              {devices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  style={styles.deviceRow}
                  onPress={() => onPair(device)}
                  accessibilityRole="button"
                >
                  <View style={styles.deviceIcon}>
                    <FontAwesome5
                      name="shoe-prints"
                      size={16}
                      color={palette.brand.cyan}
                    />
                  </View>
                  <View style={styles.deviceBody}>
                    <Text style={[typography.bodyLg as any, styles.deviceName]}>
                      {device.name}
                    </Text>
                    <Text style={[typography.bodySm as any, styles.deviceMeta]}>
                      KV · S/N {device.id.toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.rssiBox}>
                    <Text style={[typography.labelSm as any, styles.rssi]}>
                      {device.rssi} dBm
                    </Text>
                    <Text style={[typography.bodySm as any, styles.tapHint]}>
                      tap to pair
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdropTouch: {
      flex: 1,
    },
    sheet: {
      backgroundColor:
        colors.kind === 'dark'
          ? 'rgba(28,32,38,0.6)'
          : 'rgba(255,255,255,0.75)',
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      padding: spacing.lg,
      paddingBottom: spacing.xl,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: colors.glass.border,
      overflow: 'hidden',
      ...(colors.kind === 'light'
        ? {
            shadowColor: colors.obsidian,
            shadowOpacity: 0.18,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: -6 },
          }
        : {}),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      color: colors.onBackground,
    },
    statusBox: {
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.xl,
    },
    statusText: {
      color: colors.onSurfaceVariant,
    },
    list: {
      gap: spacing.sm,
    },
    deviceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.md,
      backgroundColor: colors.glass.surface,
      borderWidth: 1,
      borderColor: colors.glass.border,
    },
    deviceIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.md,
      backgroundColor: colors.iconVoltTint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    deviceBody: {
      flex: 1,
      gap: 2,
    },
    deviceName: {
      color: colors.onBackground,
    },
    deviceMeta: {
      color: colors.outline,
    },
    rssiBox: {
      alignItems: 'flex-end',
    },
    rssi: {
      color: colors.brand.cyan,
    },
    tapHint: {
      color: colors.outline,
    },
  });