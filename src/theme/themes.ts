// Centralized theme config for Prison Ready and future world variants.
import { colors } from './colors';

export type AppThemeKey = 'prison' | 'neighborhood' | 'theyreHere';

export interface AppTheme {
  key: AppThemeKey;
  label: string;
  colors: typeof colors & Record<string, string>;
  labels: Record<string, string>;
  backgroundType: string;
  gradients: {
    screen: [string, string, string];
    hero: [string, string, string];
    dock: [string, string, string];
  };
  landing: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryAction: string;
    secondaryAction: string;
    placeholderLabel: string;
  };
}

function buildTheme(
  key: AppThemeKey,
  label: string,
  accent: string,
  accentGlow: string,
  screen: [string, string, string],
  hero: [string, string, string],
  dock: [string, string, string],
  landing: AppTheme['landing'],
  labels: AppTheme['labels']
): AppTheme {
  return {
    key,
    label,
    colors: {
      background: screen[0],
      card: colors.cardBg,
      cardBg: colors.cardBg,
      surface: 'rgba(24,26,32,0.9)',
      border: 'rgba(255,255,255,0.12)',
      prisonOrange: accent,
      prisonOrangeDark: accent,
      gold: colors.gold,
      xp: colors.xp,
      teal: colors.teal,
      accentTeal: colors.accentTeal,
      purple: colors.purple,
      text: colors.text,
      textSecondary: '#B3B7C4',
      success: colors.success,
      danger: colors.danger,
      glowOrange: accentGlow,
      glowGold: colors.glowGold,
      glowPurple: colors.glowPurple,
      white: colors.white,
      black: colors.black,
      charcoal: colors.charcoal,
      slate: colors.slate,
      cardBorder: colors.cardBorder,
      incomplete: colors.incomplete,
      complete: colors.complete,
      accent,
      accentGlow,
      streak: accent,
      streakGlow: accentGlow,
    },
    labels,
    backgroundType: 'gradient',
    gradients: {
      screen,
      hero,
      dock,
    },
    landing,
  };
}

export const themes: Record<AppThemeKey | 'mystery', AppTheme> = {
  prison: buildTheme(
    'prison',
    'Prison Ready',
    '#FF6A00',
    'rgba(255,106,0,0.35)',
    ['#09090B', '#141118', '#1A130D'],
    ['#22160B', '#4F2805', '#16110B'],
    ['rgba(17,10,6,0.95)', 'rgba(33,20,12,0.92)', 'rgba(12,10,8,0.96)'],
    {
      eyebrow: 'MAX YARD LOCK',
      title: 'Track the route. Read the tells. Stay one move ahead.',
      subtitle: 'Each walk is an operation. Intelligence unlocks as your route tightens and the city starts showing its seams.',
      primaryAction: 'Launch Mission',
      secondaryAction: 'Review Case File',
      placeholderLabel: 'Nutrition Block',
    },
    {
      streak: 'Current Bid',
      badge: 'Badge',
      mission: 'Job',
      progress: 'Route Board',
      health: 'Health Sync',
    }
  ),
  neighborhood: buildTheme(
    'neighborhood',
    'Neighborhood Watch',
    '#7DE08C',
    'rgba(125,224,140,0.28)',
    ['#08110D', '#122018', '#1C1A11'],
    ['#153222', '#3C5C2E', '#101912'],
    ['rgba(10,22,15,0.96)', 'rgba(21,44,27,0.92)', 'rgba(12,18,13,0.96)'],
    {
      eyebrow: 'BLOCK WATCH LIVE',
      title: 'Keep the block calm, catch the pattern before it turns.',
      subtitle: 'Friendly streets, strange signals. Log every pass, compare every porch light, and build a case from ordinary details.',
      primaryAction: 'Open Patrol',
      secondaryAction: 'Check Street Notes',
      placeholderLabel: 'Meal Prep Ledger',
    },
    {
      streak: 'Patrol Streak',
      badge: 'Patch',
      mission: 'Patrol',
      progress: 'Neighborhood Map',
      health: 'Wellness Check',
    }
  ),
  theyreHere: buildTheme(
    'theyreHere',
    "They're Here",
    '#61E9FF',
    'rgba(97,233,255,0.32)',
    ['#050912', '#0A1630', '#130E1E'],
    ['#10274A', '#113B64', '#150F28'],
    ['rgba(6,13,24,0.96)', 'rgba(11,29,51,0.92)', 'rgba(8,12,23,0.96)'],
    {
      eyebrow: 'SKYWATCH PROTOCOL',
      title: 'Measure the anomalies. Follow the signal. Keep moving.',
      subtitle: 'The map is familiar until the lights change. Distance becomes evidence, and every checkpoint means contact is getting closer.',
      primaryAction: 'Start Sweep',
      secondaryAction: 'Review Signal Log',
      placeholderLabel: 'Field Ration Bay',
    },
    {
      streak: 'Signal Streak',
      badge: 'Insignia',
      mission: 'Sweep',
      progress: 'Contact Grid',
      health: 'Biometric Sync',
    }
  ),
  mystery: buildTheme(
    'neighborhood',
    'Neighborhood Watch',
    '#7DE08C',
    'rgba(125,224,140,0.28)',
    ['#08110D', '#122018', '#1C1A11'],
    ['#153222', '#3C5C2E', '#101912'],
    ['rgba(10,22,15,0.96)', 'rgba(21,44,27,0.92)', 'rgba(12,18,13,0.96)'],
    {
      eyebrow: 'BLOCK WATCH LIVE',
      title: 'Keep the block calm, catch the pattern before it turns.',
      subtitle: 'Friendly streets, strange signals. Log every pass, compare every porch light, and build a case from ordinary details.',
      primaryAction: 'Open Patrol',
      secondaryAction: 'Check Street Notes',
      placeholderLabel: 'Meal Prep Ledger',
    },
    {
      streak: 'Patrol Streak',
      badge: 'Patch',
      mission: 'Patrol',
      progress: 'Neighborhood Map',
      health: 'Wellness Check',
    }
  ),
};
