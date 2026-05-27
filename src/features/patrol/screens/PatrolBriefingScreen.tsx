// PatrolBriefingScreen — chapter cover, briefing copy, "Begin Patrol" CTA.
// Renders before the player starts walking. Requests permissions on demand.

import React from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, LinearGradient as SvgGradient, Rect, Stop, Path, Circle, G } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { themes } from '../../../theme/themes';
import { findGraph } from '../content';
import { PatrolStorage } from '../services/patrolStorage';
import { DEFAULT_STATS } from '../types/storyGraph';

const MONO = Platform.select({ ios: 'Courier', android: 'monospace', default: 'Courier' });
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

interface RouteParams {
  graphId: string;
}

export const PatrolBriefingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as RouteParams;
  const graph = findGraph(params.graphId);
  const [busy, setBusy] = React.useState(false);

  if (!graph) {
    return (
      <SafeAreaView style={styles.errorSafe}>
        <Text style={styles.errorText}>Story graph not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.errorBtn}>
          <Text style={styles.errorBtnLabel}>Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const theme = themes[graph.skin];
  const accent = theme.colors.accent;
  const accentGlow = theme.colors.accentGlow;
  const screenGradient = theme.gradients.screen;

  const handleBegin = async () => {
    if (busy) return;
    setBusy(true);
    try {
      // Request permission up front so the HUD doesn't have to.
      if (Platform.OS !== 'web') {
        const fg = await Location.requestForegroundPermissionsAsync();
        if (fg.status !== 'granted') {
          Alert.alert(
            'Location required',
            'The patrol uses your real movement to advance the story. Without location permission, beats can\u2019t fire.',
            [{ text: 'OK' }],
          );
          setBusy(false);
          return;
        }
      }
      // If a session is already active for a different graph, clear it.
      const existing = await PatrolStorage.loadActive();
      if (existing && existing.graphId !== graph.id) {
        await PatrolStorage.clearActive();
      }
      // Defer engine start to the stance ritual screen — the player's
      // pre-walk stance choice modifies the starting stat sheet.
      navigation.replace('PatrolStance', { graphId: graph.id });
    } catch (err: any) {
      Alert.alert('Could not start patrol', err?.message ?? 'Unknown error.');
    } finally {
      setBusy(false);
    }
  };

  const formatDistance = (m: number) =>
    m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
  const formatMins = (s: number) => `${Math.round(s / 60)} min`;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={screenGradient}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeFill} edges={['top', 'bottom']}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backLabel}>BACK</Text>
          </TouchableOpacity>
          <Text style={[styles.eyebrow, { color: accent }]}>{graph.subtitle}</Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          <ChapterCover skin={graph.skin} accent={accent} accentGlow={accentGlow} chapter={graph.chapter} title={graph.title} />

          <View style={styles.briefingBlock}>
            {graph.briefing.map((p, i) => (
              <Text
                key={i}
                style={[styles.brief, { fontFamily: SERIF }, i > 0 && { marginTop: 12 }]}
              >
                {p}
              </Text>
            ))}
          </View>

          <View style={[styles.estimateRow, { borderColor: `${accent}40` }]}>
            <View style={styles.estimateItem}>
              <Text style={styles.estimateLabel}>DISTANCE</Text>
              <Text style={[styles.estimateValue, { color: accent }]}>
                {formatDistance(graph.targetMeters)}
              </Text>
            </View>
            <View style={[styles.estimateDiv, { backgroundColor: `${accent}40` }]} />
            <View style={styles.estimateItem}>
              <Text style={styles.estimateLabel}>DURATION</Text>
              <Text style={[styles.estimateValue, { color: accent }]}>
                {formatMins(graph.targetSeconds)}
              </Text>
            </View>
            <View style={[styles.estimateDiv, { backgroundColor: `${accent}40` }]} />
            <View style={styles.estimateItem}>
              <Text style={styles.estimateLabel}>CHAPTER</Text>
              <Text style={[styles.estimateValue, { color: accent }]}>
                {String(graph.chapter).padStart(2, '0')}
              </Text>
            </View>
          </View>

          <View style={[styles.statsBlock, { borderColor: `${accent}40` }]}>
            <Text style={[styles.statsTitle, { color: accent }]}>STARTING SHEET</Text>
            <View style={styles.statsGrid}>
              {([
                ['Insight', DEFAULT_STATS.insight],
                ['Vigilance', DEFAULT_STATS.vigilance],
                ['Stamina', DEFAULT_STATS.stamina],
                ['Resolve', DEFAULT_STATS.resolve],
              ] as Array<[string, number]>).map(([label, value]) => (
                <View key={label} style={styles.statCell}>
                  <Text style={styles.statLabel}>{label.toUpperCase()}</Text>
                  <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleBegin}
          disabled={busy}
          style={[styles.cta, { borderColor: accent, backgroundColor: `${accent}1A` }]}
        >
          <Text style={[styles.ctaLabel, { color: accent }]}>
            {busy ? 'STARTING…' : 'BEGIN PATROL'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

interface CoverProps {
  skin: string;
  accent: string;
  accentGlow: string;
  chapter: number;
  title: string;
}

const ChapterCover: React.FC<CoverProps> = ({ skin, accent, accentGlow, chapter, title }) => {
  // A skin-specific abstract cover. Prison Yard: chain-link diagonal lattice
  // with a sodium-light orb. Other skins reuse the same SVG with re-tinted
  // colors (acceptable for v1).
  return (
    <View style={[styles.cover, { borderColor: `${accent}55`, shadowColor: accent }]}>
      <Svg width="100%" height={220} viewBox="0 0 320 220" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <SvgGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#0a0a10" />
            <Stop offset="100%" stopColor="#1a0e08" />
          </SvgGradient>
          <SvgGradient id="lamp" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0%" stopColor={accent} stopOpacity={0.9} />
            <Stop offset="100%" stopColor={accent} stopOpacity={0} />
          </SvgGradient>
        </Defs>
        <Rect x={0} y={0} width={320} height={220} fill="url(#bg)" />
        {/* Sodium lamp halo */}
        <Circle cx={250} cy={50} r={70} fill="url(#lamp)" opacity={0.7} />
        {/* Chain-link lattice */}
        <G opacity={0.55}>
          {Array.from({ length: 14 }).map((_, i) => (
            <Path
              key={`d1-${i}`}
              d={`M -20 ${i * 22} L ${340} ${i * 22 - 200}`}
              stroke={accentGlow}
              strokeWidth={1}
              strokeOpacity={0.5}
            />
          ))}
          {Array.from({ length: 14 }).map((_, i) => (
            <Path
              key={`d2-${i}`}
              d={`M -20 ${i * 22 - 80} L ${340} ${i * 22 + 120}`}
              stroke={accentGlow}
              strokeWidth={1}
              strokeOpacity={0.5}
            />
          ))}
        </G>
        {/* Foreground bars */}
        <G>
          {[60, 130, 200, 270].map((x) => (
            <Rect key={x} x={x} y={0} width={6} height={220} fill="#1a1410" />
          ))}
        </G>
        {/* Chapter token */}
        <G>
          <Rect
            x={20}
            y={170}
            width={64}
            height={32}
            rx={6}
            fill="#0a0a10"
            stroke={accent}
            strokeWidth={1.2}
          />
        </G>
      </Svg>
      <View style={styles.coverOverlay}>
        <Text style={[styles.coverChapter, { color: accent }]}>
          {`CHAPTER ${String(chapter).padStart(2, '0')}`}
        </Text>
        <Text style={[styles.coverTitle, { fontFamily: SERIF }]}>{title}</Text>
        <Text style={[styles.coverSkin, { color: accent }]}>{skin.toUpperCase()}</Text>
      </View>
    </View>
  );
};

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
  backLabel: {
    color: '#888',
    fontSize: 11,
    letterSpacing: 1.4,
    fontFamily: MONO,
    fontWeight: '700',
  },
  eyebrow: {
    flex: 1,
    fontSize: 11,
    letterSpacing: 1.6,
    fontFamily: MONO,
    fontWeight: '700',
    textAlign: 'right',
  },
  body: { paddingBottom: 24, gap: 16 },
  cover: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    backgroundColor: '#0a0a10',
  },
  coverOverlay: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 16,
  },
  coverChapter: {
    fontSize: 12,
    letterSpacing: 1.6,
    fontFamily: MONO,
    fontWeight: '700',
    marginBottom: 4,
  },
  coverTitle: {
    fontSize: 30,
    color: '#F2F2F0',
    fontWeight: '700',
    lineHeight: 34,
  },
  coverSkin: {
    marginTop: 6,
    fontSize: 10,
    letterSpacing: 2,
    fontFamily: MONO,
    fontWeight: '700',
    opacity: 0.85,
  },
  briefingBlock: {
    backgroundColor: 'rgba(10,12,16,0.6)',
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  brief: {
    color: '#EAE6DA',
    fontSize: 16,
    lineHeight: 23,
  },
  estimateRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10,12,16,0.85)',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
  },
  estimateItem: { flex: 1, alignItems: 'center' },
  estimateDiv: { width: 1 },
  estimateLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontFamily: MONO,
    color: '#888',
    fontWeight: '700',
  },
  estimateValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statsBlock: {
    backgroundColor: 'rgba(10,12,16,0.85)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  statsTitle: {
    fontSize: 11,
    letterSpacing: 1.6,
    fontFamily: MONO,
    fontWeight: '700',
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCell: {
    flexBasis: '46%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    fontFamily: MONO,
    color: '#aaa',
    fontWeight: '700',
  },
  statValue: { fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] },
  cta: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  ctaLabel: {
    fontSize: 14,
    letterSpacing: 2,
    fontFamily: MONO,
    fontWeight: '800',
  },
  errorSafe: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#06080d' },
  errorText: { color: '#EAE6DA', marginBottom: 12, fontSize: 16 },
  errorBtn: { borderWidth: 1, borderColor: '#888', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  errorBtnLabel: { color: '#EAE6DA', letterSpacing: 1 },
});
