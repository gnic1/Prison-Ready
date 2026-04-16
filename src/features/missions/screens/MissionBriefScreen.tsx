import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { themes } from '../../../theme/themes';
import { typography } from '../../../theme/typography';
import { PrisonCard } from '../../../components/PrisonCard';
import { PrisonButton } from '../../../components/PrisonButton';
import { TacticalMarquee } from '../../../components/TacticalMarquee';
import { useNavigation } from '@react-navigation/native';
import {
  UserPreferencesService,
  defaultUserPreferences,
  GoalType,
  DistanceUnit,
  MissionMode,
} from '../services/userPreferencesService';

// Mock mission data (replace with real props/data as needed)
const mission = {
  id: 'DAY-01',
  title: 'The Familiar Route',
  story: 'You are about to begin your first mission. The world outside is familiar, but today, everything changes. Stay sharp, and remember: every step counts.',
  objectives: [
    { text: 'Complete your route and return safely.', xp: 100 },
    { text: 'Watch for clues and keep your pace steady.', xp: 50 },
  ],
};


export const MissionBriefScreen = () => {
  const navigation = useNavigation();
  const theme = themes.prison;
  // Mission setup state
  const [goalType, setGoalType] = useState<GoalType>(defaultUserPreferences.goalType);
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>(defaultUserPreferences.distanceUnit);
  const [missionMode, setMissionMode] = useState<MissionMode>(defaultUserPreferences.missionMode);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const prefs = await UserPreferencesService.getPreferences();
      if (!mounted) return;
      setGoalType(prefs.goalType);
      setDistanceUnit(prefs.distanceUnit);
      setMissionMode(prefs.missionMode);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onGoalTypeChange = (next: GoalType) => {
    setGoalType(next);
    UserPreferencesService.updatePreferences({ goalType: next });
  };

  const onDistanceUnitChange = (next: DistanceUnit) => {
    setDistanceUnit(next);
    UserPreferencesService.updatePreferences({ distanceUnit: next });
  };

  const onMissionModeChange = (next: MissionMode) => {
    setMissionMode(next);
    UserPreferencesService.updatePreferences({ missionMode: next });
  };

  const bannerItems = [
    'MISSION BRIEF // DAY-01',
    missionMode === 'treadmill' ? 'SIMULATED ROUTE ACTIVE' : 'GPS ROUTE MODE',
    goalType === 'distance' ? 'DISTANCE GOAL ENABLED' : 'TIME GOAL ENABLED',
    'HQ STATUS: MONITORING',
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }] }>
      {/* HEADER ROW */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            fontFamily: 'monospace',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: theme.colors.textSecondary,
          }}>{'\u2039'}</Text>
        </TouchableOpacity>
        <Text style={{
          fontSize: 13,
          fontWeight: '600',
          fontFamily: 'monospace',
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: theme.colors.textSecondary,
          flex: 1,
          textAlign: 'center',
        }}>MISSION BRIEF</Text>
        <Text style={{
          fontSize: 13,
          fontWeight: '600',
          fontFamily: 'monospace',
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: theme.colors.textSecondary,
          minWidth: 60,
          textAlign: 'right',
        }}>{mission.id}</Text>
      </View>

      <TacticalMarquee items={bannerItems} tone="orange" style={styles.topBanner} />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* HERO MISSION COVER PANEL */}
        <PrisonCard style={styles.heroCard} highlighted>
          <View style={styles.heroGradient} />
          <Text style={{
            fontSize: 13,
            fontWeight: '600',
            fontFamily: 'monospace',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: theme.colors.prisonOrange,
            marginBottom: 4,
          }}>// OBJECTIVE INCOMING</Text>
          <Text style={{
            fontSize: 30,
            fontWeight: '700',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: theme.colors.text,
            marginBottom: 8,
            zIndex: 2,
          }}>{mission.title}</Text>
          <View style={styles.heroDivider} />
          <Text style={[styles.storyText, { color: theme.colors.textSecondary }]}>{mission.story}</Text>
        </PrisonCard>

        {/* OBJECTIVES LIST */}
        <View style={styles.objectivesSection}>
          <Text style={{
            fontSize: 13,
            fontWeight: '600',
            fontFamily: 'monospace',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: theme.colors.textSecondary,
            marginBottom: 8,
          }}>// OBJECTIVES</Text>
          {mission.objectives.map((obj, i) => (
            <View key={`objective-${obj.text}-${obj.xp}`} style={styles.objectiveRow}>
              <View style={[styles.bullet, { backgroundColor: theme.colors.prisonOrange }]} />
              <Text style={{
                flex: 1,
                fontSize: 15,
                color: theme.colors.text,
                marginRight: 6,
              }}>{obj.text}</Text>
              <Text style={{
                fontSize: 13,
                fontWeight: '600',
                fontFamily: 'monospace',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: theme.colors.gold,
                marginLeft: 8,
              }}>{`+${obj.xp} XP`}</Text>
            </View>
          ))}
        </View>

        {/* MISSION SETUP CONTROLS */}
        <View style={{ marginTop: 18, marginBottom: 18, padding: 16, borderRadius: 16, backgroundColor: 'rgba(24,24,28,0.92)', shadowColor: theme.colors.prisonOrange, shadowOpacity: 0.10, shadowRadius: 12, elevation: 4 }}>
          <Text style={{ color: theme.colors.text, fontWeight: '700', fontSize: 15, marginBottom: 8, letterSpacing: 1.2 }}>Mission Setup</Text>
          {/* Goal Type */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ color: theme.colors.textSecondary, fontWeight: '600', marginRight: 12 }}>Goal Type:</Text>
            <TouchableOpacity onPress={() => onGoalTypeChange('minutes')} style={{ marginRight: 8, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8, backgroundColor: goalType === 'minutes' ? theme.colors.prisonOrange : theme.colors.surface }}>
              <Text style={{ color: goalType === 'minutes' ? theme.colors.text : theme.colors.textSecondary, fontWeight: 'bold' }}>Minutes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onGoalTypeChange('distance')} style={{ marginRight: 8, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8, backgroundColor: goalType === 'distance' ? theme.colors.prisonOrange : theme.colors.surface }}>
              <Text style={{ color: goalType === 'distance' ? theme.colors.text : theme.colors.textSecondary, fontWeight: 'bold' }}>Distance</Text>
            </TouchableOpacity>
          </View>
          {/* Distance Unit */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <Text style={{ color: theme.colors.textSecondary, fontWeight: '600', marginRight: 12 }}>Distance Unit:</Text>
            <TouchableOpacity onPress={() => onDistanceUnitChange('km')} style={{ marginRight: 8, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8, backgroundColor: distanceUnit === 'km' ? theme.colors.prisonOrange : theme.colors.surface }}>
              <Text style={{ color: distanceUnit === 'km' ? theme.colors.text : theme.colors.textSecondary, fontWeight: 'bold' }}>KM</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDistanceUnitChange('miles')} style={{ marginRight: 8, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8, backgroundColor: distanceUnit === 'miles' ? theme.colors.prisonOrange : theme.colors.surface }}>
              <Text style={{ color: distanceUnit === 'miles' ? theme.colors.text : theme.colors.textSecondary, fontWeight: 'bold' }}>Miles</Text>
            </TouchableOpacity>
          </View>
          {/* Mission Mode */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
            <Text style={{ color: theme.colors.textSecondary, fontWeight: '600', marginRight: 12 }}>Mode:</Text>
            <TouchableOpacity onPress={() => onMissionModeChange('outside')} style={{ marginRight: 8, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8, backgroundColor: missionMode === 'outside' ? theme.colors.prisonOrange : theme.colors.surface }}>
              <Text style={{ color: missionMode === 'outside' ? theme.colors.text : theme.colors.textSecondary, fontWeight: 'bold' }}>Outside Route</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onMissionModeChange('treadmill')} style={{ marginRight: 8, paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8, backgroundColor: missionMode === 'treadmill' ? theme.colors.prisonOrange : theme.colors.surface }}>
              <Text style={{ color: missionMode === 'treadmill' ? theme.colors.text : theme.colors.textSecondary, fontWeight: 'bold' }}>Treadmill/Walking Pad</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PRIMARY CTA */}
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <PrisonButton
            title="Confirm & Begin"
            onPress={() => navigation.navigate('MissionDay1')}
            style={styles.ctaBtn}
            textStyle={{ letterSpacing: 2 }}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default MissionBriefScreen;


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: undefined },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 8,
    paddingHorizontal: 10,
    marginBottom: 2,
  },
  headerBtn: {
    padding: 4,
    minWidth: 32,
    alignItems: 'flex-start',
  },
  topBanner: {
    marginHorizontal: 14,
    marginBottom: 8,
  },
  heroCard: {
    marginHorizontal: 14,
    marginTop: 8,
    marginBottom: 18,
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    zIndex: 0,
    // fallback for RN: use a semi-transparent overlay
    backgroundColor: 'rgba(13,13,15,0.7)',
  },
  heroDivider: {
    width: '80%',
    height: 2,
    borderRadius: 2,
    marginVertical: 10,
    backgroundColor: 'rgba(255,106,0,0.18)',
  },
  storyText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: undefined,
    textAlign: 'center',
    marginTop: 2,
    zIndex: 2,
  },
  objectivesSection: {
    marginHorizontal: 18,
    marginTop: 8,
    marginBottom: 8,
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  bullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
    shadowOpacity: 0.7,
    shadowRadius: 6,
    elevation: 2,
  },
  objectiveText: {
    flex: 1,
    fontSize: 15,
    color: undefined,
    marginRight: 6,
  },
  ctaBtn: {
    marginTop: 10,
    minWidth: 220,
    borderRadius: 18,
    shadowColor: '#FF6A00',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
});
