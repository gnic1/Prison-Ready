// briefingAudioService — plays the optional MP3 narration for a chapter's
// briefing. Fully lazy: nothing loads expo-audio or the asset at module load
// time. Both are deferred until play() is actually called, so a problem with
// the asset or native module can't take down the app at startup.

type AudioSourceLoader = () => any;

const AUDIO_LOADERS: Record<string, AudioSourceLoader> = {
  'neighborhood.ch01.wrongPorchLight': () =>
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('../../../../assets/audio/chapter1_briefing.mp3'),
};

function tryLoadExpoAudio(): any | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-audio');
  } catch {
    return null;
  }
}

class BriefingAudioServiceImpl {
  private player: any = null;
  private currentLoaderKey: string | null = null;

  hasAudioFor(graphId: string): boolean {
    return Boolean(AUDIO_LOADERS[graphId]);
  }

  async play(graphId: string): Promise<void> {
    const loader = AUDIO_LOADERS[graphId];
    if (!loader) return;

    const expoAudio = tryLoadExpoAudio();
    if (!expoAudio) return;

    try {
      if (this.currentLoaderKey !== graphId) {
        await this.stop();
        const source = loader();
        if (typeof expoAudio.createAudioPlayer === 'function') {
          this.player = expoAudio.createAudioPlayer(source);
          this.currentLoaderKey = graphId;
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
    this.currentLoaderKey = null;
  }

  isPlaying(): boolean {
    return Boolean(this.player && (this.player.playing || this.player.isPlaying));
  }
}

export const BriefingAudioService = new BriefingAudioServiceImpl();
