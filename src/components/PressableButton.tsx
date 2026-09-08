import { useMemo, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { typography, radius, shadow, useTheme, ThemePalette } from '@/theme';

type Variant = 'primary' | 'glass' | 'destructive';

interface PressableButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export default function PressableButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}: PressableButtonProps) {
  const { palette, mode } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const scale = useRef(new Animated.Value(1)).current;

  const containerStyle = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'glass' && styles.glass,
    variant === 'destructive' && styles.destructive,
    disabled && styles.disabled,
    style,
  ];

  const textColor =
    variant === 'primary'
      ? palette.obsidian
      : variant === 'destructive'
      ? palette.brand.danger
      : palette.onBackground;

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.98,
      speed: 40,
      bounciness: 0,
      useNativeDriver: true,
    }).start();

  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={containerStyle}
        onPress={onPress}
        onPressIn={disabled || loading ? undefined : pressIn}
        onPressOut={disabled || loading ? undefined : pressOut}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || loading }}
      >
        {variant === 'glass' && (
          <BlurView
            intensity={16}
            tint={mode === 'dark' ? 'dark' : 'light'}
            style={[StyleSheet.absoluteFill, styles.glassBlur]}
          />
        )}
        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator color={textColor} />
          ) : (
            <>
              {icon}
              <Text
                style={[
                  typography.labelMd as any,
                  { color: textColor },
                  textStyle,
                ]}
              >
                {title}
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    base: {
      borderRadius: radius.full,
      minHeight: 52,
      overflow: 'hidden',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
      paddingHorizontal: 24,
      minHeight: 52,
      width: '100%',
    },
    primary: {
      backgroundColor: colors.brand.volt,
      ...shadow.energized,
      overflow: 'visible', // allow shadow
    },
    glass: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.glass.border,
    },
    glassBlur: {
      borderRadius: radius.full,
    },
    destructive: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.brand.danger,
    },
    disabled: {
      opacity: 0.4,
    },
  });