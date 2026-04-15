
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { themes } from '../../theme/themes';
import { BadgeService, setSelectedBadgeIdMemory } from '../missions/services/badgeService';
import { setSelectedBadgeId, getSelectedBadgeId } from '../missions/services/badgeSelectionStorage';
import badgeJumpingInIcon from '../../../assets/icons/badge_jumping_in.png';

export default function BadgesScreen() {
  const theme = themes.prison;
  // For now, only show the MVP badge from BadgeService
  const badge = BadgeService.getBadge();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await getSelectedBadgeId();
      setSelectedId(stored || badge.badgeId);
    })();
  }, []);

  const handleSelect = async (badgeId: string) => {
    setSelectedId(badgeId);
    setSelectedBadgeIdMemory(badgeId);
    await setSelectedBadgeId(badgeId);
  };

  // Only one badge for now, but structure for future
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }] }>
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={[styles.title, { color: theme.colors.accent }]}>Badges</Text>
        <View
          key={`badge-${badge.badgeId}`}
          style={[
            styles.card,
            { backgroundColor: theme.colors.card, borderColor: selectedId === badge.badgeId ? theme.colors.gold : theme.colors.streak },
            selectedId === badge.badgeId && { shadowColor: theme.colors.gold, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
          ]}
        >
          <Image source={badgeJumpingInIcon} style={styles.iconImg} resizeMode="contain" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.badgeName, { color: theme.colors.text }]}>{badge.badgeName}</Text>
            <Text style={[styles.badgeDesc, { color: theme.colors.textSecondary }]}>Complete your first mission</Text>
          </View>
          {badge.mastered && <Text style={{ color: theme.colors.gold, fontWeight: 'bold' }}>Mastered</Text>}
          <Text
            style={{
              color: selectedId === badge.badgeId ? theme.colors.gold : theme.colors.textSecondary,
              fontWeight: selectedId === badge.badgeId ? 'bold' : 'normal',
              marginLeft: 8,
              fontSize: 13,
            }}
            onPress={() => handleSelect(badge.badgeId)}
          >
            {selectedId === badge.badgeId ? 'Selected' : 'Select'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 2,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  icon: { fontSize: 32, marginRight: 16 },
  iconImg: { width: 40, height: 40, marginRight: 16 },
  badgeName: { fontSize: 16, fontWeight: 'bold' },
  badgeDesc: { fontSize: 13, marginTop: 2 },
});
