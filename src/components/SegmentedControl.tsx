import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { typography, radius, useTheme, ThemePalette } from '@/theme';

interface SegmentedOption<T extends string> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

const TRACK_PADDING = 4;

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [trackWidth, setTrackWidth] = useState(0);
  const slide = useRef(new Animated.Value(0)).current;

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  useEffect(() => {
    if (trackWidth <= 0) return;
    const segmentWidth = (trackWidth - TRACK_PADDING * 2) / options.length;
    Animated.spring(slide, {
      toValue: selectedIndex * segmentWidth,
      friction: 9,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [selectedIndex, trackWidth, options.length, slide]);

  const onLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  const segmentWidth =
    trackWidth > 0
      ? (trackWidth - TRACK_PADDING * 2) / options.length
      : 0;

  return (
    <View
      style={styles.track}
      onLayout={onLayout}
      accessibilityRole="tablist"
    >
      {trackWidth > 0 && (
        <Animated.View
          style={[
            styles.selector,
            {
              width: segmentWidth,
              transform: [{ translateX: slide }],
            },
          ]}
        />
      )}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={styles.segment}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
          >
            <Text
              style={[
                typography.labelMd as any,
                { color: selected ? palette.obsidian : palette.onSurfaceVariant },
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    track: {
      flexDirection: 'row',
      backgroundColor: colors.track,
      borderRadius: radius.full,
      padding: TRACK_PADDING,
      position: 'relative',
      overflow: 'hidden',
    },
    selector: {
      position: 'absolute',
      top: TRACK_PADDING,
      bottom: TRACK_PADDING,
      left: TRACK_PADDING,
      borderRadius: radius.full,
      backgroundColor: colors.brand.volt,
      ...(colors.kind === 'dark'
        ? {}
        : {
            shadowColor: colors.obsidian,
            shadowOpacity: 0.12,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 1 },
          }),
    },
    segment: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: radius.full,
      zIndex: 1,
    },
  });