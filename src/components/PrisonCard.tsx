import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { tactical } from '../theme/tactical';


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
    <LinearGradient
      colors={highlighted ? tactical.gradient.panelWarm : tactical.gradient.panel}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
    <View style={styles.topEdge} />
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: tactical.radius.xl,
    padding: 20,
    marginVertical: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.24,
    shadowRadius: 14,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  topEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  glow: {
    shadowColor: colors.glowOrange,
    shadowOpacity: 0.42,
    shadowRadius: 18,
    elevation: 12,
  },
});
