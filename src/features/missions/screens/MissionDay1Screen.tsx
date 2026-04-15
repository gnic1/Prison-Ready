import missionCompleteIcon from '../../../../assets/icons/mission_complete.png';
import missionIncompleteIcon from '../../../../assets/icons/mission_incomplete.png';
import xpRewardIcon from '../../../../assets/icons/xp_reward.png';
import badgeJumpingInIcon from '../../../../assets/icons/badge_jumping_in.png';
let badgeJumpingInLevel2Icon: any = undefined;
let badgeJumpingInMasteryIcon: any = undefined;
try { badgeJumpingInLevel2Icon = require('../../../../assets/icons/badge_jumping_in_level2.png'); } catch {}
try { badgeJumpingInMasteryIcon = require('../../../../assets/icons/badge_jumping_in_mastery.png'); } catch {}
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet, Dimensions, Animated } from 'react-native';
import { PrisonButton } from '../../../components/PrisonButton';
import { PrisonCard } from '../../../components/PrisonCard';
import { ResultModule } from '../../../components/ResultModule';
import { XPRewardModule } from '../../../components/XPRewardModule';
import { BadgeProgressCard } from '../../../components/BadgeProgressCard';
import { BadgeService } from '../services/badgeService';
import { RewardService } from '../services/rewardService';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { day1Mission, day1Triggers } from '../data/day1.mission';
import { MissionMap } from '../components/MissionMap';
import { SessionService } from '../services/sessionService';
import { GpsService } from '../services/gpsService';
import * as Location from 'expo-location';
import { RouteService } from '../services/routeService';
import { useNavigation } from '@react-navigation/native';

const MIN_LENGTH = day1Mission.durationMin;
const SUPPORTED_LENGTHS = [15, 20, 25, 30];

function buildRoundTripPacing(duration: number) {
  // Outbound: 40%, Turn: 20%, Return: 40%
  return [
    { label: 'Start', time: 0 },
    { label: 'Outbound', time: Math.round(duration * 0.4) },
    { label: 'Turnaround', time: Math.round(duration * 0.5) },
    { label: 'Return', time: Math.round(duration * 0.9) },
    { label: 'Complete', time: duration },
  ];
}

const POIS = [
  { label: 'Turnaround', icon: '◆' },
  { label: 'Return', icon: '■' },
];

