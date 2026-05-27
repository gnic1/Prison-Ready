import AsyncStorage from '@react-native-async-storage/async-storage';

import { ActiveMissionState } from '../../missions/models/missionEngine.types';
import { buildCampaignMeta, DerivedBadge } from '../../missions/services/missionMetaService';

/**
 * Persists which badges the player has *already seen the celebration for*.
 *
 * Data model in `missionMetaService` already knows whether a badge is unlocked
 * (derived from history). This service is the bridge between "unlocked" and
 * "user has watched the fanfare" — anything in the unlocked set but not in
 * the seen set becomes the celebration queue.
 */
const SEEN_KEY = 'pr_badge_seen_v1';

interface SeenPayload {
  ids: string[];
  // ms timestamp of last reset — handy for debugging dev resets.
  lastReset?: number;
}

const defaultPayload: SeenPayload = { ids: [] };

async function loadPayload(): Promise<SeenPayload> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_KEY);
    if (!raw) return { ...defaultPayload };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.ids)) return { ...defaultPayload };
    return { ids: parsed.ids.filter((id: unknown) => typeof id === 'string'), lastReset: parsed.lastReset };
  } catch {
    return { ...defaultPayload };
  }
}

async function savePayload(payload: SeenPayload): Promise<void> {
  try {
    await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(payload));
  } catch {
    // best-effort
  }
}

export const BadgeUnlockStorage = {
  async getSeenIds(): Promise<string[]> {
    const payload = await loadPayload();
    return payload.ids;
  },

  async markSeen(badgeId: string): Promise<void> {
    const payload = await loadPayload();
    if (payload.ids.includes(badgeId)) return;
    await savePayload({ ...payload, ids: [...payload.ids, badgeId] });
  },

  async resetAll(): Promise<void> {
    await savePayload({ ids: [], lastReset: Date.now() });
  },

  /**
   * Compute the badges that are unlocked-but-not-yet-celebrated, in the
   * order they appear in the meta.badges list (which is the catalog order
   * and matches what BadgesScreen renders).
   */
  async computePending(history: ActiveMissionState[]): Promise<DerivedBadge[]> {
    const meta = buildCampaignMeta(history);
    const seen = new Set(await BadgeUnlockStorage.getSeenIds());
    return meta.badges.filter((badge) => badge.unlocked && !seen.has(badge.badgeId));
  },
};
