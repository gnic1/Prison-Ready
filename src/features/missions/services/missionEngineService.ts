import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { ActiveMissionState, MissionPathPoint, MissionQueuedBeat, MissionTranscriptEntry, StartMissionInput } from '../models/missionEngine.types';
import { MissionTrigger } from '../models/trigger.types';
import { MissionNotificationService } from './missionNotificationService';
import { MissionRepository } from './missionRepository';

const ACTIVE_MISSION_KEY = 'prison_ready_active_mission_v2';
const MISSION_HISTORY_KEY = 'prison_ready_mission_history_v2';
const MAX_PATH_POINTS = 80;

export const MISSION_LOCATION_TASK = 'prison-ready-mission-location-task';

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadius = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}

function getMissionConfig(missionId: string) {
  const mission = MissionRepository.getMissionById(missionId);
  if (!mission) {
    throw new Error(`Unsupported mission: ${missionId}`);
  }
  return {
    mission,
    triggers: MissionRepository.getTriggersForMission(missionId),
  };
}

function buildTranscriptEntry(
  id: string,
  title: string,
  text: string,
  kind: MissionTranscriptEntry['kind'],
  progressPercent: number
): MissionTranscriptEntry {
  return {
    id,
    title,
    text,
    kind,
    progressPercent,
    createdAt: new Date().toISOString(),
  };
}

async function saveActiveMission(state: ActiveMissionState | null) {
  if (!state) {
    await AsyncStorage.removeItem(ACTIVE_MISSION_KEY);
    return;
  }
  await AsyncStorage.setItem(ACTIVE_MISSION_KEY, JSON.stringify(state));
}

