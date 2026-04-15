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

export const BadgeProgressCard: React.FC<BadgeProgressCardProps> = ({ badge, assetSources }) => {
  // Determine tier and icon
  let tierLabel = 'Tier 1: White Stars';
  let icon = assetSources.base;
  let stars = badge.whiteStars;
  let starColor = colors.white;
  let maxStars = 5;
  let description = 'Complete missions to level up this badge.';
  if (badge.mastered) {
    tierLabel = 'Mastered';
    icon = assetSources.mastery || assetSources.level2 || assetSources.base;
    stars = 5;
    starColor = colors.gold;
    description = 'You have mastered this badge!';
  } else if (badge.whiteStars >= 5) {
    tierLabel = 'Tier 2: Gold Stars';
    icon = assetSources.level2 || assetSources.base;
    stars = badge.goldStars;
    starColor = colors.gold;
    description = 'Earn gold stars for continued mastery!';
  }
  // Render stars
  const starRow = [];
  for (let i = 0; i < maxStars; i++) {
    starRow.push(
      <Text
        key={i}
        style={{
          fontSize: 28,
          color: i < stars ? starColor : colors.cardBorder,
          marginHorizontal: 2,
          textShadowColor: starColor === colors.gold ? colors.prisonOrange : colors.cardBorder,
          textShadowRadius: 2,
        }}
      >
        ★
      </Text>
    );
  }
  return (
    <PrisonCard style={styles.card}>
      <View style={styles.headerRow}>
        <Image source={icon} style={styles.icon} resizeMode="contain" />
        <View>
          <Text style={typography.subhead}>{badge.badgeName}</Text>
          <Text style={styles.tierLabel}>{tierLabel}</Text>
        </View>
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.starRow}>{starRow}</View>
      <Text style={styles.progressNote}>
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
