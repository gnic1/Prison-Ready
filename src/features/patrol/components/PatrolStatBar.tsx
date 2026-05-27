// Bottom stat panel: 4 mini-bars for Insight / Vigilance / Stamina / Resolve.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { PatrolStats } from '../types/storyGraph';

interface PatrolStatBarProps {
  stats: PatrolStats;
  accent: string;
  borderColor: string;
}

const ORDER: Array<{ key: keyof PatrolStats; label: string }> = [
  { key: 'insight', label: 'INS' },
  { key: 'vigilance', label: 'VIG' },
  { key: 'stamina', label: 'STA' },
  { key: 'resolve', label: 'RES' },
];

export const PatrolStatBar: React.FC<PatrolStatBarProps> = ({ stats, accent, borderColor }) => (
  <View style={[styles.wrap, { borderColor }]}>
    {ORDER.map(({ key, label }) => {
      const value = stats[key];
      const pct = Math.max(0, Math.min(1, value / 20));
      return (
        <View key={key} style={styles.stat}>
          <View style={styles.statHead}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
          </View>
          <View style={styles.barBg}>
            <View
              style={[
                styles.barFill,
                { backgroundColor: accent, width: `${pct * 100}%` },
              ]}
            />
          </View>
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: 'rgba(8,10,14,0.92)',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 14,
  },
  stat: { flex: 1 },
  statHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statLabel: {
    fontSize: 10,
    color: '#888',
    fontFamily: 'Courier',
    letterSpacing: 1,
    fontWeight: '700',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  barBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 2 },
});
