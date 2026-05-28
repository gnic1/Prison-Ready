// LedgerScreen — Neighborhood Watch reskin of the case log.
// Translucent neighborhood bg, ANPC affinity pills, observation rows.

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
import {
  LedgerService,
  LedgerState,
  NpcRecord,
  ObservationEntry,
} from '../services/ledgerService';

const BG = require('../../../../assets/backgrounds/main_background.png');

export const LedgerScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [state, setState] = React.useState<LedgerState>(LedgerService.get());

  React.useEffect(() => {
    LedgerService.load()
      .then(() => setState(LedgerService.get()))
      .catch(() => {});
    return LedgerService.subscribe(setState);
  }, []);

  const npcs = Object.values(state.npcs);

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={['rgba(7,16,29,0.35)', 'rgba(7,16,29,0.78)']}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <View style={styles.header}>
        <Text style={styles.title}>LEDGER</Text>
        <Text style={styles.subtitle}>What the block has told you so far.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <SectionHeader label="PEOPLE" count={npcs.length} />
        {npcs.length === 0 ? (
          <EmptyHint text="No one yet. Walk a patrol — neighbors will appear here." />
        ) : (
          npcs.map((n) => <NpcRow key={n.id} npc={n} />)
        )}

        <SectionHeader label="OBSERVATIONS" count={state.observations.length} />
        {state.observations.length === 0 ? (
          <EmptyHint text="Beats you flag on a patrol show up here as evidence." />
        ) : (
          state.observations.slice(0, 60).map((o) => <ObsRow key={o.id} obs={o} />)
        )}
      </ScrollView>
    </View>
  );
};

const SectionHeader: React.FC<{ label: string; count: number }> = ({ label, count }) => (
  <View style={styles.sectionRow}>
    <Text style={styles.sectionLabel}>{label}</Text>
    <Text style={styles.sectionCount}>{count}</Text>
  </View>
);

const EmptyHint: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.empty}>
    <Text style={styles.emptyText}>{text}</Text>
  </View>
);

const NpcRow: React.FC<{ npc: NpcRecord }> = ({ npc }) => {
  const aff = npc.affinity;
  const affColor =
    aff > 2 ? NW.success : aff < -2 ? NW.danger : NW.textMuted;
  return (
    <View style={styles.npcRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.npcName}>{npc.name}</Text>
        {npc.tags && npc.tags.length ? (
          <View style={styles.tagRow}>
            {npc.tags.slice(0, 3).map((t) => (
              <Text key={t} style={styles.tag}>
                {t}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
      <View style={[styles.affPill, { borderColor: affColor }]}>
        <Text style={[styles.affText, { color: affColor }]}>{aff > 0 ? '+' : ''}{aff}</Text>
      </View>
    </View>
  );
};

const ObsRow: React.FC<{ obs: ObservationEntry }> = ({ obs }) => (
  <View style={styles.obsRow}>
    <Text style={styles.obsLabel}>{obs.label}</Text>
    {obs.detail ? <Text style={styles.obsDetail}>{obs.detail}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NW.bgInk },
  header: {
    paddingTop: 44,
    paddingHorizontal: 18,
    paddingBottom: 6,
  },
  title: {
    color: NW.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 4,
  },
  subtitle: {
    color: NW.textMuted,
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 0.4,
  },
  scroll: { paddingHorizontal: 14, paddingBottom: 80 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionLabel: {
    color: NW.blueLight,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '800',
    flex: 1,
  },
  sectionCount: {
    color: NW.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  empty: {
    backgroundColor: 'rgba(16,27,41,0.55)',
    borderRadius: NW.radMd,
    borderWidth: 1,
    borderColor: NW.strokeSoft,
    padding: 14,
  },
  emptyText: {
    color: NW.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  npcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,27,41,0.55)',
    borderRadius: NW.radMd,
    borderWidth: 1,
    borderColor: NW.stroke,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  npcName: {
    color: NW.text,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4, gap: 4 },
  tag: {
    color: NW.blueLight,
    fontSize: 10,
    letterSpacing: 1.2,
    backgroundColor: 'rgba(30,144,255,0.16)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontWeight: '700',
  },
  affPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  affText: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  obsRow: {
    backgroundColor: 'rgba(16,27,41,0.5)',
    borderRadius: NW.radSm,
    borderLeftWidth: 2,
    borderLeftColor: NW.blueLight,
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  obsLabel: { color: NW.text, fontSize: 13, fontWeight: '700', lineHeight: 18 },
  obsDetail: { color: NW.textMuted, fontSize: 11, marginTop: 3, lineHeight: 15 },
});

export default LedgerScreen;
