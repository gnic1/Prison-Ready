// OffDayDispatchService - acknowledges absence in-fiction.
//
// On app open (or any explicit trigger), if it has been at least one day
// since the player walked, we play a short audio dispatch in the skin's
// voice. Tracked per-day so we never repeat a dispatch for the same day.
//
// Also publishes the most recently fired dispatch on a subscribable channel
// so Home can render it as a card (in addition to it being spoken).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlayerProfileService } from './playerProfileService';
import { TTSService, type Persona } from './ttsService';
import { AudioCueService } from './audioCueService';

const KEY = 'dispatch.lastFiredDate.v1';

export interface Dispatch {
  skin: string;
  eyebrow: string;
  heading: string;
  body: string;
  persona?: Persona;
  minDaysOff: number;
  maxDaysOff?: number;
}

type Listener = (dispatch: Dispatch | null) => void;

function todayLocalISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

class OffDayDispatchServiceImpl {
  private pool: Dispatch[] = [];
  private lastFiredDate: string | null = null;
  private loaded = false;
  private listeners: Set<Listener> = new Set();
  private latest: Dispatch | null = null;

  register(dispatches: Dispatch[]): void {
    this.pool = [...this.pool, ...dispatches];
  }

  async load(): Promise<void> {
    if (this.loaded) return;
    try {
      const raw = await AsyncStorage.getItem(KEY);
      this.lastFiredDate = raw;
    } catch {
      this.lastFiredDate = null;
    }
    this.loaded = true;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.latest);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Latest dispatch that was fired this session (or null). */
  getLatest(): Dispatch | null {
    return this.latest;
  }

  /** Replay the latest dispatch via TTS (user tapped "hear again"). */
  replayLatest(): void {
    if (!this.latest) return;
    TTSService.speak(this.latest.body, { persona: this.latest.persona ?? 'narrator' });
  }

  /** Player explicitly dismissed the surfaced card. Clears the publish channel. */
  dismissLatest(): void {
    this.latest = null;
    this.emit();
  }

  async maybeFire(args?: { skin?: string }): Promise<Dispatch | null> {
    await this.load();
    await PlayerProfileService.load();
    const today = todayLocalISO();
    if (this.lastFiredDate === today) return null;
    const daysSince = PlayerProfileService.daysSinceLastWalk();
    if (daysSince === null || daysSince < 1) return null;

    const candidates = this.pool.filter((d) => {
      if (args?.skin && d.skin !== args.skin) return false;
      if (daysSince < d.minDaysOff) return false;
      if (d.maxDaysOff !== undefined && daysSince >= d.maxDaysOff) return false;
      return true;
    });
    if (candidates.length === 0) return null;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    if (!pick) return null;

    this.lastFiredDate = today;
    AsyncStorage.setItem(KEY, today).catch(() => {});
    AudioCueService.play('beatArrived').catch(() => {});
    TTSService.speak(pick.body, { persona: pick.persona ?? 'narrator' });
    this.latest = pick;
    this.emit();
    return pick;
  }

  async reset(): Promise<void> {
    this.lastFiredDate = null;
    this.latest = null;
    try {
      await AsyncStorage.removeItem(KEY);
    } catch {}
    this.emit();
  }

  private emit(): void {
    for (const l of this.listeners) {
      try {
        l(this.latest);
      } catch {}
    }
  }
}

export const OffDayDispatchService = new OffDayDispatchServiceImpl();
