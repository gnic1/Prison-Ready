
import React from 'react';
import { View, Text } from 'react-native';
import { ArtifactService } from '../../missions/services/artifactService';
import { day1Artifact } from '../../missions/data/day1.mission';
import { SessionService } from '../../missions/services/sessionService';

export const ArtifactsScreen = () => {
  const artifacts = ArtifactService.getPlayerArtifacts();
  const earned = artifacts.find(a => a.artifactId === day1Artifact.id);
  const session = SessionService.getSession();

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Artifacts</Text>
      {earned ? (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontWeight: 'bold' }}>{day1Artifact.title}</Text>
          <Text>{day1Artifact.summary}</Text>
          <Text>Truth Level: {day1Artifact.truthLevel}</Text>
          <Text>Type: {day1Artifact.type}</Text>
          {session?.outcomeBand && (
            <Text style={{ marginTop: 8 }}>Outcome: {session.outcomeBand}</Text>
          )}
          {session?.recapEntry && (
            <Text style={{ marginTop: 8 }}>Recap: {session.recapEntry}</Text>
          )}
        </View>
      ) : (
        <Text style={{ marginTop: 16 }}>No artifacts earned yet.</Text>
      )}
    </View>
  );
};
