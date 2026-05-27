import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppThemeKey } from '../../../theme/themes';

export type PreferredMissionStyle = 'guided' | 'balanced' | 'scout';
export type AuthMode = 'signed_out' | 'guest' | 'member';

export interface LocalAccountRecord {
  email: string;
  password: string;
  displayName: string;
  ageConfirmed: boolean;
  selectedTheme: AppThemeKey;
  preferredMissionStyle: PreferredMissionStyle;
  distanceUnit: 'km' | 'miles';
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface AuthState {
  mode: AuthMode;
  onboardingCompleted: boolean;
  selectedTheme: AppThemeKey;
  displayName: string;
  email?: string;
  ageConfirmed: boolean;
  preferredMissionStyle: PreferredMissionStyle;
  distanceUnit: 'km' | 'miles';
}

interface AuthStoragePayload {
  accounts: LocalAccountRecord[];
  activeState: AuthState;
}

const STORAGE_KEY = 'prison_ready_auth_state_v1';

export const defaultAuthState: AuthState = {
  mode: 'signed_out',
  onboardingCompleted: false,
  selectedTheme: 'prison',
  displayName: 'Guest Agent',
  ageConfirmed: false,
  preferredMissionStyle: 'balanced',
  distanceUnit: 'km',
};

let cache: AuthStoragePayload | null = null;
const listeners = new Set<(state: AuthState) => void>();

function emit(next: AuthState) {
  listeners.forEach((listener) => listener(next));
}

function sanitizeAccount(raw: any): LocalAccountRecord {
  return {
    email: typeof raw?.email === 'string' ? raw.email.trim().toLowerCase() : '',
    password: typeof raw?.password === 'string' ? raw.password : '',
    displayName: typeof raw?.displayName === 'string' && raw.displayName.trim() ? raw.displayName.trim() : 'Agent',
    ageConfirmed: Boolean(raw?.ageConfirmed),
    selectedTheme: raw?.selectedTheme === 'neighborhood' || raw?.selectedTheme === 'theyreHere' ? raw.selectedTheme : 'prison',
    preferredMissionStyle: raw?.preferredMissionStyle === 'guided' || raw?.preferredMissionStyle === 'scout' ? raw.preferredMissionStyle : 'balanced',
    distanceUnit: raw?.distanceUnit === 'miles' ? 'miles' : 'km',
    onboardingCompleted: Boolean(raw?.onboardingCompleted),
    createdAt: typeof raw?.createdAt === 'string' ? raw.createdAt : new Date().toISOString(),
  };
}

function sanitizeState(raw: any): AuthState {
  return {
    mode: raw?.mode === 'guest' || raw?.mode === 'member' ? raw.mode : 'signed_out',
    onboardingCompleted: Boolean(raw?.onboardingCompleted),
    selectedTheme: raw?.selectedTheme === 'neighborhood' || raw?.selectedTheme === 'theyreHere' ? raw.selectedTheme : 'prison',
    displayName: typeof raw?.displayName === 'string' && raw.displayName.trim() ? raw.displayName.trim() : 'Guest Agent',
    email: typeof raw?.email === 'string' ? raw.email.trim().toLowerCase() : undefined,
    ageConfirmed: Boolean(raw?.ageConfirmed),
    preferredMissionStyle: raw?.preferredMissionStyle === 'guided' || raw?.preferredMissionStyle === 'scout' ? raw.preferredMissionStyle : 'balanced',
    distanceUnit: raw?.distanceUnit === 'miles' ? 'miles' : 'km',
  };
}

async function persist(payload: AuthStoragePayload): Promise<AuthStoragePayload> {
  cache = {
    activeState: sanitizeState(payload.activeState),
    accounts: Array.isArray(payload.accounts) ? payload.accounts.map(sanitizeAccount).filter((account) => account.email) : [],
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  emit(cache.activeState);
  return cache;
}

async function getPayload(): Promise<AuthStoragePayload> {
  if (cache) {
    return cache;
  }
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  if (!stored) {
    cache = { accounts: [], activeState: defaultAuthState };
    return cache;
  }
  try {
    const parsed = JSON.parse(stored);
    cache = {
      accounts: Array.isArray(parsed?.accounts) ? parsed.accounts.map(sanitizeAccount).filter((account: LocalAccountRecord) => account.email) : [],
      activeState: sanitizeState(parsed?.activeState),
    };
    return cache;
  } catch {
    cache = { accounts: [], activeState: defaultAuthState };
    return cache;
  }
}

export const AuthStorageService = {
  async loadState(): Promise<AuthState> {
    const payload = await getPayload();
    return payload.activeState;
  },

  subscribe(listener: (state: AuthState) => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  async createAccount(input: {
    email: string;
    password: string;
    displayName: string;
    ageConfirmed: boolean;
  }): Promise<{ ok: true; state: AuthState } | { ok: false; message: string }> {
    const payload = await getPayload();
    const email = input.email.trim().toLowerCase();
    if (!email || !input.password.trim() || !input.displayName.trim()) {
      return { ok: false, message: 'Fill in email, password, and display name.' };
    }
    if (!input.ageConfirmed) {
      return { ok: false, message: 'Age confirmation is required.' };
    }
    if (payload.accounts.some((account) => account.email === email)) {
      return { ok: false, message: 'An account with that email already exists.' };
    }

    const account = sanitizeAccount({
      ...input,
      email,
      onboardingCompleted: false,
      selectedTheme: 'prison',
      preferredMissionStyle: 'balanced',
      distanceUnit: 'km',
      createdAt: new Date().toISOString(),
    });
    const state = sanitizeState({
      mode: 'member',
      onboardingCompleted: false,
      selectedTheme: account.selectedTheme,
      displayName: account.displayName,
      email: account.email,
      ageConfirmed: account.ageConfirmed,
      preferredMissionStyle: account.preferredMissionStyle,
      distanceUnit: account.distanceUnit,
    });
    const next = await persist({
      accounts: [...payload.accounts, account],
      activeState: state,
    });
    return { ok: true, state: next.activeState };
  },

  async signIn(emailInput: string, passwordInput: string): Promise<{ ok: true; state: AuthState } | { ok: false; message: string }> {
    const payload = await getPayload();
    const email = emailInput.trim().toLowerCase();
    const account = payload.accounts.find((candidate) => candidate.email === email);
    if (!account || account.password !== passwordInput) {
      return { ok: false, message: 'Email or password did not match.' };
    }
    const next = await persist({
      ...payload,
      activeState: sanitizeState({
        mode: 'member',
        onboardingCompleted: account.onboardingCompleted,
        selectedTheme: account.selectedTheme,
        displayName: account.displayName,
        email: account.email,
        ageConfirmed: account.ageConfirmed,
        preferredMissionStyle: account.preferredMissionStyle,
        distanceUnit: account.distanceUnit,
      }),
    });
    return { ok: true, state: next.activeState };
  },

  async continueAsGuest(): Promise<AuthState> {
    const payload = await getPayload();
    const next = await persist({
      ...payload,
      activeState: sanitizeState({
        ...defaultAuthState,
        mode: 'guest',
        displayName: 'Guest Agent',
      }),
    });
    return next.activeState;
  },

  async updateActiveState(partial: Partial<AuthState>): Promise<AuthState> {
    const payload = await getPayload();
    const activeState = sanitizeState({
      ...payload.activeState,
      ...partial,
    });
    const nextAccounts = payload.activeState.mode === 'member' && payload.activeState.email
      ? payload.accounts.map((account) => {
          if (account.email !== payload.activeState.email) {
            return account;
          }
          return sanitizeAccount({
            ...account,
            displayName: activeState.displayName,
            ageConfirmed: activeState.ageConfirmed,
            selectedTheme: activeState.selectedTheme,
            preferredMissionStyle: activeState.preferredMissionStyle,
            distanceUnit: activeState.distanceUnit,
            onboardingCompleted: activeState.onboardingCompleted,
          });
        })
      : payload.accounts;
    const next = await persist({
      accounts: nextAccounts,
      activeState,
    });
    return next.activeState;
  },

  async completeOnboarding(partial: Partial<AuthState>): Promise<AuthState> {
    return this.updateActiveState({
      ...partial,
      onboardingCompleted: true,
    });
  },

  async signOut(): Promise<AuthState> {
    const payload = await getPayload();
    const next = await persist({
      ...payload,
      activeState: defaultAuthState,
    });
    return next.activeState;
  },
};
