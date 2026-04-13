export type ArtifactType = 'clue' | 'intel' | 'contradiction';
export type ArtifactTruthLevel = 'distorted' | 'partial' | 'strong';

export interface Artifact {
  id: string;
  missionId: string;
  chapterId: string;
  type: ArtifactType;
  title: string;
  summary: string;
  truthLevel: ArtifactTruthLevel;
  rarity: number;
  isGuaranteed: boolean;
  unlockCondition: string;
}

export interface PlayerArtifact {
  id: string;
  playerId: string;
  artifactId: string;
  earnedAt: string;
  missionSessionId: string;
  chapterId: string;
  isViewed: boolean;
}