async function loadMissionHistory(): Promise<ActiveMissionState[]> {
  const stored = await AsyncStorage.getItem(MISSION_HISTORY_KEY);
  if (!stored) {
    return [];
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveMissionHistory(history: ActiveMissionState[]) {
  await AsyncStorage.setItem(MISSION_HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
}

async function upsertHistoryItem(state: ActiveMissionState) {
  const history = await loadMissionHistory();
  const next = [state, ...history.filter((item) => item.sessionId !== state.sessionId)];
  await saveMissionHistory(next);
}

function calculateProgress(state: ActiveMissionState) {
  if (state.goalType === 'distance') {
    if (!state.targetDistanceMeters) {
      return 0;
    }
    return Math.min(100, Math.round((state.totalDistanceMeters / state.targetDistanceMeters) * 100));
  }
  if (!state.targetDurationSec) {
    return 0;
  }
  return Math.min(100, Math.round((state.elapsedSeconds / state.targetDurationSec) * 100));
}

function shouldFireTrigger(
  trigger: MissionTrigger,
  previousProgress: number,
  currentProgress: number,
  previousElapsedSeconds: number,
  currentElapsedSeconds: number
) {
  if (trigger.activationMode === 'time') {
    const targetSec = trigger.timeSec ?? 0;
    if (targetSec === 0 && previousElapsedSeconds === 0 && currentElapsedSeconds === 0) {
      return true;
    }
    return previousElapsedSeconds < targetSec && currentElapsedSeconds >= targetSec;
  }
  if (trigger.progressMin === 0 && previousProgress === 0 && currentProgress === 0) {
    return true;
  }
  return previousProgress < trigger.progressMin && currentProgress >= trigger.progressMin;
}

function buildBeat(trigger: MissionTrigger, progressPercent: number, source: MissionQueuedBeat['source']): MissionQueuedBeat {
  const title = trigger.title || (
    trigger.type === 'artifactReveal'
      ? 'Artifact unlocked'
      : trigger.type === 'missionComplete'
        ? 'Mission complete'
        : 'Story update');
  return {
    id: `${trigger.id}_${Date.now()}`,
    triggerId: trigger.id,
    title,
    text: trigger.text,
    unlockedAt: new Date().toISOString(),
    progressPercent,
    source,
  };
}

function appendPathPoint(path: MissionPathPoint[], point: MissionPathPoint) {
  const next = [...path, point];
  if (next.length <= MAX_PATH_POINTS) {
    return next;
  }
  return next.slice(next.length - MAX_PATH_POINTS);
}

async function markMissionFinished(state: ActiveMissionState, status: ActiveMissionState['status']) {
  const finishedState: ActiveMissionState = {
    ...state,
    status,
    updatedAt: new Date().toISOString(),
    endedAt: new Date().toISOString(),
    completionPercent: state.progressPercent,
  };
  await saveActiveMission(status === 'active' ? finishedState : null);
  await upsertHistoryItem(finishedState);
  return finishedState;
}

export const MissionEngineService = {
  async getActiveMission(): Promise<ActiveMissionState | null> {
    const stored = await AsyncStorage.getItem(ACTIVE_MISSION_KEY);
    if (!stored) {
      return null;
    }
    try {
      return JSON.parse(stored) as ActiveMissionState;
    } catch {
      return null;
    }
  },

  async getMissionHistory() {
    return loadMissionHistory();
  },

  async getLatestMissionRecord() {
    const active = await this.getActiveMission();
    if (active) {
      return active;
    }
    const history = await loadMissionHistory();
    return history[0] ?? null;
  },

  async clearMissionData() {
    await saveActiveMission(null);
    await saveMissionHistory([]);
    return true;
  },

  async requestMissionPermissions() {
    await MissionNotificationService.requestPermissions();
    const foreground = await Location.requestForegroundPermissionsAsync();
    if (foreground.status !== 'granted') {
      throw new Error('Foreground location permission is required for outside missions.');
    }
    const background = await Location.requestBackgroundPermissionsAsync();
    return { foreground, background };
  },

  async startMission(input: StartMissionInput) {
    const missionBundle = getMissionConfig(input.missionId);
    const baseProgress = 0;
    const state: ActiveMissionState = {
      sessionId: `mission_session_${Date.now()}`,
      missionId: input.missionId,
      routeId: input.routeId,
      themeKey: input.themeKey,
      status: 'active',
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      goalType: input.goalType,
      missionMode: input.missionMode,
      distanceUnit: input.distanceUnit,
      preferredMissionStyle: input.preferredMissionStyle,
      targetDistanceMeters: input.targetDistanceMeters,
      targetDurationSec: input.targetDurationSec,
      totalDistanceMeters: 0,
      elapsedSeconds: 0,
      progressPercent: baseProgress,
      path: [],
      firedTriggerIds: [],
      queuedBeats: [],
      transcript: [
        buildTranscriptEntry('mission_brief', 'Mission Brief', missionBundle.mission.story, 'brief', 0),
      ],
      artifactIdsEarned: [],
      completionResult: 'standard',
    };

    const startTrigger = missionBundle.triggers.find((trigger) => trigger.progressMin === 0);
    if (startTrigger) {
      const beat = buildBeat(startTrigger, 0, 'foreground');
      state.firedTriggerIds.push(startTrigger.id);
      state.queuedBeats.push(beat);
      state.transcript.push(buildTranscriptEntry(beat.id, beat.title, beat.text, 'beat', 0));
    }

    let startedBackgroundTracking = false;
    if (input.missionMode === 'outside') {
      await this.requestMissionPermissions();
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(MISSION_LOCATION_TASK);
      if (!hasStarted) {
        await Location.startLocationUpdatesAsync(MISSION_LOCATION_TASK, {
          accuracy: Location.Accuracy.Balanced,
          activityType: Location.ActivityType.Fitness,
          distanceInterval: 5,
          deferredUpdatesDistance: 20,
          deferredUpdatesInterval: 60000,
          pausesUpdatesAutomatically: false,
          foregroundService: {
            notificationTitle: 'Mission tracking active',
            notificationBody: 'Prison Ready is keeping your mission moving in the background.',
            notificationColor: '#FF6A00',
            killServiceOnDestroy: false,
          },
        });
        startedBackgroundTracking = true;
      }
    }

    try {
      await saveActiveMission(state);
      await upsertHistoryItem(state);
      return state;
    } catch (error) {
      if (startedBackgroundTracking) {
        await this.stopBackgroundTracking();
      }
      throw error;
    }
  },

  async processLocationBatch(locations: Array<{ coords: { latitude: number; longitude: number }; timestamp: number }>, source: MissionQueuedBeat['source']) {
    const state = await this.getActiveMission();
    if (!state || state.status !== 'active') {
      return null;
    }
    const missionBundle = getMissionConfig(state.missionId);
    const newBeats: MissionQueuedBeat[] = [];
    let previousProgress = state.progressPercent;
    let previousElapsedSeconds = state.elapsedSeconds;

    for (const location of locations) {
      if (!location?.coords) {
        continue;
      }
      if (state.lastLocationTimestamp && location.timestamp <= state.lastLocationTimestamp) {
        continue;
      }
      const point: MissionPathPoint = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
      };
      if (state.lastKnownLocation) {
        const segmentDistance = getDistance(
          state.lastKnownLocation.latitude,
          state.lastKnownLocation.longitude,
          point.latitude,
          point.longitude
        );
        if (segmentDistance > 0.8 && segmentDistance < 1500) {
          state.totalDistanceMeters += segmentDistance;
        }
      }
      state.lastKnownLocation = point;
      state.lastLocationTimestamp = point.timestamp;
      state.elapsedSeconds = Math.max(
        state.elapsedSeconds,
        Math.round((point.timestamp - new Date(state.startedAt).getTime()) / 1000)
      );
      state.path = appendPathPoint(state.path, point);
      state.progressPercent = calculateProgress(state);

      for (const trigger of missionBundle.triggers) {
        if (state.firedTriggerIds.includes(trigger.id)) {
          continue;
        }
        if (!shouldFireTrigger(trigger, previousProgress, state.progressPercent, previousElapsedSeconds, state.elapsedSeconds)) {
          continue;
        }
        const beat = buildBeat(trigger, state.progressPercent, source);
        state.firedTriggerIds.push(trigger.id);
        state.queuedBeats.push(beat);
        state.transcript.push(buildTranscriptEntry(beat.id, beat.title, beat.text, 'beat', state.progressPercent));
        newBeats.push(beat);
      }
      previousProgress = state.progressPercent;
      previousElapsedSeconds = state.elapsedSeconds;
    }

    state.updatedAt = new Date().toISOString();
    await saveActiveMission(state);
    await upsertHistoryItem(state);

    for (const beat of newBeats) {
      if (source === 'background') {
        await MissionNotificationService.notifyMilestone(beat);
      }
    }

    if (state.progressPercent >= 100) {
      const primaryArtifactId = missionBundle.mission.primaryArtifactId;
      const completed = await markMissionFinished(
        {
          ...state,
          status: 'completed',
          completionResult: 'standard',
          completionPercent: 100,
          artifactIdsEarned: state.artifactIdsEarned.includes(primaryArtifactId)
            ? state.artifactIdsEarned
            : [...state.artifactIdsEarned, primaryArtifactId],
        },
        'completed'
      );
      return { state: completed, newBeats };
    }

    return { state, newBeats };
  },

  async acknowledgeQueuedBeats() {
    const state = await this.getActiveMission();
    if (!state) {
      return null;
    }
    state.queuedBeats = state.queuedBeats.map((beat) => ({
      ...beat,
      acknowledgedAt: beat.acknowledgedAt ?? new Date().toISOString(),
    }));
    state.updatedAt = new Date().toISOString();
    await saveActiveMission(state);
    await upsertHistoryItem(state);
    return state;
  },

  async abandonMission(partialPoints: number = 0) {
    const state = await this.getActiveMission();
    if (!state) {
      return null;
    }
    const stopped = await Location.hasStartedLocationUpdatesAsync(MISSION_LOCATION_TASK);
    if (stopped) {
      await Location.stopLocationUpdatesAsync(MISSION_LOCATION_TASK);
    }
    const nextState = {
      ...state,
      status: 'abandoned' as const,
      completionResult: 'abandoned' as const,
      partialPoints,
      completionPercent: state.progressPercent,
    };
    return markMissionFinished(nextState, 'abandoned');
  },

  async applyReportBack(reportBackOptionId: string, outcomeBand: 'strong' | 'partial' | 'poor', recapEntry: string) {
    const latest = await this.getLatestMissionRecord();
    if (!latest) {
      return null;
    }
    const next = {
      ...latest,
      reportBackOptionId,
      outcomeBand,
      recapEntry,
      transcript: [
        ...latest.transcript,
        buildTranscriptEntry(`report_${Date.now()}`, 'Report Back', recapEntry, 'report', latest.progressPercent),
      ],
    };
    await upsertHistoryItem(next);
    return next;
  },

  async tickTreadmill() {
    const state = await this.getActiveMission();
    if (!state || state.status !== 'active' || state.missionMode === 'outside') {
      return null;
    }
    const missionBundle = getMissionConfig(state.missionId);
    const nowSec = Math.floor((Date.now() - new Date(state.startedAt).getTime()) / 1000);
    if (nowSec <= state.elapsedSeconds) {
      return { state, newBeats: [] };
    }
    const previousProgress = state.progressPercent;
    const previousElapsedSeconds = state.elapsedSeconds;
    state.elapsedSeconds = nowSec;
    state.progressPercent = calculateProgress(state);
    const newBeats: MissionQueuedBeat[] = [];

    for (const trigger of missionBundle.triggers) {
      if (state.firedTriggerIds.includes(trigger.id)) {
        continue;
      }
      if (!shouldFireTrigger(trigger, previousProgress, state.progressPercent, previousElapsedSeconds, state.elapsedSeconds)) {
        continue;
      }
      const beat = buildBeat(trigger, state.progressPercent, 'foreground');
      state.firedTriggerIds.push(trigger.id);
      state.queuedBeats.push(beat);
      state.transcript.push(buildTranscriptEntry(beat.id, beat.title, beat.text, 'beat', state.progressPercent));
      newBeats.push(beat);
    }

    state.updatedAt = new Date().toISOString();

    if (state.progressPercent >= 100) {
      const primaryArtifactId = missionBundle.mission.primaryArtifactId;
      const completed = await markMissionFinished(
        {
          ...state,
          status: 'completed',
          completionResult: 'standard',
          completionPercent: 100,
          artifactIdsEarned: state.artifactIdsEarned.includes(primaryArtifactId)
            ? state.artifactIdsEarned
            : [...state.artifactIdsEarned, primaryArtifactId],
        },
        'completed'
      );
      return { state: completed, newBeats };
    }

    await saveActiveMission(state);
    await upsertHistoryItem(state);
    return { state, newBeats };
  },

  async stopBackgroundTracking() {
    const started = await Location.hasStartedLocationUpdatesAsync(MISSION_LOCATION_TASK);
    if (started) {
      await Location.stopLocationUpdatesAsync(MISSION_LOCATION_TASK);
    }
  },

  async seedReviewMissionState(variant: 'active' | 'completed') {
    const mission = MissionRepository.getPrimaryMission();
    const triggers = MissionRepository.getTriggersForMission(mission.id);
    const artifact = MissionRepository.getArtifactForMission(mission.id) || MissionRepository.getPrimaryArtifact();
    const now = Date.now();
    const baseTranscript: MissionTranscriptEntry[] = [
      buildTranscriptEntry('review_brief', 'Mission Brief', mission.story, 'brief', 0),
      buildTranscriptEntry('review_beat_1', triggers[0]?.title || 'Story update', triggers[0]?.text || 'Mission begins.', 'beat', 0),
      buildTranscriptEntry('review_beat_2', triggers[1]?.title || 'Story update', triggers[1]?.text || 'The route starts tightening.', 'beat', 18),
      buildTranscriptEntry('review_beat_3', triggers[2]?.title || 'Story update', triggers[2]?.text || 'The team is closing in.', 'beat', 42),
    ];

    const baseState: ActiveMissionState = {
      sessionId: `review_session_${variant}`,
      missionId: mission.id,
      routeId: mission.routeId,
      themeKey: 'prison',
      status: variant,
      startedAt: new Date(now - 9 * 60 * 1000).toISOString(),
      updatedAt: new Date(now).toISOString(),
      goalType: 'minutes',
      missionMode: 'treadmill',
      distanceUnit: 'km',
      preferredMissionStyle: 'balanced',
      targetDurationSec: 30 * 60,
      totalDistanceMeters: 1420,
      elapsedSeconds: variant === 'active' ? 540 : 1800,
      progressPercent: variant === 'active' ? 30 : 100,
      path: [],
      firedTriggerIds: triggers.slice(0, variant === 'active' ? 3 : triggers.length).map((trigger) => trigger.id),
      queuedBeats: variant === 'active'
        ? [
            buildBeat(triggers[3] || triggers[0], 30, 'foreground'),
            buildBeat(triggers[4] || triggers[1] || triggers[0], 30, 'foreground'),
          ]
        : [],
      transcript: variant === 'active'
        ? baseTranscript
        : [
            ...baseTranscript,
            buildTranscriptEntry('review_beat_4', triggers[3]?.title || 'Drop found', triggers[3]?.text || 'The artifact is in play.', 'beat', 78),
            buildTranscriptEntry('review_beat_5', 'Mission complete', 'The route paid out and the team is ready to debrief.', 'beat', 100),
          ],
      artifactIdsEarned: variant === 'completed' ? [artifact.id] : [],
      completionResult: 'standard',
      endedAt: variant === 'completed' ? new Date(now - 60 * 1000).toISOString() : undefined,
      completionPercent: variant === 'completed' ? 100 : undefined,
    };

    await saveMissionHistory([baseState]);
    if (variant === 'active') {
      await saveActiveMission(baseState);
      return baseState;
    }
    await saveActiveMission(null);
    return baseState;
  },
};
