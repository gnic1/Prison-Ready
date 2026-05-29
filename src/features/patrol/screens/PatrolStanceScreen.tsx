// PatrolStanceScreen — Neighborhood Watch reskin.
// Translucent neighborhood bg, NW panel chrome, blue glow on the active
// stance. Tap a stance, hear an affirmation, walk.

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
import { useNavigation, useRoute } from '@react-navigation/native';
import NW from '../../../theme/uiTokens';
import { findGraph } from '../content';
import { patrolEngine } from '../services/patrolEngine';
import { TTSService } from '../services/ttsService';
import { AudioCueService } from '../services/audioCueService';
import { DailyPulseService } from '../services/dailyPulseService';
import { RaidWalkService } from '../services/raidWalkService';
import { DEFAULT_STATS } from '../types/storyGraph';
import type { Stance, PatrolStats } from '../types/storyGraph';

const BG = require('../../../../assets/backgrounds/main_background.png');

interface RouteParams {
  graphId: string;
  partial?: boolean;
  lengthMode?: 'minutes' | 'distance';
  lengthMinutes?: number;
  lengthDistance?: number;
  lengthUnit?: 'km' | 'miles';
}

const DEFAULT_STANCES_BY_SKIN: Record<string, Stance[]> = {
  prison: [
    { id: 'heads-down', label: 'Heads down', hint: 'Walk it small.', effects: {}, flag: 'stance.routine', spokenAffirmation: 'Eyes forward. Steady steps.' },
    { id: 'watchful', label: 'Watchful', hint: 'Catch what shifts.', effects: {}, flag: 'stance.watchful', spokenAffirmation: 'I see what changes.' },
    { id: 'present', label: 'Visible', hint: 'Be the one they see.', effects: {}, flag: 'stance.visible', spokenAffirmation: 'I am here. I see you.' },
  ],
  neighborhood: [
    { id: 'routine', label: 'Routine', hint: 'Same loop as always.', effects: {}, flag: 'stance.routine', spokenAffirmation: 'Just another lap.' },
    { id: 'watchful', label: 'Watchful', hint: 'I am paying attention tonight.', effects: {}, flag: 'stance.watchful', spokenAffirmation: 'I see the block changing.' },
    { id: 'visible', label: 'Visible', hint: 'Let them know I am here.', effects: {}, flag: 'stance.visible', spokenAffirmation: 'I am here. The block knows.' },
  ],
  theyreHere: [
    { id: 'routine', label: 'Sweep', hint: 'Standard pattern.', effects: {}, flag: 'stance.routine', spokenAffirmation: 'Logging baseline.' },
    { id: 'watchful', label: 'Filter up', hint: 'Tune for anomaly.', effects: {}, flag: 'stance.watchful', spokenAffirmation: 'Signal threshold raised.' },
    { id: 'visible', label: 'Beacon', hint: 'Let them paint me.', effects: {}, flag: 'stance.visible', spokenAffirmation: 'I am the marker tonight.' },
  ],
};

export const PatrolStanceScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const params = route.params as RouteParams;
  const graph = findGraph(params.graphId);

  const [picked, setPicked] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  if (!graph) {
    return (
      <View style={styles.errorSafe}>
        <Text style={styles.errorText}>Story graph not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.errorBtn}>
          <Text style={styles.errorBtnLabel}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stances = (graph.stances && graph.stances.length
    ? graph.stances
    : DEFAULT_STANCES_BY_SKIN[graph.skin] ?? DEFAULT_STANCES_BY_SKIN.neighborhood) as Stance[];

  const handlePick = async (stance: Stance) => {
    if (busy) return;
    setPicked(stance.id);
    setBusy(true);

    try {
      AudioCueService.play('patrolBegin').catch(() => {});
      TTSService.speak(stance.spokenAffirmation);

      const pulse = await DailyPulseService.fetchToday(graph.skin).catch(() => null);
      const pulseProjection = DailyPulseService.project(pulse);
      const raidProjection = RaidWalkService.projection(graph.skin);

      const extraFlags: string[] = [];
      if (pulseProjection.active) extraFlags.push('event.pulse.active');
      if (raidProjection.active) extraFlags.push('event.raid.active');

      const startingStats: PatrolStats = { ...DEFAULT_STATS };

      const partialFlag = params.partial ? ['session.partial'] : [];
      await patrolEngine.start(graph, startingStats, {
        stanceFlag: stance.flag,
        extraFlags: [...extraFlags, ...partialFlag],
      });
      navigation.replace('PatrolHUD', {
        graphId: graph.id,
        lengthMode: params.lengthMode,
        lengthMinutes: params.lengthMinutes,
        lengthDistance: params.lengthDistance,
        lengthUnit: params.lengthUnit,
        partial: params.partial,
      });
    } catch {
      setBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={['rgba(7,16,29,0.55)', 'rgba(7,16,29,0.88)']}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>PRE-PATROL // STANCE</Text>
        <Text style={styles.title}>HOW ARE YOU WALKING TONIGHT?</Text>
        <Text style={styles.subtitle}>
          Your stance nudges which beats fire and how skill checks lean.
        </Text>

        {stances.map((s) => {
          const isPicked = picked === s.id;
          return (
            <TouchableOpacity
              key={s.id}
              activeOpacity={0.85}
              onPress={() => handlePick(s)}
              disabled={busy}
              style={[styles.card, isPicked ? styles.cardActive : null]}
            >
              <Text style={[styles.cardLabel, isPicked ? styles.cardLabelActive : null]}>
                {s.label.toUpperCase()}
              </Text>
              {s.hint ? (
                <Text style={[styles.cardHint, isPicked ? styles.cardHintActive : null]}>
                  {s.hint.toUpperCase()}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}

        <Text style={styles.footerHint}>
          Tap a stance to step off. Affirmation plays as the walk begins.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NW.bgInk },
  scroll: { padding: 22, paddingTop: 56 },
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
    marginBottom: 22,
  },
  card: {
    backgroundColor: 'rgba(16,27,41,0.78)',
    borderRadius: NW.radLg,
    borderWidth: 1,
    borderColor: NW.strokeSoft,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  cardActive: {
    backgroundColor: 'rgba(30,144,255,0.18)',
    borderColor: NW.blue,
  },
  cardLabel: {
    color: NW.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  cardLabelActive: { color: '#ffffff' },
  cardHint: {
    color: NW.blueLight,
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 4,
    fontWeight: '700',
  },
  cardHintActive: { color: NW.text },
  footerHint: {
    color: NW.textMuted,
    fontSize: 11,
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 16,
  },
  errorSafe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NW.bgInk,
  },
  errorText: { color: NW.text, marginBottom: 12 },
  errorBtn: { padding: 12 },
  errorBtnLabel: { color: NW.blueLight, fontWeight: '700' },
});

export default PatrolStanceScreen;
