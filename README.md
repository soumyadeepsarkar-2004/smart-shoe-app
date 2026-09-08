# Kinetic Volt — Smart Shoe Companion App

A React Native (Expo) companion experience for smart energy-harvesting footwear, built from the design system.

## 📱 UI / UX Preview

<p align="center">
  <img src="assets/images/D1.jpg" width="30%" alt="Dashboard Screen" />
  <img src="assets/images/D2.jpg" width="30%" alt="Device Control Screen" />
  <img src="assets/images/D3.jpg" width="30%" alt="Settings & Firmware Update" />
</p>

<p align="center">
  <img src="assets/images/ChatGPT%20Image%20Sep%207,%202026,%2011_17_43%20PM.png" width="92%" alt="Smart Footwear Design Showcase" />
</p>


## Stack

- **Expo** SDK 51 (React Native 0.74)
- **TypeScript**
- **React Navigation** (bottom tabs)
- **react-native-svg** for the Kinetic battery/power ring
- **@react-native-async-storage/async-storage** for persistence (settings, LED config, theme, device name, daily history, firmware version)
- **expo-haptics** for control feedback (gated by the Haptic toggle)
- **@expo-google-fonts** — Plus Jakarta Sans + Space Grotesk, per the design spec

## Getting started

Requires Node.js 18+.

```bash
npm install
npm run start        # Expo dev server
npm run android      # Android emulator/device
npm run ios          # iOS simulator
npm run web          # web preview
```

## Scripts

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint (expo config)
npx expo export --platform android   # production JS bundle
npx expo-doctor      # project health (1 known warning: newArchEnabled schema false-positive on SDK 51)
```

## Features

- **Dashboard** — Kinetic battery/power gauge with live piezo pulse state, voltage/current/output metric cards, daily step goal with progress bar, weekly step chart (persisted daily history), and energy-harvest histogram with 1H / 24H / Week ranges.
- **Device** — simulated BLE shoe link (scan modal, pair, connect/disconnect), LED customization (color swatches, brightness slider, static/pulse/wave/energy patterns) with persistence.
- **Settings** — Dark/Light appearance (system default, persisted), haptic/notification/data/ambient toggles, firmware update flow with live install progress (v2.4.1 → v2.5.0).
- **Theme system** — full dark + light palettes from DESIGN.md via a `ThemeProvider`/`useTheme`; every component is theme-aware.
- **Smart alerts** — connection-loss and circuit-error banners with reconnect action, gated by notifications toggle.

The `useDeviceState` hook simulates live energy harvest telemetry (voltage, current, output power, step count, battery) so the UI is fully interactive without a physical shoe. BLE discovery is simulated in `src/utils/bleDiscovery.ts` — swap it for `react-native-ble-plx` when targeting a dev build.

## Project structure

```
App.tsx                     # root: fonts, safe area, providers, navigation theme
src/
  theme/                    # palettes, ThemeProvider, typography, spacing/radius/shadows
  components/               # KineticGauge, GlassCard, buttons, charts, scanner modal, etc.
  screens/                  # Dashboard, Device, Settings
  navigation/               # bottom tab navigator
  store/                    # DeviceProvider, SettingsProvider (app-wide shared state)
  hooks/                    # useDeviceState, usePersistentSettings, useStepHistory
  utils/                    # deviceModel types, haptics, bleDiscovery
```