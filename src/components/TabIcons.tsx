// TabIcons — bottom tab nav icons matching the style sheet mockup.
// Pure inline SVGs (react-native-svg already in deps). 24x24 viewBox.
import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

interface IconProps { size?: number; color?: string; }

export const HomeIcon: React.FC<IconProps> = ({ size = 22, color = '#a8c8ff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
  </Svg>
);

export const ProfileIcon: React.FC<IconProps> = ({ size = 22, color = '#a8c8ff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={1.8} />
    <Path d="M4 21c0-4 4-7 8-7s8 3 8 7" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const LedgerIcon: React.FC<IconProps> = ({ size = 22, color = '#a8c8ff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={4} y={3} width={16} height={18} rx={2} stroke={color} strokeWidth={1.8} />
    <Path d="M8 8h8M8 12h8M8 16h5" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 22, color = '#a8c8ff' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
    />
  </Svg>
);
