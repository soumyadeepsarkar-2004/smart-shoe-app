import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, radius, spacing, shadow, useTheme } from '@/theme';
import DashboardScreen from '@/screens/DashboardScreen';
import DeviceScreen from '@/screens/DeviceScreen';
import SettingsScreen from '@/screens/SettingsScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Device: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, string> = {
  Dashboard: 'home',
  Device: 'shoe-prints',
  Settings: 'cog',
};

export default function MainNavigator() {
  const { palette, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 12);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.brand.volt,
        tabBarInactiveTintColor: palette.outline,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'web' ? 16 : bottomInset,
          left: 20,
          right: 20,
          height: 64,
          borderRadius: radius.full,
          backgroundColor:
            mode === 'dark' ? 'rgba(16, 20, 26, 0.82)' : 'rgba(255, 255, 255, 0.88)',
          ...shadow.card,
          borderColor: palette.glass.border,
          borderWidth: 1,
          overflow: 'hidden',
          paddingBottom: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={36}
            tint={mode === 'dark' ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarItemStyle: {
          paddingVertical: 8,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarLabelStyle: {
          ...(typography.labelSm as any),
          fontSize: 10,
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color }) => (
          <View style={[styles.iconBox, focused && styles.iconBoxActive]}>
            <FontAwesome5
              name={ICONS[route.name]}
              size={17}
              color={focused ? palette.brand.volt : color}
              solid={focused}
            />
          </View>
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Device" component={DeviceScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconBox: {
    width: 32,
    height: 28,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: {
    backgroundColor: 'rgba(204, 255, 0, 0.12)',
  },
});