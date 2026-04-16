import missionCompleteIcon from '../../../../assets/icons/mission_complete.png';
import missionIncompleteIcon from '../../../../assets/icons/mission_incomplete.png';
import xpRewardIcon from '../../../../assets/icons/xp_reward.png';
import badgeJumpingInIcon from '../../../../assets/icons/badge_jumping_in.png';
let badgeJumpingInLevel2Icon: any = undefined;
let badgeJumpingInMasteryIcon: any = undefined;
try { badgeJumpingInLevel2Icon = require('../../../../assets/icons/badge_jumping_in_level2.png'); } catch {}
try { badgeJumpingInMasteryIcon = require('../../../../assets/icons/badge_jumping_in_mastery.png'); } catch {}
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, Animated } from 'react-native';
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
import { TacticalMarquee } from '../../../components/TacticalMarquee';
import {
  defaultUserPreferences,
  UserPreferences,
  UserPreferencesService,
} from '../services/userPreferencesService';

const MIN_LENGTH = day1Mission.durationMin;
const SUPPORTED_LENGTHS = [15, 20, 25, 30];

function buildRoundTripPacing(duration: number) {
  const durationSeconds = duration * 60;
  return [
    { label: 'Start', time: 0 },
    { label: 'Outbound', time: Math.round(durationSeconds * 0.4) },
    { label: 'Turnaround', time: Math.round(durationSeconds * 0.5) },
    { label: 'Return', time: Math.round(durationSeconds * 0.9) },
    { label: 'Complete', time: durationSeconds },
  ];
}

const POIS = [
  { label: 'Turnaround', icon: '◆' },
  { label: 'Return', icon: '■' },
];

