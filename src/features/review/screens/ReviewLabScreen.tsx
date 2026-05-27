import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PrisonButton } from '../../../components/PrisonButton';
import { AuthStorageService, AuthState, defaultAuthState } from '../../auth/services/authStorageService';
import { UserPreferencesService } from '../../missions/services/userPreferencesService';
import { MissionEngineService } from '../../missions/services/missionEngineService';
import HomeScreen from '../../home/HomeScreen';
import MissionStartScreen from '../../missions/screens/MissionStartScreen';
import MissionDay1Screen from '../../missions/screens/MissionDay1Screen';
import { ReportBackScreen } from '../../reportBack/screens/ReportBackScreen';
import ArtifactsScreen from '../../artifacts/screens/ArtifactsScreen';

async function seedOnboarding() {
  await AuthStorageService.continueAsGuest();
  await UserPreferencesService.updatePreferences({
    preferredMissionStyle: 'balanced',
    distanceUnit: 'km',
    goalType: 'minutes',
    missionMode: 'treadmill',
    preferredTimeMinutes: 30,
    preferredDistanceValue: 2,
  });
  await AuthStorageService.completeOnboarding({
    selectedTheme: 'prison',
    preferredMissionStyle: 'balanced',
    distanceUnit: 'km',
  });
}

export default function ReviewLabScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [authState, setAuthState] = React.useState<AuthState>(defaultAuthState);
  const [pendingDestination, setPendingDestination] = React.useState<'welcome' | 'home' | null>(null);
  const [previewScreen, setPreviewScreen] = React.useState<null | 'home' | 'missionStart' | 'activeMission' | 'reportBack' | 'artifacts'>(null);
  const [didAutoPreview, setDidAutoPreview] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    AuthStorageService.loadState().then((state) => {
      if (mounted) {
        setAuthState(state);
      }
    });
    const unsubscribe = AuthStorageService.subscribe((state) => {
      setAuthState(state);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    if (pendingDestination === 'welcome' && !authState.onboardingCompleted) {
      navigation.navigate('Welcome');
      setPendingDestination(null);
      return;
    }
    if (pendingDestination === 'home' && authState.onboardingCompleted) {
      navigation.navigate('Tabs');
      setPendingDestination(null);
    }
  }, [authState.onboardingCompleted, navigation, pendingDestination]);

  const goWelcome = async () => {
    setPendingDestination('welcome');
    await MissionEngineService.clearMissionData();
    await UserPreferencesService.resetPreferences();
    await AuthStorageService.signOut();
  };

  const goHome = async () => {
    setPreviewScreen('home');
    setPendingDestination('home');
    await MissionEngineService.clearMissionData();
    await seedOnboarding();
  };

  const goMissionStart = async () => {
    await MissionEngineService.clearMissionData();
    setPreviewScreen('missionStart');
    if (!authState.onboardingCompleted) {
      await seedOnboarding();
    }
  };

  const goActiveMission = async () => {
    await MissionEngineService.seedReviewMissionState('active');
    setPreviewScreen('activeMission');
  };

  const goReportBack = async () => {
    await MissionEngineService.seedReviewMissionState('completed');
    setPreviewScreen('reportBack');
  };

  const goArtifacts = async () => {
    await MissionEngineService.seedReviewMissionState('completed');
    setPreviewScreen('artifacts');
  };

  React.useEffect(() => {
    if (didAutoPreview) {
      return;
    }
    const preview = route.params?.initialPreview;
    if (!preview) {
      return;
    }
    setDidAutoPreview(true);
    const run = async () => {
      if (preview === 'home') {
        await goHome();
        return;
      }
      if (preview === 'missionStart') {
        await goMissionStart();
        return;
      }
      if (preview === 'activeMission') {
        await seedOnboarding();
        await goActiveMission();
        return;
      }
      if (preview === 'reportBack') {
        await seedOnboarding();
        await goReportBack();
        return;
      }
      if (preview === 'artifacts') {
        await seedOnboarding();
        await goArtifacts();
      }
    };
    run().catch(() => {
      setDidAutoPreview(false);
    });
  }, [didAutoPreview, route.params, authState.onboardingCompleted]);

  if (previewScreen) {
    const preview = previewScreen === 'home'
      ? <HomeScreen />
      : previewScreen === 'missionStart'
        ? <MissionStartScreen />
        : previewScreen === 'activeMission'
          ? <MissionDay1Screen />
          : previewScreen === 'reportBack'
            ? <ReportBackScreen />
            : <ArtifactsScreen />;

    return (
      <View style={styles.previewContainer}>
        <TouchableOpacity onPress={() => setPreviewScreen(null)} style={styles.previewBack}>
          <Text style={styles.previewBackText}>Back to Review Lab</Text>
        </TouchableOpacity>
        <View style={styles.previewBody}>
          {preview}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#071018', '#0F1320', '#170F09']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>WEB REVIEW //</Text>
        <Text style={styles.title}>Codex review lab</Text>
        <Text style={styles.body}>
          This screen exists to make browser review deterministic. It seeds safe sample state and jumps into real app screens without changing Android gameplay.
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Entry states</Text>
          <PrisonButton title="Reset to Welcome" onPress={goWelcome} />
          <View style={styles.spacer} />
          <PrisonButton title="Open Home" onPress={goHome} />
        </View>

        {authState.onboardingCompleted ? (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Mission states</Text>
              <PrisonButton title="Open Mission Setup" onPress={goMissionStart} />
              <View style={styles.spacer} />
              <PrisonButton title="Open Active Mission" onPress={goActiveMission} shimmer />
              <View style={styles.spacer} />
              <PrisonButton title="Open Report Back" onPress={goReportBack} />
              <View style={styles.spacer} />
              <PrisonButton title="Open Artifacts" onPress={goArtifacts} />
            </View>
          </>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Next step</Text>
            <Text style={styles.body}>
              Open Home once to complete onboarding. After that, reopen the review lab from inside the app to jump into missions and saved-state screens.
            </Text>
          </View>
        )}

        {Platform.OS === 'web' ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 72, paddingBottom: 60, gap: 16 },
  previewContainer: { flex: 1, backgroundColor: '#05070C' },
  previewBack: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 50,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(5,10,18,0.88)',
    borderWidth: 1,
    borderColor: 'rgba(143,216,255,0.24)',
  },
  previewBackText: { color: '#8FD8FF', fontWeight: '700', letterSpacing: 1 },
  previewBody: { flex: 1 },
  eyebrow: { color: '#97D8FF', fontSize: 12, fontWeight: '700', letterSpacing: 2.1 },
  title: { color: '#F5F3EE', fontSize: 30, fontWeight: '800' },
  body: { color: '#CCD3DE', lineHeight: 22 },
  card: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: 'rgba(11,14,20,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionTitle: {
    color: '#F5F3EE',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14,
  },
  spacer: { height: 10 },
  backLink: { alignSelf: 'center', paddingVertical: 8, paddingHorizontal: 12 },
  backText: { color: '#D8DDE7', fontWeight: '700', letterSpacing: 1 },
});
