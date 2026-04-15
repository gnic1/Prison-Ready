import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { themes } from '../../theme/themes';
import { GameBottomNav } from '../../components/GameBottomNav';

const mockPlayer = {
  name: 'Player One',
  nickname: 'The Fox',
  streak: 3,
  badge: 'Repeat Offender',
  avatar: '🦊',
};

export default function HomeScreen({ navigation }) {
  const [themeKey, setThemeKey] = useState('prison');
  const theme = themes[themeKey];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }] }>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Player Identity */}
        <View style={[styles.identityCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.accent }] }>
          <Text style={styles.avatar}>{mockPlayer.avatar}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.playerName, { color: theme.colors.text }]}>{mockPlayer.name}</Text>
            <Text style={[styles.nickname, { color: theme.colors.accentGlow }]}>aka “{mockPlayer.nickname}”</Text>
            <Text style={[styles.badge, { color: theme.colors.gold }]}>{mockPlayer.badge}</Text>
          </View>
        </View>
        {/* Streak */}
        <View style={[styles.streakCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.streak }] }>
          <Text style={[styles.streakLabel, { color: theme.colors.streakGlow }]}>{theme.labels.streak}</Text>
          <Text style={[styles.streakValue, { color: theme.colors.streak }]}>{mockPlayer.streak} days</Text>
        </View>
        {/* Main CTA */}
        <TouchableOpacity style={[styles.cta, { backgroundColor: theme.colors.accent }]} onPress={() => navigation.navigate('Missions', { screen: 'MissionBrief' })}>
          <Text style={[styles.ctaText, { color: theme.colors.text }]}>Continue Mission</Text>
        </TouchableOpacity>
        {/* Quick Access */}
        <View style={styles.quickRow}>
          <TouchableOpacity style={[styles.quickCard, { backgroundColor: theme.colors.card }]} onPress={() => navigation.navigate('Progress')}>
            <Text style={{ color: theme.colors.accent, fontSize: 24 }}>📈</Text>
            <Text style={{ color: theme.colors.textSecondary }}>Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickCard, { backgroundColor: theme.colors.card }]} onPress={() => navigation.navigate('Badges')}>
            <Text style={{ color: theme.colors.gold, fontSize: 24 }}>🏅</Text>
            <Text style={{ color: theme.colors.textSecondary }}>Badges</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickCard, { backgroundColor: theme.colors.card }]} onPress={() => navigation.navigate('StorySoFar')}>
            <Text style={{ color: theme.colors.accentGlow, fontSize: 24 }}>📖</Text>
            <Text style={{ color: theme.colors.textSecondary }}>Story</Text>
          </TouchableOpacity>
        </View>
        {/* Theme Switcher */}
        <View style={[styles.themeSwitcher, { backgroundColor: theme.colors.card }] }>
          <Text style={{ color: theme.colors.textSecondary, marginBottom: 4 }}>Theme:</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => setThemeKey('prison')} style={[styles.themeBtn, themeKey === 'prison' && { backgroundColor: theme.colors.accent }]}>
              <Text style={{ color: themeKey === 'prison' ? theme.colors.text : theme.colors.textSecondary }}>Prison</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setThemeKey('mystery')} style={[styles.themeBtn, themeKey === 'mystery' && { backgroundColor: theme.colors.accent }]}>
              <Text style={{ color: themeKey === 'mystery' ? theme.colors.text : theme.colors.textSecondary }}>Mystery</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Health Integration */}
        <View style={[styles.healthCard, { backgroundColor: theme.colors.card }] }>
          <Text style={{ color: theme.colors.textSecondary }}>Health App: <Text style={{ color: theme.colors.accent }}>Not Linked</Text></Text>
        </View>
      </ScrollView>
      <GameBottomNav activeTab="Home" onTabPress={tab => navigation.navigate(tab)} themeKey={themeKey} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 2,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: { fontSize: 48, marginRight: 16 },
  playerName: { fontSize: 20, fontWeight: 'bold' },
  nickname: { fontSize: 14, fontStyle: 'italic' },
  badge: { fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  streakCard: {
    borderRadius: 14,
    borderWidth: 2,
    marginHorizontal: 32,
    marginBottom: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 2,
  },
  streakLabel: { fontSize: 14, fontWeight: 'bold' },
  streakValue: { fontSize: 22, fontWeight: 'bold', marginTop: 2 },
  cta: {
    marginHorizontal: 32,
    marginVertical: 12,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#FF6A00',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: { fontSize: 18, fontWeight: 'bold' },
  quickRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  quickCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 6,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  themeSwitcher: {
    margin: 16,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  themeBtn: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginHorizontal: 4,
  },
  healthCard: {
    margin: 16,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
});
