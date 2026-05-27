// ChanceMomentPanel — themed in-voice replacement for the old dice UI.
//
// Two phases driven by the engine's session.status:
//   'chanceMomentPrompt'  → narrative setup is on screen, TTS reads it,
//                           soft pulse animation, no buttons. The engine
//                           auto-promotes to reveal after revealDelaySeconds.
//   'chanceMomentReveal'  → outcome caption appears in the skin's voice,
//                           tinted by visibleOutcome (success/partial/failure).
//                           A single "continue" affordance lets the player
//                           move on; absent that tap, the engine can also
//                           auto-advance after a window (HUD decides).
//
// The user never sees: dice, DC, modifier, "skill check", "roll", or any
// system-prompt phrasing. The component never references those terms.

import React from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { ChanceCheck, ChanceOutcomeKind } from '../types/storyGraph';

const MONO = Platform.select({ ios: 'Courier', android: 'monospace', default: 'Courier' });
const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

export type ChancePhase = 'prompt' | 'reveal';

interface ChanceMomentPanelProps {
  check: ChanceCheck;
  phase: ChancePhase;
  /** Set on reveal phase only — the themed outcome caption from the graph. */
  outcomeCaption?: string;
  /** Set on reveal phase only — drives accent tint of the reveal card. */
  visibleOutcome?: ChanceOutcomeKind;
  /** Skin accent for prompt phase. */
  accent: string;
  /** Optional continue affordance. If omitted, no button is rendered. */
  onContinue?: () => void;
}

const OUTCOME_TINT: Record<ChanceOutcomeKind, string> = {
  success: '#7DE08C',
  partial: '#E8C56A',
  failure: '#FF7A7A',
};

const OUTCOME_EYEBROW: Record<ChanceOutcomeKind, string> = {
  // Stay in-world. Avoid system phrasing like "SUCCESS" / "FAILURE".
  success: 'IT HOLDS',
  partial: 'BARELY',
  failure: 'IT BREAKS',
};

export const ChanceMomentPanel: React.FC<ChanceMomentPanelProps> = ({
  check,
  phase,
  outcomeCaption,
  visibleOutcome,
  accent,
  onContinue,
}) => {
  const pulse = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (phase !== 'prompt') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, phase]);

  if (phase === 'prompt') {
    const haloOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.42] });
    return (
      <View style={[styles.card, { borderColor: `${accent}55` }]}>
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: accent, opacity: haloOpacity, borderRadius: 16 },
          ]}
        />
        <Text style={[styles.eyebrow, { color: accent }]}>{`A MOMENT // STAY WITH IT`}</Text>
        <Text style={[styles.promptBody, { fontFamily: SERIF }]}>{check.prompt}</Text>
      </View>
    );
  }

  // reveal phase
  const tint = visibleOutcome ? OUTCOME_TINT[visibleOutcome] : accent;
  const eyebrow = visibleOutcome ? OUTCOME_EYEBROW[visibleOutcome] : 'OUTCOME';
  return (
    <View style={[styles.card, { borderColor: `${tint}66` }]}>
      <Text style={[styles.eyebrow, { color: tint }]}>{eyebrow}</Text>
      <Text style={[styles.revealBody, { fontFamily: SERIF }]}>{outcomeCaption ?? ''}</Text>
      {onContinue ? (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onContinue}
          style={[styles.cta, { borderColor: tint, backgroundColor: `${tint}1A` }]}
        >
          <Text style={[styles.ctaLabel, { color: tint }]}>KEEP MOVING</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(8,10,14,0.92)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.6,
    fontFamily: MONO,
    fontWeight: '700',
  },
  promptBody: {
    marginTop: 10,
    color: '#F2F2F0',
    fontSize: 18,
    lineHeight: 25,
  },
  revealBody: {
    marginTop: 10,
    color: '#F2F2F0',
    fontSize: 18,
    lineHeight: 25,
  },
  cta: {
    marginTop: 14,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ctaLabel: {
    fontSize: 13,
    letterSpacing: 2,
    fontFamily: MONO,
    fontWeight: '800',
  },
});
