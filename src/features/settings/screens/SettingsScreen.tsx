import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { themes, AppThemeKey } from '../../../theme/themes';
import { AuthStorageService, AuthState, defaultAuthState } from '../../auth/services/authStorageService';
import { UserPreferences, UserPreferencesService, defaultUserPreferences } from '../../missions/services/userPreferencesService';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const [authState, setAuthState] = React.useState<AuthState>(defaultAuthState);
  const [prefs, setPrefs] = React.useState<UserPreferences>(defaultUserPreferences);

  React.useEffect(() => {
    let mounted = true;
    Promise.all([
      AuthStorageService.loadState(),
      UserPreferencesService.getPreferences(),
    ]).then(([state, nextPrefs]) => {
      if (!mounted) {
        return;
      }
      setAuthState(state);
      setPrefs(nextPrefs);
    });
    const unsubscribe = AuthStorageService.subscribe(setAuthState);
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const theme = themes[authState.selectedTheme];

  const handleThemeChange = async (themeKey: AppThemeKey) => {
    await AuthStorageService.updateActiveState({ selectedTheme: themeKey });
  };

  const handleSignOut = async () => {
    await AuthStorageService.signOut();
    await UserPreferencesService.resetPreferences();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.gradients.screen} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>SETTINGS //</Text>
        <Text style={styles.title}>Adjust the shell tone and review the defaults driving your runs.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Theme</Text>
          {(['prison', 'neighborhood', 'theyreHere'] as AppThemeKey[]).map((themeKey) => (
            <TouchableOpacity key={themeKey} onPress={() => handleThemeChange(themeKey)} style={[styles.row, authState.selectedTheme === themeKey && { borderColor: themes[themeKey].colors.accent }]}>
              <Text style={styles.rowTitle}>{themes[themeKey].label}</Text>
              <Text style={styles.rowBody}>{themes[themeKey].landing.eyebrow}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Field Defaults</Text>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Mission Style</Text>
            <Text style={styles.rowBody}>{prefs.preferredMissionStyle}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Goal Mode</Text>
            <Text style={styles.rowBody}>{prefs.goalType === 'distance' ? 'Distance-led' : 'Time-led'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowTitle}>Route Mode</Text>
            <Text style={styles.rowBody}>{prefs.missionMode === 'outside' ? 'Outside route tracking' : 'Treadmill simulation'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Missions', { screen: 'Artifacts' })} style={styles.row}>
            <Text style={styles.rowTitle}>Open Evidence Locker</Text>
            <Text style={styles.rowBody}>Jump straight to recovered artifacts and mission evidence from here.</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleSignOut} style={[styles.row, styles.signOutRow]}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 68, paddingBottom: 120 },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.1,
    marginBottom: 12,
  },
  title: {
    color: '#F2F2EE',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 18,
  },
  card: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: 'rgba(14,18,24,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 14,
  },
  cardTitle: {
    color: '#EDEFF6',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  row: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 14,
    marginBottom: 10,
    backgroundColor: 'rgba(6,9,16,0.72)',
  },
  rowTitle: {
    color: '#FAFAF4',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  rowBody: {
    color: '#B6BCCB',
    lineHeight: 19,
  },
  signOutRow: {
    marginTop: 8,
    alignItems: 'center',
  },
  signOutText: {
    color: '#FFD7B8',
    fontSize: 15,
    fontWeight: '700',
  },
});
