import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { PrisonButton } from '../../../components/PrisonButton';
import { themes, AppThemeKey } from '../../../theme/themes';
import { AuthStorageService, defaultAuthState } from '../services/authStorageService';

const THEME_ORDER: AppThemeKey[] = ['prison', 'neighborhood', 'theyreHere'];

export default function ThemeSelectionScreen() {
  const navigation = useNavigation<any>();
  const [selectedTheme, setSelectedTheme] = React.useState<AppThemeKey>(defaultAuthState.selectedTheme);

  const handleContinue = async () => {
    await AuthStorageService.updateActiveState({ selectedTheme });
    navigation.navigate('MissionPreferences');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#071018', '#111625', '#150D0A']} style={StyleSheet.absoluteFill} />
      <Text style={styles.eyebrow}>THEME SELECTION //</Text>
      <Text style={styles.title}>Choose the world you want the app to inhabit.</Text>
      <View style={styles.grid}>
        {THEME_ORDER.map((themeKey) => {
          const theme = themes[themeKey];
          const isSelected = selectedTheme === themeKey;
          return (
            <TouchableOpacity key={themeKey} onPress={() => setSelectedTheme(themeKey)} style={[styles.card, isSelected && { borderColor: theme.colors.accent, shadowColor: theme.colors.accent, shadowOpacity: 0.24 }]}>
              <LinearGradient colors={theme.gradients.hero} style={StyleSheet.absoluteFill} />
              <Text style={[styles.cardLabel, { color: theme.colors.accent }]}>{theme.label}</Text>
              <Text style={styles.cardTitle}>{theme.landing.eyebrow}</Text>
              <Text style={styles.cardBody}>{theme.landing.subtitle}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <PrisonButton title="Continue" onPress={handleContinue} shimmer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 68,
    paddingBottom: 34,
  },
  eyebrow: {
    color: '#9CDBFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.1,
    marginBottom: 12,
  },
  title: {
    color: '#F4F3EF',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 20,
  },
  grid: {
    flex: 1,
    gap: 14,
    marginBottom: 18,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    padding: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(16,18,24,0.78)',
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 8,
  },
  cardTitle: {
    color: '#F4F3EF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  cardBody: {
    color: '#D7DCE8',
    fontSize: 14,
    lineHeight: 20,
  },
});
