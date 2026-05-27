// LedgerScreen - the player-facing dossier.
//
// Three sections:
//   1. Profile header - days walked, current streak, longest streak, lifetime
//      meters. The "you are someone who shows up" identity hook.
//   2. NPC cards - everyone the world has rendered visible to you, each with
//      a small affinity bar and tag chips. The "world remembers you" surface.
//   3. Observations timeline - reverse-chronological notes the player has
//      taken (engine-emitted), grouped by chapter.
//
// Accessible from Home. Themed against the most-recently-played skin (or the
// prison skin by default).

import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { themes, type AppThemeKey } from '../../../theme/themes';
import { LedgerService, type LedgerState, type NpcRecord, type ObservationEntry } from '../services/ledgerService';
import { PlayerProfileService, type PlayerProfile } from '../services/playerProfileService';

const MONO = Platform.select({ ios: 'Courier', android: 'monospace', default: 'Courier' });
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

export const LedgerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [ledger, setLedger] = React.useState<LedgerState>(LedgerService.get());
  const [profile, setProfile] = React.useState<PlayerProfile>(PlayerProfileService.get());

  React.useEffect(() => {
    LedgerService.load().catch(() => {});
    PlayerProfileService.load().catch(() => {});
    const u1 = LedgerService.subscribe(setLedger);
    const u2 = PlayerProfileService.subscribe(setProfile);
    return () => {
      u1();
      u2();
    };
  }, []);

  // Theme defaults to prison; could be derived from most-recently-played later.
  const skinKey: AppThemeKey = 'prison';
  const theme = themes[skinKey];
  const accent = theme.colors.accent;
  const screenGradient = theme.gradients.screen;

  const npcList = React.useMemo(() => {
    return Object.values(ledger.npcs).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [ledger.npcs]);

  const observationsByChapter = React.useMemo(() => {
    const grouped: Record<string, ObservationEntry[]> = {};
    for (const o of ledger.observations) {
      const key = o.chapterId ?? 'unfiled';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(o);
    }
    return grouped;
  }, [ledger.observations]);

  const km = (profile.lifetimeMeters / 1000).toFixed(2);

  return (
    <View style={styles.root}>
      <LinearGradient colors={screenGradient} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeFill} edges={['top', 'bottom']}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backLabel}>BACK</Text>
          </TouchableOpacity>
          <Text style={[styles.eyebrow, { color: accent }]}>LEDGER // WHAT YOU KNOW</Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile header */}
          <View style={[styles.profileCard, { borderColor: `${accent}55` }]}>
            <Text style={[styles.profileTitle, { fontFamily: SERIF }]}>
              You have walked the yard {profile.patrolsCompleted} time
              {profile.patrolsCompleted === 1 ? '' : 's'}.
            </Text>
            <View style={styles.metricRow}>
              <Metric label="STREAK" value={`${profile.currentStreak} d`} accent={accent} />
              <Divider accent={accent} />
              <Metric label="LONGEST" value={`${profile.longestStreak} d`} accent={accent} />
              <Divider accent={accent} />
              <Metric label="DISTANCE" value={`${km} km`} accent={accent} />
            </View>
            {profile.hardModeUnlocked ? (
              <Text style={[styles.unlockNote, { color: accent }]}>
                {'\u2022 RAIN IN THE YARD UNLOCKED'}
              </Text>
            ) : (
              <Text style={[styles.unlockNote, { color: '#888' }]}>
                {`\u2022 ${PlayerProfileService.streakThreshold - profile.currentStreak} more day${
                  PlayerProfileService.streakThreshold - profile.currentStreak === 1 ? '' : 's'
                } to rain in the yard`}
              </Text>
            )}
          </View>

          {/* NPC cards */}
          {npcList.length > 0 ? (
            <Section title="WHO YOU HAVE NOTICED" accent={accent}>
              {npcList.map((n) => (
                <NpcCard key={n.id} npc={n} accent={accent} />
              ))}
            </Section>
          ) : (
            <Section title="WHO YOU HAVE NOTICED" accent={accent}>
              <Text style={styles.empty}>
                Nobody yet. The first walk introduces the regulars.
              </Text>
            </Section>
          )}

          {/* Observations */}
          {ledger.observations.length > 0 ? (
            <Section title="OBSERVATIONS" accent={accent}>
              {Object.entries(observationsByChapter).map(([chapter, entries]) => (
                <View key={chapter} style={styles.chapterBlock}>
                  <Text style={[styles.chapterLabel, { color: accent }]}>
                    {chapter.toUpperCase()}
                  </Text>
                  {entries.map((o) => (
                    <View key={o.id} style={styles.obsRow}>
                      <Text style={styles.obsLabel}>{o.label}</Text>
                      {o.detail ? (
                        <Text style={styles.obsDetail}>{o.detail}</Text>
                      ) : null}
                    </View>
                  ))}
                </View>
              ))}
            </Section>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const NpcCard: React.FC<{ npc: NpcRecord; accent: string }> = ({ npc, accent }) => {
  const pct = Math.max(0, Math.min(1, (npc.affinity + 10) / 20));
  const barColor = npc.affinity > 0 ? '#7DE08C' : npc.affinity < 0 ? '#FF7A7A' : '#888';
  return (
    <View style={[styles.npcCard, { borderColor: `${accent}40` }]}>
      <View style={styles.npcHeader}>
        <Text style={[styles.npcName, { fontFamily: SERIF }]}>{npc.name}</Text>
        <Text style={[styles.npcAffinity, { color: barColor }]}>
          {npc.affinity > 0 ? `+${npc.affinity}` : `${npc.affinity}`}
        </Text>
      </View>
      <View style={styles.affinityTrack}>
        <View style={[styles.affinityFill, { width: `${pct * 100}%`, backgroundColor: barColor }]} />
      </View>
      <View style={styles.tagRow}>
        {npc.tags.map((t) => (
          <View key={t} style={styles.tag}>
            <Text style={styles.tagText}>{t}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const Metric: React.FC<{ label: string; value: string; accent: string }> = ({
  label,
  value,
  accent,
}) => (
  <View style={styles.metricItem}>
    <Text style={styles.metricLabel}>{label}</Text>
    <Text style={[styles.metricValue, { color: accent }]}>{value}</Text>
  </View>
);

const Divider: React.FC<{ accent: string }> = ({ accent }) => (
  <View style={[styles.metricDiv, { backgroundColor: `${accent}40` }]} />
);

const Section: React.FC<{ title: string; accent: string; children: React.ReactNode }> = ({
  title,
  accent,
  children,
}) => (
  <View style={[styles.section, { borderColor: `${accent}40` }]}>
    <Text style={[styles.sectionTitle, { color: accent }]}>{title}</Text>
    <View style={{ marginTop: 10 }}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#06080d' },
  safeFill: { flex: 1, paddingHorizontal: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 12,
    gap: 12,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#2a2c34',
    borderRadius: 8,
  },
  backLabel: { color: '#888', fontSize: 11, letterSpacing: 1.4, fontFamily: MONO, fontWeight: '700' },
  eyebrow: {
    flex: 1,
    fontSize: 11,
    letterSpacing: 1.6,
    fontFamily: MONO,
    fontWeight: '700',
    textAlign: 'right',
  },
  body: { paddingBottom: 24, gap: 14 },
  profileCard: {
    backgroundColor: 'rgba(10,12,16,0.85)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  profileTitle: { fontSize: 22, color: '#F2F2F0', lineHeight: 28 },
  metricRow: {
    flexDirection: 'row',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  metricItem: { flex: 1, alignItems: 'center' },
  metricDiv: { width: 1 },
  metricLabel: { fontSize: 10, letterSpacing: 1.2, fontFamily: MONO, color: '#888', fontWeight: '700' },
  metricValue: { marginTop: 4, fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] },
  unlockNote: { marginTop: 12, fontSize: 11, fontFamily: MONO, letterSpacing: 1.1, fontWeight: '700' },
  section: {
    backgroundColor: 'rgba(10,12,16,0.85)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  sectionTitle: { fontSize: 11, letterSpacing: 1.6, fontFamily: MONO, fontWeight: '700' },
  empty: { color: '#888', fontFamily: MONO, fontSize: 12, letterSpacing: 0.6, lineHeight: 18 },
  npcCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  npcHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  npcName: { fontSize: 18, color: '#F2F2F0', fontWeight: '700' },
  npcAffinity: { fontSize: 16, fontFamily: MONO, fontWeight: '700' },
  affinityTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  affinityFill: { height: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: { color: '#aaa', fontSize: 10, fontFamily: MONO, letterSpacing: 0.6 },
  chapterBlock: { marginBottom: 12 },
  chapterLabel: { fontSize: 10, fontFamily: MONO, letterSpacing: 1.4, fontWeight: '700', marginBottom: 6 },
  obsRow: { marginBottom: 8 },
  obsLabel: { color: '#EAE6DA', fontSize: 13, lineHeight: 18 },
  obsDetail: { color: '#aaa', fontSize: 12, lineHeight: 17, marginTop: 2 },
});
