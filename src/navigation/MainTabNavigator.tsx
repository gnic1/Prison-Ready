// MainTabNavigator — bottom-tab nav post-login.
// Tabs: HOME / PROFILE / LEDGER / SETTINGS — all routes that actually work.
// The legacy Missions/Progress/Badges tabs are gone; that flow is reached
// through PatrolBriefing instead.

import React from 'react';
import HomeScreen from '../features/home/HomeScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { LedgerScreen } from '../features/patrol/screens/LedgerScreen';
import SettingsScreen from '../features/settings/screens/SettingsScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GameBottomNav } from '../components/GameBottomNav';
import { AuthStorageService, defaultAuthState } from '../features/auth/services/authStorageService';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const [themeKey, setThemeKey] = React.useState(defaultAuthState.selectedTheme);

  React.useEffect(() => {
    let mounted = true;
    AuthStorageService.loadState().then((state) => {
      if (mounted) {
        setThemeKey(state.selectedTheme);
      }
    });
    const unsubscribe = AuthStorageService.subscribe((state) => {
      setThemeKey(state.selectedTheme);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => (
        <GameBottomNav
          tabs={state.routeNames}
          activeTab={state.routeNames[state.index]}
          onTabPress={(tab) => navigation.navigate(tab as never)}
          themeKey={themeKey}
        />
      )}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      <Tab.Screen name="Ledger" component={LedgerScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
