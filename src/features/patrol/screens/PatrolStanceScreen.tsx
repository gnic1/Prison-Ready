// PatrolStanceScreen - the pre-walk identity ritual.
//
// 3-5 seconds of screen time between the briefing and the HUD. The player
// picks the stance they're walking in today. Each stance applies small stat
// modifiers and writes a flag into the session log. A short in-voice TTS
// affirmation plays on pick. This is the "you told yourself who you are
// before the walk began" hook.
//
// Stances come from graph.stances if authored; otherwise a skin-aware default
// triplet is used.

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
import { patrolEngine } from '../services/patrolEngine';
import { TTSService } from '../services/ttsService';
import { AudioCueService } from '../services/audioCueService';
import { DailyPulseService } from '../services/dailyPulseService';
import { RaidWalkService } from '../services/raidWalkService';
import { DEFAULT_STATS } from '../types/storyGraph';
import type { Stance, PatrolStats } from '../types/storyGraph';

const MONO = Platform.select({ ios: 'Courier', android: 'monospace', default: 'Courier' });
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

interface RouteParams {
  graphId: string;
}

const DEFAULT_STANCES_BY_SKIN: Record<string, Stance[]> = {
  prison: [
    {
      id: 'heads-down',
      label: 'Heads down',
      hint: 'Move with the flow. Be unremarkable.',
      effects: { resolve: 1, vigilance: -1 },
      flag: 'stance.headsDown',
      spokenAffirmation: 'Heads down. The yard doesn\u2019t see you.',
    },
    {
      id: 'watchful',
      label: 'Watchful',
      hint: 'Eyes up. Note everything.',
      effects: { vigilance: 1, stamina: -1 },
      flag: 'stance.watchful',
      spokenAffirmation: 'Watchful. You are reading the room.',
    },
    {
      id: 'ready',
      label: 'Ready',
      hint: 'Composure under pressure. Match the pace.',
      effects: { stamina: 1, insight: -1 },
      flag: 'stance.ready',
      spokenAffirmation: 'Ready. Whatever the yard sends, you absorb.',
    },
  ],
  neighborhood: [
    {
      id: 'routine',
      label: 'Routine',
      hint: 'Just another night on the block.',
      effects: { resolve: 1, vigilance: -1 },
      flag: 'stance.routine',
      spokenAffirmation: 'Routine. Just another walk.',
    },
    {
      id: 'watchful',
      label: 'Watchful',
      hint: 'Read every porch, every curb, every car.',
      effects: { vigilance: 1, stamina: -1 },
      flag: 'stance.watchful',
      spokenAffirmation: 'Watchful. You are reading the street.',
    },
    {
      id: 'visible',
      label: 'Visible',
      hint: 'Be the deterrent the block agreed on.',
      effects: { stamina: 1, insight: -1 },
      flag: 'stance.visible',
      spokenAffirmation: 'Visible. The block knows you are out.',
    },
  ],
  theyreHere: [
    {
      id: 'quiet',
      label: 'Quiet',
      hint: 'Let the static do the talking.',
      effects: { resolve: 1, vigilance: -1 },
      flag: 'stance.quiet',
      spokenAffirmation: 'Quiet. The signal will come to you.',
    },
    {
      id: 'tuning',
      label: 'Tuning',
      hint: 'Catch the edge of the carrier wave.',
      effects: { vigilance: 1, stamina: -1 },
      flag: 'stance.tuning',
      spokenAffirmation: 'Tuning. You are riding the band.',
    },
    {
      id: 'transmitting',
      label: 'Transmitting',
      hint: 'You are the one being listened to.',
      effects: { stamina: 1, insight: -1 },
      flag: 'stance.transmitting',
      spokenAffirmation: 'Transmitting. Your voice carries.',
    },
  ],
};

function applyDelta(base: PatrolStats, delta: Partial<PatrolStats>): PatrolStats {
  return {
    insight: base.insight + (delta.insight ?? 0),
    vigilance: base.vigilance + (delta.vigilance ?? 0),
    stamina: base.stamina + (delta.stamina ?? 0),
    resolve: base.resolve + (delta.resolve ?? 0),
  };
}

