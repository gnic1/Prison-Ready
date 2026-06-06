import { useFocusEffect } from '@react-navigation/native';
// SettingsScreen — vertical-tab drill-in matching the style sheet mockup.
// Left rail: GENERAL / AUDIO / NOTIFICATIONS / ACCOUNT. Right pane: rows of
// settings (label + control). Bottom: RESET + SAVE CHANGES buttons.
// Sits on top of the neighborhood background image with a dark panel chrome.

import React from 'react';
import { useMainMenuAudio } from '../../../components/MainMenuAudio';
import {
  Image,
  ImageBackground,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NW from '../../../theme/uiTokens';
import {
  UserPreferences,
  UserPreferencesService,
  defaultUserPreferences,
} from '../../missions/services/userPreferencesService';

const BG = require('../../../../assets/backgrounds/home_neighborhood.png');

type TabKey = 'GENERAL' | 'AUDIO' | 'NOTIFICATIONS' | 'ACCOUNT';
const TABS: TabKey[] = ['GENERAL', 'AUDIO', 'NOTIFICATIONS', 'ACCOUNT'];

interface RowProps {
  label: string;
  control: React.ReactNode;
}
const Row: React.FC<RowProps> = ({ label, control }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={styles.rowControl}>{control}</View>
  </View>
);

interface UnitsToggleProps {
  value: 'miles' | 'kilometers';
  onChange: (v: 'miles' | 'kilometers') => void;
}
const UnitsToggle: React.FC<UnitsToggleProps> = ({ value, onChange }) => (
  <View style={styles.unitsWrap}>
    {(['miles', 'kilometers'] as const).map((u) => (
      <TouchableOpacity
        key={u}
        onPress={() => onChange(u)}
        style={[
          styles.unitsBtn,
          value === u ? styles.unitsBtnActive : null,
        ]}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.unitsLabel,
            value === u ? styles.unitsLabelActive : null,
          ]}
        >
          {u.toUpperCase()}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default function SettingsScreen() {
  const { setVolume } = useMainMenuAudio();
  useFocusEffect(React.useCallback(() => { setVolume(0.5); }, [setVolume]));

  const [active, setActive] = React.useState<TabKey>('GENERAL');
  const [prefs, setPrefs] = React.useState<UserPreferences>(defaultUserPreferences);
  const [vibration, setVibration] = React.useState(true);
  const [tutorialHints, setTutorialHints] = React.useState(true);
  const [units, setUnits] = React.useState<'miles' | 'kilometers'>('miles');
  const [cloudSave, setCloudSave] = React.useState(true);
  const [pushNotifs, setPushNotifs] = React.useState(true);
  const [sound, setSound] = React.useState(true);
  const [voiceVolume, setVoiceVolume] = React.useState(true);

  React.useEffect(() => {
    UserPreferencesService.getPreferences()
      .then(setPrefs)
      .catch(() => {});
  }, []);

  const onReset = () => {
    setVibration(true);
    setTutorialHints(true);
    setUnits('miles');
    setCloudSave(true);
    setPushNotifs(true);
    setSound(true);
    setVoiceVolume(true);
  };

  const onSave = () => {
    // Persist what we actually have storage for; the rest is in-memory for now.
    UserPreferencesService.savePreferences({
      ...prefs,
    }).catch(() => {});
  };

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={['rgba(7,16,29,0.35)', 'rgba(7,16,29,0.72)']}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <View style={styles.titleBar}>
        <Text style={styles.title}>OPTIONS</Text>
      </View>

      <View style={styles.panel}>
        <View style={styles.rail}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t}
              activeOpacity={0.85}
              onPress={() => setActive(t)}
              style={[styles.railTab, active === t ? styles.railTabActive : null]}
            >
              <Text
                style={[
                  styles.railText,
                  active === t ? styles.railTextActive : null,
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.content}>
          {active === 'GENERAL' && (
            <>
              <Row
                label="LANGUAGE"
                control={
                  <View style={styles.dropdown}>
                    <Text style={styles.dropdownText}>ENGLISH</Text>
                    <Text style={styles.caret}>v</Text>
                  </View>
                }
              />
              <Row
                label="VIBRATION"
                control={
                  <Switch
                    value={vibration}
                    onValueChange={setVibration}
                    trackColor={{ false: '#2b313b', true: NW.blue }}
                    thumbColor={vibration ? NW.blueLight : '#cfd6e2'}
                  />
                }
              />
              <Row
                label="TUTORIAL HINTS"
                control={
                  <Switch
                    value={tutorialHints}
                    onValueChange={setTutorialHints}
                    trackColor={{ false: '#2b313b', true: NW.blue }}
                    thumbColor={tutorialHints ? NW.blueLight : '#cfd6e2'}
                  />
                }
              />
              <Row
                label="UNITS"
                control={<UnitsToggle value={units} onChange={setUnits} />}
              />
              <Row
                label="CLOUD SAVE"
                control={
                  <Switch
                    value={cloudSave}
                    onValueChange={setCloudSave}
                    trackColor={{ false: '#2b313b', true: NW.blue }}
                    thumbColor={cloudSave ? NW.blueLight : '#cfd6e2'}
                  />
                }
              />
            </>
          )}

          {active === 'AUDIO' && (
            <>
              <Row
                label="SOUND EFFECTS"
                control={
                  <Switch
                    value={sound}
                    onValueChange={setSound}
                    trackColor={{ false: '#2b313b', true: NW.blue }}
                    thumbColor={sound ? NW.blueLight : '#cfd6e2'}
                  />
                }
              />
              <Row
                label="NARRATOR VOICE"
                control={
                  <Switch
                    value={voiceVolume}
                    onValueChange={setVoiceVolume}
                    trackColor={{ false: '#2b313b', true: NW.blue }}
                    thumbColor={voiceVolume ? NW.blueLight : '#cfd6e2'}
                  />
                }
              />
              <Text style={styles.hint}>
                Voice pack selection arrives with the podcast feature.
              </Text>
            </>
          )}

          {active === 'NOTIFICATIONS' && (
            <>
              <Row
                label="PUSH NOTIFICATIONS"
                control={
                  <Switch
                    value={pushNotifs}
                    onValueChange={setPushNotifs}
                    trackColor={{ false: '#2b313b', true: NW.blue }}
                    thumbColor={pushNotifs ? NW.blueLight : '#cfd6e2'}
                  />
                }
              />
              <Text style={styles.hint}>
                Pulse windows and raid alerts use this channel.
              </Text>
            </>
          )}

          {active === 'ACCOUNT' && (
            <>
              <Text style={styles.hint}>
                Sign-in and cloud account are coming with the backend hookup.
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btnReset} onPress={onReset} activeOpacity={0.85}>
          <Text style={styles.btnResetText}>RESET</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSave} onPress={onSave} activeOpacity={0.85}>
          <Text style={styles.btnSaveText}>SAVE CHANGES</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NW.bgInk, paddingTop: 44 },
  titleBar: {
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  title: {
    color: NW.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 4,
  },
  panel: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(16,27,41,0.55)',
    marginHorizontal: 14,
    borderRadius: NW.radLg,
    borderWidth: 1,
    borderColor: NW.stroke,
    overflow: 'hidden',
  },
  rail: {
    width: 120,
    paddingVertical: 16,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(11,23,42,0.85)',
    borderRightWidth: 1,
    borderRightColor: NW.strokeSoft,
  },
  railTab: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: NW.radSm,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  railTabActive: {
    backgroundColor: 'rgba(30,144,255,0.22)',
    borderColor: NW.blue,
  },
  railText: {
    color: NW.textMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.6,
  },
  railTextActive: {
    color: NW.text,
  },
  content: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: NW.strokeSoft,
  },
  rowLabel: {
    flex: 1,
    color: NW.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  rowControl: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: NW.strokeSoft,
    borderRadius: NW.radSm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dropdownText: {
    color: NW.text,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginRight: 6,
  },
  caret: {
    color: NW.blueLight,
    fontSize: 11,
    transform: [{ scaleY: 0.85 }],
  },
  unitsWrap: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: NW.radSm,
    padding: 2,
  },
  unitsBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: NW.radSm - 2,
  },
  unitsBtnActive: {
    backgroundColor: NW.blue,
  },
  unitsLabel: {
    color: NW.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  unitsLabelActive: {
    color: '#ffffff',
  },
  hint: {
    color: NW.textMuted,
    fontSize: 12,
    marginTop: 12,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 12,
  },
  btnReset: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: NW.radMd,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: NW.strokeSoft,
    alignItems: 'center',
  },
  btnResetText: {
    color: NW.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
  btnSave: {
    flex: 1.6,
    paddingVertical: 14,
    borderRadius: NW.radMd,
    backgroundColor: NW.warning,
    borderWidth: 1,
    borderColor: '#ffb02e',
    alignItems: 'center',
  },
  btnSaveText: {
    color: '#1a0d00',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
