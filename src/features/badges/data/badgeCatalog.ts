import { ImageSourcePropType } from 'react-native';

import badgeJumpingIn from '../../../../assets/icons/badge_jumping_in.png';
import badgeMissionComplete from '../../../../assets/icons/mission_complete.png';
import badgeXpReward from '../../../../assets/icons/xp_reward.png';

/**
 * Presentation metadata for each badge id.
 *
 * The unlock *condition* still lives in `missionMetaService.buildCampaignMeta`.
 * This catalog only owns how the badge is shown when it is unlocked or
 * celebrated — image, tier, narrator copy.
 *
 * Add new entries here when art lands. If a badge id has no entry in this
 * catalog the celebration overlay falls back to the Jumping In art so we
 * never leave a hole on screen.
 */
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface BadgeCatalogEntry {
  badgeId: string;
  image: ImageSourcePropType;
  tier: BadgeTier;
  // Voiceover-style line shown under the title in the unlock overlay.
  flavor: string;
  // XP bonus paid out the first time the badge is celebrated.
  unlockXp: number;
}

export const BADGE_CATALOG: Record<string, BadgeCatalogEntry> = {
  jumping_in: {
    badgeId: 'jumping_in',
    image: badgeJumpingIn,
    tier: 'bronze',
    flavor: 'You showed up. That is how every program starts — one foot in front of the other.',
    unlockXp: 150,
  },
  route_runner: {
    badgeId: 'route_runner',
    image: badgeJumpingIn, // placeholder until route_runner art lands
    tier: 'silver',
    flavor: 'The route is starting to feel owned. Three runs in and the pavement remembers you.',
    unlockXp: 250,
  },
  sharp_eye: {
    badgeId: 'sharp_eye',
    image: badgeMissionComplete,
    tier: 'silver',
    flavor: 'Two strong reports back to back. Observation is becoming muscle memory.',
    unlockXp: 250,
  },
  case_builder: {
    badgeId: 'case_builder',
    image: badgeXpReward,
    tier: 'gold',
    flavor: 'Three artifacts on the wall. The case file is no longer hypothetical.',
    unlockXp: 400,
  },
  iron_routine: {
    badgeId: 'iron_routine',
    image: badgeMissionComplete,
    tier: 'gold',
    flavor: 'Three days in a row. The habit is starting to enforce itself.',
    unlockXp: 400,
  },
};

export function getBadgeCatalogEntry(badgeId: string): BadgeCatalogEntry {
  return BADGE_CATALOG[badgeId] ?? BADGE_CATALOG.jumping_in;
}

export const TIER_ACCENT: Record<BadgeTier, string> = {
  bronze: '#FFB26B',
  silver: '#D6DCE6',
  gold: '#F8D86A',
  platinum: '#7FB6FF',
};
