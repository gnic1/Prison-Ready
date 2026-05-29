// PatrolMissionLengthScreen — pick how long this patrol is.
// Choose by time (minutes) OR by distance (miles/km, using the unit set in
// user preferences). Under 30 minutes = chapter can only be partially
// completed; the partial flag is stamped into the session so the engine and
// debrief can act on it.

import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import NW from '../../../theme/uiTokens';
import {
  UserPreferences,
  UserPreferencesService,
  defaultUserPreferences,
} from '../../missions/services/userPreferencesService';

const BG = require('../../../../assets/backgrounds/main_background.png');

const TIME_OPTIONS = [15, 20, 30, 45, 60];
const DISTANCE_OPTIONS_KM = [1, 1.5, 2.2, 3, 4];
const DISTANCE_OPTIONS_MI = [0.5, 1, 1.5, 2, 2.5];
const PARTIAL_THRESHOLD_MIN = 30;

interface RouteParams {
  graphId: string;
}

export const PatrolMissionLengthScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { graphId } = route.params as RouteParams;

  const [prefs, setPrefs] = React.useState<UserPreferences>(defaultUserPreferences);
  const [goalType, setGoalType] = React.useState<'minutes' | 'distance'>('minutes');
  const [minutes, setMinutes] = React.useState(30);
  const [distance, setDistance] = React.useState(2.2);

  React.useEffect(() => {
    UserPreferencesService.getPreferences()
      .then((p) => {
        setPrefs(p);
        setGoalType(p.goalType);
        setMinutes(p.preferredTimeMinutes);
        setDistance(p.preferredDistanceValue);
      })
      .catch(() => {});
  }, []);

  const distOptions =
    prefs.distanceUnit === 'miles' ? DISTANCE_OPTIONS_MI : DISTANCE_OPTIONS_KM;

  // Estimated minutes for the partial threshold check.
  const estimatedMinutes =
    goalType === 'minutes'
      ? minutes
      : prefs.distanceUnit === 'miles'
      ? distance * 18 // ~18 min per mile walking
      : distance * 12; // ~12 min per km walking
  const isPartial = estimatedMinutes < PARTIAL_THRESHOLD_MIN;

  const handleStart = async () => {
    await UserPreferencesService.savePreferences({
      ...prefs,
      goalType,
      preferredTimeMinutes: minutes,
      preferredDistanceValue: distance,
    });
    navigation.navigate('PatrolStance', {
      graphId,
      lengthMode: goalType,
      lengthMinutes: minutes,
      lengthDistance: distance,
      lengthUnit: prefs.distanceUnit,
      partial: isPartial,
    });
  };

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={['rgba(7,16,29,0.70)', 'rgba(7,16,29,0.96)']}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>{'‹'} BACK</Text>
        </TouchableOpacity>
        <Text style={styles.title}>HOW LONG TONIGHT?</Text>
      </View>

      <View style={styles.modeSwitch}>
        {(['minutes', 'distance'] as const).map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => setGoalType(m)}
            style={[
              styles.modeBtn,
              goalType === m ? styles.modeBtnActive : null,
            ]}
          >
            <Text
              style={[
                styles.modeBtnLabel,
                goalType === m ? styles.modeBtnLabelActive : null,
              ]}
            >
              {m === 'minutes' ? 'TIME' : 'DISTANCE'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.optionsBlock}>
        {goalType === 'minutes'
          ? TIME_OPTIONS.map((opt) => (
              <Pill
                key={opt}
                label={`${opt} MIN`}
                active={minutes === opt}
                onPress={() => setMinutes(opt)}
              />
            ))
          : distOptions.map((opt) => (
              <Pill
                key={opt}
                label={`${opt} ${prefs.distanceUnit.toUpperCase()}`}
                active={distance === opt}
                onPress={() => setDistance(opt)}
              />
            ))}
      </View>

      {isPartial ? (
        <View style={styles.warningPanel}>
          <Text style={styles.warningHeading}>PARTIAL CHAPTER ONLY</Text>
          <Text style={styles.warningBody}>
            Under 30 minutes you walk the first half of the chapter. Beats past
            the midpoint, the final choice, and chapter unlock require a full
            run.
          </Text>
        </View>
      ) : (
        <View style={styles.okPanel}>
          <Text style={styles.okHeading}>FULL CHAPTER</Text>
          <Text style={styles.okBody}>
            Long enough to complete every beat including the final choice.
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={handleStart} activeOpacity={0.85}>
          <Text style={styles.ctaText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface PillProps {
  label: string;
  active: boolean;
  onPress: () => void;
}
const Pill: React.FC<PillProps> = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.pill, active ? styles.pillActive : null]}
    activeOpacity={0.85}
  >
    <Text style={[styles.pillLabel, active ? styles.pillLabelActive : null]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NW.bgInk },
  header: {
    paddingTop: 44,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  backText: { color: NW.blueLight, fontSize: 12, letterSpacing: 1.5, fontWeight: '700' },
  title: {
    color: NW.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 14,
  },
  modeSwitch: {
    flexDirection: 'row',
    marginHorizontal: 18,
    marginBottom: 14,
    backgroundColor: 'rgba(15,28,43,0.55)',
    borderRadius: NW.radPill,
    padding: 4,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: NW.radPill,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: NW.blue,
  },
  modeBtnLabel: {
    color: NW.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
  },
  modeBtnLabelActive: { color: '#ffffff' },
  optionsBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 8,
    marginBottom: 14,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: NW.radPill,
    borderWidth: 1,
    borderColor: NW.strokeSoft,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  pillActive: {
    backgroundColor: NW.blue,
    borderColor: NW.blueLight,
  },
  pillLabel: {
    color: NW.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  pillLabelActive: { color: '#ffffff' },
  warningPanel: {
    marginHorizontal: 18,
    backgroundColor: 'rgba(255,138,0,0.16)',
    borderRadius: NW.radMd,
    borderWidth: 1,
    borderColor: NW.warning,
    padding: 14,
    marginTop: 8,
  },
  warningHeading: {
    color: NW.warning,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 4,
  },
  warningBody: { color: NW.text, fontSize: 13, lineHeight: 18 },
  okPanel: {
    marginHorizontal: 18,
    backgroundColor: 'rgba(46,204,113,0.14)',
    borderRadius: NW.radMd,
    borderWidth: 1,
    borderColor: NW.success,
    padding: 14,
    marginTop: 8,
  },
  okHeading: {
    color: NW.success,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 4,
  },
  okBody: { color: NW.text, fontSize: 13, lineHeight: 18 },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 12,
  },
  cta: {
    backgroundColor: NW.blue,
    borderRadius: 36,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: NW.blueLight,
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
});

export default PatrolMissionLengthScreen;
