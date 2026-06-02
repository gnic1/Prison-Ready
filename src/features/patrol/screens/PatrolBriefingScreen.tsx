// PatrolBriefingScreen — Mission Detail.
// Neighborhood Watch style: translucent street bg, level/clues/missions stat
// row, redacted-text summary (to be revealed at debrief), and a single
// BEGIN PATROL CTA that opens the mission length picker.

import React from 'react';
import {
  Alert,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import NW from '../../../theme/uiTokens';
import { useMainMenuAudio } from '../../../components/MainMenuAudio';
import { findGraph } from '../content';
import { PlayerProfileService } from '../services/playerProfileService';
import { LedgerService } from '../services/ledgerService';
import { graphsForSkin } from '../content';
import { ChapterAudioPlayer, hasChapterAudio, loadChapterAudio } from '../components/ChapterAudioPlayer';
import { TTSService } from '../services/ttsService';

const BG = require('../../../../assets/backgrounds/main_background.png');

interface RouteParams {
  graphId: string;
}

// Words we redact in the summary so the player has to discover them in-walk.
const REDACT_LIST = [
  'Sandersons',
  'Petrovs',
  'Maple',
  'Caldwell',
  'Janelle',
  'Mahoneys',
];

interface SegmentPart {
  text: string;
  redacted: boolean;
}
function buildSegments(line: string): SegmentPart[] {
  const out: SegmentPart[] = [];
  let i = 0;
  while (i < line.length) {
    let matched = false;
    for (const word of REDACT_LIST) {
      if (line.substr(i, word.length).toLowerCase() === word.toLowerCase()) {
        out.push({ text: word, redacted: true });
        i += word.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Accumulate non-redacted characters until next match candidate
      let next = '';
      while (i < line.length) {
        let candidate = false;
        for (const w of REDACT_LIST) {
          if (line.substr(i, w.length).toLowerCase() === w.toLowerCase()) {
            candidate = true;
            break;
          }
        }
        if (candidate) break;
        next += line[i];
        i++;
      }
      if (next.length) out.push({ text: next, redacted: false });
    }
  }
  return out;
}

export const PatrolBriefingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as RouteParams;
  const { setVolume } = useMainMenuAudio();
  useFocusEffect(React.useCallback(() => { setVolume(0); }, [setVolume]));
  const graph = findGraph(params.graphId);
  const [busy, setBusy] = React.useState(false);

  if (!graph) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: NW.bgInk }}>
        <Text style={{ color: NW.text, padding: 24 }}>Story graph not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 16 }}>
          <Text style={{ color: NW.blueLight, padding: 8 }}>Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Stats
  const profile = PlayerProfileService.get();
  const ledger = LedgerService.get();
  const skinGraphs = graphsForSkin(graph.skin);
  const totalChapters = skinGraphs.filter((g) => g.chapter < 90).length;
  const completedChapters = profile.chaptersCompleted.length;
  const cluesDiscovered = ledger.observations.length;
  const level = Math.max(1, Math.floor(profile.lifetimeMeters / 1000) + 1);

  const handleBegin = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const fg = await Location.requestForegroundPermissionsAsync();
      if (fg.status !== 'granted') {
        Alert.alert(
          'Location needed',
          'Patrols depend on real GPS distance. Enable location access to continue.',
        );
        setBusy(false);
        return;
      }
      navigation.navigate('PatrolMissionLength', { graphId: graph.id });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>{'‹'} BACK</Text>
        </TouchableOpacity>
        <Text style={styles.chapterTag}>CHAPTER {graph.chapter}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.titleBlock}>
          <Text style={styles.skin}>{graph.skin.toUpperCase()}</Text>
          <Text style={styles.title}>{graph.title}</Text>
          {graph.subtitle ? (
            <Text style={styles.subtitle}>{graph.subtitle}</Text>
          ) : null}
        </View>

        <View style={styles.bgPanel}>
          <ImageBackground source={BG} style={styles.bgImg} resizeMode="cover">
            <LinearGradient
              colors={['rgba(7,16,29,0.55)', 'rgba(7,16,29,0.85)']}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.statRow}>
              <StatBlock label="LEVEL" value={String(level)} />
              <StatBlock
                label="CHAPTERS"
                value={`${completedChapters} / ${totalChapters}`}
              />
              <StatBlock
                label="CLUES"
                value={`${cluesDiscovered}`}
              />
            </View>

            <View style={styles.summaryBlock}>
              <View style={styles.briefingHeader}>
                <Text style={styles.summaryHeading}>BRIEFING</Text>
                <BriefingPlayButton graphId={graph.id} briefing={graph.briefing} />
              </View>
              {graph.briefing.map((line, idx) => (
                <Text key={idx} style={styles.summaryLine}>
                  {buildSegments(line).map((seg, j) =>
                    seg.redacted ? (
                      <Text key={j} style={styles.redacted}>
                        {' '}
                        {seg.text.replace(/./g, '█')}{' '}
                      </Text>
                    ) : (
                      <Text key={j}>{seg.text}</Text>
                    ),
                  )}
                </Text>
              ))}
            </View>

            <Text style={styles.targetLine}>
              TARGET &middot; {(graph.targetMeters / 1000).toFixed(1)} KM
              {graph.targetSeconds
                ? `  /  ${Math.round(graph.targetSeconds / 60)} MIN`
                : ''}
            </Text>
          </ImageBackground>
        </View>

        <Text style={styles.hint}>
          Names redacted in the briefing get revealed as you discover them on the
          walk and recap at debrief.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.cta, busy ? styles.ctaBusy : null]}
          onPress={handleBegin}
          activeOpacity={0.85}
          disabled={busy}
        >
          <Text style={styles.ctaText}>{busy ? 'CHECKING…' : 'BEGIN PATROL'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const BriefingPlayButton: React.FC<{ graphId: string; briefing: string[] }> = ({ graphId, briefing }) => {
  const [playing, setPlaying] = React.useState(false);
  const usesAudio = hasChapterAudio(graphId);
  const source = React.useMemo(() => (usesAudio ? loadChapterAudio(graphId) : null), [graphId, usesAudio]);

  // Cancel any TTS the moment this screen unmounts so audio can't leak forward.
  React.useEffect(() => {
    return () => {
      if (!usesAudio) {
        try { TTSService.cancelAll(); } catch {}
      }
    };
  }, [usesAudio]);

  const toggle = () => {
    if (playing) {
      if (usesAudio) {
        setPlaying(false);
      } else {
        try { TTSService.cancelAll(); } catch {}
        setPlaying(false);
      }
    } else {
      if (usesAudio) {
        setPlaying(true);
      } else {
        TTSService.speakParagraphs(briefing, { persona: 'narrator' }).then(() => setPlaying(false));
        setPlaying(true);
      }
    }
  };

  return (
    <>
      <TouchableOpacity onPress={toggle} style={styles.audioBtn} activeOpacity={0.85}>
        <Text style={styles.audioBtnText}>{playing ? '◼ STOP' : '▶ PLAY'}</Text>
      </TouchableOpacity>
      {usesAudio && source ? (
        <ChapterAudioPlayer source={source} shouldPlay={playing} onEnded={() => setPlaying(false)} />
      ) : null}
    </>
  );
};

const StatBlock: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.statBlock}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NW.bgInk },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 44,
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  back: { paddingVertical: 6 },
  backText: { color: NW.blueLight, fontSize: 12, letterSpacing: 1.5, fontWeight: '700' },
  chapterTag: {
    color: NW.blueLight,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '800',
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 24 },
  titleBlock: { paddingVertical: 10, paddingHorizontal: 4 },
  skin: {
    color: NW.blueLight,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 6,
  },
  title: {
    color: NW.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1,
    lineHeight: 30,
  },
  subtitle: {
    color: NW.textMuted,
    fontSize: 13,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  bgPanel: {
    marginTop: 14,
    borderRadius: NW.radLg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: NW.stroke,
    backgroundColor: NW.panel,
  },
  bgImg: { padding: 16 },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 14,
  },
  statBlock: {
    flex: 1,
    backgroundColor: 'rgba(7,16,29,0.55)',
    borderRadius: NW.radSm,
    borderWidth: 1,
    borderColor: NW.strokeSoft,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statValue: { color: NW.text, fontSize: 20, fontWeight: '800' },
  statLabel: {
    color: NW.blueLight,
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 2,
    fontWeight: '700',
  },
  summaryBlock: {
    marginBottom: 14,
  },
  briefingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  audioBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1e90ff',
    backgroundColor: 'rgba(30,144,255,0.20)',
  },
  audioBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  summaryHeading: {
    color: NW.blueLight,
    fontSize: 11,
    letterSpacing: 2.5,
    fontWeight: '800',
    marginBottom: 8,
  },
  summaryLine: {
    color: NW.text,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
  redacted: {
    backgroundColor: '#000',
    color: '#000',
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  targetLine: {
    color: NW.warning,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '800',
    marginTop: 4,
  },
  hint: {
    color: NW.textMuted,
    fontSize: 11,
    marginTop: 14,
    paddingHorizontal: 6,
    lineHeight: 17,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 36,
    paddingTop: 8,
  },
  cta: {
    backgroundColor: NW.blue,
    borderRadius: 36,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: NW.blueLight,
  },
  ctaBusy: { opacity: 0.6 },
  ctaText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
});

export default PatrolBriefingScreen;
