import { MissionSession, MissionSessionStatus, MissionSessionCompletionResult } from '../models/session.types';

let session: MissionSession | null = null;

export const SessionService = {
  startSession(missionId: string, routeId: string, workoutLength?: number, pacingCheckpoints?: number[]): MissionSession {
    session = {
      id: `session_${Date.now()}`,
      missionId,
      routeId,
      startedAt: new Date().toISOString(),
      status: 'active',
      progress: 0,
      artifactIdsEarned: [],
      xpEarned: 0,
      completionResult: 'standard',
      workoutLength,
      pacingCheckpoints,
      gpsSessionState: undefined,
    };
    return session;
  },
  completeSession(artifactId: string, reportBackOptionId: string, outcomeBand: 'strong' | 'partial' | 'poor' = 'partial', recapEntry?: string) {
    if (!session) return;
    session.status = 'completed';
    session.endedAt = new Date().toISOString();
    session.artifactIdsEarned.push(artifactId);
    session.reportBackOptionId = reportBackOptionId;
    session.completionResult = outcomeBand;
    session.outcomeBand = outcomeBand;
    if (recapEntry) session.recapEntry = recapEntry;
  },
  getSession(): MissionSession | null {
    return session;
  },
  resetSession() {
    session = null;
  },
};
