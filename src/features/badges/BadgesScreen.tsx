import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { themes } from '../../theme/themes';
import { AuthStorageService, defaultAuthState } from '../auth/services/authStorageService';
import { setSelectedBadgeIdMemory } from '../missions/services/badgeService';
import { setSelectedBadgeId, getSelectedBadgeId } from '../missions/services/badgeSelectionStorage';
import { MissionEngineService } from '../missions/services/missionEngineService';
import { buildCampaignMeta } from '../missions/services/missionMetaService';
import badgeJumpingInIcon from '../../../assets/icons/badge_jumping_in.png';
import { TacticalMarquee } from '../../components/TacticalMarquee';

export default function BadgesScreen() {
  const [themeKey, setThemeKey] = React.useState(defaultAuthState.selectedTheme);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [history, setHistory] = React.useState<any[]>([]);

  const refresh = React.useCallback(async () => {
    const [stored, auth, missionHistory] = await Promise.all([
      getSelectedBadgeId(),
      AuthStorageService.loadState(),
      MissionEngineService.getMissionHistory(),
    ]);
    setSelectedId(stored);
    setThemeKey(auth.selectedTheme);
    setHistory(missionHistory);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const theme = themes[themeKey];
  const meta = React.useMemo(() => buildCampaignMeta(history), [history]);
  const unlockedBadges = meta.badges.filter((badge) => badge.unlocked);
  const effectiveSelectedId = selectedId && unlockedBadges.some((badge) => badge.badgeId === selectedId)
    ? selectedId
    : unlockedBadges[0]?.badgeId ?? null;

  const handleSelect = async (badgeId: string, unlocked: boolean) => {
    if (!unlocked) {
      return;
    }
    setSelectedId(badgeId);
    setSelectedBadgeIdMemory(badgeId);
    await setSelectedBadgeId(badgeId);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <TacticalMarquee
          items={['BADGE BOARD // LIVE', 'UNLOCK PRESSURE ACTIVE', `RANK: ${meta.playerRank.toUpperCase()}`]}
          tone="teal"
          style={styles.topBanner}
        />
        <Text style={[styles.title, { color: theme.colors.accent }]}>Badges</Text>
        <Text style={styles.subtitle}>Badges should create pressure. If a card is close, the app should make you want to go earn it.</Text>

        {meta.badges.map((badge) => {
          const selected = effectiveSelectedId === badge.badgeId;
          return (
            <TouchableOpacity
              key={badge.badgeId}
              activeOpacity={badge.unlocked ? 0.88 : 1}
              onPress={() => handleSelect(badge.badgeId, badge.unlocked)}
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: selected ? theme.colors.gold : badge.unlocked ? theme.colors.streak : 'rgba(255,255,255,0.12)',
                  opacity: badge.unlocked ? 1 : 0.76,
                },
                selected && { shadowColor: theme.colors.gold, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
              ]}
            >
              <Image source={badgeJumpingInIcon} style={styles.iconImg} resizeMode="contain" />
              <View style={styles.cardBody}>
                <Text style={[styles.badgeName, { color: theme.colors.text }]}>{badge.label}</Text>
                <Text style={[styles.badgeDesc, { color: theme.colors.textSecondary }]}>{badge.description}</Text>
                <Text style={styles.progressText}>
                  {badge.unlocked
                    ? badge.flavor
                    : `${badge.progressCurrent}/${badge.progressTarget} toward unlock`}
                </Text>
              </View>
              <View style={styles.statusWrap}>
                <Text style={[styles.statusText, { color: selected ? theme.colors.gold : theme.colors.textSecondary }]}>
                  {selected ? 'Selected' : badge.unlocked ? 'Unlocked' : 'Locked'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 120 },
  topBanner: { marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  subtitle: { color: '#BFC7D4', lineHeight: 20, marginBottom: 16 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },
  iconImg: { width: 40, height: 40, marginRight: 16 },
  cardBody: { flex: 1 },
  badgeName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  badgeDesc: { fontSize: 13, lineHeight: 18 },
  progressText: { color: '#F8D18A', fontSize: 12, marginTop: 8, fontWeight: '700', letterSpacing: 0.4 },
  statusWrap: { marginLeft: 12 },
  statusText: { fontSize: 13, fontWeight: '700' },
});
