
import React, { useState } from 'react';
import { View, Text, Button, ScrollView, Alert } from 'react-native';
import { day1Mission, day1Triggers, day1Artifact, day1ReportBack } from '../data/day1.mission';
import { SessionService } from '../services/sessionService';
import { ArtifactService } from '../services/artifactService';
import { useNavigation } from '@react-navigation/native';
import { GpsService } from '../services/gpsService';

export const MissionDebugScreen = () => {
  const navigation = useNavigation();
  const [workoutLength, setWorkoutLength] = useState<number>(20);
  const [missionActive, setMissionActive] = useState(false);

  const minLength = day1Mission.durationMin;
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
    const session = SessionService.startSession(day1Mission.id, day1Mission.routeId);
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
    ArtifactService.awardArtifact(day1Artifact, SessionService.getSession()?.id || '', day1Mission.chapterId, 'player1');
    SessionService.completeSession(day1Artifact.id, '', 'standard');
    navigation.navigate('ReportBack');
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 20 }}>{day1Mission.title}</Text>
      <Text>Theme: {day1Mission.theme}</Text>
      <Text>Status: {day1Mission.status}</Text>
      <Text>Duration: {day1Mission.durationMin}-{day1Mission.durationMax} min</Text>
      <Text>Distance: {day1Mission.distanceMinMiles}-{day1Mission.distanceMaxMiles} mi</Text>
      <Text>Route ID: {day1Mission.routeId}</Text>
      <Text>Intro Audio: {day1Mission.introAudioKey}</Text>
      <Text>Completion Audio: {day1Mission.completionAudioKey}</Text>
      <Text style={{ marginTop: 16, fontWeight: 'bold' }}>Triggers</Text>
      {day1Triggers.map(trigger => (
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
