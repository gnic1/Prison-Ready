// Voice command service — pluggable speech-recognition for choice selection.
//
// The interface is intentionally narrow: listen() opens the mic, captures the
// player's reply, and returns the matched Choice id (or null if nothing
// matched / mic was unavailable). Backends are responsible for everything in
// between (recording, transcription, fuzzy-matching aliases).
//
// Backends shipped in this round:
//   • StubBackend  — default. Reports as unavailable. The HUD falls back to
//     tap input and plays an `attentionNeeded` audio cue.
//   • WhisperBackend (later) — records audio with expo-av, posts to a
//     transcription endpoint. Plug in by calling
//     VoiceCommandService.use(new WhisperBackend({ apiKey, endpoint })).
//   • DevBuildBackend (later) — wraps a native speech-recognition module
//     (@react-native-voice/voice or expo-speech-recognition). Requires a
//     custom dev build to install. Plug in the same way.
//
// The HUD always renders tap-able buttons regardless of which backend is in
// use, so voice is purely additive.

export interface ChoiceCandidate {
  id: string;
  label: string;
  /** Phrases that should also resolve to this choice. */
  aliases?: string[];
}

export interface VoiceListenOptions {
  /** Choices the player can pick from. The backend will match against label + aliases. */
  candidates: ChoiceCandidate[];
  /** Max seconds to listen before giving up. Default 5. */
  timeoutSeconds?: number;
}

export interface VoiceListenResult {
  /** The matched choice id, or null if nothing usable was heard. */
  matchedId: string | null;
  /** Confidence 0..1 if the backend reports it. */
  confidence?: number;
  /** Raw transcript if the backend captured one (debug / debrief). */
  transcript?: string;
  /** True if the mic was opened at all. */
  micOpened: boolean;
  /** Human-readable reason if listening was skipped. */
  reason?: string;
}

export interface VoiceBackend {
  readonly name: string;
  isAvailable(): Promise<boolean>;
  listen(options: VoiceListenOptions): Promise<VoiceListenResult>;
}

class StubBackend implements VoiceBackend {
  readonly name = 'stub';
  async isAvailable(): Promise<boolean> {
    return false;
  }
  async listen(_options: VoiceListenOptions): Promise<VoiceListenResult> {
    return {
      matchedId: null,
      micOpened: false,
      reason: 'voice-input-not-configured',
    };
  }
}

class VoiceCommandServiceImpl {
  private backend: VoiceBackend = new StubBackend();

  use(backend: VoiceBackend): void {
    this.backend = backend;
  }

  current(): VoiceBackend {
    return this.backend;
  }

  isAvailable(): Promise<boolean> {
    return this.backend.isAvailable();
  }

  listen(options: VoiceListenOptions): Promise<VoiceListenResult> {
    return this.backend.listen(options);
  }
}

export const VoiceCommandService = new VoiceCommandServiceImpl();

/**
 * Simple fuzzy match used by future backends to resolve a transcript against
 * the offered candidates. Exported here so all backends share matching rules.
 */
export function matchTranscript(
  transcript: string,
  candidates: ChoiceCandidate[],
): { id: string; confidence: number } | null {
  const t = transcript.toLowerCase().trim();
  if (!t) return null;
  let best: { id: string; score: number } | null = null;
  for (const c of candidates) {
    const phrases = [c.label, ...(c.aliases ?? [])];
    for (const p of phrases) {
      const ph = p.toLowerCase();
      let score = 0;
      if (t === ph) score = 1;
      else if (t.includes(ph)) score = 0.85;
      else if (ph.includes(t)) score = 0.65;
      else {
        // word-overlap heuristic
        const tw = new Set(t.split(/\s+/));
        const pw = ph.split(/\s+/);
        const hits = pw.filter((w) => tw.has(w)).length;
        score = pw.length ? (hits / pw.length) * 0.6 : 0;
      }
      if (!best || score > best.score) best = { id: c.id, score };
    }
  }
  if (!best || best.score < 0.5) return null;
  return { id: best.id, confidence: best.score };
}
