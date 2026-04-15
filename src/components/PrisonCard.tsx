import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors } from '../theme/colors';


interface PrisonCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const PrisonCard: React.FC<PrisonCardProps & { highlighted?: boolean; borderColor?: string }> = ({ children, style, highlighted = false, borderColor }) => (
  <View
    style={[
      styles.card,
      { borderColor: borderColor || colors.prisonOrange },
      highlighted && styles.glow,
      style,
    ]}
  >
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    marginVertical: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: colors.prisonOrange,
  },
  glow: {
    shadowColor: colors.glowOrange,
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 12,
  },
});
