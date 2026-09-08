import { useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  StyleSheet,
  View,
  LayoutChangeEvent,
} from 'react-native';
import { radius, useTheme, ThemePalette, isAndroid } from '@/theme';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  onRelease?: () => void;
  trackHeight?: number;
}

export default function Slider({
  value,
  onChange,
  onRelease,
  trackHeight = 8,
}: SliderProps) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [width, setWidth] = useState(0);
  const touchRef = useRef<View>(null);
  const leftRef = useRef(0);
  const widthRef = useRef(0);
  const onChangeRef = useRef(onChange);
  const onReleaseRef = useRef(onRelease);
  onChangeRef.current = onChange;
  onReleaseRef.current = onRelease;

  const updateFromX = (screenX: number) => {
    const w = widthRef.current;
    if (w === 0) return;
    const x = Math.max(0, Math.min(w, screenX - leftRef.current));
    onChangeRef.current(x / w);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (_, gesture) => {
        touchRef.current?.measureInWindow((x) => {
          leftRef.current = x;
          updateFromX(gesture.x0);
        });
      },
      onPanResponderMove: (_, gesture) => {
        updateFromX(gesture.moveX);
      },
      onPanResponderRelease: () => {
        onReleaseRef.current?.();
      },
      onPanResponderTerminate: () => {
        onReleaseRef.current?.();
      },
    })
  ).current;

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    setWidth(w);
    widthRef.current = w;
    touchRef.current?.measureInWindow((x) => {
      leftRef.current = x;
    });
  };

  const fillWidth = width > 0 ? value * width : 0;

  return (
    <View style={styles.container}>
      <View
        ref={touchRef}
        {...panResponder.panHandlers}
        style={styles.touchArea}
        onLayout={onLayout}
      >
        <View style={[styles.track, { height: trackHeight }]}>
          <View
            style={[
              styles.fill,
              { width: fillWidth, height: trackHeight },
            ]}
          />
          <View
            style={[styles.thumb, { left: fillWidth - 12 }]}
          />
        </View>
      </View>
    </View>
  );
}

const THUMB = 24;

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    container: {
      paddingVertical: 8,
    },
    touchArea: {
      justifyContent: 'center',
      height: 40,
    },
    track: {
      backgroundColor: colors.track,
      borderRadius: radius.full,
      overflow: 'visible',
    },
    fill: {
      backgroundColor: colors.brand.volt,
      borderRadius: radius.full,
    },
    thumb: {
      position: 'absolute',
      top: -((THUMB - 8) / 2),
      width: THUMB,
      height: THUMB,
      borderRadius: radius.full,
      backgroundColor: colors.brand.volt,
      ...(isAndroid
        ? { elevation: 6 }
        : {
            shadowColor: colors.brand.volt,
            shadowOpacity: 0.6,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 0 },
          }),
    },
  });