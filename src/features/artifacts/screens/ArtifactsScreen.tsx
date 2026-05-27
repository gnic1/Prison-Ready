import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { MissionEngineService } from '../../missions/services/missionEngineService';
import { AuthStorageService, defaultAuthState } from '../../auth/services/authStorageService';
import { themes } from '../../../theme/themes';
import { buildCampaignMeta } from '../../missions/services/missionMetaService';
import { MissionRepository } from '../../missions/services/missionRepository';

const ArtifactsScreen = () => {
  const [themeKey, setThemeKey] = React.useState(defaultAuthState.selectedTheme);
  const [missionRecord, setMissionRecord] = React.useState<any>(null);
  const [history, setHistory] = React.useState<any[]>([]);

  const refresh = React.useCallback(async () => {
      const [auth, latest, missionHistory] = await Promise.all([
        AuthStorageService.loadState(),
        MissionEngineService.getLatestMissionRecord(),
        MissionEngineService.getMissionHistory(),
      ]);
      setThemeKey(auth.selectedTheme);
      setMissionRecord(latest);
      setHistory(missionHistory);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const theme = themes[themeKey];
  const meta = React.useMemo(() => buildCampaignMeta(history), [history]);
  const artifact = missionRecord?.artifactIdsEarned?.length
    ? MissionRepository.getArtifactById(missionRecord.artifactIdsEarned[0]) || MissionRepository.getPrimaryArtifact()
    : MissionRepository.getPrimaryArtifact();
  const earned = missionRecord?.artifactIdsEarned?.includes(artifact.id);

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.screen} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>ARTIFACTS //</Text>
        <Text style={styles.title}>Recovered evidence from the latest mission.</Text>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Locker Status</Text>
          <Text style={styles.body}>{meta.artifactCount} artifact entries recovered across all stored runs.</Text>
        </View>
        <View style={styles.card}>
          {earned ? (
            <>
              <Text style={styles.itemTitle}>{artifact.title}</Text>
              <Text style={styles.body}>{artifact.summary}</Text>
              <Text style={styles.meta}>Truth Level: {artifact.truthLevel}</Text>
              <Text style={styles.meta}>Type: {artifact.type}</Text>
              {missionRecord?.recapEntry ? <Text style={styles.meta}>Recap: {missionRecord.recapEntry}</Text> : null}
            </>
          ) : (
            <Text style={styles.body}>No artifacts earned yet.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default ArtifactsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, paddingTop: 60, paddingBottom: 120, gap: 14 },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 2.1 },
  title: { color: '#F4F2EE', fontSize: 28, lineHeight: 34, fontWeight: '800' },
  summaryCard: { borderRadius: 20, padding: 16, backgroundColor: 'rgba(15,18,25,0.78)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  summaryTitle: { color: '#F4F2EE', fontSize: 18, fontWeight: '800', marginBottom: 6 },
  card: { borderRadius: 22, padding: 18, backgroundColor: 'rgba(12,16,24,0.82)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  itemTitle: { color: '#F5F3EE', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  body: { color: '#C4CBD8', lineHeight: 21 },
  meta: { color: '#AEB6C6', lineHeight: 20, marginTop: 8 },
});
