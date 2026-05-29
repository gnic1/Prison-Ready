// PatrolMap.web — web-only stub for PatrolMap.
// react-native-maps imports native RN internals that don't exist on web,
// so on web we always render the SVG abstraction. Metro auto-picks this file
// when bundling for `web` platform.

import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import type { PatrolWaypoint } from '../types/patrolSession';
import type { GhostWalkerPing } from '../services/remoteSyncService';

interface PatrolMapProps {
  waypoints: PatrolWaypoint[];
  accent: string;
  glow: string;
  ghosts?: GhostWalkerPing[];
}

export const PatrolMap: React.FC<PatrolMapProps> = ({ waypoints, accent, glow }) => {
  const hasFix = waypoints.length > 0;
  return (
    <View style={styles.wrap}>
      <Svg width="100%" height="100%" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <RadialGradient id="pulse" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={accent} stopOpacity={0.6} />
            <Stop offset="60%" stopColor={glow} stopOpacity={0.15} />
            <Stop offset="100%" stopColor="#000" stopOpacity={0} />
          </RadialGradient>
        </Defs>
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
};

const styles = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, backgroundColor: '#06080d' },
});

export default PatrolMap;
