// RemoteSyncService - pluggable backend boundary.
//
// Today the app has no server. But three planned features (Ghost Walkers,
// Daily Pulse synchronized events, Raid Walks) only become possible with a
// shared backend. To avoid a future rewrite, every networked call goes through
// this interface; the default implementation is a deterministic local-only
// backend so the features either degrade gracefully (ghost walkers return
// empty) or work fully offline (Daily Pulse via date-hash).
//
// Drop-in implementations to add later:
//   - FirebaseBackend (using @react-native-firebase) - cloud functions for
//     pulse scheduling, anonymous waypoint writes for ghosts.
//   - SupabaseBackend (using @supabase/supabase-js) - same surface, Postgres
//     for waypoints + edge function for pulse.
//   - RestBackend - point at any HTTP service exposing the same JSON.
//
// All methods are async and must not throw. They return safe defaults on
// any error so the rest of the app keeps running.

import type { PatrolStats } from '../types/storyGraph';

export interface DailyPulseWindow {
  /** Skin this pulse belongs to ('prison' | 'neighborhood' | 'theyreHere'). */
  skin: string;
  /** Local yyyy-mm-dd this window applies to. */
  date: string;
  /** Local seconds-since-midnight when the window opens. */
  startSecondsLocal: number;
  /** Window length in minutes. Typically 10. */
  durationMinutes: number;
  /** A short in-fiction headline shown on Home if pulse is active. */
  headline: string;
}

export interface GhostWalkerPing {
  /** Anonymized id (hash). Never personally identifying. */
  id: string;
  /** Approximate lat/lon (snapped to ~50m grid for privacy). */
  lat: number;
  lon: number;
  /** Last-seen unix ms. */
  ts: number;
  /** Skin context. */
  skin?: string;
}

export interface PatrolRecord {
  sessionId: string;
  chapterId: string;
  skin: string;
  distanceMeters: number;
  durationSeconds: number;
  visibleOutcomes: string[];
  startStats: PatrolStats;
  finalStats: PatrolStats;
  completedAt: number;
}

export interface ProfileSnapshot {
  lifetimeMeters: number;
  patrolsCompleted: number;
  longestStreak: number;
  chaptersCompleted: string[];
}

export interface RemoteSyncBackend {
  /** Stable, non-PII identifier for this device/install. */
  readonly clientId: string;
  /** Human-readable name for logging/UI ("Local", "Firebase", etc.). */
  readonly name: string;
  /** Is the network features layer actually online and reachable? */
  isOnline(): Promise<boolean>;
  getDailyPulseWindow(args: { date: string; skin: string }): Promise<DailyPulseWindow | null>;
  fetchGhostWalkers(args: { lat: number; lon: number; radiusMeters: number; skin?: string }): Promise<GhostWalkerPing[]>;
  recordPatrol(record: PatrolRecord): Promise<void>;
  syncProfile(snapshot: ProfileSnapshot): Promise<void>;
}

// ----- Deterministic local backend -----------------------------------------
//
// Daily Pulse works fully offline via a date-hash. Every device computes the
// same window for the same (date, skin) pair, so the "everyone gets the same
// event window" property holds without a server.

function hashStringToInt(s: string): number {
  // Simple xorshift-ish hash. Stable across JS engines.
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function computePulseWindow(date: string, skin: string): DailyPulseWindow {
  const h = hashStringToInt(`${date}:${skin}`);
  // Window opens between 09:00 and 19:00 local time, in 5-minute steps.
  // 120 steps of 5 minutes between 09:00 and 19:00.
  const steps = 120;
  const stepIdx = h % steps;
  const startSecondsLocal = 9 * 3600 + stepIdx * 5 * 60;
  const HEADLINES: Record<string, string[]> = {
    prison: [
      'The yard is holding its breath.',
      'Something is moving on the east wall.',
      'The lapper is walking the wrong direction today.',
      'A new face was processed at dawn.',
    ],
    neighborhood: [
      'A porch light has been on too long.',
      'A car is parked where one should not be.',
      'The block is quieter than it should be at this hour.',
      'A neighbor was seen leaving by the back gate.',
    ],
    theyreHere: [
      'The streetlight on Maple is flickering on a pattern.',
      'A dog is barking at nothing for the third night running.',
      'The compass on your phone drifted six degrees east at dusk.',
      'Someone heard a hum near the substation that was not the substation.',
    ],
  };
  const headlines = HEADLINES[skin] ?? HEADLINES.prison;
  const headline = headlines[Math.floor(h / 7) % headlines.length] ?? headlines[0];
  return {
    skin,
    date,
    startSecondsLocal,
    durationMinutes: 10,
    headline,
  };
}

class LocalOnlyBackendImpl implements RemoteSyncBackend {
  readonly clientId = 'local-only';
  readonly name = 'Local';

  async isOnline(): Promise<boolean> {
    return false;
  }

  async getDailyPulseWindow(args: { date: string; skin: string }): Promise<DailyPulseWindow | null> {
    return computePulseWindow(args.date, args.skin);
  }

  async fetchGhostWalkers(): Promise<GhostWalkerPing[]> {
    return [];
  }

  async recordPatrol(): Promise<void> {
    // No-op. Local profile already stores patrol history.
  }

  async syncProfile(): Promise<void> {
    // No-op.
  }
}

let currentBackend: RemoteSyncBackend = new LocalOnlyBackendImpl();

export const RemoteSyncService = {
  get current(): RemoteSyncBackend {
    return currentBackend;
  },
  /** Drop in a real backend at app start (or in tests). */
  setBackend(backend: RemoteSyncBackend): void {
    currentBackend = backend;
  },
  /** Convenience accessor exposing computePulseWindow for tests and UIs. */
  computeLocalPulseWindow: computePulseWindow,
};

export const LocalOnlyBackend = LocalOnlyBackendImpl;
