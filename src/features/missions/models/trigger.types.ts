export type MissionTriggerType = 'storyBeat' | 'artifactReveal' | 'missionComplete';

export interface MissionTrigger {
  id: string;
  missionId: string;
  type: MissionTriggerType;
  progressMin: number;
  progressMax: number;
  requiresSafeState: boolean;
  audioKey: string;
  text: string;
  firesOnce: boolean;
  priority: number;
}
