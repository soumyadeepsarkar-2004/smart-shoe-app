import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';
import { typography, useTheme } from '@/theme';
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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.brand.volt,
        tabBarInactiveTintColor: palette.outline,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'transparent',
          borderTopColor: palette.glass.border,
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={28}
            tint={mode === 'dark' ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarLabelStyle: typography.labelSm as any,
        tabBarIcon: ({ focused, color }) => (
          <FontAwesome5
            name={ICONS[route.name]}
            size={18}
            color={color}
            solid={focused}
          />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Device" component={DeviceScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}