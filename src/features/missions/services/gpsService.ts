import * as Location from 'expo-location';

export type GpsSessionState = {
  active: boolean;
  positions: { latitude: number; longitude: number; timestamp: number }[];
  totalDistance: number;
};

let watchId: Location.LocationSubscription | null = null;
let gpsSessionState: GpsSessionState = {
  active: false,
  positions: [],
  totalDistance: 0,
};

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  // Haversine formula
  const R = 6371000;
  const toRad = (deg: number) => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export const GpsService = {
  async startTracking(onUpdate?: (state: GpsSessionState) => void) {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') throw new Error('Location permission not granted');
    gpsSessionState = { active: true, positions: [], totalDistance: 0 };
    let lastPos: { latitude: number; longitude: number } | null = null;
    watchId = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, timeInterval: 2000, distanceInterval: 5 },
      (loc) => {
        const { latitude, longitude } = loc.coords;
        gpsSessionState.positions.push({ latitude, longitude, timestamp: Date.now() });
        if (lastPos) {
          gpsSessionState.totalDistance += getDistance(lastPos.latitude, lastPos.longitude, latitude, longitude);
        }
        lastPos = { latitude, longitude };
        if (onUpdate) onUpdate(gpsSessionState);
      }
    );
  },
  stopTracking() {
    if (watchId) {
      watchId.remove();
      watchId = null;
    }
    gpsSessionState.active = false;
  },
  getState(): GpsSessionState {
    return gpsSessionState;
  },
  reset() {
    gpsSessionState = { active: false, positions: [], totalDistance: 0 };
  },
};
