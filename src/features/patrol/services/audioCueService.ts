// Audio cue service — short non-verbal-feeling cues for hands-free play.
//
// We don't bundle chime audio files yet (that's a follow-up content pass).
// Until we do, cues are delivered as:
//   • a layered haptic pattern (felt with phone in pocket)
//   • a tiny spoken "earcon" via TTS with a low-pitch / fast-rate voicing,
//     designed to sound like a tone rather than a word ("mm", "tk", "hsh")
//
// The contract is intentional: AudioCueService.play(kind) should always do
// the same thing regardless of platform. When we add real chimes we swap the
// implementation here without touching the HUD.

import * as Haptics from 'expo-haptics';
import { TTSService } from './ttsService';

export type CueKind =
  /** A new beat just appeared. */
  | 'beatArrived'
  /** A chance moment is starting; pay attention. */
  | 'chanceIncoming'
  /** A chance moment resolved as success. */
  | 'outcomeSuccess'
  /** A chance moment resolved as partial. */
  | 'outcomePartial'
  /** A chance moment resolved as failure. */
  | 'outcomeFailure'
  /** Player needs to make a choice (and voice failed or is unavailable). */
  | 'attentionNeeded'
  /** Patrol just started. */
  | 'patrolBegin'
  /** Patrol completed. */
  | 'patrolEnd';

interface CueDef {
  haptic?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
  /** A non-verbal earcon shaped to feel like a tone. */
  earcon?: string;
  earconRate?: number;
  earconPitch?: number;
}

const CUES: Record<CueKind, CueDef> = {
  beatArrived: { haptic: 'light' },
  chanceIncoming: {
    haptic: 'warning',
    earcon: 'mm hmm',
    earconRate: 0.7,
    earconPitch: 0.7,
  },
  outcomeSuccess: {
    haptic: 'success',
  },
  outcomePartial: {
    haptic: 'warning',
  },
  outcomeFailure: {
    haptic: 'error',
  },
  attentionNeeded: {
    haptic: 'medium',
    earcon: 'hey',
    earconRate: 0.9,
    earconPitch: 1.2,
  },
  patrolBegin: { haptic: 'medium' },
  patrolEnd: { haptic: 'success' },
};

class AudioCueServiceImpl {
  async play(kind: CueKind): Promise<void> {
    const def = CUES[kind];
    if (!def) return;

    if (def.haptic) {
      try {
        switch (def.haptic) {
          case 'light':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'medium':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'heavy':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          case 'success':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case 'warning':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
          case 'error':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
        }
      } catch {
        // device may not support haptics
      }
    }

    if (def.earcon) {
      // Fire the earcon as a non-queued, replace-current speech utterance so
      // it cuts through. It's a tonal hint, not narrative — keep it short.
      TTSService.speak(def.earcon, {
        persona: 'system',
        rate: def.earconRate,
        pitch: def.earconPitch,
        queue: false,
      });
    }
  }
}

export const AudioCueService = new AudioCueServiceImpl();
