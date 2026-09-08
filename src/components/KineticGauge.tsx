import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, Text } from 'react-native';
import { typography, radius, useTheme, ThemePalette } from '@/theme';
import { Telemetry } from '@/utils/deviceModel';

interface KineticGaugeProps {
  percent: number;
  energyWh: string;
  capacityWh: string;
  status?: Telemetry['status'];
  size?: number;
  strokeWidth?: number;
}

export default function KineticGauge({
  percent,
  energyWh,
  capacityWh,
  status = 'harvesting',
  size = 220,
  strokeWidth = 14,
}: KineticGaugeProps) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const statusCfg = useMemo(
    () => ({
      harvesting: { label: 'Harvesting', color: palette.brand.volt },
      idle: { label: 'Idle', color: palette.outline },
      error: { label: 'Circuit Error', color: palette.brand.danger },
    }),
    [palette]
  );

  const radiusValue = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusValue;
  const clamped = Math.min(100, Math.max(0, percent));
  const filled = (clamped / 100) * circumference;
  const dashArray = `${filled} ${circumference}`;
  const cfg = statusCfg[status];

  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (status === 'harvesting') {
      const loop = Animated.loop(
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      );
      loop.start();
      return () => loop.stop();
    }
    pulse.setValue(0);
  }, [status, pulse]);

  return (
    <View style={{ width: size, height: size, ...styles.wrap }} accessible>
      {status === 'harvesting' && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.shock,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              borderColor: palette.brand.volt,
              opacity: pulse.interpolate({
                inputRange: [0, 0.3, 1],
                outputRange: [0.55, 0.4, 0],
              }),
              transform: [
                {
                  scale: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.16],
                  }),
                },
              ],
            },
          ]}
        />
      )}
      <Svg width={size} height={size} style={styles.gauge}>
        <Defs>
          <LinearGradient id="kineticRing" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={palette.brand.volt} />
            <Stop offset="1" stopColor={palette.brand.cyan} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          stroke={palette.ring}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          stroke="url(#kineticRing)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={dashArray}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.inner} pointerEvents="none">
        <Text style={typography.labelSm as any} accessibilityElementsHidden>
          Battery
        </Text>
        <Text style={[typography.metricXl as any, styles.percent]}>
          {Math.round(clamped)}%
        </Text>
        <Text style={[typography.metricMd as any, styles.energy]}>
          {energyWh} <Text style={styles.energyUnit}>/ {capacityWh} Wh</Text>
        </Text>
        <View style={styles.pulse}>
          <Animated.View
            style={[
              styles.pulseDot,
              {
                backgroundColor: cfg.color,
                opacity:
                  status === 'harvesting'
                    ? pulse.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 0.35, 1],
                      })
                    : 1,
              },
            ]}
          />
          <Text style={[typography.labelSm as any, { color: cfg.color }]}>
            {cfg.label}
          </Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    wrap: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    shock: {
      position: 'absolute',
      borderWidth: 3,
    },
    gauge: {
      position: 'absolute',
    },
    inner: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    percent: {
      color: colors.onBackground,
      fontVariant: ['tabular-nums'],
    },
    energy: {
      color: colors.onSurfaceVariant,
      fontVariant: ['tabular-nums'],
    },
    energyUnit: {
      color: colors.outline,
    },
    pulse: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 6,
    },
    pulseDot: {
      width: 8,
      height: 8,
      borderRadius: radius.full,
    },
  });