function formatElapsed(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

type NoticeTone = 'warning' | 'danger' | 'info';

const MissionDay1Screen = () => {
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
  const [prefs, setPrefs] = useState<UserPreferences>(defaultUserPreferences);
  const [notice, setNotice] = useState<{ title: string; message: string; tone: NoticeTone } | null>(null);
  // Animation state (for future polish)
  const [resultAnim] = useState(new Animated.Value(0));
  // MVP badge/xp state
  const [badge, setBadge] = useState(BadgeService.getBadge());
  const [xp, setXP] = useState(RewardService.getXP());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gpsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gotFirstFix = useRef(false);
  const statusCardAnim = useRef(new Animated.Value(0)).current;
  const mapFocusAnim = useRef(new Animated.Value(0)).current;
  const [statusCardHeight, setStatusCardHeight] = useState(0);
  const pacing = buildRoundTripPacing(workoutLength);
  const storyBeats = [
    'You begin your familiar route.',
    'You reach the outbound checkpoint. The world feels different.',
    'You turn around, keeping the house in mind.',
    'You are on your way back. Something feels off.',
    'Mission complete. Time to report back.'
  ];
  const targetDistanceMeters = Math.round(((day1Mission.distanceMinMiles + day1Mission.distanceMaxMiles) / 2) * 1609.34);
  const isTreadmillMode = prefs.missionMode === 'treadmill';

  function buildSimulatedPath() {
    return [
      { latitude: 37.78825, longitude: -122.4324 },
      { latitude: 37.78945, longitude: -122.4309 },
      { latitude: 37.7901, longitude: -122.4294 },
      { latitude: 37.7892, longitude: -122.4282 },
      { latitude: 37.7877, longitude: -122.4293 },
      { latitude: 37.7869, longitude: -122.4312 },
      { latitude: 37.78825, longitude: -122.4324 },
    ];
  }

  useEffect(() => {
    (async () => {
      const stored = await UserPreferencesService.getPreferences();
      setPrefs(stored);
    })();
  }, []);

  useEffect(() => {
    if (!missionActive) return;
    timerRef.current = setInterval(() => {
      setElapsed(e => e + 1);
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [missionActive]);

  useEffect(() => {
    if (screenStage !== 'active') {
      statusCardAnim.stopAnimation();
      mapFocusAnim.stopAnimation();
      statusCardAnim.setValue(0);
      mapFocusAnim.setValue(0);
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
      return;
    }

    statusCardAnim.setValue(0);
    mapFocusAnim.setValue(0);
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    collapseTimerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(statusCardAnim, {
          toValue: 1,
          duration: 480,
          useNativeDriver: false,
        }),
        Animated.timing(mapFocusAnim, {
          toValue: 1,
          duration: 540,
          useNativeDriver: false,
        }),
      ]).start();
    }, 3000);

    return () => {
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    };
  }, [screenStage, statusCardAnim, mapFocusAnim]);

  // Track user location only for outside mode.
  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let cancelled = false;
    async function startLocationWatch() {
      if (!missionActive || isTreadmillMode) {
        setUserLocation(null);
        return;
      }
      setMapLoading(true);
      // Request permission if not already granted
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setMapLoading(false);
        setGpsStatus('Permission Denied');
        setNotice({
          title: 'Location Permission Needed',
          message: 'Enable location permissions for outside route mode, or switch to treadmill/walking pad.',
          tone: 'warning',
        });
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
    if (missionActive && !isTreadmillMode) startLocationWatch();
    return () => {
      cancelled = true;
      if (subscription) subscription.remove();
    };
  }, [missionActive, isTreadmillMode]);

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
    const totalSeconds = workoutLength * 60;
    const percent = Math.min(100, Math.round((elapsed / totalSeconds) * 100));
    setCompletionPercent(percent);
    // End mission if time is up
    if (elapsed >= totalSeconds) {
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
    setNotice(null);
    if (workoutLength < MIN_LENGTH) {
      setNotice({
        title: 'Workout Too Short',
        message: `Minimum mission length is ${MIN_LENGTH} minutes. Please select a longer workout.`,
        tone: 'warning',
      });
      setScreenStage('length');
      return;
    }
    setMissionActive(true);
    setElapsed(0);
    setPhase('Start');
    setStoryIdx(0);
    setDistance(0);
    setPath([]);
    setGpsStatus(isTreadmillMode ? 'Simulated' : 'Starting...');
    gotFirstFix.current = false;
    const session = SessionService.startSession(day1Mission.id, day1Mission.routeId, workoutLength, pacing.map(p => p.time));

    if (isTreadmillMode) {
      const simulatedPath = buildSimulatedPath();
      setPath(simulatedPath);
      setUserLocation(simulatedPath[0]);
      setMapLoading(false);
      return;
    }

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
          setNotice({
            title: 'Location Error',
            message: 'Could not get your location. Ensure location services are enabled or switch to treadmill/walking pad mode.',
            tone: 'danger',
          });
        }
      }, 10000);
    } catch (e: any) {
      setNotice({
        title: 'Location Error',
        message: e?.message || 'Could not start GPS tracking. Please retry or switch to treadmill mode.',
        tone: 'danger',
      });
      setMissionActive(false);
      setGpsStatus('Error');
      return;
    }
  };

  // Called when user completes or ends mission
  const handleCompleteMission = (early: boolean = false) => {
    if (!isTreadmillMode) {
      GpsService.stopTracking();
    }
    setMissionActive(false);
    setGpsStatus('Idle');
    let percent = Math.min(100, Math.round((elapsed / (workoutLength * 60)) * 100));
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

  const formattedDistance = UserPreferencesService.formatDistanceFromMeters(distance, prefs.distanceUnit);
  const elapsedLabel = formatElapsed(elapsed);
  const goalLabel = formatElapsed(workoutLength * 60);
  const routeProgressLabel = `${completionPercent}%`;
  const routeRemainingLabel = `${Math.max(0, 100 - completionPercent)}% route left`;
  const distanceKm = distance / 1000;
  const elapsedMinutes = elapsed / 60;
  const paceMinPerKm = distanceKm > 0 ? elapsedMinutes / distanceKm : 0;
  const paceMins = Math.floor(paceMinPerKm);
  const paceSecs = Math.floor((paceMinPerKm - paceMins) * 60);
  const paceLabel = distanceKm > 0 ? `${String(paceMins).padStart(2, '0')}:${String(paceSecs).padStart(2, '0')}` : '--:--';
  const objectiveDirection = phase === 'Return' ? 'Bear left · Return route' : 'Bear right · Oak Street';
  const objectiveName = phase === 'Return' ? 'Return Checkpoint' : 'Outbound Checkpoint 3';
  const mapStatusLabel = gpsStatus === 'Simulated' || gpsStatus === 'Tracking' ? 'TRACKING' : gpsStatus.toUpperCase();
  const objectiveDistanceLabel = isTreadmillMode ? routeRemainingLabel : UserPreferencesService.formatDistanceFromMeters(Math.max(0, targetDistanceMeters - distance), prefs.distanceUnit);
  const metricPrimaryValue = isTreadmillMode ? routeProgressLabel : formattedDistance;
  const metricPrimaryLabel = isTreadmillMode ? 'Route' : 'Distance';
  const metricTertiaryValue = isTreadmillMode ? goalLabel : paceLabel;
  const metricTertiaryLabel = isTreadmillMode ? 'Goal' : 'Pace/km';
  const bannerItems = [
    'LIVE MISSION // DAY-01',
    isTreadmillMode ? 'SIMULATED ROUTE ACTIVE' : 'GPS LOCKED',
    `${phase.toUpperCase()} PHASE`,
    prefs.goalType === 'distance' ? 'DISTANCE GOAL ENABLED' : 'TIME GOAL ENABLED',
    mapStatusLabel,
  ];
  const animatedStatusHeight = statusCardHeight > 0
    ? statusCardAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [statusCardHeight, 0],
      })
    : undefined;
  const animatedStatusOpacity = statusCardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const animatedStatusTranslateY = statusCardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });
  const animatedStatusMarginTop = statusCardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });
  const animatedMapTranslateY = mapFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -34],
  });
  const animatedMapScale = mapFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.02],
  });
  const animatedMapMarginTop = mapFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 6],
  });

  // --- UI RENDER ---
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {notice && (
        <PrisonCard
          style={[
            styles.noticeCard,
            notice.tone === 'danger' && { borderColor: colors.incomplete },
            notice.tone === 'warning' && { borderColor: colors.prisonOrange },
            notice.tone === 'info' && { borderColor: colors.accentTeal },
          ]}
        >
          <Text style={[styles.noticeTitle, notice.tone === 'danger' && { color: colors.incomplete }]}>{notice.title}</Text>
          <Text style={styles.noticeMessage}>{notice.message}</Text>
          <PrisonButton title="Dismiss" onPress={() => setNotice(null)} style={styles.noticeBtn} textStyle={{ fontSize: 13, letterSpacing: 1 }} />
        </PrisonCard>
      )}
      {/* Start Screen */}
      {screenStage === 'start' && (
        <PrisonCard style={{ alignItems: 'center', marginTop: 32, backgroundColor: 'rgba(24,24,28,0.98)', borderRadius: 20, shadowColor: colors.prisonOrange, shadowOpacity: 0.12, shadowRadius: 16, elevation: 8 }}>
          <Text style={{ fontSize: 30, fontWeight: "bold", letterSpacing: 1.2, textTransform: "uppercase", color: colors.prisonOrange }}>Day 1: {day1Mission.title}</Text>
          <Text style={{ fontSize: 16, fontWeight: "normal", letterSpacing: 0.1, marginVertical: 12, color: colors.textSecondary }}>Ready to begin your mission?</Text>
          <PrisonButton title="Start Mission" onPress={handleStartMission} shimmer />
        </PrisonCard>
      )}
      {/* Mission Length Selection */}
      {screenStage === 'length' && (
        <PrisonCard style={{ alignItems: 'center', marginTop: 32, backgroundColor: 'rgba(24,24,28,0.98)', borderRadius: 20, shadowColor: colors.prisonOrange, shadowOpacity: 0.12, shadowRadius: 16, elevation: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", letterSpacing: 0.5, textTransform: 'uppercase', color: colors.prisonOrange }}>Select Mission Length</Text>
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
          <PrisonButton title="Confirm & Begin" onPress={handleLengthConfirm} shimmer />
        </PrisonCard>
      )}
      {/* Briefing/Transition */}
      {screenStage === 'briefing' && (
        <PrisonCard style={{ alignItems: 'center', marginTop: 32, backgroundColor: colors.prisonOrange }}>
            <Text style={{ fontSize: 30, fontWeight: "bold", letterSpacing: 1.2, textTransform: 'uppercase', color: colors.white }}>Mission Briefing</Text>
            <Text style={{ fontSize: 16, fontWeight: "normal", letterSpacing: 0.1, color: colors.white, marginVertical: 12 }}>Get ready! Your mission is about to begin...</Text>
        </PrisonCard>
      )}
      {/* Mission Active */}
      {screenStage === 'active' && (
        <>
          <TacticalMarquee items={bannerItems} tone="orange" style={styles.topBanner} />
          <View style={styles.activeHero}>
            <Text style={styles.heroTag}>// Live Mission · Day-01</Text>
            <Text style={styles.heroTitle}>{day1Mission.title}</Text>
            <Text style={styles.heroSubtitle}>Stay sharp. Every step is data.</Text>
            <View style={styles.heroProgressTrack}>
              <View style={[styles.heroProgressFill, { width: `${completionPercent}%` }]} />
            </View>
            <View style={styles.heroProgressRow}>
              <Text style={styles.heroProgressLabel}>{completionPercent}% complete</Text>
              <Text style={styles.heroProgressLabel}>{elapsedLabel} / {goalLabel}</Text>
            </View>
            <View style={styles.heroChipRow}>
              <View style={styles.heroChip}><Text style={styles.heroChipText}>{isTreadmillMode ? 'SIMULATED ROUTE' : 'GPS TRACKING'}</Text></View>
              <View style={styles.heroChip}><Text style={styles.heroChipText}>{prefs.goalType === 'distance' ? 'DISTANCE GOAL' : 'TIME GOAL'}</Text></View>
            </View>
          </View>
          <Animated.View
            style={[
              styles.statusCardWrap,
              {
                marginTop: animatedStatusMarginTop,
                opacity: animatedStatusOpacity,
                transform: [{ translateY: animatedStatusTranslateY }],
                height: animatedStatusHeight,
              },
            ]}
          >
            <View
              onLayout={(event) => {
                if (!statusCardHeight) {
                  setStatusCardHeight(Math.ceil(event.nativeEvent.layout.height));
                }
              }}
            >
              <PrisonCard style={styles.activeCard}>
                <Text style={styles.activeTitle}>Status: {missionActive ? 'Active' : 'Not Started'}</Text>
                <Text style={styles.activeMetaText}>Elapsed: {elapsedLabel} / {goalLabel}</Text>
                <Text style={styles.activeMetaText}>Phase: {phase}</Text>
                <Text style={styles.activeMetaText}>{isTreadmillMode ? `Route Progress: ${routeProgressLabel}` : `Distance: ${formattedDistance}`}</Text>
                <Text style={styles.activeMetaText}>Mode: {isTreadmillMode ? 'Treadmill/Walking Pad' : 'Outside Route'}</Text>
                <Text style={styles.activeMetaText}>Goal Type: {prefs.goalType === 'distance' ? 'Distance' : 'Time'}</Text>
                <Text style={styles.activeMetaText}>GPS: {gpsStatus}</Text>
                <Text style={[styles.activeMetaText, styles.activeObjective]}>Current Objective: {storyBeats[storyIdx]}</Text>
              </PrisonCard>
            </View>
          </Animated.View>
          <Animated.View
            style={[
              styles.mapFocusWrap,
              {
                marginTop: animatedMapMarginTop,
                transform: [{ translateY: animatedMapTranslateY }, { scale: animatedMapScale }],
              },
            ]}
          >
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
              mode={isTreadmillMode ? 'simulated' : 'gps'}
              progressPercent={completionPercent}
              statusLabel={mapStatusLabel}
              progressLabel={isTreadmillMode ? routeRemainingLabel.toUpperCase() : `${objectiveDistanceLabel.toUpperCase()} LEFT`}
              objectiveDirection={objectiveDirection}
              objectiveName={objectiveName}
              objectiveDistance={objectiveDistanceLabel}
              elapsedLabel={elapsedLabel}
              metricPrimaryValue={metricPrimaryValue}
              metricPrimaryLabel={metricPrimaryLabel}
              metricTertiaryValue={metricTertiaryValue}
              metricTertiaryLabel={metricTertiaryLabel}
              focusProgress={mapFocusAnim}
            />
          </Animated.View>
          <PrisonButton
            title="End Mission Early"
            onPress={() => handleCompleteMission(true)}
            shimmer
            style={styles.endMissionBtn}
            textStyle={styles.endMissionBtnText}
          />
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
            <Text style={{ fontSize: 16, fontWeight: "normal", letterSpacing: 0.1, color: colors.text, marginVertical: 8 }}>Completion: {completionPercent}%</Text>
            {missionEndedEarly ? (
              <Text style={{ fontSize: 16, fontWeight: "normal", letterSpacing: 0.1, color: colors.incomplete, marginVertical: 8 }}>Workout logged. Mission incomplete. Your mission will resume next time.</Text>
            ) : (
              <Text style={{ fontSize: 16, fontWeight: "normal", letterSpacing: 0.1, color: colors.complete, marginVertical: 8 }}>Great job! You completed your mission.</Text>
            )}
            {partialPoints > 0 && missionEndedEarly && (
              <Text style={{ fontSize: 16, fontWeight: "normal", letterSpacing: 0.1, color: colors.xp }}>Partial points awarded: {partialPoints}</Text>
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
            <PrisonButton title="Continue" onPress={() => navigation.navigate && navigation.navigate('ReportBack' as never)} style={{ marginTop: 16 }} />
          </ResultModule>
        </Animated.View>
      )}
    </ScrollView>
  );
};

export default MissionDay1Screen;

const styles = StyleSheet.create({
  container: { backgroundColor: '#0D0D0F', minHeight: Dimensions.get('window').height },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  activeHero: {
    marginTop: 16,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#111114',
    borderWidth: 1,
    borderColor: 'rgba(255,106,0,0.18)',
    shadowColor: colors.prisonOrange,
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  topBanner: {
    marginTop: 10,
    marginHorizontal: 2,
    marginBottom: 8,
  },
  heroTag: {
    ...typography.monoLabel,
    color: colors.prisonOrange,
    marginBottom: 4,
  },
  heroTitle: {
    ...typography.headline,
    color: colors.text,
    marginBottom: 6,
  },
  heroSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 14,
  },
  heroProgressTrack: {
    height: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  heroProgressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.prisonOrange,
  },
  heroProgressRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroProgressLabel: {
    ...typography.monoLabel,
    color: colors.textSecondary,
    fontSize: 11,
  },
  heroChipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    flexWrap: 'wrap',
  },
  heroChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(35,35,41,0.9)',
  },
  heroChipText: {
    ...typography.monoLabel,
    color: colors.text,
    fontSize: 11,
  },
  statusCardWrap: {
    overflow: 'hidden',
  },
  activeCard: {
    borderColor: colors.prisonOrange,
    borderWidth: 1.5,
    borderRadius: 20,
    backgroundColor: 'rgba(24,24,28,0.96)',
    shadowColor: colors.prisonOrange,
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
  },
  activeTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.prisonOrange,
    marginBottom: 8,
    ...typography.h2,
  },
  activeMetaText: {
    fontSize: 17,
    color: colors.text,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  activeObjective: {
    marginTop: 6,
    color: colors.textSecondary,
  },
  mapFocusWrap: {
    transformOrigin: 'center',
  },
  endMissionBtn: {
    marginTop: 10,
    backgroundColor: colors.incomplete,
    borderColor: '#ff6f8d',
    borderWidth: 1,
    shadowColor: colors.incomplete,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  endMissionBtnText: {
    color: colors.white,
    letterSpacing: 1.6,
    fontSize: 16,
  },
  noticeCard: {
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: 'rgba(24,24,28,0.96)',
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: colors.prisonOrange,
  },
  noticeMessage: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  noticeBtn: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
});
