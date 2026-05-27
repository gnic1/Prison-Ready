// HomeScreen — clean post-login surface.
//
// Layout principles:
//   - Full-bleed neighborhood night scene as backdrop.
//   - Single primary action: BEGIN PATROL (the suburb pill button).
//   - Everything else lives behind a left drawer (hamburger top-left).
//   - One tiny status chip top-right (streak + lifetime km).
//   - If a raid window is currently open, a slim banner appears just above
//     the patrol button so the player notices without crowding the screen.
//
// All other surfaces (Profile, Ledger, Settings) are reached from the
// drawer, matching the style guide's vertical-tabs treatment.

import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { themes } from '../../theme/themes';
import {
  AuthState,
  AuthStorageService,
  defaultAuthState,
} from '../auth/services/authStorageService';
import { graphsForSkin } from '../patrol/content';
import {
  PlayerProfileService,
  PlayerProfile,
} from '../patrol/services/playerProfileService';
import {
  RaidWalkService,
  RaidProjection,
} from '../patrol/services/raidWalkService';
import { PillImageButton } from '../../components/PillImageButton';
import { HomeDrawer, DrawerItem } from '../../components/HomeDrawer';
import { MenuIcon } from '../../components/MenuIcon';

const SUBURB_BTN = require('../../../assets/buttons/suburb_button.png');
const BG = require('../../../assets/backgrounds/home_neighborhood.png');

const C = {
  ink0: 'rgba(7,16,29,0.50)',
  ink1: 'rgba(7,16,29,0.92)',
  text: '#f3f6fb',
  textMuted: '#a8b6c8',
  blueLight: '#a8c8ff',
  warning: '#ff8a00',
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [authState, setAuthState] = React.useState<AuthState>(defaultAuthState);
  const [profile, setProfile] = React.useState<PlayerProfile>(
    PlayerProfileService.get(),
  );
  const [raid, setRaid] = React.useState<RaidProjection | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    PlayerProfileService.load().catch(() => {});
    return PlayerProfileService.subscribe(setProfile);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      let alive = true;
      AuthStorageService.loadState().then((state) => {
        if (!alive) return;
        setAuthState(state);
        try {
          setRaid(RaidWalkService.projection(state.selectedTheme));
        } catch {}
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  const theme = themes[authState.selectedTheme] ?? themes.neighborhood;
  const skinGraphs = graphsForSkin(authState.selectedTheme);
  const completed = new Set(profile.chaptersCompleted);
  const nextPatrol = skinGraphs.find(
    (g) => g.chapter < 90 && !completed.has(g.id),
  );
  const raidChapter = skinGraphs.find((g) => g.chapter >= 90);
  const kmWalked = (profile.lifetimeMeters / 1000).toFixed(1);
  const isRaidActive = !!(raid && raid.active && raidChapter);

  const drawerItems: DrawerItem[] = [
    { label: 'HOME', route: 'Tabs', current: true },
    { label: 'PROFILE', route: 'Profile' },
    { label: 'LEDGER', route: 'Ledger' },
    { label: 'SETTINGS', route: 'Settings' },
  ];

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={[C.ink0, C.ink1]}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setDrawerOpen(true)}
          accessibilityLabel="Open menu"
        >
          <MenuIcon size={22} color={C.blueLight} />
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <View style={styles.chip}>
          <Text style={styles.chipText}>
            {profile.currentStreak}d &middot; {kmWalked} km
          </Text>
        </View>
      </View>

      <View style={styles.center}>
        <Text style={styles.eyebrow}>TONIGHT // {theme.label}</Text>
        <Text style={styles.title}>
          {nextPatrol ? nextPatrol.title : 'All chapters cleared.'}
        </Text>
        {nextPatrol && nextPatrol.subtitle ? (
          <Text style={styles.subtitle}>{nextPatrol.subtitle}</Text>
        ) : null}
      </View>

      <View style={styles.bottom}>
        {isRaidActive ? (
          <TouchableOpacity
            style={styles.raidBanner}
            onPress={() =>
              raidChapter
                ? navigation.navigate('PatrolBriefing', { graphId: raidChapter.id })
                : undefined
            }
            activeOpacity={0.85}
          >
            <Text style={styles.raidEyebrow}>RAID WINDOW OPEN</Text>
            <Text style={styles.raidHeadline} numberOfLines={1}>
              {raid?.window ? raid.window.headline : ''}
            </Text>
          </TouchableOpacity>
        ) : null}

        <PillImageButton
          source={SUBURB_BTN}
          label="BEGIN PATROL"
          sublabel={
            nextPatrol
              ? nextPatrol.title.toUpperCase()
              : 'ALL CHAPTERS COMPLETE'
          }
          tone="light"
          disabled={!nextPatrol}
          onPress={() => {
            if (nextPatrol) {
              navigation.navigate('PatrolBriefing', { graphId: nextPatrol.id });
            }
          }}
        />

        <Text style={styles.brand}>PRISON READY</Text>
        <Text style={styles.brandTag}>BUILT TODAY. READY FOR TOMORROW.</Text>
      </View>

      <HomeDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={drawerItems}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#03050c' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 44,
    paddingHorizontal: 16,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(15,28,43,0.86)',
    borderWidth: 1,
    borderColor: 'rgba(138,191,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(15,28,43,0.86)',
    borderWidth: 1,
    borderColor: 'rgba(138,191,255,0.35)',
  },
  chipText: {
    color: C.text,
    fontSize: 12,
    letterSpacing: 1.1,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  eyebrow: {
    color: C.blueLight,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    color: C.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 6,
  },
  subtitle: {
    color: C.textMuted,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  bottom: {
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  raidBanner: {
    backgroundColor: 'rgba(255,138,0,0.16)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.warning,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  raidEyebrow: {
    color: C.warning,
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 2,
  },
  raidHeadline: { color: C.text, fontSize: 13, fontWeight: '700' },
  brand: {
    textAlign: 'center',
    color: C.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 4,
    marginTop: 24,
  },
  brandTag: {
    textAlign: 'center',
    color: C.blueLight,
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 3,
  },
});

export default HomeScreen;
export { HomeScreen };
