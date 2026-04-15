import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { PrisonCard } from '../../components/PrisonCard';
import { PrisonButton } from '../../components/PrisonButton';
import { typography } from '../../theme/typography';
import { themes } from '../../theme/themes';
import { getSelectedBadgeId } from '../missions/services/badgeSelectionStorage';
import { Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import badgeJumpingInIcon from '../../../assets/icons/badge_jumping_in.png';
import { day1Mission } from '../missions/data/day1.mission';
import { SessionService } from '../missions/services/sessionService';
import {
  defaultUserPreferences,
  UserPreferences,
  UserPreferencesService,
} from '../missions/services/userPreferencesService';

// Map badge IDs to their image assets
const badgeIdToImage: Record<string, any> = {
  jumping_in: badgeJumpingInIcon,
  // Add more badgeId: image pairs here as new badges are added
};

const mockPlayer = {
  name: 'Player One',
  streak: 0,
};


export const HomeScreen = () => {
  const navigation = useNavigation();
  const [themeKey, setThemeKey] = useState('prison');
  const theme = themes[themeKey] || themes.prison;
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<UserPreferences>(defaultUserPreferences);

  const session = SessionService.getSession();
  const missionProgress = session?.completionPercent != null
    ? Math.max(0.08, Math.min(1, session.completionPercent / 100))
    : 0.62;
  const missionTargetXP = 1000;
  const missionCurrentXP = Math.round(missionProgress * missionTargetXP);
  const activeMission = {
    name: day1Mission.title,
    progress: missionProgress,
    progressText: `${missionCurrentXP} / ${missionTargetXP} XP`,
  };
  const percentComplete = Math.round(activeMission.progress * 100);
  const averageMissionMiles = (day1Mission.distanceMinMiles + day1Mission.distanceMaxMiles) / 2;
  const preferredDistance = UserPreferencesService.formatDistanceFromMiles(averageMissionMiles, prefs.distanceUnit);
  const remainingMiles = Math.max(0, averageMissionMiles * (1 - activeMission.progress));
  const remainingDistance = UserPreferencesService.formatDistanceFromMiles(remainingMiles, prefs.distanceUnit);
  const completedMissions = session?.status === 'completed' ? 1 : 0;
  const currentStreak = session?.status === 'completed' ? 1 : mockPlayer.streak;
  const stats = [
    { label: 'MISSIONS', value: completedMissions, key: 'missions' },
    { label: 'STREAK', value: currentStreak, key: 'streak' },
    { label: prefs.goalType === 'distance' ? 'GOAL' : 'DURATION', value: prefs.goalType === 'distance' ? preferredDistance : `${day1Mission.durationMin}-${day1Mission.durationMax} min`, key: 'distance' },
  ];
  const week = [true, true, true, false, false, false, false]; // Example: first 3 days complete
  const todayIdx = 2;

  useFocusEffect(React.useCallback(() => {
    (async () => {
      const [storedBadge, storedPrefs] = await Promise.all([
        getSelectedBadgeId(),
        UserPreferencesService.getPreferences(),
      ]);
      setSelectedBadgeId(storedBadge);
      setPrefs(storedPrefs);
    })();
  }, []));

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }] }>
      <LinearGradient
        pointerEvents="none"
        colors={['#08090C', '#11141B', '#0B0D12']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={styles.statusBar}>
          <Text style={styles.statusText}>09:41</Text>
          <Text style={styles.statusText}>▲ GPS ▲▲▲ 100%</Text>
        </View>
        {/* HERO SECTION */}
        {/* HERO CARD with background gradient */}
        <PrisonCard style={[styles.heroCard, { backgroundColor: 'rgba(20,23,29,0.95)', shadowColor: theme.colors.prisonOrange, shadowOpacity: 0.18, shadowRadius: 24, elevation: 8 }] }>
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', zIndex: 1 }}>
            {/* Badge image on left */}
            <View style={{ marginRight: 16 }}>
              {selectedBadgeId && badgeIdToImage[selectedBadgeId] && (
                <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.surface, alignItems: 'center', justifyContent: 'center', shadowColor: theme.colors.gold, shadowOpacity: 0.18, shadowRadius: 8, elevation: 2 }}>
                  <Image source={badgeIdToImage[selectedBadgeId]} style={{ width: 36, height: 36, borderRadius: 18 }} resizeMode="contain" />
                </View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 13,
                fontWeight: '600',
                fontFamily: 'monospace',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: theme.colors.textSecondary,
                marginBottom: 2,
              }}>// ACTIVE AGENT</Text>
              <Text style={{
                fontSize: 30,
                fontWeight: '700',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: theme.colors.text,
                marginBottom: 2,
              }}>{mockPlayer.name}</Text>
            </View>
          </View>
          <View style={styles.xpBarWrap}>
            <View style={[styles.xpBarBg, { backgroundColor: theme.colors.surface }]} />
            <View style={[styles.xpBarFill, { width: `${activeMission.progress * 100}%` }]}>
              <LinearGradient
                colors={[theme.colors.prisonOrange, '#FFB347', theme.colors.gold]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.progressGradient}
              />
            </View>
          </View>
          <Text style={{
            fontSize: 13,
            fontWeight: '600',
            fontFamily: 'monospace',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: theme.colors.gold,
            marginTop: 2,
          }}>{activeMission.progressText}</Text>
        </PrisonCard>
          <View style={styles.statsRow}>
            {stats.map((stat, i) => (
            <PrisonCard
              key={stat.key}
              style={[
                styles.statCard,
                i === 1 && styles.statCardCenter,
                { borderWidth: 0, backgroundColor: theme.colors.surface, shadowColor: theme.colors.prisonOrange, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
              ].filter(Boolean)}
            >
              <Text style={{
                fontSize: 13,
                fontWeight: '600',
                fontFamily: 'monospace',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: theme.colors.textSecondary,
                marginBottom: 2,
              }}>{stat.label}</Text>
              <Text style={{
                fontSize: 30,
                fontWeight: '700',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: theme.colors.text,
              }}>{stat.value}</Text>
            </PrisonCard>
          ))}
        </View>

        {/* ACTIVE MISSION CARD */}
        {/* ACTIVE MISSION CARD - premium style */}
        <PrisonCard
          style={{
            ...styles.activeMissionCard,
            borderLeftWidth: 8,
            borderLeftColor: theme.colors.prisonOrange,
            borderRadius: 20,
            borderWidth: 0,
            backgroundColor: 'rgba(36,24,10,0.92)',
            shadowColor: theme.colors.prisonOrange,
            shadowOpacity: 0.25,
            shadowRadius: 24,
            elevation: 10,
            paddingLeft: 24,
            marginTop: 18,
            marginBottom: 18,
            alignItems: 'flex-start',
            // overflow removed
          }}
          highlighted
        >
          <Text style={{
            fontSize: 13,
            fontWeight: '700',
            fontFamily: 'monospace',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: theme.colors.prisonOrange,
            marginBottom: 2,
            textShadowColor: theme.colors.glowOrange,
            textShadowRadius: 8,
          }}>⊙ ACTIVE MISSION</Text>
          <Text style={{
            fontSize: 22,
            fontWeight: '800',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            color: theme.colors.text,
            marginBottom: 4,
            textShadowColor: theme.colors.glowOrange,
            textShadowRadius: 8,
          }}>{activeMission.name}</Text>
          <View style={styles.xpBarWrap}>
            <View style={[styles.xpBarBg, { backgroundColor: theme.colors.surface }]}/>
            <View style={[styles.xpBarFill, { width: `${activeMission.progress * 100}%`, shadowColor: theme.colors.gold, shadowOpacity: 0.18, shadowRadius: 8, elevation: 2 }]}>
              <LinearGradient
                colors={[theme.colors.prisonOrange, '#FFB347', theme.colors.gold]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.progressGradient}
              />
            </View>
          </View>
          <Text style={{
            fontSize: 13,
            fontWeight: '700',
            fontFamily: 'monospace',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: theme.colors.prisonOrange,
            marginTop: 2,
            textShadowColor: theme.colors.glowOrange,
            textShadowRadius: 8,
          }}>{activeMission.progressText}</Text>
            <Text style={styles.missionSubline}>{`${percentComplete}% COMPLETE • ${remainingDistance} REMAINING`}</Text>
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              fontFamily: 'monospace',
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: theme.colors.textSecondary,
              marginTop: 6,
            }}>{`${prefs.missionMode === 'treadmill' ? 'TREADMILL/WALKING PAD' : 'OUTSIDE ROUTE'} • ${prefs.distanceUnit.toUpperCase()}`}</Text>
            <PrisonButton
              title="Resume Mission"
              icon="▶"
              onPress={() => navigation.navigate('Missions', { screen: 'MissionBrief' })}
              style={{
                ...styles.resumeBtn,
                backgroundColor: theme.colors.prisonOrange,
                borderRadius: 16,
                shadowColor: theme.colors.gold,
                shadowOpacity: 0.25,
                shadowRadius: 16,
                elevation: 8,
                marginTop: 18,
                marginBottom: 2,
              }}
              textStyle={{ color: theme.colors.text, fontWeight: 'bold', fontSize: 16, letterSpacing: 2, textShadowColor: theme.colors.gold, textShadowRadius: 8 }}
              shimmer
            />
        </PrisonCard>

        <Text style={styles.weeklyLabel}>// WEEKLY ACTIVITY</Text>
        {/* WEEKLY STREAK ROW */}
        <View style={styles.streakRow}>
          {[...'MTWTFSS'].map((d, i) => {
            let boxStyle = [styles.streakBox, { borderColor: theme.colors.border }];
            let textStyle = [typography.monoLabel, { color: theme.colors.textSecondary }];
            if (week[i]) {
              boxStyle.push({
                ...styles.streakBoxActive,
                borderColor: theme.colors.prisonOrange,
                width: 36,
                height: 36,
                borderRadius: 8,
                borderWidth: 2,
                alignItems: 'center',
                justifyContent: 'center',
                marginHorizontal: 2,
                backgroundColor: theme.colors.streak,
              });
              textStyle.push({ color: theme.colors.prisonOrange });
            }
            if (i === todayIdx) {
              boxStyle.push(styles.streakBoxToday);
              textStyle.push({ color: theme.colors.background });
            }
            return (
              <View key={`streak-${i}`} style={boxStyle}>
                <Text style={Array.isArray(textStyle) ? Object.assign({}, ...textStyle) : textStyle}>{d}</Text>
              </View>
            );
          })}
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.quickRow}>
          <PrisonCard style={styles.quickCard}>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('Progress')}>
              <Text style={{ color: theme.colors.accent, fontSize: 24 }}>📈</Text>
              <Text style={{
                fontSize: 13,
                fontWeight: '600',
                fontFamily: 'monospace',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: theme.colors.textSecondary,
                marginTop: 2,
              }}>PROGRESS</Text>
            </TouchableOpacity>
          </PrisonCard>
          <PrisonCard style={styles.quickCard}>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('Badges')}>
              <Text style={{ color: theme.colors.gold, fontSize: 24 }}>🏅</Text>
              <Text style={{
                fontSize: 13,
                fontWeight: '600',
                fontFamily: 'monospace',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: theme.colors.textSecondary,
                marginTop: 2,
              }}>BADGES</Text>
            </TouchableOpacity>
          </PrisonCard>
          <PrisonCard style={styles.quickCard}>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('StorySoFar')}>
              <Text style={{ color: theme.colors.accentGlow, fontSize: 24 }}>📖</Text>
              <Text style={{
                fontSize: 13,
                fontWeight: '600',
                fontFamily: 'monospace',
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: theme.colors.textSecondary,
                marginTop: 2,
              }}>STORY</Text>
            </TouchableOpacity>
          </PrisonCard>
        </View>

        {/* THEME SWITCHER (subtle) */}
        <View style={[styles.themeSwitcher, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }] }>
          <Text style={{
            fontSize: 13,
            fontWeight: '600',
            fontFamily: 'monospace',
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: theme.colors.textSecondary,
            marginBottom: 4,
          }}>THEME</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => setThemeKey('prison')} style={[styles.themeBtn, themeKey === 'prison' && { backgroundColor: theme.colors.accent }]}>
              <Text style={{ color: themeKey === 'prison' ? theme.colors.text : theme.colors.textSecondary }}>Prison</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setThemeKey('mystery')} style={[styles.themeBtn, themeKey === 'mystery' && { backgroundColor: theme.colors.accent }]}>
              <Text style={{ color: themeKey === 'mystery' ? theme.colors.text : theme.colors.textSecondary }}>Mystery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1 },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: 'rgba(242,242,240,0.5)',
    letterSpacing: 0.8,
  },
  heroCard: {
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
    alignItems: 'center',
    paddingVertical: 24,
  },
  xpBarWrap: {
    width: '100%',
    height: 12,
    borderRadius: 8,
    backgroundColor: 'transparent',
    marginTop: 8,
    marginBottom: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  xpBarBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 8,
    opacity: 0.18,
  },
  xpBarFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
    borderRadius: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 8,
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    paddingVertical: 14,
    borderRadius: 14,
    minWidth: 80,
  },
  statCardCenter: {
    zIndex: 1,
    elevation: 2,
  },
  activeMissionCard: {
    marginHorizontal: 12,
    marginVertical: 16,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 0,
    shadowColor: undefined,
    alignItems: 'flex-start',
  },
  resumeBtn: {
    marginTop: 14,
    alignSelf: 'stretch',
  },
  missionSubline: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#888888',
    letterSpacing: 0.8,
    marginTop: 4,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 24,
    marginBottom: 18,
    marginTop: 2,
  },
  weeklyLabel: {
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: '#888888',
    marginHorizontal: 24,
    marginTop: 2,
    marginBottom: 8,
  },
  streakBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
    backgroundColor: 'transparent',
  },
  streakBoxActive: {
    backgroundColor: 'rgba(255,106,0,0.08)',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 2,
  },
  streakBoxToday: {
    backgroundColor: '#FF6A00',
    borderColor: '#FF6A00',
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 4,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 18,
  },
  quickCard: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    minWidth: 80,
  },
  quickActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  themeSwitcher: {
    margin: 16,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  themeBtn: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginHorizontal: 4,
  },
});
export default HomeScreen;
