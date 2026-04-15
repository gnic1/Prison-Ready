import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { PrisonCard } from './PrisonCard';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export interface BadgeProgress {
  badgeId: string;
  badgeName: string;
  whiteStars: number;
  goldStars: number;
  mastered: boolean;
  totalCompletions: number;
  lastUpdatedAt: string;
}

interface BadgeProgressCardProps {
  badge: BadgeProgress;
  assetSources: {
    base: any;
    level2?: any;
    mastery?: any;
  };
}

import { StyleProp, ViewStyle, TextStyle } from 'react-native';

export const BadgeProgressCard: React.FC<BadgeProgressCardProps> = ({ badge, assetSources }) => {
  // Determine tier and icon
  let tierLabel = 'Tier 1: White Stars';
  let icon = assetSources.base;
  let stars = badge.whiteStars;
  let starColor = colors.white;
  let maxStars = 5;
  let description = 'Complete missions to level up this badge.';
  let glowStyle: StyleProp<ViewStyle> = undefined;
  if (badge.mastered) {
    tierLabel = 'Mastered';
    icon = assetSources.mastery || assetSources.level2 || assetSources.base;
    stars = 5;
    starColor = colors.gold;
    description = 'You have mastered this badge!';
    glowStyle = { shadowColor: colors.glowGold, shadowOpacity: 0.7, shadowRadius: 18, elevation: 12 };
  } else if (badge.whiteStars >= 5) {
    tierLabel = 'Tier 2: Gold Stars';
    icon = assetSources.level2 || assetSources.base;
    stars = badge.goldStars;
    starColor = colors.gold;
    description = 'Earn gold stars for continued mastery!';
    glowStyle = { shadowColor: colors.glowGold, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 };
  }
  // Render stars
  const starRow = [];
  for (let i = 0; i < maxStars; i++) {
    starRow.push(
      <Text
        key={`star-${badge.badgeId}-${i}`}
        style={{
          fontSize: 28,
          color: i < stars ? starColor : colors.border,
          marginHorizontal: 2,
          textShadowColor: i < stars && starColor === colors.gold ? colors.gold : colors.border,
          textShadowRadius: i < stars && starColor === colors.gold ? 8 : 2,
        } as TextStyle}
      >
        ★
      </Text>
    );
  }
  // Merge styles into a single object to avoid type error
  const mergedStyle = glowStyle ? { ...styles.card, ...(glowStyle as object) } : styles.card;
  return (
    <PrisonCard style={mergedStyle} borderColor={starColor} highlighted={!!glowStyle}>
      <View style={styles.headerRow}>
        <Image source={icon} style={styles.icon} resizeMode="contain" />
        <View>
          <Text style={{
            fontSize: 20,
            fontWeight: '700',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            color: colors.text,
          } as TextStyle}>{badge.badgeName}</Text>
          <Text style={styles.tierLabel}>{tierLabel}</Text>
        </View>
      </View>
      <Text style={{
        color: colors.textSecondary,
        marginBottom: 8,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '400',
        letterSpacing: 0.1,
      } as TextStyle}>{description}</Text>
      <View style={styles.starRow}>{starRow}</View>
      <Text style={{
        marginTop: 8,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.2,
        color: colors.textSecondary,
      } as TextStyle}>
        {badge.mastered
          ? 'Badge Mastered'
          : badge.whiteStars < 5
          ? `${badge.whiteStars} White Star${badge.whiteStars === 1 ? '' : 's'} Earned`
          : badge.goldStars < 5
          ? `${badge.goldStars} Gold Star${badge.goldStars === 1 ? '' : 's'} Earned`
          : 'Gold Star Track Complete'}
      </Text>
    </PrisonCard>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderColor: colors.prisonOrange,
    borderWidth: 2,
    backgroundColor: colors.cardBg,
    borderRadius: 20,
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    width: 56,
    height: 56,
    marginRight: 16,
  },
  tierLabel: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  starRow: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  progressNote: {
    ...typography.caption,
    marginTop: 4,
    textAlign: 'center',
  },
});
