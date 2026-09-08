import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { colors, ThemeProvider, useTheme } from '@/theme';
import MainNavigator from '@/navigation/MainNavigator';
import { DeviceProvider } from '@/store/DeviceProvider';
import { SettingsProvider } from '@/store/SettingsProvider';

function RootNavigator() {
  const { palette } = useTheme();
  const navTheme = useMemo(
    () => ({
      ...DefaultTheme,
      dark: palette.background === colors.background,
      colors: {
        ...DefaultTheme.colors,
        background: palette.background,
        card: palette.surfaceContainer,
        text: palette.onBackground,
        primary: palette.brand.volt,
        border: palette.glass.border,
      },
    }),
    [palette]
  );

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={palette.background === colors.background ? 'light' : 'dark'} />
      <MainNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={initialStyles.loading}>
        <ActivityIndicator color={colors.brand.volt} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={initialStyles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <SettingsProvider>
            <DeviceProvider>
              <RootNavigator />
            </DeviceProvider>
          </SettingsProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const initialStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});