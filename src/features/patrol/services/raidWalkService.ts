// RaidWalkService - the weekly synchronized event.
//
// Daily Pulse is the "every day a small thing." Raid Walks are the "every
// week a big thing." Same loop, longer cadence, much bigger payoff. While
// pulse is a 10-minute window, the raid is a 90-minute window once per
// ISO-week, and during it a special chapter is available.
//
// Like DailyPulse, we compute the schedule deterministically from
// (isoWeek, isoYear, skin) so every device opens the raid at the same wall
// clock - no server needed. Once a real backend exists, the schedule can be
// overridden via a future RemoteSyncService.getRaidWindow extension.
//
// The chapter that fires during a raid is authored separately and registered
// with raidChapterId() so this service is content-agnostic.

const HASH_SEED = 2166136261;

export interface RaidWindow {
  /** Skin this window belongs to. */
  skin: string;
  /** ISO year. */
  isoYear: number;
  /** ISO week number (1..53). */
  isoWeek: number;
  /** Day of week the window opens (0=Sun, 1=Mon, ..., 6=Sat). */
  dayOfWeek: number;
  /** Local seconds-since-midnight when the window opens. */
  startSecondsLocal: number;
  /** Window length in minutes. */
  durationMinutes: number;
  /** In-fiction headline shown on Home. */
  headline: string;
  /** Chapter id authored for this skin's raid. */
  chapterId: string;
}

export interface RaidProjection {
  window: RaidWindow | null;
  active: boolean;
  upcoming: boolean;
  /** Millis until window opens (negative if past). */
  startsInMs: number;
  /** Millis until window closes. */
  endsInMs: number;
}

function hashStringToInt(s: string): number {
  let h = HASH_SEED >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function getISOWeek(d: Date): { isoYear: number; isoWeek: number } {
  // Algorithm from ISO 8601 standard.
  const target = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (target.getUTCDay() + 6) % 7; // Mon=0..Sun=6
  target.setUTCDate(target.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4));
  const isoYear = target.getUTCFullYear();
  const weekNum =
    1 +
    Math.round(
      ((target.getTime() - firstThursday.getTime()) / 86400000 -
        3 +
        ((firstThursday.getUTCDay() + 6) % 7)) /
        7,
    );
  return { isoYear, isoWeek: weekNum };
}

function secondsSinceLocalMidnight(d: Date = new Date()): number {
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
}

/** Pure: deterministic raid window for a given week + skin. */
function computeRaidWindow(isoYear: number, isoWeek: number, skin: string): RaidWindow {
  const h = hashStringToInt(`${isoYear}-W${isoWeek}-${skin}`);
  // Day of week: lean toward weekends (Sat/Sun) 60% of the time.
  const dayPool = [0, 6, 6, 5, 5, 0, 0, 4]; // weighted: Sat, Sun, Fri, Thu
  const dayOfWeek = dayPool[h % dayPool.length] ?? 6;
  // Window opens between 11:00 and 17:00 local time, 15-minute steps (25 steps).
  const stepIdx = Math.floor(h / 13) % 25;
  const startSecondsLocal = 11 * 3600 + stepIdx * 15 * 60;

  const HEADLINES_BY_SKIN: Record<string, { headline: string; chapterId: string }> = {
    prison: {
      headline: 'Drill in the yard. Everyone walks today.',
      chapterId: 'prison.raid.theDrill',
    },
    neighborhood: {
      headline: 'Block meeting tonight. The whole watch is on the streets.',
      chapterId: 'neighborhood.raid.theMeeting',
    },
    theyreHere: {
      headline: 'A signal is breaking through. The whole band is listening.',
      chapterId: 'theyreHere.raid.theBreakthrough',
    },
  };
  const meta = HEADLINES_BY_SKIN[skin] ?? HEADLINES_BY_SKIN.prison;
  return {
    skin,
    isoYear,
    isoWeek,
    dayOfWeek,
    startSecondsLocal,
    durationMinutes: 90,
    headline: meta.headline,
    chapterId: meta.chapterId,
  };
}

function localDayOfWeek(d: Date = new Date()): number {
  return d.getDay();
}

class RaidWalkServiceImpl {
  /** Get the window for this ISO-week + skin. */
  thisWeek(skin: string, now: Date = new Date()): RaidWindow {
    const { isoYear, isoWeek } = getISOWeek(now);
    return computeRaidWindow(isoYear, isoWeek, skin);
  }

  /** Get the next upcoming window if this week's has already passed. */
  nextWeek(skin: string, now: Date = new Date()): RaidWindow {
    const advanced = new Date(now);
    advanced.setDate(advanced.getDate() + 7);
    const { isoYear, isoWeek } = getISOWeek(advanced);
    return computeRaidWindow(isoYear, isoWeek, skin);
  }

  projection(skin: string, now: Date = new Date()): RaidProjection {
    const win = this.thisWeek(skin, now);
    const today = localDayOfWeek(now);
    let startsInMs: number;
    let endsInMs: number;
    if (today === win.dayOfWeek) {
      const sec = secondsSinceLocalMidnight(now);
      startsInMs = (win.startSecondsLocal - sec) * 1000;
      endsInMs = (win.startSecondsLocal + win.durationMinutes * 60 - sec) * 1000;
    } else {
      const dayDelta = ((win.dayOfWeek - today) + 7) % 7;
      // If dayDelta is 0 here, that means we are on the raid day but checked
      // outside the active path above; treat as "today, missed". Use thisWeek's
      // start vs now.
      if (dayDelta === 0) {
        const sec = secondsSinceLocalMidnight(now);
        startsInMs = (win.startSecondsLocal - sec) * 1000;
        endsInMs = (win.startSecondsLocal + win.durationMinutes * 60 - sec) * 1000;
      } else {
        const sec = secondsSinceLocalMidnight(now);
        startsInMs = dayDelta * 86400_000 + (win.startSecondsLocal - sec) * 1000;
        endsInMs = dayDelta * 86400_000 + (win.startSecondsLocal + win.durationMinutes * 60 - sec) * 1000;
      }
    }
    // If this week's window has already ended, use next week's.
    if (endsInMs <= 0) {
      const nextWin = this.nextWeek(skin, now);
      const dayDelta = ((nextWin.dayOfWeek - today) + 7) % 7 + 7;
      const sec = secondsSinceLocalMidnight(now);
      const ns = dayDelta * 86400_000 + (nextWin.startSecondsLocal - sec) * 1000;
      const ne = ns + nextWin.durationMinutes * 60 * 1000;
      return {
        window: nextWin,
        active: false,
        upcoming: true,
        startsInMs: ns,
        endsInMs: ne,
      };
    }
    const active = startsInMs <= 0 && endsInMs > 0;
    const upcoming = startsInMs > 0;
    return { window: win, active, upcoming, startsInMs, endsInMs };
  }

  /** The flag a session should record when it begins during a raid. */
  raidFlag(skin: string, isoYear: number, isoWeek: number): string {
    return `raid.${skin}.${isoYear}-W${String(isoWeek).padStart(2, '0')}`;
  }
}

export const RaidWalkService = new RaidWalkServiceImpl();
