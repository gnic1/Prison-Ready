import React from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { DerivedBadge } from '../../missions/services/missionMetaService';
import { getBadgeCatalogEntry, TIER_ACCENT } from '../data/badgeCatalog';

interface BadgeUnlockOverlayProps {
  badge: DerivedBadge | null;
  onDismiss: () => void;
}

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const RAY_COUNT = 18;
const CONFETTI_COUNT = 36;
const CONFETTI_PALETTE = ['#FFB26B', '#FFD180', '#7FB6FF', '#F4F2EE', '#FF8C3B'];

function fireFanfareHaptics() {
  if (Platform.OS === 'web') return;
  // Lead-in: two sharp impacts, then a SUCCESS swell. Timed roughly to the
  // visual badge landing.
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  setTimeout(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
  }, 120);
  setTimeout(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  }, 320);
}

interface ConfettiPiece {
  left: number;
  delay: number;
  duration: number;
  drift: number;
  color: string;
  rotate: number;
}

function buildConfetti(): ConfettiPiece[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    left: Math.random() * SCREEN_W,
    delay: Math.random() * 600,
    duration: 2200 + Math.random() * 1600,
    drift: (Math.random() - 0.5) * 220,
    color: CONFETTI_PALETTE[i % CONFETTI_PALETTE.length],
    rotate: Math.random() * 720,
  }));
}

