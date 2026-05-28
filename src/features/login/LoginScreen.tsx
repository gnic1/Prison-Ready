// LoginScreen — branded entry gate shown on every cold launch.
// The user must tap START to enter the app, even if they're already onboarded.
// Renders OUTSIDE NavigationContainer (during the pre-session phase), so it
// must NOT depend on a SafeAreaProvider — using a fixed bottom inset instead.

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

const BG = require('../../../assets/login/login_background.png');

interface LoginScreenProps {
  onStart: () => void;
}

const BOTTOM_INSET = 64;

export const LoginScreen: React.FC<LoginScreenProps> = ({ onStart }) => {
  const pulse = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Subtle breathing glow around the button so it reads as the affordance.
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

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} style={StyleSheet.absoluteFill} resizeMode="cover">
        <View style={styles.bottomDim} />

        <View style={[styles.bottom, { paddingBottom: BOTTOM_INSET }]}>
          <Text style={styles.tagline}>STAY ALERT &middot; STAY READY</Text>

          <Pressable
            onPress={onStart}
            android_ripple={{ color: 'rgba(255,255,255,0.18)', borderless: false }}
            style={({ pressed }) => [
              styles.btnWrap,
              pressed ? styles.pressed : null,
            ]}
          >
            <Animated.View
              style={[
                styles.button,
                {
                  shadowColor: '#1e90ff',
                  shadowOpacity,
                  shadowRadius,
                  shadowOffset: { width: 0, height: 0 },
                },
              ]}
            >
              <Text style={styles.btnLabel}>START PATROL</Text>
              <Text style={styles.btnSub}>TAP TO BEGIN</Text>
            </Animated.View>
          </Pressable>

          <Text style={styles.brand}>PRISON READY</Text>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#03050c' },
  bottomDim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 280,
    backgroundColor: 'transparent',
  },
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  tagline: {
    color: '#a8c8ff',
    fontSize: 11,
    letterSpacing: 4,
    fontWeight: '700',
    marginBottom: 18,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowRadius: 4,
  },
  btnWrap: {
    width: '100%',
    borderRadius: 36,
  },
  button: {
    backgroundColor: '#1e90ff',
    borderRadius: 36,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a8c8ff',
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
  brand: {
    color: '#f3f6fb',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 4,
    marginTop: 22,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 4,
  },
});

export default LoginScreen;
