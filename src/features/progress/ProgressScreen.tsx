import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { themes } from '../../theme/themes';

const mockStats = {
  totalMissions: 7,
  longestMission: 32,
  totalDistance: 8.2,
  currentStreak: 3,
  bestStreak: 5,
  badges: 2,
  artifacts: 1,
};

export default function ProgressScreen() {
  const theme = themes.prison;
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }] }>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={[styles.title, { color: theme.colors.accent }]}>Progress</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card }] }>
          <Text style={styles.label}>Total Missions</Text>
          <Text style={styles.value}>{mockStats.totalMissions}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: theme.colors.card }] }>
          <Text style={styles.label}>Longest Mission</Text>
          <Text style={styles.value}>{mockStats.longestMission} min</Text>
        </View>
        <View style={[styles.card, { backgroundColor: theme.colors.card }] }>
          <Text style={styles.label}>Total Distance</Text>
          <Text style={styles.value}>{mockStats.totalDistance} mi</Text>
        </View>
        <View style={[styles.card, { backgroundColor: theme.colors.card }] }>
          <Text style={styles.label}>Current Streak</Text>
          <Text style={styles.value}>{mockStats.currentStreak} days</Text>
        </View>
        <View style={[styles.card, { backgroundColor: theme.colors.card }] }>
          <Text style={styles.label}>Best Streak</Text>
          <Text style={styles.value}>{mockStats.bestStreak} days</Text>
        </View>
        <View style={[styles.card, { backgroundColor: theme.colors.card }] }>
          <Text style={styles.label}>Badges Earned</Text>
          <Text style={styles.value}>{mockStats.badges}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: theme.colors.card }] }>
          <Text style={styles.label}>Artifacts Collected</Text>
          <Text style={styles.value}>{mockStats.artifacts}</Text>
        </View>
        <View style={[styles.card, { backgroundColor: theme.colors.card }] }>
          <Text style={styles.label}>Story Progress</Text>
          <Text style={styles.value}>Day 1</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  label: { fontSize: 14, color: '#FFB366' },
  value: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginTop: 2 },
});
