// MissionPreferencesScreen — Neighborhood Watch reskin.
// Player sets distance unit (km/miles) and surface (outside/treadmill) so the
// app knows what kind of patrol they typically walk.

import React from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import NW from '../../../theme/uiTokens';
import { AuthStorageService } from '../services/authStorageService';
import {
  GoalType,
  MissionMode,
  UserPreferencesService,
} from '../../missions/services/userPreferencesService';

const BG = require('../../../../assets/backgrounds/main_background.png');

export default function MissionPreferencesScreen() {
  const navigation = useNavigation<any>();
  const [styleChoice, setStyleChoice] = React.useState<
    'guided' | 'balanced' | 'scout'
  >('balanced');
  const [distanceUnit, setDistanceUnit] = React.useState<'km' | 'miles'>('km');
  const [goalType, setGoalType] = React.useState<GoalType>('distance');
  const [missionMode, setMissionMode] = React.useState<MissionMode>('outside');

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
    <View style={styles.root}>
      <ImageBackground source={BG} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={['rgba(7,16,29,0.50)', 'rgba(7,16,29,0.94)']}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>YOUR DEFAULTS //</Text>
        <Text style={styles.title}>How do you usually walk?</Text>
        <Text style={styles.subtitle}>
          These set sensible defaults. You can change them per session from the
          mission length picker.
        </Text>

        <View style={styles.panel}>
          <Section label="DISTANCE UNIT">
            <Segment
              options={[
                { value: 'km', label: 'KM' },
                { value: 'miles', label: 'MILES' },
              ]}
              value={distanceUnit}
              onChange={(v) => setDistanceUnit(v as 'km' | 'miles')}
            />
          </Section>

          <Section label="GOAL TYPE">
            <Segment
              options={[
                { value: 'distance', label: 'DISTANCE' },
                { value: 'minutes', label: 'TIME' },
              ]}
              value={goalType}
              onChange={(v) => setGoalType(v as GoalType)}
            />
          </Section>

          <Section label="WHERE YOU WALK">
            <Text style={styles.hint}>
              You can switch this each session in the mission length picker.
            </Text>
            <Segment
              options={[
                { value: 'outside', label: 'OUTSIDE' },
                { value: 'treadmill', label: 'TREADMILL' },
              ]}
              value={missionMode}
              onChange={(v) => setMissionMode(v as MissionMode)}
            />
          </Section>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={finish} activeOpacity={0.85}>
          <Text style={styles.ctaText}>FINISH SETUP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const Section: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionLabel}>{label}</Text>
    {children}
  </View>
);

interface SegmentProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}
const Segment: React.FC<SegmentProps> = ({ options, value, onChange }) => (
  <View style={styles.segmentRow}>
    {options.map((opt) => (
      <TouchableOpacity
        key={opt.value}
        onPress={() => onChange(opt.value)}
        style={[
          styles.segment,
          value === opt.value ? styles.segmentActive : null,
        ]}
        activeOpacity={0.85}
      >
        <Text
          style={[
            styles.segmentText,
            value === opt.value ? styles.segmentTextActive : null,
          ]}
        >
          {opt.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NW.bgInk },
  scroll: { padding: 22, paddingTop: 56, paddingBottom: 16 },
  eyebrow: {
    color: NW.blueLight,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '800',
    marginBottom: 8,
  },
  title: {
    color: NW.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
    lineHeight: 28,
    marginBottom: 6,
  },
  subtitle: {
    color: NW.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 18,
  },
  panel: {
    backgroundColor: 'rgba(16,27,41,0.78)',
    borderRadius: NW.radLg,
    borderWidth: 1,
    borderColor: NW.stroke,
    padding: 16,
  },
  section: { marginBottom: 18 },
  sectionLabel: {
    color: NW.blueLight,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 8,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(7,16,29,0.5)',
    borderRadius: NW.radPill,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: NW.radPill,
    alignItems: 'center',
  },
  segmentActive: { backgroundColor: NW.blue },
  segmentText: {
    color: NW.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  segmentTextActive: { color: '#ffffff' },
  hint: {
    color: NW.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 15,
    marginBottom: 8,
  },
  footer: { paddingHorizontal: 22, paddingBottom: 24, paddingTop: 8 },
  cta: {
    backgroundColor: NW.blue,
    borderRadius: 36,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: NW.blueLight,
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
