import { ViewStyle, TextStyle } from 'react-native';

export const tactical = {
  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
    pill: 999,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
  },
  colors: {
    bg0: '#06080B',
    bg1: '#0C1218',
    panel: '#101720',
    panelAlt: '#0F161D',
    border: 'rgba(255,255,255,0.10)',
    borderSoft: 'rgba(255,255,255,0.06)',
    orange: '#FF6A00',
    orangeSoft: 'rgba(255,106,0,0.20)',
    teal: '#00C8A0',
    tealSoft: 'rgba(0,200,160,0.18)',
    gold: '#FFD36A',
    textPrimary: '#F2F2F0',
    textSecondary: '#8C95A3',
    textMuted: '#637080',
  },
  gradient: {
    panel: ['#111823', '#0D131B'] as [string, string],
    panelWarm: ['#1A1410', '#111318'] as [string, string],
    cta: ['#D95100', '#FF6A00', '#FF9600'] as [string, string, string],
    banner: ['#1B120C', '#121A24'] as [string, string],
  },
  shadow: {
    orange: {
      shadowColor: '#FF6A00',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.26,
      shadowRadius: 14,
      elevation: 8,
    } as ViewStyle,
    teal: {
      shadowColor: '#00C8A0',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 6,
    } as ViewStyle,
  },
};

export const tacticalText = {
  tag: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: tactical.colors.textMuted,
  } as TextStyle,
  pill: {
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: tactical.colors.textPrimary,
  } as TextStyle,
};

export function panelBorder(color: string = tactical.colors.border): ViewStyle {
  return {
    borderWidth: 1,
    borderColor: color,
  };
}
