import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { PrisonCard } from './PrisonCard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface ResultModuleProps {
  title: string;
  icon: any;
  statusColor?: string;
  children?: React.ReactNode;
}

export const ResultModule: React.FC<ResultModuleProps> = ({ title, icon, statusColor, children }) => (
  <PrisonCard style={[styles.container, statusColor ? { borderColor: statusColor } : {}]}>
    <View style={styles.headerRow}>
      <Image source={icon} style={styles.icon} resizeMode="contain" />
      <Text style={[typography.headline, styles.title]}>{title}</Text>
    </View>
    {children}
  </PrisonCard>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 48,
    height: 48,
    marginRight: 16,
  },
  title: {
    color: colors.text,
  },
});
