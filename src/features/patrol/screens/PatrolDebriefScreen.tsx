// PatrolDebriefScreen - what happened, what changed, what comes next.

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
import { useNavigation, useRoute } from '@react-navigation/native';
import { themes } from '../../../theme/themes';
import { findGraph } from '../content';
import { PatrolStorage } from '../services/patrolStorage';
import type { PatrolSession } from '../types/patrolSession';
import type { PatrolStats } from '../types/storyGraph';

const MONO = Platform.select({ ios: 'Courier', android: 'monospace', default: 'Courier' });
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

interface RouteParams {
  graphId: string;
  sessionId: string;
}

const STAT_KEYS: Array<keyof PatrolStats> = ['insight', 'vigilance', 'stamina', 'resolve'];

export const PatrolDebriefScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as RouteParams;
  const graph = findGraph(params.graphId);
  const [session, setSession] = React.useState<PatrolSession | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    PatrolStorage.loadHistory().then((h) => {
      if (cancelled) return;
      const found = h.find((s) => s.id === params.sessionId);
      setSession(found ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [params.sessionId]);

  if (!graph || !session) {
    return (
      <SafeAreaView style={styles.errorSafe}>
        <Text style={styles.errorText}>Loading debrief...</Text>
      </SafeAreaView>
    );
  }

  const theme = themes[graph.skin];
  const accent = theme.colors.accent;
  const screenGradient = theme.gradients.screen;
  const endNode = graph.nodes[session.currentNodeId];
  const debrief =
    endNode && endNode.type === 'end' ? endNode.debrief : null;

  const distanceKm = session.distanceMeters / 1000;
  const minutes = session.endedAt
    ? Math.round((session.endedAt - session.startedAt) / 60000)
    : 0;

  const statDeltas: Array<{ key: keyof PatrolStats; delta: number; final: number }> =
    STAT_KEYS.map((k) => ({
      key: k,
      delta: session.stats[k] - session.startStats[k],
      final: session.stats[k],
    }));

  return (
    <View style={styles.root}>
      <LinearGradient colors={screenGradient} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeFill} edges={['top', 'bottom']}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.eyebrow, { color: accent }]}>
            {`PATROL CLOSED // ${graph.subtitle}`}
          </Text>
          <Text style={[styles.title, { fontFamily: SERIF }]}>{graph.title}</Text>
          {debrief?.closingLine ? (
            <Text style={[styles.closing, { fontFamily: SERIF }]}>
              {debrief.closingLine}
            </Text>
          ) : null}

          <View style={[styles.metricRow, { borderColor: `${accent}40` }]}>
            <Metric label="DISTANCE" value={`${distanceKm.toFixed(2)} km`} accent={accent} />
            <Divider accent={accent} />
            <Metric label="DURATION" value={`${minutes} min`} accent={accent} />
            <Divider accent={accent} />
            <Metric label="BEATS" value={String(session.visitedNodeIds.length)} accent={accent} />
          </View>

          <Section title="STAT SHEET" accent={accent}>
            <View style={styles.statsGrid}>
              {statDeltas.map(({ key, delta, final }) => (
                <View key={key} style={styles.statRow}>
                  <Text style={styles.statName}>{key.toUpperCase()}</Text>
                  <Text style={[styles.statFinal, { color: accent }]}>{final}</Text>
                  <Text
                    style={[
                      styles.statDelta,
                      { color: delta > 0 ? '#7DE08C' : delta < 0 ? '#FF7A7A' : '#888' },
                    ]}
                  >
                    {delta > 0 ? `+${delta}` : delta === 0 ? '\u00b10' : `${delta}`}
                  </Text>
                </View>
              ))}
            </View>
          </Section>

          {session.choiceLog.length ? (
            <Section title="CHOICES MADE" accent={accent}>
              {session.choiceLog.map((c, i) => (
                <Text key={`${c.nodeId}-${i}`} style={styles.logLine}>
                  {`→ ${c.label}`}
                </Text>
              ))}
            </Section>
          ) : null}

          {session.chanceLog.length ? (
            <Section title="MOMENTS LOGGED" accent={accent}>
              {session.chanceLog.map((r, i) => {
                const visible = r.visibleOutcome.toUpperCase();
                const internal = r.internal.toUpperCase();
                const sign = r.modifier >= 0 ? '+' : '-';
                return (
                  <Text key={`${r.nodeId}-${i}`} style={styles.logLine}>
                    {`${r.stat.toUpperCase()} \u00b7 ${r.roll}${sign}${Math.abs(r.modifier)}=${r.total}/${r.dc} -> ${visible} (${internal})`}
                  </Text>
                );
              })}
            </Section>
          ) : null}

          {session.flags.length ? (
            <Section title="LEDGER" accent={accent}>
              <View style={styles.flagWrap}>
                {session.flags.map((f) => (
                  <View key={f} style={[styles.flagPill, { borderColor: `${accent}55` }]}>
                    <Text style={[styles.flagText, { color: accent }]}>{f}</Text>
                  </View>
                ))}
              </View>
            </Section>
          ) : null}

          {debrief?.nextChapterTease ? (
            <View style={[styles.teaseCard, { borderColor: `${accent}55` }]}>
              <Text style={[styles.teaseEyebrow, { color: accent }]}>NEXT</Text>
              <Text style={[styles.teaseLine, { fontFamily: SERIF }]}>
                {debrief.nextChapterTease}
              </Text>
            </View>
          ) : null}
        </ScrollView>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.popToTop()}
          style={[styles.cta, { borderColor: accent, backgroundColor: `${accent}1A` }]}
        >
          <Text style={[styles.ctaLabel, { color: accent }]}>RETURN TO BASE</Text>
        </TouchableOpacity>
      </SafeAreaView>
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

