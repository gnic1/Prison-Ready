import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PrisonButton } from '../../../components/PrisonButton';
import { useNavigation } from '@react-navigation/native';
import { themes } from '../../../theme/themes';
import { MissionTranscriptPanel } from '../components/MissionTranscriptPanel';
import { MissionEngineService } from '../services/missionEngineService';
import { AuthStorageService, defaultAuthState } from '../../auth/services/authStorageService';
import {
  UserPreferencesService,
  defaultUserPreferences,
  UserPreferences,
} from '../services/userPreferencesService';
import { MissionRepository } from '../services/missionRepository';

export const MissionBriefScreen = () => {
  const navigation = useNavigation<any>();
  const [prefs, setPrefs] = useState<UserPreferences>(defaultUserPreferences);
  const [themeKey, setThemeKey] = useState(defaultAuthState.selectedTheme);
  const theme = themes[themeKey];
  const mission = MissionRepository.getPrimaryMission();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [nextPrefs, auth] = await Promise.all([
        UserPreferencesService.getPreferences(),
        AuthStorageService.loadState(),
      ]);
      if (!mounted) return;
      setPrefs(nextPrefs);
      setThemeKey(auth.selectedTheme);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const targetSummary = prefs.goalType === 'distance'
    ? `${prefs.preferredDistanceValue} ${prefs.distanceUnit === 'miles' ? 'mi' : 'km'}`
    : `${prefs.preferredTimeMinutes} min`;

  const handleBeginMission = async () => {
    try {
      await MissionEngineService.startMission({
        missionId: mission.id,
        routeId: mission.routeId,
        themeKey,
        goalType: prefs.goalType,
        missionMode: prefs.missionMode,
        distanceUnit: prefs.distanceUnit,
        preferredMissionStyle: prefs.preferredMissionStyle,
        targetDistanceMeters: prefs.goalType === 'distance'
          ? UserPreferencesService.toMeters(prefs.preferredDistanceValue, prefs.distanceUnit)
          : undefined,
        targetDurationSec: prefs.goalType === 'minutes'
          ? prefs.preferredTimeMinutes * 60
          : undefined,
      });
      navigation.navigate('MissionDay1');
    } catch (error: any) {
      Alert.alert('Mission Start', error?.message || 'Could not start mission tracking.');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.screen} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
          <Text style={[styles.backText, { color: theme.colors.accent }]}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>MISSION BRIEF //</Text>
        <Text style={styles.title}>{mission.title}</Text>
        <Text style={styles.subtitle}>{mission.story}</Text>

        <View style={styles.setupCard}>
          <Text style={styles.setupTitle}>Locked mission setup</Text>
          <Text style={styles.setupBody}>Goal: {prefs.goalType === 'distance' ? 'Distance' : 'Time'}</Text>
          <Text style={styles.setupBody}>Target: {targetSummary}</Text>
          <Text style={styles.setupBody}>Mode: {prefs.missionMode === 'outside' ? 'Outside Route' : 'Treadmill / Walking Pad'}</Text>
          <Text style={styles.setupBody}>Style: {prefs.preferredMissionStyle}</Text>
          <Text style={styles.setupNote}>
            {prefs.goalType === 'distance'
              ? 'Distance mode remains distance-based. Progress comes from route movement and will not silently switch to time.'
              : 'Time mode stays explicit. Outdoor progression is still updated from location events rather than a foreground-only timer.'}
          </Text>
        </View>

        <MissionTranscriptPanel
          title="Mission transcript"
          items={mission.briefingTranscript.map((line, index) => ({
            id: `brief_line_${index}`,
            title: `Transcript ${index + 1}`,
            text: line,
            createdAt: new Date().toISOString(),
            kind: 'brief',
            progressPercent: 0,
          }))}
          accentColor={theme.colors.accent}
          collapsedByDefault={false}
        />

        <PrisonButton title="Begin Active Workout" onPress={handleBeginMission} shimmer />
      </ScrollView>
    </View>
  );
};

export default MissionBriefScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 120, gap: 16 },
  backRow: { marginBottom: 4 },
  backText: { fontSize: 15, fontWeight: '700' },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 2.1 },
  title: { color: '#F4F2EE', fontSize: 30, fontWeight: '800', marginTop: 8 },
  subtitle: { color: '#CBD2DE', lineHeight: 22 },
  setupCard: { borderRadius: 22, padding: 18, backgroundColor: 'rgba(12,16,22,0.82)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  setupTitle: { color: '#F4F3EE', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  setupBody: { color: '#D0D6E1', lineHeight: 21, marginBottom: 4 },
  setupNote: { color: '#AEB6C6', lineHeight: 20, marginTop: 10 },
});
