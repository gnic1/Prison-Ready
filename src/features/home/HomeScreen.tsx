// HomeScreen — main landing page.
// Full-bleed neighborhood background, tagline + Start Patrol blue pill button.
// Bottom nav (HOME / PROFILE / LEDGER / SETTINGS) lives in MainTabNavigator.

import React from 'react';
import {
  Animated,
  Easing,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NW from '../../theme/uiTokens';
import { graphsForSkin } from '../patrol/content';
import {
  AuthStorageService,
  defaultAuthState,
  AuthState,
} from '../auth/services/authStorageService';
import {
  PlayerProfileService,
  PlayerProfile,
} from '../patrol/services/playerProfileService';

const BG = require('../../../assets/backgrounds/main_background.png');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [auth, setAuth] = React.useState<AuthState>(defaultAuthState);
  const [profile, setProfile] = React.useState<PlayerProfile>(
    PlayerProfileService.get(),
  );
  const pulse = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    AuthStorageService.loadState().then(setAuth).catch(() => {});
    return PlayerProfileService.subscribe(setProfile);
  }, []);

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [pulse]);

  const shadowRadius = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [6, 18],
  });
  const shadowOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 0.95],
  });

  const skinGraphs = graphsForSkin(auth.selectedTheme);
  const completed = new Set(profile.chaptersCompleted);
  const nextPatrol = skinGraphs.find(
    (g) => g.chapter < 90 && !completed.has(g.id),
  );

  const handleStart = () => {
    if (nextPatrol) {
      navigation.navigate('PatrolBriefing', { graphId: nextPatrol.id });
    }
  };

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <View style={styles.bottom}>
        <Text style={styles.tagline}>EVERY STREET HAS SECRETS</Text>

        <Pressable
          onPress={handleStart}
          disabled={!nextPatrol}
          android_ripple={{ color: 'rgba(255,255,255,0.18)', borderless: false }}
          style={({ pressed }) => [
            styles.btnWrap,
            pressed ? styles.pressed : null,
            !nextPatrol ? styles.disabled : null,
          ]}
        >
          <Animated.View
            style={[
              styles.button,
              {
                shadowColor: NW.blue,
                shadowOpacity,
                shadowRadius,
                shadowOffset: { width: 0, height: 0 },
              },
            ]}
          >
            <Text style={styles.btnLabel}>START PATROL</Text>
            <Text style={styles.btnSub}>
              {nextPatrol ? nextPatrol.title.toUpperCase() : 'ALL CHAPTERS CLEARED'}
            </Text>
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NW.bgInk },
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 36,
  },
  tagline: {
    color: NW.blueLight,
    fontSize: 11,
    letterSpacing: 4,
    fontWeight: '700',
    marginBottom: 18,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowRadius: 4,
  },
  btnWrap: { width: '100%', borderRadius: 36 },
  button: {
    backgroundColor: NW.blue,
    borderRadius: 36,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: NW.blueLight,
  },
  btnLabel: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
  },
  btnSub: {
    color: '#cfe0ff',
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 2,
    fontWeight: '600',
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.45 },
});

export default HomeScreen;
export { HomeScreen };
