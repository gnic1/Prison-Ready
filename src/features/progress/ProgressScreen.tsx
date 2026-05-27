import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { themes } from '../../theme/themes';
import { AuthStorageService, defaultAuthState } from '../auth/services/authStorageService';
import { MissionEngineService } from '../missions/services/missionEngineService';
import { UserPreferencesService } from '../missions/services/userPreferencesService';
import { buildCampaignMeta } from '../missions/services/missionMetaService';

export default function ProgressScreen() {
  const [themeKey, setThemeKey] = React.useState(defaultAuthState.selectedTheme);
  const [history, setHistory] = React.useState<any[]>([]);
  const [distanceUnit, setDistanceUnit] = React.useState<'km' | 'miles'>('km');

  const refresh = React.useCallback(async () => {
    const [auth, missionHistory, prefs] = await Promise.all([
      AuthStorageService.loadState(),
      MissionEngineService.getMissionHistory(),
      UserPreferencesService.getPreferences(),
    ]);
    setThemeKey(auth.selectedTheme);
    setHistory(missionHistory);
    setDistanceUnit(prefs.distanceUnit);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const theme = themes[themeKey];
  const meta = React.useMemo(() => buildCampaignMeta(history), [history]);
  const formattedDistance = UserPreferencesService.formatDistanceFromMeters(meta.totalDistanceMeters, distanceUnit);

  const cards = [
    { label: 'Player Rank', value: meta.playerRank },
    { label: 'Current Streak', value: `${meta.activeStreakDays} days` },
    { label: 'Completed Missions', value: meta.completedMissions },
    { label: 'Strong Reports', value: meta.strongReports },
    { label: 'Artifacts Collected', value: meta.artifactCount },
    { label: 'Total Distance', value: formattedDistance },
    { label: 'Total XP', value: meta.totalXP },
    { label: 'Latest Grade', value: meta.latestPerformance ? `${meta.latestPerformance.rank} / ${meta.latestPerformance.score}` : '--' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.screen} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>{theme.labels.progress.toUpperCase()} //</Text>
        <Text style={styles.title}>Progress should feel like mounting pressure and momentum, not a dead ledger.</Text>

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>{meta.latestPerformance?.heading || 'No scored mission yet'}</Text>
          <Text style={styles.heroBody}>
            {meta.nextUnlock
              ? `${meta.nextUnlock.label} is next: ${meta.nextUnlock.progressCurrent}/${meta.nextUnlock.progressTarget}`
              : 'Every currently defined unlock has been claimed. Content depth is now the real limiter.'}
          </Text>
        </View>

        {cards.map((card) => (
          <View key={card.label} style={styles.card}>
            <Text style={styles.label}>{card.label}</Text>
            <Text style={styles.value}>{card.value}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 66, paddingBottom: 120 },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 2.1, marginBottom: 12 },
  title: { fontSize: 28, lineHeight: 34, fontWeight: '800', marginBottom: 18, color: '#F5F3EE' },
  heroCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    backgroundColor: 'rgba(18,21,28,0.84)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroTitle: { color: '#F4F4EE', fontSize: 19, fontWeight: '800', marginBottom: 6 },
  heroBody: { color: '#C4CBD8', lineHeight: 21 },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(12,16,24,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  label: { fontSize: 13, color: '#B8C0CF', textTransform: 'uppercase', letterSpacing: 1.1, fontWeight: '700' },
  value: { fontSize: 22, fontWeight: '800', color: '#FFF', marginTop: 6 },
});
