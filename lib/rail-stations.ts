// Coordinates for Indian railway stations referenced in lib/mock-data.ts's
// TRAINS dataset. Decorative, for plotting the hero rail map, not for
// navigation.

export const STATION_COORDS: Record<string, [number, number]> = {
  NDLS: [28.6431, 77.2197], // New Delhi
  BCT: [18.9696, 72.8194],  // Mumbai Central
  BPL: [23.2680, 77.4096],  // Bhopal Jn
  BSB: [25.3176, 82.9739],  // Varanasi Jn
  AGC: [27.1592, 78.0092],  // Agra Cantt
  PUNE: [18.5286, 73.8744], // Pune Jn
  CSTM: [18.9398, 72.8355], // Mumbai CST
  LTT: [19.0728, 72.8826],  // Lokmanya Tilak Terminus
  TVC: [8.4875, 76.9525],   // Thiruvananthapuram Central
};

export function getStationCoords(code: string): [number, number] | null {
  return STATION_COORDS[code] ?? null;
}
