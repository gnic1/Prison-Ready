import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { MissionMap } from '../components/MissionMap';
import { MissionTranscriptPanel } from '../components/MissionTranscriptPanel';
import { MissionEngineService } from '../services/missionEngineService';
import { MissionNotificationService } from '../services/missionNotificationService';
import { AuthStorageService, defaultAuthState } from '../../auth/services/authStorageService';
import { PrisonButton } from '../../../components/PrisonButton';
import { themes } from '../../../theme/themes';
import { UserPreferencesService } from '../services/userPreferencesService';
import { deriveMissionPerformance } from '../services/missionMetaService';

function formatElapsed(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function MissionDay1Screen() {
  const navigation = useNavigation<any>();
  const [themeKey, setThemeKey] = React.useState(defaultAuthState.selectedTheme);
  const [missionRecord, setMissionRecord] = React.useState<any>(null);
  const [liveMissionActive, setLiveMissionActive] = React.useState(false);
  const unreadCountRef = React.useRef(0);

  const refreshMission = React.useCallback(async () => {
    const [auth, activeMission, latestMission] = await Promise.all([
      AuthStorageService.loadState(),
      MissionEngineService.getActiveMission(),
      MissionEngineService.getLatestMissionRecord(),
    ]);
    const record = activeMission ?? latestMission;
    const unread = record?.queuedBeats?.filter((beat: any) => !beat.acknowledgedAt).length ?? 0;
    if (unread > unreadCountRef.current) {
      await MissionNotificationService.triggerForegroundFeedback();
    }
    unreadCountRef.current = unread;
    setThemeKey(auth.selectedTheme);
    setMissionRecord(record);
    setLiveMissionActive(Boolean(activeMission?.status === 'active'));
  }, []);

  useFocusEffect(React.useCallback(() => {
    refreshMission();
    const intervalId = setInterval(async () => {
      await MissionEngineService.tickTreadmill();
      refreshMission();
    }, 1000);
    return () => clearInterval(intervalId);
  }, [refreshMission]));

  React.useEffect(() => {
    if (!liveMissionActive || missionRecord?.missionMode !== 'outside') {
      return;
    }
    let cancelled = false;
    let subscription: Location.LocationSubscription | null = null;
    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 2000,
        distanceInterval: 3,
      },
      async (location) => {
        if (cancelled) {
          return;
        }
        await MissionEngineService.processLocationBatch([location], 'foreground');
        await refreshMission();
      }
    ).then((nextSubscription) => {
      subscription = nextSubscription;
    }).catch(() => {
      // Best-effort foreground refresh. Background task remains primary for continuity.
    });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [liveMissionActive, missionRecord?.missionMode, refreshMission]);

  const theme = themes[themeKey];

  if (!missionRecord) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={theme.gradients.screen} style={StyleSheet.absoluteFill} />
        <View style={styles.emptyCard}>
          <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>ACTIVE WORKOUT //</Text>
          <Text style={styles.title}>No mission is active.</Text>
          <Text style={styles.body}>Start from the mission setup flow to create a persisted mission session.</Text>
          <PrisonButton title="Go to Mission Start" onPress={() => navigation.navigate('MissionStart')} />
        </View>
      </View>
    );
  }

  const unreadBeats = missionRecord.queuedBeats.filter((beat: any) => !beat.acknowledgedAt);
  const elapsedLabel = formatElapsed(missionRecord.elapsedSeconds || 0);
  const goalLabel = missionRecord.goalType === 'distance'
    ? UserPreferencesService.formatDistanceFromMeters(missionRecord.targetDistanceMeters || 0, missionRecord.distanceUnit)
    : `${Math.round((missionRecord.targetDurationSec || 0) / 60)} min`;
  const primaryMetric = missionRecord.goalType === 'distance'
    ? UserPreferencesService.formatDistanceFromMeters(missionRecord.totalDistanceMeters || 0, missionRecord.distanceUnit)
    : elapsedLabel;
  const objectiveDistance = missionRecord.goalType === 'distance'
    ? UserPreferencesService.formatDistanceFromMeters(
        Math.max(0, (missionRecord.targetDistanceMeters || 0) - (missionRecord.totalDistanceMeters || 0)),
        missionRecord.distanceUnit
      )
    : `${Math.max(0, Math.round(((missionRecord.targetDurationSec || 0) - missionRecord.elapsedSeconds) / 60))} min`;
  const missionPerformance = deriveMissionPerformance(missionRecord);

  if (missionRecord.status !== 'active') {
    return (
      <View style={styles.container}>
        <LinearGradient colors={theme.gradients.screen} style={StyleSheet.absoluteFill} />
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>ACTIVE WORKOUT //</Text>
          <Text style={styles.title}>{missionRecord.status === 'completed' ? 'Mission complete.' : 'Mission ended early.'}</Text>
          <Text style={styles.body}>
            {missionRecord.status === 'completed'
              ? 'Checkpoint progression and transcript state have been preserved. Continue to report back or review the full mission read-along.'
              : 'Your current record was preserved. You can review the transcript now and restart from mission setup when ready.'}
          </Text>
          {missionPerformance ? (
            <View style={styles.debriefCard}>
              <Text style={[styles.debriefLabel, { color: theme.colors.accent }]}>Mission Debrief</Text>
              <Text style={styles.debriefTitle}>{missionPerformance.heading}</Text>
              <Text style={styles.debriefBody}>{missionPerformance.summary}</Text>
              <View style={styles.metricRow}>
                <View style={styles.metricCard}><Text style={styles.metricLabel}>Grade</Text><Text style={styles.metricValue}>{missionPerformance.rank}</Text></View>
                <View style={styles.metricCard}><Text style={styles.metricLabel}>Score</Text><Text style={styles.metricValue}>{missionPerformance.score}</Text></View>
                <View style={styles.metricCard}><Text style={styles.metricLabel}>XP</Text><Text style={styles.metricValue}>{missionPerformance.xpAward}</Text></View>
              </View>
            </View>
          ) : null}
          <MissionTranscriptPanel title="Mission transcript" items={missionRecord.transcript} accentColor={theme.colors.accent} collapsedByDefault={false} />
          <PrisonButton
            title={missionRecord.status === 'completed' ? 'Open Report Back' : 'Restart Setup'}
            onPress={() => navigation.navigate(missionRecord.status === 'completed' ? 'ReportBack' : 'MissionStart')}
            shimmer
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.screen} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>ACTIVE WORKOUT //</Text>
        <View style={styles.heroCard}>
          <Text style={styles.title}>{missionRecord.missionId === 'mission_day1' ? 'The Familiar Route' : 'Mission Live'}</Text>
          <Text style={styles.body}>Mission continuity is now driven by persisted route progress and queued story beats, not a focus-only timer.</Text>
          <View style={styles.metricRow}>
            <View style={styles.metricCard}><Text style={styles.metricLabel}>Progress</Text><Text style={styles.metricValue}>{missionRecord.progressPercent}%</Text></View>
            <View style={styles.metricCard}><Text style={styles.metricLabel}>Elapsed</Text><Text style={styles.metricValue}>{elapsedLabel}</Text></View>
            <View style={styles.metricCard}><Text style={styles.metricLabel}>Goal</Text><Text style={styles.metricValue}>{goalLabel}</Text></View>
          </View>
        </View>

        {unreadBeats.length > 0 ? (
          <View style={styles.queueCard}>
            <Text style={[styles.queueLabel, { color: theme.colors.accent }]}>Queued updates ready</Text>
            {unreadBeats.map((beat: any) => (
              <View key={beat.id} style={styles.queueEntry}>
                <Text style={styles.queueTitle}>{beat.title}</Text>
                <Text style={styles.queueText}>{beat.text}</Text>
              </View>
            ))}
            <TouchableOpacity onPress={async () => { await MissionEngineService.acknowledgeQueuedBeats(); await refreshMission(); }}>
              <Text style={[styles.queueAction, { color: theme.colors.accent }]}>Mark updates reviewed</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <MissionMap
          path={missionRecord.path.map((point: any) => ({ latitude: point.latitude, longitude: point.longitude }))}
          pois={[]}
          userLocation={missionRecord.lastKnownLocation ? { latitude: missionRecord.lastKnownLocation.latitude, longitude: missionRecord.lastKnownLocation.longitude } : null}
          expanded={false}
          loading={false}
          theme="day"
          mode={missionRecord.missionMode === 'outside' ? 'gps' : 'simulated'}
          progressPercent={missionRecord.progressPercent}
          statusLabel={missionRecord.missionMode === 'outside' ? 'TRACKING' : 'SIMULATED'}
          progressLabel={`${missionRecord.progressPercent}% COMPLETE`}
          objectiveDirection={unreadBeats[0]?.title || 'Continue the route'}
          objectiveName={unreadBeats[0]?.title || 'Next checkpoint'}
          objectiveDistance={objectiveDistance}
          metricPrimaryValue={primaryMetric}
          metricPrimaryLabel={missionRecord.goalType === 'distance' ? 'Distance' : 'Elapsed'}
          elapsedLabel={elapsedLabel}
          metricTertiaryValue={goalLabel}
          metricTertiaryLabel="Goal"
        />

        <MissionTranscriptPanel title="Read-along transcript" items={missionRecord.transcript} accentColor={theme.colors.accent} />

        <PrisonButton title="End Mission Early" onPress={async () => { await MissionEngineService.abandonMission(missionRecord.progressPercent >= 25 ? 25 : 0); await refreshMission(); }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, paddingTop: 60, paddingBottom: 124, gap: 16 },
  emptyCard: { margin: 18, marginTop: 80, padding: 20, borderRadius: 24, backgroundColor: 'rgba(12,16,24,0.82)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 2.1, textTransform: 'uppercase' },
  title: { color: '#F5F3EE', fontSize: 30, fontWeight: '800', marginTop: 10, marginBottom: 8 },
  body: { color: '#C4CBD8', lineHeight: 22 },
  heroCard: { borderRadius: 24, padding: 18, backgroundColor: 'rgba(11,14,20,0.82)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  debriefCard: { borderRadius: 22, padding: 16, backgroundColor: 'rgba(15,18,25,0.84)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  debriefLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1.7, textTransform: 'uppercase', marginBottom: 8 },
  debriefTitle: { color: '#F5F3EE', fontSize: 22, fontWeight: '800', marginBottom: 8 },
  debriefBody: { color: '#C4CBD8', lineHeight: 21 },
  metricRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  metricCard: { flex: 1, borderRadius: 18, padding: 12, backgroundColor: 'rgba(6,9,14,0.7)' },
  metricLabel: { color: '#A8B0C0', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.1, fontWeight: '700', marginBottom: 4 },
  metricValue: { color: '#F8F6F0', fontSize: 18, fontWeight: '800' },
  queueCard: { borderRadius: 22, padding: 16, backgroundColor: 'rgba(15,18,24,0.84)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  queueLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1.8, textTransform: 'uppercase', marginBottom: 8 },
  queueEntry: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' },
  queueTitle: { color: '#F4F3EE', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  queueText: { color: '#C4CBD8', lineHeight: 20 },
  queueAction: { marginTop: 10, fontWeight: '700', letterSpacing: 1 },
});
