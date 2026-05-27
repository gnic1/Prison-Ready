
import React, { useState } from 'react';
import { View, Text, Button, ScrollView, Alert } from 'react-native';
import { SessionService } from '../services/sessionService';
import { ArtifactService } from '../services/artifactService';
import { useNavigation } from '@react-navigation/native';
import { GpsService } from '../services/gpsService';
import { MissionRepository } from '../services/missionRepository';

export const MissionDebugScreen = () => {
  const navigation = useNavigation<any>();
  const [workoutLength, setWorkoutLength] = useState<number>(20);
  const [missionActive, setMissionActive] = useState(false);
  const mission = MissionRepository.getPrimaryMission();
  const triggers = MissionRepository.getTriggersForMission(mission.id);
  const artifact = MissionRepository.getArtifactForMission(mission.id) || MissionRepository.getPrimaryArtifact();

  const minLength = mission.durationMin;
  const supportedLengths = [15, 20, 25, 30];

  function buildMissionPacing(duration: number): number[] {
    // Simple pacing: checkpoints at 25%, 50%, 75%, 100%
    return [0.25, 0.5, 0.75, 1].map(f => Math.round(duration * f));
  }

  const handleStartMission = async () => {
    if (workoutLength < minLength) {
      Alert.alert('Workout Too Short', `Minimum mission length is ${minLength} minutes. Please select a longer workout.`);
      return;
    }
    setMissionActive(true);
    const pacingCheckpoints = buildMissionPacing(workoutLength);
    const session = SessionService.startSession(mission.id, mission.routeId);
    session.workoutLength = workoutLength;
    session.pacingCheckpoints = pacingCheckpoints;
    // Start GPS tracking
    try {
      await GpsService.startTracking(state => {
        session.gpsSessionState = state;
      });
    } catch (e: any) {
      Alert.alert('Location Error', e.message || 'Could not start GPS tracking.');
      setMissionActive(false);
      return;
    }
    // Simulate mission pacing (for MVP, just wait and allow manual completion)
  };

  const handleCompleteMission = () => {
    GpsService.stopTracking();
    setMissionActive(false);
    ArtifactService.awardArtifact(artifact, SessionService.getSession()?.id || '', mission.chapterId, 'player1');
    SessionService.completeSession(artifact.id, '', 'strong');
    navigation.navigate('ReportBack');
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 20 }}>{mission.title}</Text>
      <Text>Theme: {mission.theme}</Text>
      <Text>Status: {mission.status}</Text>
      <Text>Duration: {mission.durationMin}-{mission.durationMax} min</Text>
      <Text>Distance: {mission.distanceMinMiles}-{mission.distanceMaxMiles} mi</Text>
      <Text>Route ID: {mission.routeId}</Text>
      <Text>Intro Audio: {mission.introAudioKey}</Text>
      <Text>Completion Audio: {mission.completionAudioKey}</Text>
      <Text style={{ marginTop: 16, fontWeight: 'bold' }}>Triggers</Text>
      {triggers.map(trigger => (
        <View key={trigger.id} style={{ marginBottom: 8 }}>
          <Text>Type: {trigger.type}</Text>
          <Text>Text: {trigger.text}</Text>
        </View>
      ))}

      <Text style={{ marginTop: 16, fontWeight: 'bold' }}>Select Workout Length (min)</Text>
      <View style={{ flexDirection: 'row', marginVertical: 8 }}>
        {supportedLengths.map(len => (
          <Button
            key={len}
            title={len.toString()}
            onPress={() => setWorkoutLength(len)}
            color={workoutLength === len ? 'green' : undefined}
          />
        ))}
      </View>
      <Text>Selected: {workoutLength} min</Text>

      {!missionActive && (
        <Button title="Start Mission" onPress={handleStartMission} />
      )}
      {missionActive && (
        <Button title="Complete Mission (MVP)" onPress={handleCompleteMission} color="orange" />
      )}
      <Button title="Story So Far" onPress={() => navigation.navigate('StorySoFar')} />
    </ScrollView>
  );
};
