import { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { typography, radius, spacing, useTheme, ThemePalette } from '@/theme';
import { BLEConnectionState } from '@/utils/deviceModel';

type BannerTone = 'connected' | 'connecting' | 'disconnected';

interface ConnectionBannerProps {
  state: BLEConnectionState;
  deviceName: string;
}

export default function ConnectionBanner({
  state,
  deviceName,
}: ConnectionBannerProps) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const tone: BannerTone = state;
  const color =
    tone === 'connected'
      ? palette.brand.success
      : tone === 'connecting'
      ? palette.brand.cyan
      : palette.brand.danger;
  const label =
    tone === 'connected'
      ? 'Connected'
      : tone === 'connecting'
      ? 'Connecting…'
      : 'Disconnected';

  return (
    <View style={styles.banner}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[typography.labelMd as any, { color }]}>{label}</Text>
      <Text style={[typography.bodySm as any, styles.name]}>{deviceName}</Text>
    </View>
  );
}

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.full,
      backgroundColor: colors.glass.surface,
      borderWidth: 1,
      borderColor: colors.glass.border,
      alignSelf: 'flex-start',
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: radius.full,
    },
    name: {
      color: colors.onSurfaceVariant,
    },
  });