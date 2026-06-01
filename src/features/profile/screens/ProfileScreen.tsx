// ProfileScreen — quick view of the player's persistent stats and progress.
// Styled to match the Neighborhood Watch panel system (dark navy panels with
// blue borders, gold accents). Reached from the fence button on Home.

import React from 'react';
import { useMainMenuAudio } from '../../../components/MainMenuAudio';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { PlayerProfileService, PlayerProfile } from '../../patrol/services/playerProfileService';
import { LedgerService } from '../../patrol/services/ledgerService';

const C = {
  bg0: '#07101d',
  bg1: '#0a0f14',
  panel: '#101b29',
  panelStroke: 'rgba(138,191,255,0.38)',
  text: '#f3f6fb',
  textMuted: '#a8b6c8',
  blue: '#1e90ff',
  blueLight: '#a8c8ff',
  gold: '#ffc107',
};

export const ProfileScreen: React.FC = () => {
  const { setVolume } = useMainMenuAudio();
  useFocusEffect(React.useCallback(() => { setVolume(0.5); }, [setVolume]));

  const navigation = useNavigation<any>();
  const [profile, setProfile] = React.useState<PlayerProfile>(PlayerProfileService.get());
  const [ledgerCount, setLedgerCount] = React.useState(0);

  React.useEffect(() => {
    PlayerProfileService.load().catch(() => {});
    LedgerService.load()
      .then(() => setLedgerCount(LedgerService.get().observations.length))
      .catch(() => {});
    return PlayerProfileService.subscribe(setProfile);
  }, []);

  const kmWalked = (profile.lifetimeMeters / 1000).toFixed(1);
  const chaptersDone = profile.chaptersCompleted.length;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[C.bg0, C.bg1]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>PROFILE</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.panel}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarInitial}>W</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>WATCHER</Text>
                <Text style={styles.sub}>Block Watch &middot; Briarwood</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{profile.currentStreak}</Text>
              <Text style={styles.statLabel}>DAY STREAK</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{kmWalked}</Text>
              <Text style={styles.statLabel}>KM WALKED</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{chaptersDone}</Text>
              <Text style={styles.statLabel}>CHAPTERS</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{ledgerCount}</Text>
              <Text style={styles.statLabel}>LEDGER</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate('Ledger')}
          >
            <Text style={styles.linkText}>Open Ledger &raquo;</Text>
          </TouchableOpacity>

          {profile.hardModeUnlocked ? (
            <View style={[styles.panel, { borderColor: C.gold }]}>
              <Text style={[styles.label, { color: C.gold }]}>HARD MODE UNLOCKED</Text>
              <Text style={styles.sub}>
                Seven-day streak achieved. The block has accepted you.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(138,191,255,0.22)',
  },
  title: { color: C.blueLight, fontSize: 18, fontWeight: '800', letterSpacing: 2 },
  headerSpacer: { width: 0 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(230,230,230,0.3)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeX: { color: C.text, fontSize: 22, lineHeight: 22, marginTop: -2 },
  scroll: { padding: 20, gap: 16 },
  panel: {
    backgroundColor: C.panel,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.panelStroke,
    padding: 18,
    marginBottom: 12,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#152336',
    borderWidth: 1,
    borderColor: C.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: C.blueLight, fontSize: 22, fontWeight: '800' },
  label: { color: C.text, fontSize: 18, fontWeight: '800', letterSpacing: 1.5 },
  sub: { color: C.textMuted, fontSize: 13, marginTop: 2 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flexBasis: '47%',
    backgroundColor: C.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.panelStroke,
    padding: 16,
  },
  statValue: { color: C.text, fontSize: 28, fontWeight: '800' },
  statLabel: { color: C.textMuted, fontSize: 11, letterSpacing: 1.5, marginTop: 4 },
  linkRow: {
    backgroundColor: 'rgba(30,144,255,0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(30,144,255,0.45)',
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  linkText: { color: C.blueLight, fontSize: 14, letterSpacing: 1, fontWeight: '700' },
});

export default ProfileScreen;
