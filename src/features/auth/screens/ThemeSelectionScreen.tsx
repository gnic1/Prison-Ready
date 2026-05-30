// ThemeSelectionScreen — Neighborhood Watch reskin.
// Player picks the skin (Prison / Neighborhood / They're Here) on the
// suburban backdrop with NW chrome.

import React from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import NW from '../../../theme/uiTokens';
import { themes, AppThemeKey } from '../../../theme/themes';
import {
  AuthStorageService,
  defaultAuthState,
} from '../services/authStorageService';

const BG = require('../../../../assets/backgrounds/main_background.png');
const THEME_ORDER: AppThemeKey[] = ['prison', 'neighborhood', 'theyreHere'];

export default function ThemeSelectionScreen() {
  const navigation = useNavigation<any>();
  const [selectedTheme, setSelectedTheme] = React.useState<AppThemeKey>(
    defaultAuthState.selectedTheme,
  );

  const handleContinue = async () => {
    await AuthStorageService.updateActiveState({ selectedTheme });
    navigation.navigate('MissionPreferences');
  };

  return (
    <View style={styles.root}>
      <ImageBackground source={BG} style={StyleSheet.absoluteFill} resizeMode="cover">
        <LinearGradient
          colors={['rgba(7,16,29,0.50)', 'rgba(7,16,29,0.94)']}
          style={StyleSheet.absoluteFill}
        />
      </ImageBackground>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>CHOOSE YOUR WORLD //</Text>
        <Text style={styles.title}>What kind of patrol are you walking?</Text>
        <Text style={styles.subtitle}>
          Each skin reshapes the story, the voice, and what kind of street the
          app lives on. You can change this later in Settings.
        </Text>

        {THEME_ORDER.map((themeKey) => {
          const theme = themes[themeKey];
          const isSelected = selectedTheme === themeKey;
          return (
            <TouchableOpacity
              key={themeKey}
              activeOpacity={0.85}
              onPress={() => setSelectedTheme(themeKey)}
              style={[styles.card, isSelected ? styles.cardActive : null]}
            >
              <Text style={[styles.cardLabel, isSelected ? styles.cardLabelActive : null]}>
                {theme.label.toUpperCase()}
              </Text>
              <Text style={[styles.cardTitle, isSelected ? styles.cardTitleActive : null]}>
                {theme.landing.title}
              </Text>
              <Text style={styles.cardBody}>{theme.landing.subtitle}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={styles.ctaText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: NW.bgInk },
  scroll: { padding: 22, paddingTop: 56, paddingBottom: 12 },
  eyebrow: {
    color: NW.blueLight,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: '800',
    marginBottom: 8,
  },
  title: {
    color: NW.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
    lineHeight: 28,
    marginBottom: 8,
  },
  subtitle: {
    color: NW.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 18,
  },
  card: {
    backgroundColor: 'rgba(16,27,41,0.78)',
    borderRadius: NW.radLg,
    borderWidth: 1,
    borderColor: NW.strokeSoft,
    padding: 18,
    marginBottom: 12,
  },
  cardActive: {
    backgroundColor: 'rgba(30,144,255,0.20)',
    borderColor: NW.blue,
  },
  cardLabel: {
    color: NW.blueLight,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardLabelActive: { color: '#ffffff' },
  cardTitle: {
    color: NW.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  cardTitleActive: { color: '#ffffff' },
  cardBody: {
    color: NW.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  footer: { paddingHorizontal: 22, paddingBottom: 24, paddingTop: 8 },
  cta: {
    backgroundColor: NW.blue,
    borderRadius: 36,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: NW.blueLight,
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
  },
});
