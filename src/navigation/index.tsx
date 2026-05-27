import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainTabNavigator from './MainTabNavigator';
import WelcomeScreen from '../features/auth/screens/WelcomeScreen';
import AccountBasicsScreen from '../features/auth/screens/AccountBasicsScreen';
import ThemeSelectionScreen from '../features/auth/screens/ThemeSelectionScreen';
import MissionPreferencesScreen from '../features/auth/screens/MissionPreferencesScreen';
import SettingsScreen from '../features/settings/screens/SettingsScreen';
import DietTrackerPlaceholderScreen from '../features/diet/screens/DietTrackerPlaceholderScreen';
import { AuthState, AuthStorageService, defaultAuthState } from '../features/auth/services/authStorageService';
import ReviewLabScreen from '../features/review/screens/ReviewLabScreen';
import { PatrolBriefingScreen } from '../features/patrol/screens/PatrolBriefingScreen';
import { PatrolStanceScreen } from '../features/patrol/screens/PatrolStanceScreen';
import { PatrolHUDScreen } from '../features/patrol/screens/PatrolHUDScreen';
import { PatrolDebriefScreen } from '../features/patrol/screens/PatrolDebriefScreen';
import { LedgerScreen } from '../features/patrol/screens/LedgerScreen';
import { PlayerProfileService } from '../features/patrol/services/playerProfileService';
import { LedgerService } from '../features/patrol/services/ledgerService';
import { OffDayDispatchService } from '../features/patrol/services/offDayDispatchService';
import { dispatches as ALL_DISPATCHES } from '../features/patrol/content/dispatches';
import { LoadingScreen } from '../features/loading/LoadingScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';

const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="ReviewLab" component={ReviewLabScreen} />
      <Stack.Screen name="AccountBasics" component={AccountBasicsScreen} />
      <Stack.Screen name="ThemeSelection" component={ThemeSelectionScreen} />
      <Stack.Screen name="MissionPreferences" component={MissionPreferencesScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={MainTabNavigator} />
      <Stack.Screen name="ReviewLab" component={ReviewLabScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="DietTracker" component={DietTrackerPlaceholderScreen} />
      <Stack.Screen name="PatrolBriefing" component={PatrolBriefingScreen} />
      <Stack.Screen name="PatrolStance" component={PatrolStanceScreen} />
      <Stack.Screen name="PatrolHUD" component={PatrolHUDScreen} />
      <Stack.Screen name="PatrolDebrief" component={PatrolDebriefScreen} />
      <Stack.Screen name="Ledger" component={LedgerScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const [authState, setAuthState] = React.useState<AuthState>(defaultAuthState);
  const [bootstrapped, setBootstrapped] = React.useState(false);
  const [splashDone, setSplashDone] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    AuthStorageService.loadState().then((state) => {
      if (!mounted) {
        return;
      }
      setAuthState(state);
      setBootstrapped(true);
    });

    PlayerProfileService.load().then(() => PlayerProfileService.noteAppOpen()).catch(() => {});
    LedgerService.load().catch(() => {});
    OffDayDispatchService.register(ALL_DISPATCHES);
    setTimeout(() => {
      AuthStorageService.loadState().then((state) => {
        OffDayDispatchService.maybeFire({ skin: state.selectedTheme }).catch(() => {});
      });
    }, 1500);

    const unsubscribe = AuthStorageService.subscribe((next) => {
      setAuthState(next);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  if (!bootstrapped || !splashDone) {
    return <LoadingScreen onFinish={() => setSplashDone(true)} />;
  }

  return (
    <NavigationContainer>
      {authState.onboardingCompleted ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
