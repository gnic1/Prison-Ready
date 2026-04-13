export interface Route {
  id: string;
  routeType: string;
  distanceMeters: number;
  estimatedDurationSec: number;
  polyline: string;
  corridorWidthMeters: number;
  yellowBufferMeters: number;
  redBufferMeters: number;
  hazardZoneIds: string[];
}
