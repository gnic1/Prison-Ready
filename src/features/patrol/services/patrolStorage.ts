// Persistence for patrol sessions. AsyncStorage is the source of truth so the
// engine survives app backgrounding and force-quit.

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PatrolSession } from '../types/patrolSession';

const ACTIVE_KEY = 'patrol.activeSession.v1';
const HISTORY_KEY = 'patrol.history.v1';

export const PatrolStorage = {
  async loadActive(): Promise<PatrolSession | null> {
    try {
      const raw = await AsyncStorage.getItem(ACTIVE_KEY);
      return raw ? (JSON.parse(raw) as PatrolSession) : null;
    } catch {
      return null;
    }
  },

  async saveActive(session: PatrolSession): Promise<void> {
    try {
      await AsyncStorage.setItem(ACTIVE_KEY, JSON.stringify(session));
    } catch {
      // Best-effort; engine continues with in-memory state.
    }
  },

  async clearActive(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACTIVE_KEY);
    } catch {}
  },

  async appendHistory(session: PatrolSession): Promise<void> {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      const list: PatrolSession[] = raw ? JSON.parse(raw) : [];
      list.unshift(session);
      // Cap history to last 50 patrols.
      const trimmed = list.slice(0, 50);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch {}
  },

  async loadHistory(): Promise<PatrolSession[]> {
    try {
      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      return raw ? (JSON.parse(raw) as PatrolSession[]) : [];
    } catch {
      return [];
    }
  },
};
