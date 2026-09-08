import { useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { radius, useTheme, ThemePalette } from '@/theme';
import { LedColorKey } from '@/utils/deviceModel';

interface LedSwatchesProps {
  selected: LedColorKey;
  onSelect: (key: LedColorKey) => void;
}

export default function LedSwatches({ selected, onSelect }: LedSwatchesProps) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const ledColors: Record<LedColorKey, string> = useMemo(
    () => ({
      volt: palette.brand.volt,
      cyan: palette.brand.cyan,
      purple: palette.brand.purple,
      solar: palette.brand.solar,
      white: palette.brand.white,
    }),
    [palette]
  );

  return (
    <View style={styles.row}>
      {(Object.keys(ledColors) as LedColorKey[]).map((key) => {
        const active = key === selected;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onSelect(key)}
            style={[
              styles.halo,
              active && { borderColor: ledColors[key] },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`LED color ${key}`}
            accessibilityState={{ selected: active }}
          >
            <View
              style={[
                styles.swatch,
                { backgroundColor: ledColors[key] },
                key === 'white' && styles.whiteSwatch,
              ]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const createStyles = (colors: ThemePalette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    halo: {
      width: 44,
      height: 44,
      borderRadius: radius.full,
      borderWidth: 3,
      borderColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    swatch: {
      width: 30,
      height: 30,
      borderRadius: radius.full,
    },
    whiteSwatch: {
      borderWidth: 1,
      borderColor: colors.swatchBorder,
    },
  });