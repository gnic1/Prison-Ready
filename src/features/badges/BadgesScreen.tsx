import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { themes } from '../../theme/themes';

const mockBadges = [
  { name: 'Repeat Offender', desc: 'Complete 5 missions', icon: '🏅', streak: true },
  { name: 'First Steps', desc: 'Complete your first mission', icon: '🥇', streak: false },
];

export default function BadgesScreen() {
  const theme = themes.prison;
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }] }>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={[styles.title, { color: theme.colors.accent }]}>Badges</Text>
        {mockBadges.map(badge => (
          <View key={badge.name} style={[styles.card, { backgroundColor: theme.colors.card, borderColor: badge.streak ? theme.colors.streak : theme.colors.accent }] }>
            <Text style={styles.icon}>{badge.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.badgeName, { color: theme.colors.text }]}>{badge.name}</Text>
              <Text style={[styles.badgeDesc, { color: theme.colors.textSecondary }]}>{badge.desc}</Text>
            </View>
            {badge.streak && <Text style={{ color: theme.colors.streakGlow, fontWeight: 'bold' }}>Streak</Text>}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 2,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  icon: { fontSize: 32, marginRight: 16 },
  badgeName: { fontSize: 16, fontWeight: 'bold' },
  badgeDesc: { fontSize: 13, marginTop: 2 },
});
