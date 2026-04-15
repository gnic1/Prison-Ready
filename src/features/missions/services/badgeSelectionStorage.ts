import AsyncStorage from '@react-native-async-storage/async-storage';

const SELECTED_BADGE_KEY = 'selected_badge_id';

export async function setSelectedBadgeId(badgeId: string) {
  try {
    await AsyncStorage.setItem(SELECTED_BADGE_KEY, badgeId);
  } catch (e) {
    // fallback: ignore
  }
}

export async function getSelectedBadgeId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(SELECTED_BADGE_KEY);
  } catch (e) {
    return null;
  }
}