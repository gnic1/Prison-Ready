// PatrolMap — the underlay for the HUD. Shows the player's actual GPS path
// using react-native-maps on native platforms, and a stylized SVG abstraction
// on web (where react-native-maps degrades) OR whenever the native map fails
// to initialize (e.g. a standalone build with no Google Maps API key). The
// SVG fallback guarantees the patrol never crashes on the map.

import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import type { PatrolWaypoint } from '../types/patrolSession';
import type { GhostWalkerPing } from '../services/remoteSyncService';

// Lazy require react-native-maps so that web (where it doesn't ship) doesn't
// crash at import time.
let MapView: any = null;
let Polyline: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const m = require('react-native-maps');
    MapView = m.default;
    Polyline = m.Polyline;
    Marker = m.Marker;
    PROVIDER_GOOGLE = m.PROVIDER_GOOGLE;
  } catch {
    // Maps unavailable; fall through to SVG stub.
  }
}


// Native Google Maps requires an API key baked into the standalone build
// (android.config.googleMaps.apiKey in app.json). Without it, mounting a
// PROVIDER_GOOGLE MapView crashes at the native layer on Android. Until a key
// is wired up, keep this false — the patrol uses the SVG underlay below, which
// is the intended fallback. Flip to true AFTER adding the key, then rebuild.
const ENABLE_NATIVE_MAP = false;

interface PatrolMapProps {
  waypoints: PatrolWaypoint[];
  accent: string;
  glow: string;
  ghosts?: GhostWalkerPing[];
}

// If the native map view throws while mounting or rendering (the classic
// "no Google Maps API key in a standalone build" failure, or any other native
// map error), catch it and render the SVG abstraction instead of letting the
// whole patrol screen crash.
interface BoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}
interface BoundaryState {
  failed: boolean;
}
class MapErrorBoundary extends React.Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // Swallow — the fallback is the recovery. Keep a console note for dev.
    // eslint-disable-next-line no-console
    console.warn('PatrolMap: native map failed, using SVG fallback.', error);
  }

  render() {
    if (this.state.failed) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export const PatrolMap: React.FC<PatrolMapProps> = ({ waypoints, accent, glow, ghosts }) => {
  const last = waypoints[waypoints.length - 1];

  const stub = <PatrolMapStub accent={accent} glow={glow} hasFix={Boolean(last)} />;

  if (ENABLE_NATIVE_MAP && MapView && last) {
    return (
      <MapErrorBoundary fallback={stub}>
        <View style={styles.fill}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFill}
            showsUserLocation
            followsUserLocation
            showsCompass={false}
            showsMyLocationButton={false}
            customMapStyle={DARK_MAP_STYLE}
            initialRegion={{
              latitude: last.lat,
              longitude: last.lon,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
          >
            {waypoints.length > 1 ? (
              <Polyline
                coordinates={waypoints.map((w) => ({
                  latitude: w.lat,
                  longitude: w.lon,
                }))}
                strokeColor={accent}
                strokeWidth={4}
              />
            ) : null}
            <Marker
              coordinate={{ latitude: last.lat, longitude: last.lon }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={[styles.marker, { borderColor: accent, shadowColor: accent }]}>
                <View style={[styles.markerDot, { backgroundColor: accent }]} />
              </View>
            </Marker>
            {(ghosts ?? []).map((g) => (
              <Marker
                key={g.id}
                coordinate={{ latitude: g.lat, longitude: g.lon }}
                anchor={{ x: 0.5, y: 0.5 }}
                tracksViewChanges={false}
                opacity={0.6}
              >
                <View style={[styles.ghost, { borderColor: accent }]} />
              </Marker>
            ))}
          </MapView>
        </View>
      </MapErrorBoundary>
    );
  }

  // Fallback abstraction — used on web and before any GPS fix.
  return stub;
};

interface StubProps {
  accent: string;
  glow: string;
  hasFix: boolean;
}

const PatrolMapStub: React.FC<StubProps> = ({ accent, glow, hasFix }) => (
  <View style={styles.stubWrap}>
    <Svg width="100%" height="100%" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <RadialGradient id="pulse" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={accent} stopOpacity={0.6} />
          <Stop offset="60%" stopColor={glow} stopOpacity={0.15} />
          <Stop offset="100%" stopColor="#000" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      {/* Grid */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Path
          key={`h${i}`}
          d={`M 0 ${i * 50} L 300 ${i * 50}`}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <Path
          key={`v${i}`}
          d={`M ${i * 60} 0 L ${i * 60} 400`}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={1}
        />
      ))}
      <Circle cx={150} cy={200} r={120} fill="url(#pulse)" />
      {hasFix ? (
        <Circle cx={150} cy={200} r={6} fill={accent} stroke="#fff" strokeWidth={1.5} />
      ) : null}
    </Svg>
  </View>
);

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0a0a0e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0a0a0e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5a5a66' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1c1c24' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0a0a0e' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#06080d' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFillObject },
  stubWrap: { ...StyleSheet.absoluteFillObject, backgroundColor: '#06080d' },
  marker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  markerDot: { width: 10, height: 10, borderRadius: 5 },
  ghost: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    opacity: 0.7,
  },
});
