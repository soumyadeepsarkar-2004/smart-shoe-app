export interface DiscoveredDevice {
  id: string;
  name: string;
  rssi: number;
}

const CANDIDATES: DiscoveredDevice[] = [
  { id: 'kv-01-runner', name: 'KV-01 Runner', rssi: -44 },
  { id: 'kv-01-pixel', name: 'KV-01 Pixel', rssi: -61 },
  { id: 'kv-trail-x', name: 'KV Trail X', rssi: -38 },
];

const jitter = (rssi: number) => Math.round(rssi + (Math.random() * 10 - 5));

export interface ScanHandle {
  stop: () => void;
}
// TODO: swap with react-native-ble-plx when a real device build is available.
export function scanForDevices(
  onResult: (devices: DiscoveredDevice[]) => void
): ScanHandle {
  const emit = () =>
    onResult(
      CANDIDATES.map((device) => ({
        ...device,
        rssi: jitter(device.rssi),
      }))
    );

  const first = setTimeout(emit, 800);
  const refresh = setInterval(emit, 1800);

  return {
    stop: () => {
      clearTimeout(first);
      clearInterval(refresh);
    },
  };
}