import AsyncStorage from '@react-native-async-storage/async-storage';

export type GoalType = 'minutes' | 'distance';
export type DistanceUnit = 'km' | 'miles';
export type MissionMode = 'outside' | 'treadmill';

export interface UserPreferences {
  goalType: GoalType;
  distanceUnit: DistanceUnit;
  missionMode: MissionMode;
}

const STORAGE_KEY = 'prison_ready_user_preferences_v1';

const DEFAULT_PREFERENCES: UserPreferences = {
  goalType: 'minutes',
  distanceUnit: 'km',
  missionMode: 'outside',
};

let cache: UserPreferences | null = null;

function sanitizePreferences(raw: any): UserPreferences {
  return {
    goalType: raw?.goalType === 'distance' ? 'distance' : 'minutes',
    distanceUnit: raw?.distanceUnit === 'miles' ? 'miles' : 'km',
    missionMode: raw?.missionMode === 'treadmill' ? 'treadmill' : 'outside',
  };
}

export const UserPreferencesService = {
  async getPreferences(): Promise<UserPreferences> {
    if (cache) return cache;
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) {
      cache = DEFAULT_PREFERENCES;
      return cache;
    }
    try {
      cache = sanitizePreferences(JSON.parse(stored));
      return cache;
    } catch {
      cache = DEFAULT_PREFERENCES;
      return cache;
    }
  },

  async savePreferences(next: UserPreferences): Promise<UserPreferences> {
    cache = sanitizePreferences(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    return cache;
  },

  async updatePreferences(partial: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = await this.getPreferences();
    const next = sanitizePreferences({ ...current, ...partial });
    return this.savePreferences(next);
  },

  formatDistanceFromMiles(miles: number, unit: DistanceUnit): string {
    if (unit === 'miles') {
      return `${miles.toFixed(1)} mi`;
    }
    const km = miles * 1.60934;
    return `${km.toFixed(1)} km`;
  },

  formatDistanceFromMeters(meters: number, unit: DistanceUnit): string {
    if (unit === 'miles') {
      const miles = meters / 1609.34;
      return `${miles.toFixed(2)} mi`;
    }
    const km = meters / 1000;
    return `${km.toFixed(2)} km`;
  },
};

export const defaultUserPreferences = DEFAULT_PREFERENCES;
