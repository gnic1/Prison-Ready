// MenuIcon — hamburger menu glyph for opening the drawer.
import React from 'react';
import Svg, { Path } from 'react-native-svg';

export const MenuIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 22,
  color = '#a8c8ff',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 6h18M3 12h18M3 18h18" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

export default MenuIcon;
