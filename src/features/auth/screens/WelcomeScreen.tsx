import React from 'react';
import { Platform, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { PrisonButton } from '../../../components/PrisonButton';
import { AuthStorageService } from '../services/authStorageService';

export default function WelcomeScreen() {
  const navigation = useNavigation<any>();

  React.useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }
    const preview = new URLSearchParams(window.location.search).get('codexPreview');
    if (!preview) {
      return;
    }
    navigation.navigate('ReviewLab', { initialPreview: preview });
  }, [navigation]);

  const handleGuest = async () => {
    await AuthStorageService.continueAsGuest();
    navigation.navigate('ThemeSelection');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#09090B', '#161019', '#211406']} style={StyleSheet.absoluteFill} />
      <View style={styles.heroPanel}>
        <Text style={styles.eyebrow}>WELCOME //</Text>
        <Text style={styles.title}>Mission continuity starts before the first walk.</Text>
        <Text style={styles.subtitle}>
          Set up your identity, choose your world, and lock in how this app should guide your next mission.
        </Text>
      </View>
      <View style={styles.actions}>
        <PrisonButton title="Sign In" onPress={() => navigation.navigate('AccountBasics', { mode: 'signIn' })} shimmer />
        <PrisonButton title="Create Account" onPress={() => navigation.navigate('AccountBasics', { mode: 'create' })} />
        <TouchableOpacity onPress={handleGuest} style={styles.guestLink}>
          <Text style={styles.guestText}>Continue as Guest</Text>
        </TouchableOpacity>
        {Platform.OS === 'web' ? (
          <TouchableOpacity onPress={() => navigation.navigate('ReviewLab')} style={styles.reviewLink}>
            <Text style={styles.reviewText}>Open Review Lab</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    justifyContent: 'space-between',
    paddingTop: 92,
    paddingBottom: 48,
    backgroundColor: '#09090B',
  },
  heroPanel: {
    gap: 14,
  },
  eyebrow: {
    color: '#FFB26B',
    fontSize: 12,
    letterSpacing: 2.4,
    fontWeight: '700',
  },
  title: {
    color: '#F5F3EE',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
  },
  subtitle: {
    color: '#B4B8C4',
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    gap: 8,
  },
  guestLink: {
    alignSelf: 'center',
    paddingVertical: 10,
  },
  guestText: {
    color: '#D5D9E4',
    letterSpacing: 1,
    fontSize: 14,
  },
  reviewLink: {
    alignSelf: 'center',
    paddingVertical: 6,
  },
  reviewText: {
    color: '#8FD8FF',
    letterSpacing: 1.2,
    fontSize: 13,
    fontWeight: '700',
  },
});
