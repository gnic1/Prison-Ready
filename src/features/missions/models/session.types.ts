export type MissionSessionStatus = 'not_started' | 'active' | 'paused' | 'completed' | 'abandoned';
export type MissionSessionCompletionResult = 'standard' | 'partial' | 'abandoned';

export interface MissionSession {
  id: string;
  missionId: string;
  routeId: string;
  startedAt: string;
  endedAt?: string;
  status: MissionSessionStatus;
  progress: number;
  routeState?: any; // TODO: Define route state type if needed
  artifactIdsEarned: string[];
  reportBackOptionId?: string;
  xpEarned: number;
  completionResult: MissionSessionCompletionResult;
  outcomeBand?: 'strong' | 'partial' | 'poor';
  recapEntry?: string;
  workoutLength?: number; // in minutes
  pacingCheckpoints?: number[]; // in minutes
  gpsSessionState?: {
    active: boolean;
    positions: { latitude: number; longitude: number; timestamp: number }[];
    totalDistance: number; // meters
  };
}