export const PatrolStanceScreen: React.FC = () => {
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
  const screenGradient = theme.gradients.screen;
  const stances = graph.stances ?? DEFAULT_STANCES_BY_SKIN[graph.skin] ?? DEFAULT_STANCES_BY_SKIN.prison;

  const handlePick = async (stance: Stance) => {
    if (busy) return;
    setBusy(true);
    try {
      await AudioCueService.play('patrolBegin');
      TTSService.speak(stance.spokenAffirmation, { persona: 'narrator' });
      const startingStats = applyDelta(DEFAULT_STATS, stance.effects);
      // Detect concurrent raid + pulse so the session log captures them.
      const extraFlags: string[] = [];
      try {
        const raid = RaidWalkService.projection(graph.skin);
        if (raid.active && raid.window) {
          extraFlags.push(RaidWalkService.raidFlag(graph.skin, raid.window.isoYear, raid.window.isoWeek));
        }
        const pulseProj = await DailyPulseService.projectionToday(graph.skin);
        if (pulseProj.active) {
          extraFlags.push(DailyPulseService.pulseFlag(graph.skin));
        }
      } catch {}
      await patrolEngine.start(graph, startingStats, { stanceFlag: stance.flag, extraFlags });
      navigation.replace('PatrolHUD', { graphId: graph.id });
    } catch {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={screenGradient} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safeFill} edges={['top', 'bottom']}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            disabled={busy}
          >
            <Text style={styles.backLabel}>BACK</Text>
          </TouchableOpacity>
          <Text style={[styles.eyebrow, { color: accent }]}>PRE-PATROL // STANCE</Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.prompt, { fontFamily: SERIF }]}>
            Before you step out, decide who you are walking as.
          </Text>
          <Text style={[styles.subPrompt, { color: '#aaa' }]}>
            The yard reads what you bring.
          </Text>

          <View style={styles.stancesWrap}>
            {stances.map((s) => (
              <TouchableOpacity
                key={s.id}
                activeOpacity={0.85}
                onPress={() => handlePick(s)}
                disabled={busy}
                style={[
                  styles.stanceCard,
                  {
                    borderColor: accent,
                    opacity: busy ? 0.5 : 1,
                  },
                ]}
              >
                <Text style={[styles.stanceLabel, { fontFamily: SERIF }]}>{s.label}</Text>
                <Text style={[styles.stanceHint, { color: accent }]}>{s.hint.toUpperCase()}</Text>
                <View style={styles.modifierRow}>
                  {(Object.entries(s.effects) as Array<[keyof PatrolStats, number]>)
                    .filter(([, v]) => v !== 0)
                    .map(([k, v]) => (
                      <View
                        key={k}
                        style={[
                          styles.modifierChip,
                          { borderColor: v > 0 ? '#7DE08C' : '#FF7A7A' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.modifierText,
                            { color: v > 0 ? '#7DE08C' : '#FF7A7A' },
                          ]}
                        >
                          {`${k.toUpperCase()} ${v > 0 ? '+' : ''}${v}`}
                        </Text>
                      </View>
                    ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.fineprint, { color: '#888' }]}>
            Your stance shapes the starting sheet only. Choices on the walk
            still drive the story.
          </Text>
        </ScrollView>
      </SafeAreaView>
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
  backLabel: { color: '#888', fontSize: 11, letterSpacing: 1.4, fontFamily: MONO, fontWeight: '700' },
  eyebrow: {
    flex: 1,
    fontSize: 11,
    letterSpacing: 1.6,
    fontFamily: MONO,
    fontWeight: '700',
    textAlign: 'right',
  },
  body: { paddingBottom: 24, gap: 16 },
  prompt: { fontSize: 22, color: '#F2F2F0', lineHeight: 28 },
  subPrompt: { fontSize: 13, fontFamily: MONO, letterSpacing: 1.1, marginBottom: 8 },
  stancesWrap: { gap: 12 },
  stanceCard: {
    backgroundColor: 'rgba(10,12,16,0.88)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  stanceLabel: { fontSize: 22, color: '#F2F2F0', fontWeight: '700', lineHeight: 26 },
  stanceHint: {
    marginTop: 6,
    fontSize: 11,
    letterSpacing: 1.4,
    fontFamily: MONO,
    fontWeight: '700',
  },
  modifierRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 6 },
  modifierChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  modifierText: { fontSize: 10, fontFamily: MONO, fontWeight: '700', letterSpacing: 0.6 },
  fineprint: { fontSize: 11, fontFamily: MONO, lineHeight: 16 },
  errorSafe: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#06080d' },
  errorText: { color: '#EAE6DA', marginBottom: 12, fontSize: 16 },
  errorBtn: { borderWidth: 1, borderColor: '#888', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10 },
  errorBtnLabel: { color: '#EAE6DA', letterSpacing: 1 },
});
