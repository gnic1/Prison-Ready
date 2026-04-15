import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface PrisonButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const PrisonButton: React.FC<PrisonButtonProps> = ({ title, onPress, style, textStyle, disabled }) => (
  <TouchableOpacity
    style={[styles.button, style, disabled && styles.disabled]}
    onPress={onPress}
    activeOpacity={0.85}
    disabled={disabled}
  >
    <Text style={[styles.text, textStyle]}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.prisonOrange,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: colors.prisonOrangeDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    ...typography.button,
    color: colors.white,
    textShadowColor: colors.prisonOrangeDark,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  disabled: {
    backgroundColor: colors.cardBorder,
    opacity: 0.6,
  },
});
