import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Button, ScrollView, Alert, StyleSheet } from 'react-native';
import { day1Mission, day1Triggers } from '../data/day1.mission';
import { SessionService } from '../services/sessionService';
import { GpsService } from '../services/gpsService';
import { RouteService } from '../services/routeService';
import { useNavigation } from '@react-navigation/native';

const MIN_LENGTH = day1Mission.durationMin;
const SUPPORTED_LENGTHS = [15, 20, 25, 30];

function buildRoundTripPacing(duration: number) {
  // Outbound: 40%, Turn: 20%, Return: 40%
  return [
    { label: 'Start', time: 0 },
    { label: 'Outbound', time: Math.round(duration * 0.4) },
    { label: 'Turnaround', time: Math.round(duration * 0.5) },
    { label: 'Return', time: Math.round(duration * 0.9) },
    { label: 'Complete', time: duration },
  ];
}

const POIS = [
  { label: 'Turnaround', icon: '◆' },
  { label: 'Return', icon: '■' },
];

export const MissionDay1Screen = () => {
  const navigation = useNavigation();
  const [workoutLength, setWorkoutLength] = useState<number>(20);
  const [missionActive, setMissionActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState('Start');
  const [distance, setDistance] = useState(0);
  const [storyIdx, setStoryIdx] = useState(0);
  const [gpsStatus, setGpsStatus] = useState('Idle');
  const [path, setPath] = useState<any[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gpsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gotFirstFix = useRef(false);
  const pacing = buildRoundTripPacing(workoutLength);
  const storyBeats = [
    'You begin your familiar route.',
    'You reach the outbound checkpoint. The world feels different.',
    'You turn around, keeping the house in mind.',
    'You are on your way back. Something feels off.',
    'Mission complete. Time to report back.'
  ];

  useEffect(() => {
    if (!missionActive) return;
    timerRef.current = setInterval(() => {
      setElapsed(e => e + 1);
    }, 1000 * 60); // 1 minute
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [missionActive]);

  useEffect(() => {
    if (!missionActive) return;
    // Update phase and story
    for (let i = pacing.length - 1; i >= 0; i--) {
      if (elapsed >= pacing[i].time) {
        setPhase(pacing[i].label);
        setStoryIdx(i);
        break;
      }
    }
    // End mission
    if (elapsed >= workoutLength) {
      handleCompleteMission();
    }
  }, [elapsed, missionActive]);

  const handleStartMission = async () => {
    if (workoutLength < MIN_LENGTH) {
      Alert.alert('Workout Too Short', `Minimum mission length is ${MIN_LENGTH} minutes. Please select a longer workout.`);
      return;
    }
    setMissionActive(true);
    setElapsed(0);
    setPhase('Start');
    setStoryIdx(0);
    setDistance(0);
    setPath([]);
    setGpsStatus('Starting...');
    gotFirstFix.current = false;
    const session = SessionService.startSession(day1Mission.id, day1Mission.routeId, workoutLength, pacing.map(p => p.time));
    try {
      await GpsService.startTracking(state => {
        setDistance(Math.round(state.totalDistance));
        setPath([...state.positions]);
        setGpsStatus(state.active ? 'Tracking' : 'Idle');
        if (!gotFirstFix.current && state.positions.length > 0) {
          gotFirstFix.current = true;
          if (gpsTimeoutRef.current) clearTimeout(gpsTimeoutRef.current);
        }
      });
      // Set a timeout for first GPS fix
      gpsTimeoutRef.current = setTimeout(() => {
        if (!gotFirstFix.current) {
          GpsService.stopTracking();
          setMissionActive(false);
          setGpsStatus('Error');
          Alert.alert('Location Error', 'Could not get your location. Please ensure location services are enabled and try again.');
        }
      }, 10000); // 10 seconds
    } catch (e: any) {
      Alert.alert('Location Error', e.message || 'Could not start GPS tracking.');
      setMissionActive(false);
      setGpsStatus('Error');
      return;
    }
  };

  const handleCompleteMission = () => {
    GpsService.stopTracking();
    setMissionActive(false);
    setGpsStatus('Idle');
    // Save route as routine
    if (path.length > 1) {
      RouteService.saveRoute({
        id: `route_${Date.now()}`,
        name: `Routine Route (${workoutLength} min)`,
        missionId: day1Mission.id,
        duration: workoutLength,
        startLocation: path[0],
        path,
        createdAt: new Date().toISOString(),
      });
    }
    navigation.navigate('ReportBack');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{day1Mission.title}</Text>
      <Text>Status: {missionActive ? 'Active' : 'Not Started'}</Text>
      <Text>Elapsed: {elapsed} min / {workoutLength} min</Text>
      <Text>Phase: {phase}</Text>
      <Text>Distance: {distance} m</Text>
      <Text>GPS: {gpsStatus}</Text>
      <Text>Current Objective: {storyBeats[storyIdx]}</Text>
      <Text style={{ marginTop: 12, fontWeight: 'bold' }}>POI Markers (Proof of Concept):</Text>
      <View style={{ flexDirection: 'row', marginVertical: 8 }}>
        {POIS.map((poi, idx) => (
          <View key={idx} style={styles.poiMarker}><Text>{poi.icon}</Text><Text>{poi.label}</Text></View>
        ))}
      </View>
      <Text style={{ marginTop: 12, fontWeight: 'bold' }}>Workout Length (min):</Text>
      <View style={{ flexDirection: 'row', marginVertical: 8 }}>
        {SUPPORTED_LENGTHS.map(len => (
          <Button
            key={len}
            title={len.toString()}
            onPress={() => setWorkoutLength(len)}
            color={workoutLength === len ? 'green' : undefined}
            disabled={missionActive}
          />
        ))}
      </View>
      {!missionActive && (
        <Button title="Start Mission" onPress={handleStartMission} />
      )}
      {missionActive && (
        <Button title="Complete Mission (MVP)" onPress={handleCompleteMission} color="orange" />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontWeight: 'bold', fontSize: 20 },
  poiMarker: { alignItems: 'center', marginHorizontal: 12 },
});
