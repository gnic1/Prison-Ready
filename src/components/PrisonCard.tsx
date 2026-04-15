import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

interface PrisonCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const PrisonCard: React.FC<PrisonCardProps> = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 20,
    marginVertical: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
});