export const MissionDay1Screen = () => {
  const navigation = useNavigation();
  // UI state
  const [screenStage, setScreenStage] = useState<'start' | 'length' | 'briefing' | 'active' | 'result'>(
    'start'
  );
  const [workoutLength, setWorkoutLength] = useState<number>(20);
  const [missionActive, setMissionActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState('Start');
  const [distance, setDistance] = useState(0);
  const [storyIdx, setStoryIdx] = useState(0);
  const [gpsStatus, setGpsStatus] = useState('Idle');
  const [path, setPath] = useState<any[]>([]);
  const [missionEndedEarly, setMissionEndedEarly] = useState(false);
  const [completionPercent, setCompletionPercent] = useState(0);
  const [partialPoints, setPartialPoints] = useState(0);
  const [mapExpanded, setMapExpanded] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<any>(null);
  // Animation state (for future polish)
  const [resultAnim] = useState(new Animated.Value(0));
  // MVP badge/xp state
  const [badge, setBadge] = useState(BadgeService.getBadge());
  const [xp, setXP] = useState(RewardService.getXP());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gpsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gotFirstFix = useRef(false);
  const pacing = buildRoundTripPacing(workoutLength);
  const storyBeats = [
    'You begin your familiar route.',
    'You reach the outbound checkpoint. The world feels different.',
    'You turn around, keeping the house in mind.',
    'You are on your way back. Something feels off.',
    'Mission complete. Time to report back.'
  ];

  useEffect(() => {
    if (!missionActive) return;
    timerRef.current = setInterval(() => {
      setElapsed(e => e + 1);
    }, 1000 * 60); // 1 minute
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [missionActive]);

  // Track user location for map (but only after mission start)
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;
    async function startLocationWatch() {
      if (!missionActive) {
        setUserLocation(null);
        return;
      }
      setMapLoading(true);
      // Request permission if not already granted
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setMapLoading(false);
        setGpsStatus('Permission Denied');
        Alert.alert('Location permission not granted');
        return;
      }
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, timeInterval: 2000, distanceInterval: 1 },
        loc => {
          if (cancelled) return;
          setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          setMapLoading(false);
        }
      );
    }
    if (missionActive) startLocationWatch();
    return () => {
      cancelled = true;
      if (subscription) subscription.remove();
    };
  }, [missionActive]);

  useEffect(() => {
    if (!missionActive) return;
    // Update phase and story
    for (let i = pacing.length - 1; i >= 0; i--) {
      if (elapsed >= pacing[i].time) {
        setPhase(pacing[i].label);
        setStoryIdx(i);
        break;
      }
    }
    // Update completion percent
    const percent = Math.min(100, Math.round((elapsed / workoutLength) * 100));
    setCompletionPercent(percent);
    // End mission if time is up
    if (elapsed >= workoutLength) {
      handleCompleteMission();
    }
  }, [elapsed, missionActive, workoutLength]);

  // Staged mission start flow
  const handleStartMission = () => {
    setScreenStage('length');
  };

  const handleLengthConfirm = () => {
    setScreenStage('briefing');
    setTimeout(() => setScreenStage('active'), 1200); // Briefing for 1.2s, then start
    setTimeout(() => startMissionActive(), 1200);
  };

  const startMissionActive = async () => {
    if (workoutLength < MIN_LENGTH) {
      Alert.alert('Workout Too Short', `Minimum mission length is ${MIN_LENGTH} minutes. Please select a longer workout.`);
      setScreenStage('length');
      return;
    }
    setMissionActive(true);
    setElapsed(0);
    setPhase('Start');
    setStoryIdx(0);
    setDistance(0);
    setPath([]);
    setGpsStatus('Starting...');
    gotFirstFix.current = false;
    const session = SessionService.startSession(day1Mission.id, day1Mission.routeId, workoutLength, pacing.map(p => p.time));
    try {
      await GpsService.startTracking(state => {
        setDistance(Math.round(state.totalDistance));
        setPath([...state.positions]);
        setGpsStatus(state.active ? 'Tracking' : 'Idle');
        if (!gotFirstFix.current && state.positions.length > 0) {
          gotFirstFix.current = true;
          if (gpsTimeoutRef.current) clearTimeout(gpsTimeoutRef.current);
        }
      });
      gpsTimeoutRef.current = setTimeout(() => {
        if (!gotFirstFix.current) {
          GpsService.stopTracking();
          setMissionActive(false);
          setGpsStatus('Error');
          Alert.alert('Location Error', 'Could not get your location. Please ensure location services are enabled and try again.');
        }
      }, 10000);
    } catch (e: any) {
      Alert.alert('Location Error', e.message || 'Could not start GPS tracking.');
      setMissionActive(false);
      setGpsStatus('Error');
      return;
    }
  };

  // Called when user completes or ends mission
  const handleCompleteMission = (early: boolean = false) => {
    GpsService.stopTracking();
    setMissionActive(false);
    setGpsStatus('Idle');
    let percent = Math.min(100, Math.round((elapsed / workoutLength) * 100));
    setCompletionPercent(percent);
    // Save route as routine if meaningful
    if (path.length > 1) {
      RouteService.saveRoute({
        id: `route_${Date.now()}`,
        name: `Routine Route (${workoutLength} min)`,
        missionId: day1Mission.id,
        duration: workoutLength,
        startLocation: path[0],
        path,
        createdAt: new Date().toISOString(),
      });
    }
    // If early/manual end or not enough progress, show result module (no badge/xp)
    if (early || percent < 95) {
      setMissionEndedEarly(true);
      if (percent >= 25) {
        setPartialPoints(25);
      } else {
        setPartialPoints(0);
      }
      SessionService.pauseSession(percent, partialPoints);
      setScreenStage('result');
      Animated.timing(resultAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
      return;
    }
    // Normal completion: award XP and badge
    setMissionEndedEarly(false);
    setPartialPoints(0);
    SessionService.completeSession(
      day1Mission.primaryArtifactId,
      '',
      'partial',
      undefined
    );
    // Award XP and badge progression
    const newXP = RewardService.addXP(50); // MVP: 50 XP per complete
    setXP(newXP);
    const newBadge = BadgeService.incrementOnComplete();
    setBadge({ ...newBadge });
    setScreenStage('result');
    Animated.timing(resultAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  };

  // --- UI RENDER ---
  return (
    <ScrollView style={styles.container}>
      {/* Start Screen */}
      {screenStage === 'start' && (
        <PrisonCard style={{ alignItems: 'center', marginTop: 32 }}>
          <Text style={[typography.headline, { color: colors.prisonOrange }]}>Day 1: {day1Mission.title}</Text>
          <Text style={[typography.body, { marginVertical: 12, color: colors.textSecondary }]}>Ready to begin your mission?</Text>
          <PrisonButton title="Start Mission" onPress={handleStartMission} />
        </PrisonCard>
      )}
      {/* Mission Length Selection */}
      {screenStage === 'length' && (
        <PrisonCard style={{ alignItems: 'center', marginTop: 32 }}>
          <Text style={[typography.subhead, { color: colors.prisonOrange }]}>Select Mission Length</Text>
          <View style={{ flexDirection: 'row', marginVertical: 16 }}>
            {SUPPORTED_LENGTHS.map(len => (
              <PrisonButton
                key={len}
                title={len.toString()}
                onPress={() => setWorkoutLength(len)}
                style={{
                  backgroundColor: workoutLength === len ? colors.prisonOrange : colors.cardBorder,
                  marginHorizontal: 6,
                  minWidth: 60,
                }}
                textStyle={{ color: workoutLength === len ? colors.white : colors.textSecondary }}
                disabled={missionActive}
              />
            ))}
          </View>
          <PrisonButton title="Confirm & Begin" onPress={handleLengthConfirm} />
        </PrisonCard>
      )}
      {/* Briefing/Transition */}
      {screenStage === 'briefing' && (
        <PrisonCard style={{ alignItems: 'center', marginTop: 32, backgroundColor: colors.prisonOrange }}>
          <Text style={[typography.headline, { color: colors.white }]}>Mission Briefing</Text>
          <Text style={[typography.body, { color: colors.white, marginVertical: 12 }]}>Get ready! Your mission is about to begin...</Text>
        </PrisonCard>
      )}
      {/* Mission Active */}
      {screenStage === 'active' && (
        <>
          <PrisonCard style={{ marginTop: 16 }}>
            <Text style={[typography.subhead, { color: colors.prisonOrange }]}>Status: {missionActive ? 'Active' : 'Not Started'}</Text>
            <Text style={typography.body}>Elapsed: {elapsed} min / {workoutLength} min</Text>
            <Text style={typography.body}>Phase: {phase}</Text>
            <Text style={typography.body}>Distance: {distance} m</Text>
            <Text style={typography.body}>GPS: {gpsStatus}</Text>
            <Text style={typography.body}>Current Objective: {storyBeats[storyIdx]}</Text>
          </PrisonCard>
          <MissionMap
            path={path}
            pois={POIS.map((poi, idx) => ({
              ...poi,
              coordinate: path.length > 0 ? path[Math.floor((idx + 1) * path.length / (POIS.length + 1))] : { latitude: 37.78825, longitude: -122.4324 }
            }))}
            userLocation={userLocation}
            expanded={mapExpanded}
            onToggleExpand={() => setMapExpanded(e => !e)}
            loading={mapLoading}
            theme={'day'}
          />
          <PrisonButton title="End Mission Early" onPress={() => handleCompleteMission(true)} style={{ backgroundColor: colors.incomplete }} />
        </>
      )}
      {/* Result Module (Complete/Incomplete) */}
      {screenStage === 'result' && (
        <Animated.View style={{ opacity: resultAnim, marginTop: 32 }}>
          <ResultModule
            title={missionEndedEarly ? 'Mission Incomplete' : 'Mission Complete'}
            icon={missionEndedEarly ? missionIncompleteIcon : missionCompleteIcon}
            statusColor={missionEndedEarly ? colors.incomplete : colors.complete}
          >
            <Text style={[typography.body, { color: colors.text, marginVertical: 8 }]}>Completion: {completionPercent}%</Text>
            {missionEndedEarly ? (
              <Text style={[typography.body, { color: colors.incomplete, marginVertical: 8 }]}>Workout logged. Mission incomplete. Your mission will resume next time.</Text>
            ) : (
              <Text style={[typography.body, { color: colors.complete, marginVertical: 8 }]}>Great job! You completed your mission.</Text>
            )}
            {partialPoints > 0 && missionEndedEarly && (
              <Text style={[typography.body, { color: colors.xp }]}>Partial points awarded: {partialPoints}</Text>
            )}
            {/* XP Reward and Badge Progression (only for complete) */}
            {!missionEndedEarly && (
              <>
                <XPRewardModule xp={50} icon={xpRewardIcon} />
                <BadgeProgressCard
                  badge={badge}
                  assetSources={{
                    base: badgeJumpingInIcon,
                    level2: badgeJumpingInLevel2Icon || badgeJumpingInIcon,
                    mastery: badgeJumpingInMasteryIcon || badgeJumpingInLevel2Icon || badgeJumpingInIcon,
                  }}
                />
              </>
            )}
            <PrisonButton title="Continue" onPress={() => navigation.navigate('ReportBack')} style={{ marginTop: 16 }} />
          </ResultModule>
        </Animated.View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: colors.slate, minHeight: Dimensions.get('window').height },
});
