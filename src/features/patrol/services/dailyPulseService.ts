// DailyPulseService - "the event window everyone gets at the same time."
//
// Wraps RemoteSyncService.getDailyPulseWindow with a small cache and a
// computed { active, upcoming, startsInMs, endsInMs } projection. Today's
// window is computed deterministically by skin + local date, so every device
// agrees on when the window opens without needing a server. When a real
// backend is plugged in, the same call can defer to it - the consumer code
// here does not change.
//
// Why pulse matters: it is the FOMO loop. Once a day the world produces a
// moment that only patrols-during-this-window unlock. The headline shown on
// Home is in-fiction ("The yard is holding its breath"), not "10 min event."

import { RemoteSyncService, type DailyPulseWindow } from './remoteSyncService';

export interface DailyPulseProjection {
  window: DailyPulseWindow | null;
  /** True if local time is currently inside the window. */
  active: boolean;
  /** True if window is later today but hasn't opened yet. */
  upcoming: boolean;
  /** Milliseconds until window opens (negative if already past). */
  startsInMs: number;
  /** Milliseconds until window closes (negative if already past). */
  endsInMs: number;
}

function todayLocalISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function secondsSinceLocalMidnight(d: Date = new Date()): number {
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
}

class DailyPulseServiceImpl {
  private cache: Map<string, DailyPulseWindow | null> = new Map();

  private cacheKey(date: string, skin: string): string {
    return `${date}::${skin}`;
  }

  /** Fetch (and cache) the window for skin + today. */
  async fetchToday(skin: string): Promise<DailyPulseWindow | null> {
    const date = todayLocalISO();
    const key = this.cacheKey(date, skin);
    if (this.cache.has(key)) return this.cache.get(key) ?? null;
    try {
      const w = await RemoteSyncService.current.getDailyPulseWindow({ date, skin });
      this.cache.set(key, w);
      return w;
    } catch {
      this.cache.set(key, null);
      return null;
    }
  }

  /** Project a window into "is it happening right now?" state. */
  project(window: DailyPulseWindow | null): DailyPulseProjection {
    if (!window) {
      return { window: null, active: false, upcoming: false, startsInMs: 0, endsInMs: 0 };
    }
    const now = new Date();
    const today = todayLocalISO(now);
    // If the window is for a different date, treat it as not-applicable.
    if (window.date !== today) {
      return { window, active: false, upcoming: false, startsInMs: 0, endsInMs: 0 };
    }
    const sec = secondsSinceLocalMidnight(now);
    const startsInSec = window.startSecondsLocal - sec;
    const endsInSec = window.startSecondsLocal + window.durationMinutes * 60 - sec;
    const startsInMs = startsInSec * 1000;
    const endsInMs = endsInSec * 1000;
    const active = startsInMs <= 0 && endsInMs > 0;
    const upcoming = startsInMs > 0;
    return { window, active, upcoming, startsInMs, endsInMs };
  }

  /** Convenience: get a fresh projection for a skin. */
  async projectionToday(skin: string): Promise<DailyPulseProjection> {
    const w = await this.fetchToday(skin);
    return this.project(w);
  }

  /** The flag a patrol session should record when it begins during pulse. */
  pulseFlag(skin: string, date?: string): string {
    return `pulse.${skin}.${date ?? todayLocalISO()}`;
  }
}

export const DailyPulseService = new DailyPulseServiceImpl();
