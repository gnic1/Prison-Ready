export type MissionTriggerType = 'storyBeat' | 'artifactReveal' | 'missionComplete';
export type MissionTriggerActivationMode = 'progress' | 'time';

export interface MissionTrigger {
  id: string;
  missionId: string;
  type: MissionTriggerType;
  activationMode?: MissionTriggerActivationMode;
  progressMin: number;
  progressMax: number;
  timeSec?: number;
  requiresSafeState: boolean;
  audioKey: string;
  text: string;
  title?: string;
  firesOnce: boolean;
  priority: number;
}
