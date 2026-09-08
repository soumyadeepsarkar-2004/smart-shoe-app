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
import { typography, spacing, radius, useTheme, ThemePalette } from '@/theme';
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
  const { toggles, setToggle, stepGoal, setStepGoal, weightKg, setWeightKg, ready } = useSettings();
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

      <GlassCard title="Fitness & Activity Goals">
        <Text style={[typography.bodyMd as any, styles.goalLabel]}>
          Daily Step Target
        </Text>
        <SegmentedControl<string>
          options={[
            { label: '6,000', value: '6000' },
            { label: '8,000', value: '8000' },
            { label: '10,000', value: '10000' },
            { label: '12,500', value: '12500' },
          ]}
          value={stepGoal.toString()}
          onChange={(val) => {
            hapticFeedback(toggles, 'light');
            setStepGoal(parseInt(val, 10));
          }}
        />
        <View style={styles.weightRow}>
          <View style={styles.weightInfo}>
            <Text style={[typography.bodyMd as any, styles.weightLabel]}>Body Weight Profile</Text>
            <Text style={[typography.bodySm as any, styles.weightDesc]}>Calibrates dynamic stride calorie burn</Text>
          </View>
          <View style={styles.weightBadge}>
            <Text style={[typography.metricMd as any, styles.weightVal]}>{weightKg} kg</Text>
          </View>
        </View>
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

      <GlassCard title="About Kinetic Volt">
        <View style={styles.aboutHeader}>
          <View style={styles.aboutBadge}>
            <FontAwesome5 name="bolt" size={18} color={palette.brand.volt} />
          </View>
          <View style={styles.aboutTitleBlock}>
            <Text style={[typography.headlineSm as any, styles.aboutTitle]}>
              KV-01 Apex
            </Text>
            <Text style={[typography.labelSm as any, styles.aboutSub]}>
              Piezo-Kinetic Smart Footwear
            </Text>
          </View>
        </View>

        <Text style={[typography.bodyMd as any, styles.about]}>
          Next-generation sports companion converting every stride into sustainable, stored electrical power. Engineered with dual piezo ceramic sole wafers and Bluetooth Low Energy telemetry.
        </Text>

        <View style={styles.specGrid}>
          <View style={styles.specChip}>
            <Text style={[typography.labelSm as any, styles.specLabel]}>Cell Capacity</Text>
            <Text style={[typography.metricMd as any, styles.specValue]}>1.1 Wh</Text>
          </View>
          <View style={styles.specChip}>
            <Text style={[typography.labelSm as any, styles.specLabel]}>Max Output</Text>
            <Text style={[typography.metricMd as any, styles.specValue]}>0.85 W</Text>
          </View>
          <View style={styles.specChip}>
            <Text style={[typography.labelSm as any, styles.specLabel]}>BLE Link</Text>
            <Text style={[typography.metricMd as any, styles.specValue]}>v5.3 LE</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.aboutFooter}>
          <Text style={[typography.labelSm as any, styles.version]}>
            Companion App v1.0.0 (Build 42)
          </Text>
          <Text style={[typography.bodySm as any, styles.copyright]}>
            © 2026 Kinetic Volt Systems. All rights reserved.
          </Text>
        </View>
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
      paddingBottom: spacing.contentBottomPadding,
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
    goalLabel: {
      color: colors.onSurfaceVariant,
      marginBottom: 2,
    },
    weightRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.track,
      borderRadius: radius.md,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.glass.border,
      marginTop: spacing.xs,
    },
    weightInfo: {
      flex: 1,
      gap: 2,
    },
    weightLabel: {
      color: colors.onBackground,
    },
    weightDesc: {
      color: colors.outline,
      fontSize: 11,
    },
    weightBadge: {
      backgroundColor: colors.iconVoltTint,
      borderColor: colors.brand.volt,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: radius.full,
    },
    weightVal: {
      color: colors.brand.volt,
      fontSize: 14,
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
    aboutHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xxs,
    },
    aboutBadge: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: colors.iconVoltTint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    aboutTitleBlock: {
      flex: 1,
    },
    aboutTitle: {
      color: colors.onBackground,
    },
    aboutSub: {
      color: colors.brand.cyan,
      letterSpacing: 0.8,
    },
    about: {
      color: colors.onSurfaceVariant,
      lineHeight: 22,
    },
    specGrid: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    specChip: {
      flex: 1,
      backgroundColor: colors.track,
      borderRadius: radius.md,
      padding: spacing.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.glass.border,
    },
    specLabel: {
      color: colors.outline,
      fontSize: 9,
      marginBottom: 2,
    },
    specValue: {
      color: colors.onBackground,
      fontSize: 15,
    },
    divider: {
      height: 1,
      backgroundColor: colors.glass.border,
      marginVertical: spacing.xxs,
    },
    aboutFooter: {
      gap: 4,
    },
    version: {
      color: colors.brand.volt,
    },
    copyright: {
      color: colors.outline,
      fontSize: 11,
    },
  });