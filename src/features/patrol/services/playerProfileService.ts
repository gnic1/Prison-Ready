// PlayerProfileService - persistent player meta-progression.
//
// Owns the "you've been showing up" layer that lives across patrols:
//   - lifetime distance + total patrols (a number you can be proud of)
//   - currentStreak / longestStreak in walking days (the consistency engine)
//   - lastWalkedDate (drives off-day dispatches + streak rollover)
//   - chaptersCompleted (gate for unlock-by-completion content)
//   - hardModeUnlocked (7+ day streak earns "rain in the yard")
//   - lifetimeStats (slow-accumulating insight/vigilance/stamina/resolve baseline)
//
// All persisted to AsyncStorage. Singleton + pub/sub like patrolEngine so
// any screen can subscribe and re-render.
//
// Date handling: dates stored as ISO yyyy-mm-dd in the device's local timezone.
// Streak rolls over at local midnight. Off-by-one tolerated; we are not a
// banking app and a missed midnight is fine.

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PatrolStats } from '../types/storyGraph';

const KEY = 'player.profile.v1';
const HARD_MODE_STREAK_THRESHOLD = 7;

export interface PlayerProfile {
  /** Schema version - bump when shape changes. */
  schema: 1;
  /** Total meters walked across all patrols. */
  lifetimeMeters: number;
  /** Total patrols started (whether completed or aborted). */
  patrolsStarted: number;
  /** Total patrols completed (reached end node). */
  patrolsCompleted: number;
  /** Local yyyy-mm-dd of the most recent patrol day. */
  lastWalkedDate: string | null;
  /** Distinct days walked in a row including today (or last walked day if today not yet). */
  currentStreak: number;
  /** Longest streak ever achieved. */
  longestStreak: number;
  /** Chapter ids that have been completed at least once. */
  chaptersCompleted: string[];
  /** Lifetime accumulating stat baseline (separate from per-patrol stats). */
  lifetimeStats: PatrolStats;
  /** True once user has hit HARD_MODE_STREAK_THRESHOLD at least once. */
  hardModeUnlocked: boolean;
  /** Local yyyy-mm-dd dates the user opened the app (used to detect off-days). */
  lastAppOpenDate: string | null;
  /** Created at first profile init (ms). */
  createdAt: number;
  /** Most recent profile mutation (ms). */
  updatedAt: number;
}

type Listener = (profile: PlayerProfile) => void;

function todayLocalISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysBetween(a: string, b: string): number {
  // Both ISO yyyy-mm-dd. Returns b - a in days. May be negative.
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

function defaultProfile(): PlayerProfile {
  const now = Date.now();
  return {
    schema: 1,
    lifetimeMeters: 0,
    patrolsStarted: 0,
    patrolsCompleted: 0,
    lastWalkedDate: null,
    currentStreak: 0,
    longestStreak: 0,
    chaptersCompleted: [],
    lifetimeStats: { insight: 0, vigilance: 0, stamina: 0, resolve: 0 },
    hardModeUnlocked: false,
    lastAppOpenDate: null,
    createdAt: now,
    updatedAt: now,
  };
}

class PlayerProfileServiceImpl {
  private profile: PlayerProfile = defaultProfile();
  private loaded = false;
  private listeners: Set<Listener> = new Set();

  async load(): Promise<PlayerProfile> {
    if (this.loaded) return this.profile;
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PlayerProfile;
        if (parsed && parsed.schema === 1) {
          this.profile = parsed;
        }
      }
    } catch {
      // Best-effort. Profile stays default on parse error.
    }
    this.loaded = true;
    this.emit();
    return this.profile;
  }

  /** Synchronous accessor. Call load() once at app start to hydrate. */
  get(): PlayerProfile {
    return this.profile;
  }

  isHardModeUnlocked(): boolean {
    return this.profile.hardModeUnlocked;
  }

  /** Streak length the player needs for hard mode (exposed for UI). */
  get streakThreshold(): number {
    return HARD_MODE_STREAK_THRESHOLD;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.profile);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Called once per app launch. Updates lastAppOpenDate + handles streak break. */
  async noteAppOpen(): Promise<void> {
    const today = todayLocalISO();
    const last = this.profile.lastWalkedDate;
    if (last) {
      const gap = daysBetween(last, today);
      // If more than 1 day has passed since last walk, the streak is broken.
      if (gap >= 2 && this.profile.currentStreak > 0) {
        this.profile = { ...this.profile, currentStreak: 0 };
      }
    }
    this.profile = { ...this.profile, lastAppOpenDate: today, updatedAt: Date.now() };
    await this.persist();
    this.emit();
  }

  async notePatrolStarted(): Promise<void> {
    this.profile = {
      ...this.profile,
      patrolsStarted: this.profile.patrolsStarted + 1,
      updatedAt: Date.now(),
    };
    await this.persist();
    this.emit();
  }

  /**
   * Called when a patrol successfully completes. Updates lifetime meters,
   * streak, chapter completion, and unlocks hard mode if threshold hit.
   */
  async notePatrolCompleted(args: {
    chapterId: string;
    distanceMeters: number;
    finalStats: PatrolStats;
    startStats: PatrolStats;
  }): Promise<void> {
    const today = todayLocalISO();
    const last = this.profile.lastWalkedDate;
    let nextStreak = this.profile.currentStreak;
    if (last === today) {
      // Already walked today. Streak unchanged.
    } else if (last && daysBetween(last, today) === 1) {
      // Consecutive day. Bump.
      nextStreak = this.profile.currentStreak + 1;
    } else {
      // First walk or returning after a break.
      nextStreak = 1;
    }
    const longest = Math.max(this.profile.longestStreak, nextStreak);
    const completed = this.profile.chaptersCompleted.includes(args.chapterId)
      ? this.profile.chaptersCompleted
      : [...this.profile.chaptersCompleted, args.chapterId];
    const lifetimeStats: PatrolStats = {
      insight: this.profile.lifetimeStats.insight + Math.max(0, args.finalStats.insight - args.startStats.insight),
      vigilance: this.profile.lifetimeStats.vigilance + Math.max(0, args.finalStats.vigilance - args.startStats.vigilance),
      stamina: this.profile.lifetimeStats.stamina + Math.max(0, args.finalStats.stamina - args.startStats.stamina),
      resolve: this.profile.lifetimeStats.resolve + Math.max(0, args.finalStats.resolve - args.startStats.resolve),
    };
    this.profile = {
      ...this.profile,
      lifetimeMeters: this.profile.lifetimeMeters + Math.max(0, args.distanceMeters),
      patrolsCompleted: this.profile.patrolsCompleted + 1,
      lastWalkedDate: today,
      currentStreak: nextStreak,
      longestStreak: longest,
      chaptersCompleted: completed,
      lifetimeStats,
      hardModeUnlocked: this.profile.hardModeUnlocked || nextStreak >= HARD_MODE_STREAK_THRESHOLD,
      updatedAt: Date.now(),
    };
    await this.persist();
    this.emit();
  }

  /** Days since lastWalkedDate, or null if never walked. */
  daysSinceLastWalk(): number | null {
    if (!this.profile.lastWalkedDate) return null;
    return daysBetween(this.profile.lastWalkedDate, todayLocalISO());
  }

  /** Dev/test affordance. Resets everything. */
  async reset(): Promise<void> {
    this.profile = defaultProfile();
    await this.persist();
    this.emit();
  }

  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(KEY, JSON.stringify(this.profile));
    } catch {
      // Best-effort.
    }
  }

  private emit(): void {
    for (const l of this.listeners) {
      try {
        l(this.profile);
      } catch {}
    }
  }
}

export const PlayerProfileService = new PlayerProfileServiceImpl();
