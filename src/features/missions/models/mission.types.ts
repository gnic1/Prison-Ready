export interface Mission {
  id: string;
  chapterId: string;
  dayNumber: number;
  title: string;
  theme: string;
  status: MissionStatus;
  durationMin: number;
  durationMax: number;
  distanceMinMiles: number;
  distanceMaxMiles: number;
  routeId: string;
  introAudioKey: string;
  completionAudioKey: string;
  primaryArtifactId: string;
  reportBackId: string;
  triggerIds: string[];
}

export type MissionStatus = 'not_started' | 'active' | 'completed' | 'abandoned';