export function BadgeUnlockOverlay({ badge, onDismiss }: BadgeUnlockOverlayProps) {
  const visible = !!badge;
  const veil = React.useRef(new Animated.Value(0)).current;
  const drop = React.useRef(new Animated.Value(0)).current;
  const titleFade = React.useRef(new Animated.Value(0)).current;
  const glowPulse = React.useRef(new Animated.Value(0)).current;
  const raySpin = React.useRef(new Animated.Value(0)).current;
  const confettiProgress = React.useRef(new Animated.Value(0)).current;
  const confettiPieces = React.useRef<ConfettiPiece[]>(buildConfetti()).current;

  const runAnimation = React.useCallback(() => {
    veil.setValue(0);
    drop.setValue(0);
    titleFade.setValue(0);
    confettiProgress.setValue(0);

    Animated.timing(veil, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.delay(180),
      Animated.spring(drop, {
        toValue: 1,
        tension: 70,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(640),
      Animated.timing(titleFade, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(confettiProgress, {
      toValue: 1,
      duration: 3400,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();

    fireFanfareHaptics();
  }, [veil, drop, titleFade, confettiProgress]);

  // Re-run the entrance animation each time a *new* badge enters the queue,
  // not just on visible toggles — handles the case where multiple badges
  // unlock at once and we burn through them without the modal closing.
  const badgeId = badge?.badgeId ?? null;
  React.useEffect(() => {
    if (!badgeId) return;
    confettiPieces.splice(0, confettiPieces.length, ...buildConfetti());
    runAnimation();
  }, [badgeId, runAnimation, confettiPieces]);

  // Continuous loops: the rays slowly rotate and the glow gently pulses while
  // the overlay is mounted. Looped via JS driver with no useNativeDriver
  // restrictions on reset.
  React.useEffect(() => {
    if (!badgeId) return;
    const spin = Animated.loop(
      Animated.timing(raySpin, {
        toValue: 1,
        duration: 18000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    spin.start();
    pulse.start();
    return () => {
      spin.stop();
      pulse.stop();
    };
  }, [badgeId, raySpin, glowPulse]);

  if (!badge) return null;

  const catalog = getBadgeCatalogEntry(badge.badgeId);
  const accent = TIER_ACCENT[catalog.tier];

  const veilOpacity = veil.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const badgeTranslate = drop.interpolate({ inputRange: [0, 1], outputRange: [-260, 0] });
  const badgeScale = drop.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0.55, 1.06, 1] });
  const glowScale = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const glowOpacity = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const raysSpin = raySpin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onDismiss} statusBarTranslucent>
      <Animated.View style={[styles.fill, { opacity: veilOpacity }]} pointerEvents="auto">
        <LinearGradient
          colors={['rgba(9,9,11,0.96)', 'rgba(22,16,25,0.94)', 'rgba(33,20,6,0.96)']}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.center} pointerEvents="box-none">
          {/* Sun rays */}
          <Animated.View style={[styles.rays, { transform: [{ rotate: raysSpin }] }]} pointerEvents="none">
            {Array.from({ length: RAY_COUNT }).map((_, i) => {
              const angle = (360 / RAY_COUNT) * i;
              return (
                <View
                  key={`ray_${i}`}
                  style={[
                    styles.ray,
                    {
                      transform: [{ rotate: `${angle}deg` }, { translateY: -180 }],
                      opacity: i % 2 === 0 ? 0.55 : 0.22,
                      backgroundColor: accent,
                    },
                  ]}
                />
              );
            })}
          </Animated.View>

          {/* Glow halo */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.glow,
              {
                backgroundColor: accent,
                transform: [{ scale: glowScale }],
                opacity: glowOpacity,
              },
            ]}
          />

          {/* Confetti */}
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {confettiPieces.map((p, idx) => {
              const fall = confettiProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [-40, SCREEN_H + 60],
              });
              const drift = confettiProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, p.drift],
              });
              const rotation = confettiProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', `${p.rotate}deg`],
              });
              const opacity = confettiProgress.interpolate({
                inputRange: [0, 0.05, 0.85, 1],
                outputRange: [0, 1, 1, 0],
              });
              return (
                <Animated.View
                  key={`conf_${idx}`}
                  style={[
                    styles.confetti,
                    {
                      left: p.left,
                      backgroundColor: p.color,
                      opacity,
                      transform: [{ translateY: fall }, { translateX: drift }, { rotate: rotation }],
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Hero block */}
          <Animated.Text
            style={[styles.eyebrow, { color: accent, opacity: titleFade }]}
          >
            BADGE UNLOCKED //
          </Animated.Text>

          <Animated.View
            style={[
              styles.badgeWrap,
              {
                transform: [{ translateY: badgeTranslate }, { scale: badgeScale }],
              },
            ]}
          >
            <Image source={catalog.image} style={styles.badgeImg} resizeMode="contain" />
          </Animated.View>

          <Animated.Text style={[styles.title, { opacity: titleFade, color: accent }]}>
            {badge.label}
          </Animated.Text>
          <Animated.Text style={[styles.flavor, { opacity: titleFade }]}>
            {catalog.flavor}
          </Animated.Text>

          <Animated.View style={[styles.statRow, { opacity: titleFade }]}>
            <View style={[styles.stat, { borderColor: `${accent}55` }]}>
              <Text style={styles.statLabel}>TIER</Text>
              <Text style={[styles.statVal, { color: accent }]}>{catalog.tier.toUpperCase()}</Text>
            </View>
            <View style={[styles.stat, { borderColor: `${accent}55` }]}>
              <Text style={styles.statLabel}>XP</Text>
              <Text style={[styles.statVal, { color: accent }]}>+{catalog.unlockXp}</Text>
            </View>
            <View style={[styles.stat, { borderColor: `${accent}55` }]}>
              <Text style={styles.statLabel}>BADGE</Text>
              <Text style={[styles.statVal, { color: accent }]}>{badge.badgeId.replace(/_/g, ' ')}</Text>
            </View>
          </Animated.View>

          <Animated.View style={[styles.ctaWrap, { opacity: titleFade }]}>
            <Pressable
              onPress={onDismiss}
              style={({ pressed }) => [
                styles.cta,
                { backgroundColor: accent, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={styles.ctaText}>Add to locker  →</Text>
            </Pressable>
            <Pressable onPress={runAnimation} style={styles.replay}>
              <Text style={styles.replayText}>♪ replay fanfare</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  rays: {
    position: 'absolute',
    width: 360,
    height: 360,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ray: {
    position: 'absolute',
    width: 2,
    height: 200,
    borderRadius: 1,
  },
  glow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    opacity: 0.55,
    transform: [{ scale: 1 }],
  },
  badgeWrap: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  badgeImg: {
    width: 200,
    height: 200,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 14,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 6,
    textAlign: 'center',
  },
  flavor: {
    color: '#CBD2DE',
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 320,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  stat: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: 'rgba(15,18,25,0.78)',
    borderWidth: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: '#7E8696',
    fontSize: 9,
    letterSpacing: 1.4,
    fontWeight: '700',
  },
  statVal: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ctaWrap: {
    marginTop: 28,
    alignItems: 'center',
  },
  cta: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 30,
  },
  ctaText: {
    color: '#1A1208',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  replay: {
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  replayText: {
    color: '#7E8696',
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '700',
  },
  confetti: {
    position: 'absolute',
    width: 6,
    height: 10,
    borderRadius: 1,
    top: -40,
  },
});

export default BadgeUnlockOverlay;
