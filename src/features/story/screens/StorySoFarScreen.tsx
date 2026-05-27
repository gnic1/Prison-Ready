import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { PrisonButton } from '../../../components/PrisonButton';
import { MissionTranscriptPanel } from '../../missions/components/MissionTranscriptPanel';
import { MissionEngineService } from '../../missions/services/missionEngineService';
import { AuthStorageService, defaultAuthState } from '../../auth/services/authStorageService';
import { themes } from '../../../theme/themes';

const StorySoFarScreen = ({ navigation }: any) => {
  const [themeKey, setThemeKey] = React.useState(defaultAuthState.selectedTheme);
  const [missionRecord, setMissionRecord] = React.useState<any>(null);

  const refresh = React.useCallback(async () => {
      const [auth, latest] = await Promise.all([
        AuthStorageService.loadState(),
        MissionEngineService.getLatestMissionRecord(),
      ]);
      setThemeKey(auth.selectedTheme);
      setMissionRecord(latest);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const theme = themes[themeKey];

  if (!missionRecord) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={theme.gradients.screen} style={StyleSheet.absoluteFill} />
        <View style={styles.card}>
          <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>STORY SO FAR //</Text>
          <Text style={styles.title}>No mission transcript is available yet.</Text>
          <PrisonButton title="Back" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.screen} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>STORY SO FAR //</Text>
        <Text style={styles.title}>{missionRecord.recapEntry || 'The transcript is available even before report-back is complete.'}</Text>
        <MissionTranscriptPanel title="Mission read-along" items={missionRecord.transcript} accentColor={theme.colors.accent} collapsedByDefault={false} />
        {missionRecord.recapEntry ? <PrisonButton title="Read Recap Aloud" onPress={() => Speech.speak(missionRecord.recapEntry)} /> : null}
        <PrisonButton title="Back" onPress={() => navigation.goBack()} />
      </ScrollView>
    </View>
  );
};

export default StorySoFarScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, paddingTop: 60, paddingBottom: 120, gap: 14 },
  card: { margin: 18, marginTop: 80, borderRadius: 22, padding: 18, backgroundColor: 'rgba(12,16,24,0.82)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 2.1 },
  title: { color: '#F4F2EE', fontSize: 28, lineHeight: 34, fontWeight: '800' },
});
