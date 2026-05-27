// Text-to-speech wrapper around expo-speech.
//
// All narrative copy that the player would otherwise have to read is fed
// through here. The HUD calls speak() for each beat body, chance prompt, and
// chance reveal caption. We queue requests so we never speak two things on top
// of each other; we cancel everything pending when the screen unmounts or
// when the player aborts.

import * as Speech from 'expo-speech';

export type Persona =
  | 'narrator'
  | 'warden'
  | 'transmission'
  | 'fieldlog'
  | 'system';

interface PersonaConfig {
  rate: number;
  pitch: number;
  language?: string;
}

const PERSONAS: Record<Persona, PersonaConfig> = {
  narrator: { rate: 0.95, pitch: 1.0 },
  warden: { rate: 0.92, pitch: 0.85 },
  transmission: { rate: 1.05, pitch: 1.1 },
  fieldlog: { rate: 1.0, pitch: 0.95 },
  system: { rate: 1.0, pitch: 1.0 },
};

interface SpeakOptions {
  persona?: Persona;
  rate?: number;
  pitch?: number;
  queue?: boolean;
  onStart?: () => void;
  onDone?: () => void;
}

interface QueueItem {
  text: string;
  options: SpeakOptions;
}

class TTSServiceImpl {
  private muted = false;
  private queue: QueueItem[] = [];
  private speaking = false;
  private currentDoneCb: (() => void) | null = null;

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) this.cancelAll();
  }

  isMuted(): boolean {
    return this.muted;
  }

  /** True if an utterance is currently being spoken (or queued behind one). */
  isSpeaking(): boolean {
    return this.speaking || this.queue.length > 0;
  }

  speak(text: string, options: SpeakOptions = {}): Promise<void> {
    if (this.muted || !text?.trim()) {
      options.onDone?.();
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      const wrapped: SpeakOptions = {
        ...options,
        onDone: () => {
          options.onDone?.();
          resolve();
        },
      };
      const item: QueueItem = { text, options: wrapped };
      const replace = options.queue === false;
      if (replace) {
        this.cancelAll();
        this.queue = [item];
      } else {
        this.queue.push(item);
      }
      this.drain();
    });
  }

  async speakParagraphs(paragraphs: string[], options: SpeakOptions = {}): Promise<void> {
    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i].trim();
      if (!para) continue;
      const isLast = i === paragraphs.length - 1;
      await this.speak(para, {
        ...options,
        onDone: isLast ? options.onDone : undefined,
      });
    }
  }

  cancelAll(): void {
    this.queue = [];
    if (this.currentDoneCb) {
      const cb = this.currentDoneCb;
      this.currentDoneCb = null;
      try {
        cb();
      } catch {}
    }
    this.speaking = false;
    Speech.stop().catch(() => {});
  }

  private drain() {
    if (this.speaking) return;
    const next = this.queue.shift();
    if (!next) return;
    this.speaking = true;
    const persona = PERSONAS[next.options.persona ?? 'narrator'];
    const rate = next.options.rate ?? persona.rate;
    const pitch = next.options.pitch ?? persona.pitch;
    this.currentDoneCb = next.options.onDone ?? null;
    next.options.onStart?.();
    Speech.speak(next.text, {
      rate,
      pitch,
      language: persona.language,
      onDone: () => {
        this.speaking = false;
        const cb = this.currentDoneCb;
        this.currentDoneCb = null;
        cb?.();
        this.drain();
      },
      onStopped: () => {
        this.speaking = false;
        const cb = this.currentDoneCb;
        this.currentDoneCb = null;
        cb?.();
        this.drain();
      },
      onError: () => {
        this.speaking = false;
        const cb = this.currentDoneCb;
        this.currentDoneCb = null;
        cb?.();
        this.drain();
      },
    });
  }
}

export const TTSService = new TTSServiceImpl();

/** Map a beat's register to a sensible default persona. */
export function personaForRegister(
  register: 'narrative' | 'fieldlog' | 'transmission' | undefined,
): Persona {
  switch (register) {
    case 'fieldlog':
      return 'fieldlog';
    case 'transmission':
      return 'transmission';
    case 'narrative':
    default:
      return 'narrator';
  }
}
