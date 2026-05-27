import { AppThemeKey } from '../../../theme/themes';
import { DistanceUnit, GoalType, MissionMode, PreferredMissionStyle } from '../services/userPreferencesService';

export interface MissionPathPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface MissionQueuedBeat {
  id: string;
  triggerId: string;
  title: string;
  text: string;
  unlockedAt: string;
  progressPercent: number;
  source: 'foreground' | 'background';
  acknowledgedAt?: string;
}

export interface MissionTranscriptEntry {
  id: string;
  title: string;
  text: string;
  createdAt: string;
  kind: 'brief' | 'beat' | 'system' | 'report';
  progressPercent: number;
}

export interface ActiveMissionState {
  sessionId: string;
  missionId: string;
  routeId: string;
  themeKey: AppThemeKey;
  status: 'active' | 'completed' | 'paused' | 'abandoned';
  startedAt: string;
  updatedAt: string;
  endedAt?: string;
  goalType: GoalType;
  missionMode: MissionMode;
  distanceUnit: DistanceUnit;
  preferredMissionStyle: PreferredMissionStyle;
  targetDistanceMeters?: number;
  targetDurationSec?: number;
  totalDistanceMeters: number;
  elapsedSeconds: number;
  progressPercent: number;
  path: MissionPathPoint[];
  firedTriggerIds: string[];
  queuedBeats: MissionQueuedBeat[];
  transcript: MissionTranscriptEntry[];
  artifactIdsEarned: string[];
  completionResult: 'standard' | 'partial' | 'abandoned';
  outcomeBand?: 'strong' | 'partial' | 'poor';
  reportBackOptionId?: string;
  recapEntry?: string;
  lastLocationTimestamp?: number;
  lastKnownLocation?: MissionPathPoint;
  completionPercent?: number;
  partialPoints?: number;
}

export interface StartMissionInput {
  missionId: string;
  routeId: string;
  themeKey: AppThemeKey;
  goalType: GoalType;
  missionMode: MissionMode;
  distanceUnit: DistanceUnit;
  preferredMissionStyle: PreferredMissionStyle;
  targetDistanceMeters?: number;
  targetDurationSec?: number;
}
