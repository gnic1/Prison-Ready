import { Artifact, PlayerArtifact } from '../models/artifact.types';

let playerArtifacts: PlayerArtifact[] = [];

export const ArtifactService = {
  awardArtifact(artifact: Artifact, missionSessionId: string, chapterId: string, playerId: string) {
    const earned: PlayerArtifact = {
      id: `playerartifact_${Date.now()}`,
      playerId,
      artifactId: artifact.id,
      earnedAt: new Date().toISOString(),
      missionSessionId,
      chapterId,
      isViewed: false,
    };
    playerArtifacts.push(earned);
    return earned;
  },
  getPlayerArtifacts(): PlayerArtifact[] {
    return playerArtifacts;
  },
  markViewed(artifactId: string) {
    playerArtifacts = playerArtifacts.map(a => a.artifactId === artifactId ? { ...a, isViewed: true } : a);
  },
  reset() {
    playerArtifacts = [];
  },
};