const Section: React.FC<{
  title: string;
  accent: string;
  children: React.ReactNode;
}> = ({ title, accent, children }) => (
  <View style={[styles.section, { borderColor: `${accent}40` }]}>
    <Text style={[styles.sectionTitle, { color: accent }]}>{title}</Text>
    <View style={{ marginTop: 10 }}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#06080d' },
  safeFill: { flex: 1, paddingHorizontal: 16 },
  body: { paddingTop: 16, paddingBottom: 24, gap: 14 },
  eyebrow: { fontSize: 11, letterSpacing: 1.6, fontFamily: MONO, fontWeight: '700' },
  title: { fontSize: 32, color: '#F2F2F0', fontWeight: '700', lineHeight: 36, marginTop: 6 },
  closing: { marginTop: 8, color: '#EAE6DA', fontSize: 16, lineHeight: 23, fontStyle: 'italic' },
  metricRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10,12,16,0.85)',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
  },
  metricItem: { flex: 1, alignItems: 'center' },
  metricDiv: { width: 1 },
  metricLabel: { fontSize: 10, letterSpacing: 1.2, fontFamily: MONO, color: '#888', fontWeight: '700' },
  metricValue: { marginTop: 4, fontSize: 17, fontWeight: '700', fontVariant: ['tabular-nums'] },
  section: {
    backgroundColor: 'rgba(10,12,16,0.85)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  sectionTitle: { fontSize: 11, letterSpacing: 1.6, fontFamily: MONO, fontWeight: '700' },
  statsGrid: { gap: 8 },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  statName: { fontSize: 11, letterSpacing: 1.2, fontFamily: MONO, color: '#aaa', fontWeight: '700', flex: 1 },
  statFinal: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'], width: 36, textAlign: 'right' },
  statDelta: { fontSize: 12, fontFamily: MONO, fontWeight: '700', width: 50, textAlign: 'right' },
  logLine: { color: '#D8DDE0', fontFamily: MONO, fontSize: 12, letterSpacing: 0.6, lineHeight: 18 },
  flagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  flagPill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  flagText: { fontSize: 10, fontFamily: MONO, fontWeight: '700', letterSpacing: 0.6 },
  teaseCard: {
    backgroundColor: 'rgba(10,12,16,0.85)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  teaseEyebrow: { fontSize: 11, letterSpacing: 1.6, fontFamily: MONO, fontWeight: '700' },
  teaseLine: { marginTop: 6, fontSize: 18, color: '#F2F2F0', lineHeight: 24 },
  cta: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  ctaLabel: { fontSize: 14, letterSpacing: 2, fontFamily: MONO, fontWeight: '800' },
  errorSafe: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#06080d' },
  errorText: { color: '#EAE6DA', fontSize: 16 },
});
