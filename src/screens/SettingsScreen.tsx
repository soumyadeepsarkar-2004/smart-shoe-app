import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { typography, spacing, useTheme, ThemePalette } from '@/theme';
import GlassCard from '@/components/GlassCard';
import PressableButton from '@/components/PressableButton';
import SegmentedControl from '@/components/SegmentedControl';
import { useSettings } from '@/store/SettingsProvider';
import { hapticFeedback } from '@/utils/haptics';
import { FontAwesome5 } from '@expo/vector-icons';

const FIRMWARE_LATEST = '2.5.0';
const FIRMWARE_KEY = 'kv.firmware.version.v1';

const ROWS: {
  key: 'haptic' | 'notifications' | 'data' | 'ambient';
  icon: React.ComponentProps<typeof FontAwesome5>['name'];
  label: string;
  description: string;
}[] = [
  {
    key: 'haptic',
    icon: 'vibrations',
    label: 'Haptic feedback',
    description: 'Tap response on controls',
  },
  {
    key: 'notifications',
    icon: 'bell',
    label: 'Notifications',
    description: 'Low battery & sync alerts',
  },
  {
    key: 'data',
    icon: 'database',
    label: 'Data collection',
    description: 'Share telemetry for insights',
  },
  {
    key: 'ambient',
    icon: 'adjust',
    label: 'Ambient LED',
    description: 'Sole illumination while idle',
  },
];

export default function SettingsScreen() {
  const { toggles, setToggle, ready } = useSettings();
  const { palette, mode, setMode } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

  const [firmware, setFirmware] = useState('2.4.1');
  const [checking, setChecking] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(FIRMWARE_KEY);
        if (stored) setFirmware(stored);
      } catch {
        // ignore
      }
    })();
  }, []);

  const onToggleRow = (key: keyof typeof toggles) => {
    const next = !toggles[key];
    hapticFeedback(
      { ...toggles, [key]: next },
      key === 'notifications' ? 'light' : 'medium'
    );
    setToggle(key, next);
  };

  const onCheckForUpdates = () => {
    if (checking || installing) return;
    hapticFeedback(toggles, 'medium');
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      if (firmware === FIRMWARE_LATEST) {
        Alert.alert('Up to date', `KV-01 is running v${firmware}.`);
      } else {
        Alert.alert(
          'Update available',
          `Firmware v${FIRMWARE_LATEST} is available (installed: v${firmware}).`
        );
      }
    }, 1400);
  };

  const onInstallUpdate = () => {
    if (installing || firmware === FIRMWARE_LATEST) return;
    hapticFeedback(toggles, 'medium');
    setInstalling(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(100, prev + Math.floor(Math.random() * 14) + 6);
        if (next >= 100) {
          clearInterval(interval);
          setInstalling(false);
          setFirmware(FIRMWARE_LATEST);
          AsyncStorage.setItem(FIRMWARE_KEY, FIRMWARE_LATEST).catch(() => {});
          hapticFeedback(toggles, 'success');
          Alert.alert('Update complete', `KV-01 is now on v${FIRMWARE_LATEST}.`);
        }
        return next;
      });
    }, 240);
  };

  const updateAvailable = firmware !== FIRMWARE_LATEST;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[typography.displayLgMobile as any, styles.title]}>
        Settings
      </Text>

      <GlassCard title="Appearance">
        <SegmentedControl<'dark' | 'light'>
          options={[
            { label: 'Dark', value: 'dark' },
            { label: 'Light', value: 'light' },
          ]}
          value={mode}
          onChange={(next) => {
            hapticFeedback(toggles, 'light');
            setMode(next);
          }}
        />
        <Text style={[typography.bodySm as any, styles.appearanceHint]}>
          Follows the kinetic cockpit aesthetic in dark, or clinical alabaster
          in light.
        </Text>
      </GlassCard>

      <GlassCard title="Preferences">
        {ROWS.map((row) => (
          <Row
            key={row.key}
            icon={row.icon}
            label={row.label}
            description={row.description}
            value={toggles[row.key]}
            disabled={!ready}
            onValueChange={() => onToggleRow(row.key)}
          />
        ))}
      </GlassCard>

      <GlassCard title="Firmware">
        <View style={styles.fwRow}>
          <Text style={[typography.bodyMd as any, styles.fwVersion]}>
            KV-01 Firmware v{firmware}
          </Text>
          {updateAvailable ? (
            <FontAwesome5 name="arrow-circle-up" size={18} color={palette.brand.cyan} />
          ) : (
            <FontAwesome5 name="check-circle" size={18} color={palette.brand.success} />
          )}
        </View>

        {installing && (
          <View style={styles.fwProgressTrack}>
            <View style={[styles.fwProgressFill, { width: `${progress}%` }]} />
          </View>
        )}

        <PressableButton
          title={installing ? `Installing… ${progress}%` : 'Check for updates'}
          variant="glass"
          loading={checking}
          disabled={installing}
          onPress={onCheckForUpdates}
        />
        {updateAvailable && (
          <PressableButton
            title="Download & Install"
            variant="primary"
            disabled={checking || installing}
            onPress={onInstallUpdate}
          />
        )}
      </GlassCard>

      <GlassCard title="About">
        <Text style={[typography.bodyMd as any, styles.about]}>
          Kinetic Volt — companion app for smart energy-harvesting footwear.
        </Text>
        <Text style={[typography.bodySm as any, styles.version]}>
          Version 1.0.0
        </Text>
      </GlassCard>
    </ScrollView>
  );
}

interface RowProps {
  icon: React.ComponentProps<typeof FontAwesome5>['name'];
  label: string;
  description: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: () => void;
}

function Row({
  icon,
  label,
  description,
  value,
  disabled = false,
  onValueChange,
}: RowProps) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  return (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <View style={styles.iconWrap}>
        <FontAwesome5 name={icon} size={16} color={palette.brand.volt} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[typography.bodyLg as any, styles.rowLabel]}>{label}</Text>
        <Text style={[typography.bodySm as any, styles.rowDesc]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{
          true: palette.brand.volt,
          false: palette.track,
        }}
        thumbColor={palette.obsidian}
      />
    </View>
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
    title: {
      color: colors.onBackground,
      marginBottom: spacing.xs,
    },
    appearanceHint: {
      color: colors.outline,
      textAlign: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.xs,
    },
    rowDisabled: {
      opacity: 0.5,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.iconVoltTint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowBody: {
      flex: 1,
      gap: 2,
    },
    rowLabel: {
      color: colors.onBackground,
    },
    rowDesc: {
      color: colors.outline,
    },
    fwRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    fwVersion: {
      color: colors.onBackground,
    },
    fwProgressTrack: {
      height: 8,
      borderRadius: 9999,
      backgroundColor: colors.track,
      overflow: 'hidden',
    },
    fwProgressFill: {
      height: '100%',
      borderRadius: 9999,
      backgroundColor: colors.brand.volt,
    },
    about: {
      color: colors.onSurfaceVariant,
    },
    version: {
      color: colors.outline,
    },
  });