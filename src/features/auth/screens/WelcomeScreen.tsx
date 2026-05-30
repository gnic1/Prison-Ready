// WelcomeScreen — Neighborhood Watch reskin.
// Full-bleed main_background.png, blue tagline, pill CTAs matching the rest
// of the app. Routes the player into sign in / create account / guest.

import React from 'react';
import {
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import NW from '../../../theme/uiTokens';
import { AuthStorageService } from '../services/authStorageService';

const BG = require('../../../../assets/backgrounds/main_background.png');

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();

  React.useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const preview = new URLSearchParams(window.location.search).get('codexPreview');
    if (!preview) return;
    navigation.navigate('ReviewLab', { initialPreview: preview });
  }, [navigation]);

  const handleGuest = async () => {
    await AuthStorageService.continueAsGuest();
    navigation.navigate('ThemeSelection');
  };

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={['rgba(7,16,29,0.20)', 'rgba(7,16,29,0.92)']}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <View style={styles.bottom}>
        <Text style={styles.tagline}>EVERY STREET HAS SECRETS</Text>
        <Text style={styles.title}>WELCOME, WATCHER</Text>
        <Text style={styles.subtitle}>
          Sign in to sync your patrol, create an account to start one, or jump in
          as a guest.
        </Text>

        <Pressable
          onPress={() => navigation.navigate('AccountBasics', { mode: 'create' })}
          android_ripple={{ color: 'rgba(255,255,255,0.18)', borderless: false }}
          style={({ pressed }) => [styles.btnWrap, pressed ? styles.pressed : null]}
        >
          <View style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryLabel}>CREATE ACCOUNT</Text>
          </View>
        </Pressable>

        <TouchableOpacity
          onPress={() => navigation.navigate('AccountBasics', { mode: 'signIn' })}
          style={styles.btnSecondary}
          activeOpacity={0.85}
        >
          <Text style={styles.btnSecondaryLabel}>SIGN IN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleGuest}
          style={styles.guestLink}
          activeOpacity={0.7}
        >
          <Text style={styles.guestText}>CONTINUE AS GUEST</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NW.bgInk },
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: 44,
  },
  tagline: {
    color: NW.blueLight,
    fontSize: 11,
    letterSpacing: 4,
    fontWeight: '700',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowRadius: 4,
  },
  title: {
    color: NW.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowRadius: 4,
  },
  subtitle: {
    color: NW.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  btnWrap: { width: '100%', borderRadius: 36, marginBottom: 10 },
  btnPrimary: {
    backgroundColor: NW.blue,
    borderRadius: 36,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: NW.blueLight,
  },
  btnPrimaryLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
  btnSecondary: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 36,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: NW.stroke,
    marginBottom: 14,
  },
  btnSecondaryLabel: {
    color: NW.text,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  guestLink: { paddingVertical: 8 },
  guestText: {
    color: NW.blueLight,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.98 }] },
});
