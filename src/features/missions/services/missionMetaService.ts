import { ActiveMissionState } from '../models/missionEngine.types';

export interface MissionPerformance {
  score: number;
  xpAward: number;
  rank: 'S' | 'A' | 'B' | 'C' | 'D';
  heading: string;
  summary: string;
}

export interface DerivedBadge {
  badgeId: string;
  label: string;
  description: string;
  flavor: string;
  progressCurrent: number;
  progressTarget: number;
  unlocked: boolean;
}

export interface CampaignMeta {
  completedMissions: number;
  strongReports: number;
  artifactCount: number;
  totalDistanceMeters: number;
  activeStreakDays: number;
  totalXP: number;
  playerRank: string;
  latestPerformance: MissionPerformance | null;
  badges: DerivedBadge[];
  nextUnlock: DerivedBadge | null;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getDayKey(isoDate: string) {
  return isoDate.slice(0, 10);
}

function daysBetween(dateA: string, dateB: string) {
  const a = new Date(`${dateA}T00:00:00Z`).getTime();
  const b = new Date(`${dateB}T00:00:00Z`).getTime();
  return Math.round((a - b) / 86400000);
}

export function deriveMissionPerformance(record: ActiveMissionState | null): MissionPerformance | null {
  if (!record) {
    return null;
  }

  let score = clamp(record.progressPercent || 0, 0, 100);

  if (record.status === 'completed') {
    score += 20;
  }
  if (record.artifactIdsEarned.length > 0) {
    score += 15;
  }

  if (record.outcomeBand === 'strong') {
    score += 25;
  } else if (record.outcomeBand === 'partial') {
    score += 12;
  }

  score += clamp(record.queuedBeats.length * 2, 0, 10);
  score = clamp(score, 0, 150);

  let rank: MissionPerformance['rank'] = 'D';
  let heading = 'Rough Landing';
  let summary = 'The route recorded movement, but the debrief still needs sharper payoff.';

  if (score >= 140) {
    rank = 'S';
    heading = 'Legendary Sweep';
    summary = 'This run landed like a headline event. You moved cleanly and converted it into story progress.';
  } else if (score >= 120) {
    rank = 'A';
    heading = 'Elite Debrief';
    summary = 'Strong pace, strong read, strong finish. This is the level the core loop should feel built around.';
  } else if (score >= 95) {
    rank = 'B';
    heading = 'Solid Operation';
    summary = 'The mission held together well and paid out credible progress.';
  } else if (score >= 70) {
    rank = 'C';
    heading = 'Filed and Logged';
    summary = 'The mission worked, but the payoff was more routine than electric.';
  }

  return {
    score,
    xpAward: score * 10,
    rank,
    heading,
    summary,
  };
}

function deriveStreakDays(history: ActiveMissionState[]) {
  const completedDays = Array.from(
    new Set(
      history
        .filter((item) => item.status === 'completed' && item.endedAt)
        .map((item) => getDayKey(item.endedAt as string))
    )
  ).sort((a, b) => b.localeCompare(a));

  if (!completedDays.length) {
    return 0;
  }

  let streak = 1;
  for (let index = 1; index < completedDays.length; index += 1) {
    if (daysBetween(completedDays[index - 1], completedDays[index]) !== 1) {
      break;
    }
    streak += 1;
  }
  return streak;
}

export function buildCampaignMeta(history: ActiveMissionState[]): CampaignMeta {
  const completedMissions = history.filter((item) => item.status === 'completed');
  const strongReports = history.filter((item) => item.outcomeBand === 'strong').length;
  const artifactCount = history.reduce((sum, item) => sum + item.artifactIdsEarned.length, 0);
  const totalDistanceMeters = history.reduce((sum, item) => sum + (item.totalDistanceMeters || 0), 0);
  const activeStreakDays = deriveStreakDays(history);

  const latestPerformance = deriveMissionPerformance(history[0] ?? null);
  const totalXP = history.reduce((sum, item) => sum + (deriveMissionPerformance(item)?.xpAward ?? 0), 0);

  const badges: DerivedBadge[] = [
    {
      badgeId: 'jumping_in',
      label: 'Jumping In',
      description: 'Clear the first mission and prove the shell has a pulse.',
      flavor: 'First completion unlock.',
      progressCurrent: completedMissions.length,
      progressTarget: 1,
      unlocked: completedMissions.length >= 1,
    },
    {
      badgeId: 'route_runner',
      label: 'Route Runner',
      description: 'Chain enough finished runs together that the route starts feeling owned.',
      flavor: 'Unlocked at 3 completed missions.',
      progressCurrent: completedMissions.length,
      progressTarget: 3,
      unlocked: completedMissions.length >= 3,
    },
    {
      badgeId: 'sharp_eye',
      label: 'Sharp Eye',
      description: 'Turn observation into clean report-backs instead of vague completion.',
      flavor: 'Unlocked at 2 strong reports.',
      progressCurrent: strongReports,
      progressTarget: 2,
      unlocked: strongReports >= 2,
    },
    {
      badgeId: 'case_builder',
      label: 'Case Builder',
      description: 'Stack evidence until the world starts feeling like a case file.',
      flavor: 'Unlocked at 3 recovered artifacts.',
      progressCurrent: artifactCount,
      progressTarget: 3,
      unlocked: artifactCount >= 3,
    },
    {
      badgeId: 'iron_routine',
      label: 'Iron Routine',
      description: 'Come back enough days in a row that the habit starts enforcing itself.',
      flavor: 'Unlocked at a 3-day streak.',
      progressCurrent: activeStreakDays,
      progressTarget: 3,
      unlocked: activeStreakDays >= 3,
    },
  ];

  const unlockedBadges = badges.filter((badge) => badge.unlocked).length;
  const nextUnlock = badges.find((badge) => !badge.unlocked) ?? null;

  let playerRank = 'Rookie Operative';
  if (totalXP >= 5000 || unlockedBadges >= 4) {
    playerRank = 'Prime Asset';
  } else if (totalXP >= 3000 || unlockedBadges >= 3) {
    playerRank = 'Field Specialist';
  } else if (totalXP >= 1500 || unlockedBadges >= 2) {
    playerRank = 'Trusted Runner';
  } else if (totalXP >= 600 || unlockedBadges >= 1) {
    playerRank = 'Cleared Agent';
  }

  return {
    completedMissions: completedMissions.length,
    strongReports,
    artifactCount,
    totalDistanceMeters,
    activeStreakDays,
    totalXP,
    playerRank,
    latestPerformance,
    badges,
    nextUnlock,
  };
}
