import React from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';

type LatLng = { latitude: number; longitude: number };
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

const ROUTE_PATH =
  'M 44 246 ' +
  'C 70 224, 92 203, 116 191 ' +
  'C 143 179, 168 158, 194 144 ' +
  'C 220 130, 246 113, 266 98 ' +
  'C 285 85, 300 74, 312 64';

const WAYPOINTS = [
  { x: 44, y: 246 },
  { x: 116, y: 191 },
  { x: 194, y: 144 },
  { x: 266, y: 98 },
  { x: 312, y: 64 },
] as const;

function playerPosition(progress: number) {
  const p = Math.max(0, Math.min(100, progress));
  const segmentCount = WAYPOINTS.length - 1;
  const rawIndex = (p / 100) * segmentCount;
  const segmentIndex = Math.min(Math.floor(rawIndex), segmentCount - 1);
  const t = rawIndex - segmentIndex;
  const start = WAYPOINTS[segmentIndex];
  const end = WAYPOINTS[segmentIndex + 1];
  return {
    x: start.x + (end.x - start.x) * t,
    y: start.y + (end.y - start.y) * t,
  };
}

export const MissionMap: React.FC<MissionMapProps> = ({
  expanded = false,
  onToggleExpand = () => {},
  mode = 'simulated',
  progressPercent = 0,
  statusLabel = 'PREVIEW',
  progressLabel = 'WEB REVIEW',
  objectiveDirection = 'Browser preview route',
  objectiveName = 'Map fallback',
  objectiveDistance = 'Preview only',
  metricPrimaryValue = '0%',
  metricPrimaryLabel = 'Route',
  elapsedLabel = '00:00',
  metricTertiaryValue = '20:00',
  metricTertiaryLabel = 'Goal',
}) => {
  const player = playerPosition(progressPercent);

  return (
    <View style={[styles.container, expanded && styles.fullScreen]}>
      <View style={styles.viewport}>
        <LinearGradient colors={['#091410', '#060c09']} style={StyleSheet.absoluteFill} />
        <Svg width="100%" height="100%" viewBox="0 0 343 290">
          <Path
            d={ROUTE_PATH}
            stroke="#103628"
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={ROUTE_PATH}
            stroke="#00C8A0"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={[Math.max(3, progressPercent * 3.48), 999]}
          />
          {WAYPOINTS.map((point, index) => (
            <Circle
              key={`point-${index}`}
              cx={point.x}
              cy={point.y}
              r={index === 0 ? 5 : 8}
              fill={index === 0 ? '#1b3028' : progressPercent >= index * 25 ? '#00C8A0' : '#0a1e16'}
              stroke={index === 0 ? '#1b3028' : '#274739'}
              strokeWidth={1.5}
            />
          ))}
          <Circle cx={player.x} cy={player.y} r={7} fill="#FF6A00" stroke="#fff4e8" strokeWidth={2} />
        </Svg>

        <View style={styles.hudRow}>
          <View style={styles.hudPill}>
            <View style={[styles.hudDot, { backgroundColor: mode === 'gps' ? '#00C850' : '#FF6A00' }]} />
            <Text style={styles.hudText}>{statusLabel}</Text>
          </View>
          <View style={styles.hudPill}>
            <View style={[styles.hudDot, { backgroundColor: '#00C8A0' }]} />
            <Text style={styles.hudText}>{progressLabel}</Text>
          </View>
        </View>

        <View style={styles.webBadge}>
          <Text style={styles.webBadgeText}>WEB PREVIEW MAP</Text>
        </View>

        <TouchableOpacity style={styles.expandBtn} onPress={onToggleExpand}>
          <View style={styles.expandHandle} />
        </TouchableOpacity>
      </View>

      <View style={styles.panel}>
        <View style={styles.guidanceRow}>
          <View style={styles.guidanceArrowWrap}>
            <Text style={styles.guidanceArrow}>↗</Text>
          </View>
          <View style={styles.guidanceText}>
            <Text style={styles.guidanceDir} numberOfLines={1}>{objectiveDirection}</Text>
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
          <View style={styles.metricCard}>
            <Text style={styles.metricVal}>{elapsedLabel}</Text>
            <Text style={styles.metricLbl}>Elapsed</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricVal, styles.metricAccent]}>{metricTertiaryValue}</Text>
            <Text style={styles.metricLbl}>{metricTertiaryLabel}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#060c09',
    borderWidth: 1,
    borderColor: '#182820',
  },
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SW,
    height: SH,
    borderRadius: 0,
    zIndex: 100,
    marginTop: 0,
  },
  viewport: {
    height: 280,
    position: 'relative',
    overflow: 'hidden',
  },
  hudRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hudPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(6,12,9,0.94)',
    borderWidth: 1,
    borderColor: '#1b3028',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 9,
  },
  hudDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  hudText: {
    color: '#F2F2F0',
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  webBadge: {
    position: 'absolute',
    left: 10,
    bottom: 11,
    backgroundColor: 'rgba(6,12,9,0.88)',
    borderWidth: 1,
    borderColor: '#182820',
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  webBadgeText: {
    color: '#4fa48d',
    fontFamily: 'monospace',
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  expandBtn: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    backgroundColor: 'rgba(20,36,28,0.92)',
    borderWidth: 1,
    borderColor: '#1e3a2c',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  expandHandle: {
    width: 18,
    height: 3,
    backgroundColor: '#3a6050',
    borderRadius: 2,
  },
  panel: {
    backgroundColor: '#080d0a',
    borderTopWidth: 1,
    borderTopColor: '#182820',
    paddingHorizontal: 12,
    paddingTop: 11,
    paddingBottom: 14,
    gap: 8,
  },
  guidanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0e1a14',
    borderWidth: 1,
    borderColor: 'rgba(255,106,0,0.20)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 11,
    gap: 10,
  },
  guidanceArrowWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,106,0,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,106,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guidanceArrow: {
    fontSize: 14,
    color: '#FF6A00',
  },
  guidanceText: {
    flex: 1,
  },
  guidanceDir: {
    color: '#FF6A00',
    fontFamily: 'monospace',
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    opacity: 0.85,
  },
  guidanceName: {
    color: '#F2F2F0',
    fontSize: 13,
    fontWeight: '700',
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
    color: '#00C8A0',
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
    backgroundColor: '#0e1a14',
    borderWidth: 1,
    borderColor: '#192a22',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  metricVal: {
    color: '#F2F2F0',
    fontSize: 16,
    fontWeight: '700',
  },
  metricAccent: {
    color: '#00C850',
  },
  metricLbl: {
    color: '#6a9080',
    fontFamily: 'monospace',
    fontSize: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});

export default MissionMap;
