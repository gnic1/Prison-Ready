// briefingAudioService — plays the optional MP3 narration for a chapter's
// briefing. Lazy-requires expo-audio so the build doesn't fail when the
// package isn't installed locally.

// eslint-disable-next-line @typescript-eslint/no-require-imports
type ExpoAudio = any;
let expoAudio: ExpoAudio | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  expoAudio = require('expo-audio');
} catch {
  // module not present — playback no-ops
}

// Per-chapter audio sources. Add additional chapters here as audio is authored.
const AUDIO_BY_CHAPTER: Record<string, any> = {
  'neighborhood.ch01.wrongPorchLight': require('../../../../assets/audio/chapter1_briefing.mp3'),
};

class BriefingAudioServiceImpl {
  private player: any = null;
  private currentSource: any = null;

  hasAudioFor(graphId: string): boolean {
    return Boolean(AUDIO_BY_CHAPTER[graphId]);
  }

  async play(graphId: string): Promise<void> {
    const source = AUDIO_BY_CHAPTER[graphId];
    if (!source || !expoAudio) return;

    try {
      if (this.currentSource !== source) {
        await this.stop();
        // Use the imperative createAudioPlayer API which works outside hooks.
        if (typeof expoAudio.createAudioPlayer === 'function') {
          this.player = expoAudio.createAudioPlayer(source);
          this.currentSource = source;
        }
      }
      if (this.player) {
        try {
          this.player.seekTo(0);
        } catch {}
        this.player.play();
      }
    } catch {
      // best-effort
    }
  }

  async stop(): Promise<void> {
    if (!this.player) return;
    try {
      this.player.pause();
    } catch {}
    try {
      if (typeof this.player.remove === 'function') {
        this.player.remove();
      }
    } catch {}
    this.player = null;
    this.currentSource = null;
  }

  isPlaying(): boolean {
    return Boolean(this.player && (this.player.playing || this.player.isPlaying));
  }
}

export const BriefingAudioService = new BriefingAudioServiceImpl();
