import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MissionEngineService } from '../../missions/services/missionEngineService';
import { AuthStorageService, defaultAuthState } from '../../auth/services/authStorageService';
import { themes } from '../../../theme/themes';
import { PrisonButton } from '../../../components/PrisonButton';
import { deriveMissionPerformance } from '../../missions/services/missionMetaService';
import { MissionRepository } from '../../missions/services/missionRepository';

export const ReportBackScreen = () => {
  const navigation = useNavigation<any>();
  const [themeKey, setThemeKey] = React.useState(defaultAuthState.selectedTheme);
  const [missionRecord, setMissionRecord] = React.useState<any>(null);
  const [selected, setSelected] = React.useState<string | null>(null);
  const [submittedOutcome, setSubmittedOutcome] = React.useState<any>(null);

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
  const missionPerformance = deriveMissionPerformance(missionRecord);
  const reportBack = missionRecord?.missionId
    ? MissionRepository.getReportBackForMission(missionRecord.missionId) || MissionRepository.getPrimaryReportBack()
    : MissionRepository.getPrimaryReportBack();

  if (!missionRecord || missionRecord.status !== 'completed') {
    return (
      <View style={styles.container}>
        <LinearGradient colors={theme.gradients.screen} style={StyleSheet.absoluteFill} />
        <View style={styles.card}>
          <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>REPORT BACK //</Text>
          <Text style={styles.title}>No completed mission is ready for report-back.</Text>
          <PrisonButton title="Back to Missions" onPress={() => navigation.navigate('MissionDay1')} />
        </View>
      </View>
    );
  }

  const submit = async () => {
    const option = reportBack.options.find((item) => item.id === selected);
    if (!option) {
      return;
    }
    const recapEntry = `Last mission: ${option.outcomeText}`;
    const nextMissionRecord = await MissionEngineService.applyReportBack(option.id, option.outcomeBand, recapEntry);
    if (nextMissionRecord) {
      setMissionRecord(nextMissionRecord);
    }
    setSubmittedOutcome(option);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.screen} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>REPORT BACK //</Text>
        <Text style={styles.title}>{reportBack.prompt}</Text>
        {!submittedOutcome ? reportBack.options.map((option) => (
          <TouchableOpacity key={option.id} onPress={() => setSelected(option.id)} style={[styles.optionCard, selected === option.id && { borderColor: theme.colors.accent }]}>
            <Text style={styles.optionLabel}>{option.label}</Text>
            <Text style={styles.optionBody}>{option.outcomeText}</Text>
          </TouchableOpacity>
        )) : (
          <View style={styles.card}>
            <Text style={styles.optionLabel}>Mission Outcome</Text>
            <Text style={styles.optionBody}>{submittedOutcome.outcomeText}</Text>
            {missionPerformance ? (
              <Text style={styles.performanceText}>
                Grade {missionPerformance.rank} / {missionPerformance.score} score / {missionPerformance.xpAward} XP
              </Text>
            ) : null}
            <TouchableOpacity onPress={() => Speech.speak(submittedOutcome.outcomeText)}>
              <Text style={[styles.readAloud, { color: theme.colors.accent }]}>Read aloud</Text>
            </TouchableOpacity>
          </View>
        )}
        {!submittedOutcome ? (
          <PrisonButton title="Submit Report" onPress={submit} />
        ) : (
          <PrisonButton title="Continue to Artifacts" onPress={() => navigation.navigate('Artifacts')} shimmer />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, paddingTop: 60, paddingBottom: 120, gap: 12 },
  card: { borderRadius: 22, padding: 18, backgroundColor: 'rgba(12,16,24,0.82)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 2.1 },
  title: { color: '#F4F2EE', fontSize: 28, lineHeight: 34, fontWeight: '800' },
  optionCard: { borderRadius: 20, padding: 16, backgroundColor: 'rgba(10,13,20,0.78)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  optionLabel: { color: '#F4F2EE', fontSize: 17, fontWeight: '700', marginBottom: 6 },
  optionBody: { color: '#C4CBD8', lineHeight: 21 },
  performanceText: { color: '#FFD58B', lineHeight: 21, marginTop: 10, fontWeight: '700' },
  readAloud: { marginTop: 12, fontWeight: '700', letterSpacing: 1 },
});
