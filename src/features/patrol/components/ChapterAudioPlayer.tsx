// ChapterAudioPlayer — invisible audio player for chapter briefing narration.
//
// Uses expo-video's `useVideoPlayer` hook which happily plays audio-only mp3
// files. We don't render the VideoView — the audio is routed through the
// system media channel as-is.
//
// expo-video is lazy-required at module load, so a missing or broken native
// module yields a no-op component instead of crashing the screen.

import React from 'react';

let useVideoPlayer: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  useVideoPlayer = require('expo-video').useVideoPlayer;
} catch {
  // expo-video not present — render falls through to TTS at the call site
}

interface ChapterAudioPlayerProps {
  source: any;
  shouldPlay: boolean;
  onEnded?: () => void;
}

export const ChapterAudioPlayer: React.FC<ChapterAudioPlayerProps> = ({
  source,
  shouldPlay,
  onEnded,
}) => {
  // Hook must be called unconditionally — guard with an inner null-check
  // so an absent expo-video shows up at render time, not as a hook violation.
  if (!useVideoPlayer) {
    return null;
  }
  return (
    <ChapterAudioPlayerInner
      source={source}
      shouldPlay={shouldPlay}
      onEnded={onEnded}
    />
  );
};

const ChapterAudioPlayerInner: React.FC<ChapterAudioPlayerProps> = ({
  source,
  shouldPlay,
  onEnded,
}) => {
  const player = useVideoPlayer(source, (p: any) => {
    try {
      p.loop = false;
      p.muted = false;
    } catch {}
  });

  React.useEffect(() => {
    if (!player) return;
    try {
      if (shouldPlay) {
        try {
          player.seekTo(0);
        } catch {}
        player.play();
      } else {
        player.pause();
      }
    } catch {}
  }, [shouldPlay, player]);

  React.useEffect(() => {
    if (!player || !onEnded) return;
    let cancelled = false;
    try {
      const sub = player.addListener?.('playToEnd', () => {
        if (!cancelled) onEnded();
      });
      return () => {
        cancelled = true;
        try {
          sub?.remove?.();
        } catch {}
      };
    } catch {
      return () => {
        cancelled = true;
      };
    }
  }, [player, onEnded]);

  return null;
};

// Static map of chapter audio so callers can ask `hasAudio(graphId)` without
// instantiating a player. Add more entries here as you author chapter audio.
export const CHAPTER_AUDIO: Record<string, () => any> = {
  'neighborhood.ch01.wrongPorchLight': () =>
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../../../../assets/audio/chapter1_briefing.mp3'),
};

export function hasChapterAudio(graphId: string): boolean {
  return Boolean(CHAPTER_AUDIO[graphId]);
}

export function loadChapterAudio(graphId: string): any | null {
  const loader = CHAPTER_AUDIO[graphId];
  return loader ? loader() : null;
}

export default ChapterAudioPlayer;
