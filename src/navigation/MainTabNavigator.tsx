import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../features/home/HomeScreen';
import ProgressScreen from '../features/progress/ProgressScreen';
import BadgesScreen from '../features/badges/BadgesScreen';
import { GameBottomNav } from '../components/GameBottomNav';
import MissionDay1Screen from '../features/missions/screens/MissionDay1Screen';
import MissionBriefScreen from '../features/missions/screens/MissionBriefScreen';
import { ReportBackScreen } from '../features/reportBack/screens/ReportBackScreen';
import ArtifactsScreen from '../features/artifacts/screens/ArtifactsScreen';
import StorySoFarScreen from '../features/story/screens/StorySoFarScreen';
import MissionStartScreen from '../features/missions/screens/MissionStartScreen';
import MissionLengthScreen from '../features/missions/screens/MissionLengthScreen';
import { AuthStorageService, defaultAuthState } from '../features/auth/services/authStorageService';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MissionsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MissionStart" component={MissionStartScreen} />
      <Stack.Screen name="MissionLength" component={MissionLengthScreen} />
      <Stack.Screen name="MissionBrief" component={MissionBriefScreen} />
      <Stack.Screen name="MissionDay1" component={MissionDay1Screen} />
      <Stack.Screen name="ReportBack" component={ReportBackScreen} />
      <Stack.Screen name="Artifacts" component={ArtifactsScreen} />
      <Stack.Screen name="StorySoFar" component={StorySoFarScreen} />
    </Stack.Navigator>
  );
}

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
          onTabPress={tab => navigation.navigate(tab as never)}
          themeKey={themeKey}
        />
      )}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Missions" component={MissionsStack} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Badges" component={BadgesScreen} />
    </Tab.Navigator>
  );
}

