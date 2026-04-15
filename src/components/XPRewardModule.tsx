import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { PrisonCard } from './PrisonCard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

interface XPRewardModuleProps {
  xp: number;
  icon: any;
}

export const XPRewardModule: React.FC<XPRewardModuleProps> = ({ xp, icon }) => (
  <PrisonCard style={styles.card}>
    <View style={styles.row}>
      <Image source={icon} style={styles.icon} resizeMode="contain" />
      <Text style={styles.xpText}>+{xp} XP</Text>
    </View>
    <Text style={styles.caption}>XP earned for this mission</Text>
  </PrisonCard>
);

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderColor: colors.xp,
    borderWidth: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  xpText: {
    ...typography.headline,
    color: colors.xp,
  },
  caption: {
    ...typography.caption,
    marginTop: 2,
    color: colors.xp,
  },
});
