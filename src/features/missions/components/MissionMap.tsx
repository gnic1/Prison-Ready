/**
 * MissionMap — Live mission map card.
 *
 * Simulated mode: art-directed SVG bezier route with proper player tracking,
 * progress-driven checkpoint states, and polished tactical UI.
 * GPS mode: react-native-maps with preserved behaviour.
 *
 * Props interface is unchanged from the previous version.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path,
  Circle,
  G,
  Text as SvgText,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import MapView, {
  Polyline,
  Marker,
  PROVIDER_GOOGLE,
  LatLng,
} from 'react-native-maps';

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  routeDim:        '#0c2e22',
  routeComplete:   '#00C8A0',
  orange:          '#FF6A00',
  green:           '#00C850',
  bg1:             '#091410',
  bg2:             '#060c09',
  grid:            'rgba(0,200,160,0.05)',
  border:          '#182820',
  pillBg:          'rgba(6,12,9,0.94)',
  pillBorder:      '#1b3028',
  panel:           '#080d0a',
  panelBorder:     '#182820',
  card:            '#0e1a14',
  cardBorder:      '#192a22',
  textPrimary:     '#F2F2F0',
  textSec:         '#6a9080',
  textTeal:        '#00C8A0',
  textOrange:      '#FF6A00',
  cpDoneFill:      '#00C8A0',
  cpUpcomingBorder:'#1c4030',
} as const;

// ─── Route geometry (viewBox: 343 × 290) ─────────────────────────────────────
// Art-directed waypoints for the Day 1 simulated mission route.
// Route travels bottom-left to upper-right in a smooth diagonal curve.

const VB_W = 343;
const VB_H = 290;

// [Start, CP1, CP2, CP3, CP4]
const WAYPOINTS = [
  { x: 44,  y: 246 }, // Start
  { x: 116, y: 191 }, // Checkpoint 1
  { x: 194, y: 144 }, // Checkpoint 2
  { x: 266, y: 98  }, // Checkpoint 3
  { x: 312, y: 64  }, // Checkpoint 4 / finish
] as const;

// Smooth cubic bezier through waypoints
const ROUTE_PATH =
  'M 44 246 ' +
  'C 70 224, 92 203, 116 191 ' +
  'C 143 179, 168 158, 194 144 ' +
  'C 220 130, 246 113, 266 98 ' +
  'C 285 85, 300 74, 312 64';

// Approximate arc length (calibrated)
const ROUTE_LENGTH = 348;

// Progress thresholds at which each CP becomes "done" (index = CP index 0-3)
const CP_THRESHOLDS = [25, 50, 75, 100];

// Grid guides
const GRID_COLS = [0.18, 0.37, 0.56, 0.74, 0.92];
const GRID_ROWS = [0.22, 0.40, 0.58, 0.77];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function playerPosition(progress: number): { xPct: number; yPct: number } {
  const p = Math.max(0, Math.min(100, progress));
  const segCount = WAYPOINTS.length - 1;
  const rawIdx = (p / 100) * segCount;
  const segIdx = Math.min(Math.floor(rawIdx), segCount - 1);
  const t = rawIdx - segIdx;
  const a = WAYPOINTS[segIdx];
  const b = WAYPOINTS[segIdx + 1];
  return {
    xPct: (a.x + (b.x - a.x) * t) / VB_W,
    yPct: (a.y + (b.y - a.y) * t) / VB_H,
  };
}

type CPState = 'done' | 'active' | 'upcoming';

function cpState(cpIdx: number, progress: number): CPState {
  const threshold = CP_THRESHOLDS[cpIdx];
  if (progress >= threshold) return 'done';
  if (progress >= threshold - 25) return 'active';
  return 'upcoming';
}

// ─── Types ────────────────────────────────────────────────────────────────────

type POI = { coordinate: LatLng; label: string; icon?: string };

interface MissionMapProps {
  path?: LatLng[];
  pois?: POI[];
  userLocation?: LatLng | null;
  expanded?: boolean;
  onToggleExpand?: () => void;
  loading?: boolean;
  theme?: string;
  mode?: 'gps' | 'simulated';
  progressPercent?: number;
  statusLabel?: string;
  progressLabel?: string;
  objectiveDirection?: string;
  objectiveName?: string;
  objectiveDistance?: string;
  metricPrimaryValue?: string;
  metricPrimaryLabel?: string;
  elapsedLabel?: string;
  metricTertiaryValue?: string;
  metricTertiaryLabel?: string;
  focusProgress?: Animated.Value;
}

const { width: SW, height: SH } = Dimensions.get('window');
const DEFAULT_FOCUS = new Animated.Value(0);

// ─── Component ────────────────────────────────────────────────────────────────

export const MissionMap: React.FC<MissionMapProps> = ({
  path = [],
  pois = [],
  userLocation = null,
  expanded = false,
  onToggleExpand = () => {},
  loading = false,
  theme = 'day',
  mode = 'gps',
  progressPercent = 0,
  statusLabel = 'TRACKING',
  progressLabel = '100% ROUTE LEFT',
  objectiveDirection = 'Bear right · Oak Street',
  objectiveName = 'Outbound Checkpoint 3',
  objectiveDistance = '340m',
  metricPrimaryValue = '0%',
  metricPrimaryLabel = 'Route',
  elapsedLabel = '00:00',
  metricTertiaryValue = '20:00',
  metricTertiaryLabel = 'Goal',
  focusProgress = DEFAULT_FOCUS,
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 900,  useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const viewportHeight = focusProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [280, 320],
  });

  const pulseScale   = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.0] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] });

  const player       = playerPosition(progressPercent);
  const completedLen = Math.max(0, (progressPercent / 100) * ROUTE_LENGTH);

  const region = userLocation
    ? { latitude: userLocation.latitude, longitude: userLocation.longitude, latitudeDelta: 0.005, longitudeDelta: 0.005 }
    : { latitude: 37.78825, longitude: -122.4324, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  return (
    <Animated.View style={[styles.container, expanded && styles.fullScreen]}>

      {/* MAP VIEWPORT */}
      <Animated.View style={[styles.viewport, { height: viewportHeight }]}>

        <LinearGradient
          colors={[C.bg1, C.bg2]}
          start={{ x: 0.05, y: 0 }}
          end={{ x: 0.95, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Grid */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {GRID_COLS.map((pct, i) => (
            <View key={`gc${i}`} style={[styles.gridV, { left: `${pct * 100}%` }]} />
          ))}
          {GRID_ROWS.map((pct, i) => (
            <View key={`gr${i}`} style={[styles.gridH, { top: `${pct * 100}%` }]} />
          ))}
        </View>

        {/* Atmospheric glows */}
        <View style={styles.glowMid}    pointerEvents="none" />
        <View style={styles.glowOrigin} pointerEvents="none" />

        {mode === 'simulated' ? (
          <>
            {/* SVG route layer */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <Svg width="100%" height="100%" viewBox={`0 0 ${VB_W} ${VB_H}`}>
                <Defs>
                  <RadialGradient id="cpGlow" cx="50%" cy="50%" r="50%">
                    <Stop offset="0%"   stopColor={C.orange} stopOpacity="0.35" />
                    <Stop offset="100%" stopColor={C.orange} stopOpacity="0"    />
                  </RadialGradient>
                </Defs>

                {/* Base (dim) route */}
                <Path
                  d={ROUTE_PATH}
                  stroke={C.routeDim}
                  strokeWidth={3.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Completed overlay — teal glow + core */}
                {completedLen > 2 && (
                  <>
                    <Path
                      d={ROUTE_PATH}
                      stroke={C.routeComplete}
                      strokeWidth={10}
                      fill="none"
                      strokeLinecap="round"
                      opacity={0.12}
                      strokeDasharray={[completedLen, ROUTE_LENGTH + 20]}
                    />
                    <Path
                      d={ROUTE_PATH}
                      stroke={C.routeComplete}
                      strokeWidth={2.5}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeDasharray={[completedLen, ROUTE_LENGTH + 20]}
                    />
                  </>
                )}

                {/* Start node */}
                <Circle cx={WAYPOINTS[0].x} cy={WAYPOINTS[0].y} r={5}   fill={C.bg1}    stroke="#1c4030" strokeWidth={1.5} />
                <Circle cx={WAYPOINTS[0].x} cy={WAYPOINTS[0].y} r={2.5} fill="#1c4030" />

                {/* Checkpoints */}
                {WAYPOINTS.slice(1).map((wp, idx) => {
                  const state  = cpState(idx, progressPercent);
                  const done   = state === 'done';
                  const active = state === 'active';
                  return (
                    <G key={`cp${idx}`}>
                      {active && <Circle cx={wp.x} cy={wp.y} r={22} fill="url(#cpGlow)" />}
                      <Circle
                        cx={wp.x} cy={wp.y}
                        r={active ? 14 : 12}
                        fill={active ? 'rgba(255,106,0,0.10)' : done ? 'rgba(0,200,160,0.08)' : 'transparent'}
                        stroke={active ? C.orange : done ? C.routeComplete : C.cpUpcomingBorder}
                        strokeWidth={active ? 1.5 : 1}
                        opacity={done ? 0.5 : 1}
                      />
                      <Circle
                        cx={wp.x} cy={wp.y}
                        r={9}
                        fill={done ? C.cpDoneFill : active ? 'rgba(255,106,0,0.18)' : '#0a1e16'}
                        stroke={done ? 'none' : active ? C.orange : '#1a3828'}
                        strokeWidth={done ? 0 : 1.5}
                      />
                      {done ? (
                        <Circle cx={wp.x} cy={wp.y} r={3.5} fill="rgba(0,0,0,0.35)" />
                      ) : (
                        <SvgText
                          x={wp.x} y={wp.y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={active ? C.orange : '#2a5040'}
                          fontSize={9}
                          fontWeight="700"
                        >
                          {idx + 1}
                        </SvgText>
                      )}
                    </G>
                  );
                })}

                {/* Finish marker */}
                <Circle
                  cx={WAYPOINTS[4].x} cy={WAYPOINTS[4].y}
                  r={6}
                  fill={progressPercent >= 95 ? C.routeComplete : '#0a1e16'}
                  stroke={C.routeComplete}
                  strokeWidth={1.5}
                  opacity={0.7}
                />
              </Svg>
            </View>

            {/* Player pulse */}
            <Animated.View
              pointerEvents="none"
              style={[styles.playerPulse, {
                left: `${player.xPct * 100}%`,
                top:  `${player.yPct * 100}%`,
                opacity:   pulseOpacity,
                transform: [{ scale: pulseScale }],
              }]}
            />
            {/* Player dot */}
            <View
              pointerEvents="none"
              style={[styles.playerDot, {
                left: `${player.xPct * 100}%`,
                top:  `${player.yPct * 100}%`,
              }]}
            />

            {/* SIMULATED badge */}
            <View style={styles.simBadge} pointerEvents="none">
              <Text style={styles.simBadgeText}>SIMULATED</Text>
            </View>
          </>
        ) : (
          <>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={StyleSheet.absoluteFill}
              region={region}
              showsUserLocation={!!userLocation}
              followsUserLocation={!!userLocation}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              toolbarEnabled={false}
            >
              {path.length > 1 && (
                <Polyline coordinates={path} strokeColor={C.routeComplete} strokeWidth={4} />
              )}
              {pois.map((poi, idx) => (
                <Marker key={`poi-${idx}`} coordinate={poi.coordinate} title={poi.label} />
              ))}
            </MapView>
            <LinearGradient
              colors={['rgba(6,12,9,0.14)', 'rgba(8,13,10,0.28)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
          </>
        )}

        {/* HUD pills */}
        <View style={styles.hudRow} pointerEvents="none">
          <View style={styles.hudPill}>
            <View style={[styles.hudDot, { backgroundColor: C.green }]} />
            <Text style={styles.hudText}>{statusLabel}</Text>
          </View>
          <View style={styles.hudPill}>
            <View style={[styles.hudDot, { backgroundColor: C.orange }]} />
            <Text style={styles.hudText}>{progressLabel}</Text>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#F2F2F0" />
          </View>
        )}

        <TouchableOpacity
          style={styles.expandBtn}
          onPress={onToggleExpand}
          accessibilityLabel={expanded ? 'Collapse map' : 'Expand map'}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={styles.expandHandle} />
        </TouchableOpacity>
      </Animated.View>

      {/* BOTTOM PANEL */}
      <View style={styles.panel}>

        <View style={styles.guidanceRow}>
          <View style={styles.guidanceArrowWrap}>
            <Text style={styles.guidanceArrow}>↗</Text>
          </View>
          <View style={styles.guidanceText}>
            <Text style={styles.guidanceDir}  numberOfLines={1}>{objectiveDirection}</Text>
            <Text style={styles.guidanceName} numberOfLines={1}>{objectiveName}</Text>
          </View>
          <View style={styles.guidanceDistWrap}>
            <Text style={styles.guidanceDist}>{objectiveDistance}</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricVal}>{metricPrimaryValue}</Text>
            <Text style={styles.metricLbl}>{metricPrimaryLabel}</Text>
          </View>
          <View style={[styles.metricCard, styles.metricCardMid]}>
            <Text style={styles.metricVal}>{elapsedLabel}</Text>
            <Text style={styles.metricLbl}>Elapsed</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricVal, styles.metricValAccent]}>{metricTertiaryValue}</Text>
            <Text style={styles.metricLbl}>{metricTertiaryLabel}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: C.bg2,
    borderWidth: 1,
    borderColor: C.border,
  },
  fullScreen: {
    position: 'absolute',
    top: 0, left: 0,
    width: SW, height: SH,
    borderRadius: 0,
    zIndex: 100,
    marginTop: 0,
  },
  viewport: {
    height: 280,
    position: 'relative',
    overflow: 'hidden',
  },
  gridV: {
    position: 'absolute',
    top: 0, bottom: 0,
    width: 1,
    backgroundColor: C.grid,
  },
  gridH: {
    position: 'absolute',
    left: 0, right: 0,
    height: 1,
    backgroundColor: C.grid,
  },
  glowMid: {
    position: 'absolute',
    width: 220, height: 220,
    borderRadius: 110,
    left: '30%', top: '12%',
    backgroundColor: 'rgba(0,200,160,0.033)',
  },
  glowOrigin: {
    position: 'absolute',
    width: 100, height: 100,
    borderRadius: 50,
    left: '4%', top: '68%',
    backgroundColor: 'rgba(0,200,160,0.022)',
  },
  playerPulse: {
    position: 'absolute',
    width: 38, height: 38,
    borderRadius: 19,
    marginLeft: -19, marginTop: -19,
    backgroundColor: 'rgba(255,106,0,0.45)',
  },
  playerDot: {
    position: 'absolute',
    width: 14, height: 14,
    borderRadius: 7,
    marginLeft: -7, marginTop: -7,
    backgroundColor: C.orange,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: C.orange,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    elevation: 6,
  },
  simBadge: {
    position: 'absolute',
    left: 10, bottom: 11,
    backgroundColor: 'rgba(6,12,9,0.88)',
    borderWidth: 1,
    borderColor: '#182820',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  simBadgeText: {
    color: '#2d5a48',
    fontFamily: 'monospace',
    fontSize: 8,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  hudRow: {
    position: 'absolute',
    top: 10, left: 10, right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  hudPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.pillBg,
    borderWidth: 1,
    borderColor: C.pillBorder,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 9,
  },
  hudDot: {
    width: 5, height: 5,
    borderRadius: 3,
  },
  hudText: {
    color: C.textPrimary,
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6,12,9,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  expandBtn: {
    position: 'absolute',
    right: 10, bottom: 10,
    backgroundColor: 'rgba(20,36,28,0.92)',
    borderWidth: 1,
    borderColor: '#1e3a2c',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    zIndex: 20,
  },
  expandHandle: {
    width: 18, height: 3,
    backgroundColor: '#3a6050',
    borderRadius: 2,
  },
  panel: {
    backgroundColor: C.panel,
    borderTopWidth: 1,
    borderTopColor: C.panelBorder,
    paddingHorizontal: 12,
    paddingTop: 11,
    paddingBottom: 14,
    gap: 8,
  },
  guidanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: 'rgba(255,106,0,0.20)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 11,
    gap: 10,
  },
  guidanceArrowWrap: {
    width: 30, height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,106,0,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,106,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidanceArrow: {
    fontSize: 14,
    color: C.orange,
  },
  guidanceText: { flex: 1 },
  guidanceDir: {
    color: C.textOrange,
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    opacity: 0.85,
  },
  guidanceName: {
    color: C.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  guidanceDistWrap: {
    backgroundColor: 'rgba(0,200,160,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0,200,160,0.18)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  guidanceDist: {
    color: C.textTeal,
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  metricCard: {
    flex: 1,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  metricCardMid: {
    borderColor: '#1a2e24',
  },
  metricVal: {
    color: C.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  metricValAccent: {
    color: C.green,
  },
  metricLbl: {
    color: C.textSec,
    fontFamily: 'monospace',
    fontSize: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});
