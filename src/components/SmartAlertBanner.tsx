import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { typography, radius, spacing, useTheme, ThemePalette } from '@/theme';

export interface SmartAlert {
  kind: 'danger' | 'info' | 'success';
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function SmartAlertBanner({
  alert,
}: {
  alert: SmartAlert | null;
}) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  if (!alert) return null;
  const surface =
    alert.kind === 'danger'
      ? palette.errorContainer
      : alert.kind === 'success'
      ? 'rgba(48,209,88,0.14)'
      : 'rgba(0,240,255,0.12)';
  const accent =
    alert.kind === 'danger'
      ? palette.error
      : alert.kind === 'success'
      ? palette.brand.success
      : palette.brand.cyan;
  const icon =
    alert.kind === 'danger'
      ? 'exclamation-circle'
      : alert.kind === 'success'
      ? 'check-circle'
      : 'info-circle';

  return (
    <View style={[styles.banner, { backgroundColor: surface }]}>
      <FontAwesome5 name={icon} size={18} color={accent} />
      <View style={styles.body}>
        <Text style={[typography.labelMd as any, { color: accent }]}>
          {alert.title}
        </Text>
        <Text style={[typography.bodySm as any, styles.message]}>
          {alert.message}
        </Text>
      </View>
      {alert.actionLabel && alert.onAction && (
        <TouchableOpacity
          onPress={alert.onAction}
          style={[styles.action, { borderColor: accent }]}
          accessibilityRole="button"
        >
          <Text style={[typography.labelSm as any, { color: accent }]}>
            {alert.actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      padding: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.glass.border,
    },
    body: {
      flex: 1,
      gap: 2,
    },
    message: {
      color: colors.onSurfaceVariant,
    },
    action: {
      borderWidth: 1,
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
    },
  });