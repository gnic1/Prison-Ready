import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { PrisonButton } from '../../../components/PrisonButton';
import { AuthStorageService } from '../services/authStorageService';
import { GoalType, MissionMode, UserPreferencesService } from '../../missions/services/userPreferencesService';

type RecoPath = 'recommend' | 'custom';

export default function MissionPreferencesScreen() {
  const navigation = useNavigation<any>();
  const [styleChoice, setStyleChoice] = React.useState<'guided' | 'balanced' | 'scout'>('balanced');
  const [distanceUnit, setDistanceUnit] = React.useState<'km' | 'miles'>('km');
  const [goalType, setGoalType] = React.useState<GoalType>('distance');
  const [missionMode, setMissionMode] = React.useState<MissionMode>('outside');
  const [pathMode, setPathMode] = React.useState<RecoPath>('recommend');

  const applyRecommendation = () => {
    setStyleChoice('balanced');
    setDistanceUnit('km');
    setGoalType('distance');
    setMissionMode('outside');
    setPathMode('recommend');
  };

  const finish = async () => {
    await UserPreferencesService.updatePreferences({
      preferredMissionStyle: styleChoice,
      distanceUnit,
      goalType,
      missionMode,
    });
    await AuthStorageService.completeOnboarding({
      preferredMissionStyle: styleChoice,
      distanceUnit,
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#090A0F', '#171826', '#1A130C']} style={StyleSheet.absoluteFill} />
      <Text style={styles.eyebrow}>MISSION PREFERENCES //</Text>
      <Text style={styles.title}>Choose how the app should guide your first run.</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Mission style</Text>
        <View style={styles.segmentRow}>
          {['guided', 'balanced', 'scout'].map((item) => (
            <TouchableOpacity key={item} style={[styles.segment, styleChoice === item && styles.segmentActive]} onPress={() => { setStyleChoice(item as 'guided' | 'balanced' | 'scout'); setPathMode('custom'); }}>
              <Text style={[styles.segmentText, styleChoice === item && styles.segmentTextActive]}>{item.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Preferred distance unit</Text>
        <View style={styles.segmentRow}>
          {['km', 'miles'].map((item) => (
            <TouchableOpacity key={item} style={[styles.segment, distanceUnit === item && styles.segmentActive]} onPress={() => { setDistanceUnit(item as 'km' | 'miles'); setPathMode('custom'); }}>
              <Text style={[styles.segmentText, distanceUnit === item && styles.segmentTextActive]}>{item.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Mission defaults</Text>
        <View style={styles.segmentRow}>
          {['distance', 'minutes'].map((item) => (
            <TouchableOpacity key={item} style={[styles.segment, goalType === item && styles.segmentActive]} onPress={() => { setGoalType(item as GoalType); setPathMode('custom'); }}>
              <Text style={[styles.segmentText, goalType === item && styles.segmentTextActive]}>{item === 'minutes' ? 'TIME' : 'DISTANCE'}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.segmentRow}>
          <Text style={{ color: '#a8b6c8', fontSize: 11, marginBottom: 8, fontStyle: 'italic' }}>You can switch this each session in the mission length picker.</Text>
          {['outside', 'treadmill'].map((item) => (
            <TouchableOpacity key={item} style={[styles.segment, missionMode === item && styles.segmentActive]} onPress={() => { setMissionMode(item as MissionMode); setPathMode('custom'); }}>
              <Text style={[styles.segmentText, missionMode === item && styles.segmentTextActive]}>{item === 'outside' ? 'OUTSIDE' : 'TREADMILL'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.recommendCard, pathMode === 'recommend' && styles.recommendCardActive]} onPress={applyRecommendation}>
          <Text style={styles.recommendLabel}>Recommend for me</Text>
          <Text style={styles.recommendText}>Outdoor distance missions are the strongest fit for reliable background continuity and ordered story updates.</Text>
        </TouchableOpacity>
      </View>

      <PrisonButton title="Finish Setup" onPress={finish} shimmer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 68,
    paddingBottom: 32,
  },
  eyebrow: {
    color: '#A4D3FF',
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
    marginBottom: 20,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    padding: 18,
    backgroundColor: 'rgba(16,19,27,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 18,
  },
  sectionTitle: {
    color: '#EDF0F8',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 8,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  segment: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(7,9,14,0.72)',
  },
  segmentActive: {
    borderColor: '#FF6A00',
    backgroundColor: 'rgba(255,106,0,0.16)',
  },
  segmentText: {
    color: '#C4CAD8',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 1,
  },
  segmentTextActive: {
    color: '#FFF5E8',
  },
  recommendCard: {
    marginTop: 10,
    padding: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(12,15,20,0.76)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  recommendCardActive: {
    borderColor: '#61E9FF',
  },
  recommendLabel: {
    color: '#61E9FF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  recommendText: {
    color: '#CBD1DD',
    lineHeight: 20,
  },
});
