export type BLEConnectionState = 'connecting' | 'connected' | 'disconnected';

export type PowerRange = '1H' | '24H' | 'W';

export type PowerSeries = Record<PowerRange, number[]>;

export interface BatteryState {
  percent: number;
  energyWh: number;
  capacityWh: number;
  charging: boolean;
}

export interface Telemetry {
  voltageV: number;
  currentMA: number;
  outputPowerW: number;
  status: 'harvesting' | 'idle' | 'error';
}

export type LedColorKey =
  | 'volt'
  | 'cyan'
  | 'purple'
  | 'solar'
  | 'white';

export type LedPattern = 'static' | 'pulse' | 'wave' | 'energy';

export interface LedConfig {
  colorKey: LedColorKey;
  brightness: number;
  pattern: 'static' | 'pulse' | 'wave' | 'energy';
}

export interface DeviceState {
  connectionState: BLEConnectionState;
  name: string;
  battery: BatteryState;
  telemetry: Telemetry;
  led: LedConfig;
  stepCount: number;
  powerSeries: PowerSeries;
}
