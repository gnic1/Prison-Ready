// Top chyron: distance, time, eyebrow tag. Always visible during a patrol.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PatrolChyronProps {
  eyebrow?: string;
  distanceMeters: number;
  elapsedSeconds: number;
  accent: string;
  borderColor: string;
}

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(2)} km`;
}

function formatTime(s: number): string {
  const mins = Math.floor(s / 60);
  const secs = Math.floor(s % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const PatrolChyron: React.FC<PatrolChyronProps> = ({
  eyebrow,
  distanceMeters,
  elapsedSeconds,
  accent,
  borderColor,
}) => (
  <View style={[styles.wrap, { borderColor }]}>
    <View style={styles.row}>
      <Text style={[styles.eyebrow, { color: accent }]}>
        {eyebrow ?? 'PATROL //'}
      </Text>
      <View style={styles.spacer} />
      <Text style={styles.metric}>{formatDistance(distanceMeters)}</Text>
      <View style={[styles.dot, { backgroundColor: borderColor }]} />
      <Text style={styles.metric}>{formatTime(elapsedSeconds)}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'rgba(8,10,14,0.92)',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    fontFamily: 'Courier',
  },
  spacer: { flex: 1 },
  metric: {
    fontSize: 14,
    color: '#F2F2F0',
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 8,
  },
});
