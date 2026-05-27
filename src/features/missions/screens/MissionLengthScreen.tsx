import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { PrisonButton } from '../../../components/PrisonButton';
import { DistanceUnit, GoalType, MissionMode, UserPreferencesService, defaultUserPreferences } from '../services/userPreferencesService';

const TIME_OPTIONS = [15, 20, 25, 30, 35, 40, 45, 50, 60];
const DISTANCE_OPTIONS = [1, 1.5, 2, 2.5, 3, 4, 5];

export default function MissionLengthScreen() {
  const navigation = useNavigation<any>();
  const [goalType, setGoalType] = React.useState<GoalType>(defaultUserPreferences.goalType);
  const [distanceUnit, setDistanceUnit] = React.useState<DistanceUnit>(defaultUserPreferences.distanceUnit);
  const [missionMode, setMissionMode] = React.useState<MissionMode>(defaultUserPreferences.missionMode);
  const [selectedMinutes, setSelectedMinutes] = React.useState(defaultUserPreferences.preferredTimeMinutes);
  const [selectedDistance, setSelectedDistance] = React.useState(defaultUserPreferences.preferredDistanceValue);

  React.useEffect(() => {
    let mounted = true;
    UserPreferencesService.getPreferences().then((prefs) => {
      if (!mounted) {
        return;
      }
      setGoalType(prefs.goalType);
      setDistanceUnit(prefs.distanceUnit);
      setMissionMode(prefs.missionMode);
      setSelectedMinutes(prefs.preferredTimeMinutes);
      setSelectedDistance(prefs.preferredDistanceValue);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const saveAndContinue = async () => {
    await UserPreferencesService.updatePreferences({
      goalType,
      distanceUnit,
      missionMode,
      preferredTimeMinutes: selectedMinutes,
      preferredDistanceValue: selectedDistance,
    });
    navigation.navigate('MissionBrief');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#090A0E', '#151520', '#1B130C']} style={StyleSheet.absoluteFill} />
      <Text style={styles.eyebrow}>MISSION LENGTH //</Text>
      <Text style={styles.title}>Pick a goal that matches how you want this run to feel.</Text>
      <Text style={styles.help}>Distance is the best choice when you want mission continuity tied to actual movement. Time works best when you want a fixed block.</Text>

      <View style={styles.segmentRow}>
        {['distance', 'minutes'].map((item) => (
          <TouchableOpacity key={item} style={[styles.segment, goalType === item && styles.segmentActive]} onPress={() => setGoalType(item as GoalType)}>
            <Text style={[styles.segmentText, goalType === item && styles.segmentTextActive]}>{item === 'minutes' ? 'TIME' : 'DISTANCE'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.segmentRow}>
        {['km', 'miles'].map((item) => (
          <TouchableOpacity key={item} style={[styles.segment, distanceUnit === item && styles.segmentActive]} onPress={() => setDistanceUnit(item as DistanceUnit)}>
            <Text style={[styles.segmentText, distanceUnit === item && styles.segmentTextActive]}>{item.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
        {['outside', 'treadmill'].map((item) => (
          <TouchableOpacity key={item} style={[styles.segment, missionMode === item && styles.segmentActive]} onPress={() => setMissionMode(item as MissionMode)}>
            <Text style={[styles.segmentText, missionMode === item && styles.segmentTextActive]}>{item === 'outside' ? 'OUTSIDE' : 'TREADMILL'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.wheelCard}>
        <Text style={styles.wheelLabel}>{goalType === 'distance' ? 'Distance target' : 'Time target'}</Text>
        <ScrollView contentContainerStyle={styles.wheelContent} showsVerticalScrollIndicator={false}>
          {(goalType === 'distance' ? DISTANCE_OPTIONS : TIME_OPTIONS).map((value) => {
            const selected = goalType === 'distance' ? selectedDistance === value : selectedMinutes === value;
            const label = goalType === 'distance'
              ? `${value} ${distanceUnit === 'miles' ? 'mi' : 'km'}`
              : `${value} min`;
            return (
              <TouchableOpacity
                key={`${goalType}_${value}`}
                onPress={() => goalType === 'distance' ? setSelectedDistance(value) : setSelectedMinutes(value)}
                style={[styles.wheelItem, selected && styles.wheelItemSelected]}
              >
                <Text style={[styles.wheelItemText, selected && styles.wheelItemTextSelected]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <PrisonButton title="Continue to Briefing" onPress={saveAndContinue} shimmer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 68,
    paddingBottom: 34,
  },
  eyebrow: {
    color: '#FFD27E',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.1,
    marginBottom: 12,
  },
  title: {
    color: '#F4F2EF',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 10,
  },
  help: {
    color: '#B9C0CF',
    lineHeight: 20,
    marginBottom: 16,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  segment: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(8,10,16,0.72)',
  },
  segmentActive: {
    borderColor: '#FF6A00',
    backgroundColor: 'rgba(255,106,0,0.14)',
  },
  segmentText: {
    color: '#C7CEDC',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  segmentTextActive: {
    color: '#FFF4E8',
  },
  wheelCard: {
    flex: 1,
    borderRadius: 22,
    padding: 16,
    backgroundColor: 'rgba(16,18,24,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 18,
  },
  wheelLabel: {
    color: '#EDF1F8',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  wheelContent: {
    paddingVertical: 6,
  },
  wheelItem: {
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(7,9,15,0.64)',
  },
  wheelItemSelected: {
    borderWidth: 1,
    borderColor: '#61E9FF',
    backgroundColor: 'rgba(97,233,255,0.14)',
  },
  wheelItemText: {
    color: '#D3D9E5',
    fontSize: 24,
    fontWeight: '800',
  },
  wheelItemTextSelected: {
    color: '#F6FBFF',
  },
});
