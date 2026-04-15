// MVP badge progression logic for "Jumping In" badge
export interface BadgeProgress {
  badgeId: string;
  badgeName: string;
  whiteStars: number;
  goldStars: number;
  mastered: boolean;
  totalCompletions: number;
  lastUpdatedAt: string;
}

const BADGE_ID = 'jumping_in';
const BADGE_NAME = 'Jumping In';

// In-memory MVP state (replace with persistence later)

let badge: BadgeProgress = {
  badgeId: BADGE_ID,
  badgeName: BADGE_NAME,
  whiteStars: 0,
  goldStars: 0,
  mastered: false,
  totalCompletions: 0,
  lastUpdatedAt: new Date().toISOString(),
};

// Selected badge id (in-memory fallback)
let selectedBadgeId: string | null = null;

export function setSelectedBadgeIdMemory(badgeId: string) {
  selectedBadgeId = badgeId;
}
export function getSelectedBadgeIdMemory(): string | null {
  return selectedBadgeId;
}

export const BadgeService = {
  getBadge() {
    return badge;
  },
  incrementOnComplete() {
    if (badge.mastered) return badge;
    badge.totalCompletions += 1;
    badge.lastUpdatedAt = new Date().toISOString();
    if (badge.whiteStars < 5) {
      badge.whiteStars += 1;
    } else if (badge.goldStars < 5) {
      badge.goldStars += 1;
    }
    if (badge.whiteStars === 5 && badge.goldStars === 5) {
      badge.mastered = true;
    }
    return badge;
  },
  reset() {
    badge = {
      badgeId: BADGE_ID,
      badgeName: BADGE_NAME,
      whiteStars: 0,
      goldStars: 0,
      mastered: false,
      totalCompletions: 0,
      lastUpdatedAt: new Date().toISOString(),
    };
  },
};
