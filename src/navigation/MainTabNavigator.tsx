import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../features/home/HomeScreen';
import ProgressScreen from '../features/progress/ProgressScreen';
import BadgesScreen from '../features/badges/BadgesScreen';
import { MissionDay1Screen } from '../features/missions/screens/MissionDay1Screen';
import MissionBriefScreen from '../features/missions/screens/MissionBriefScreen';
import { ReportBackScreen } from '../features/reportBack/screens/ReportBackScreen';
import { ArtifactsScreen } from '../features/artifacts/screens/ArtifactsScreen';
import { StorySoFarScreen } from '../features/story/screens/StorySoFarScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MissionsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="MissionBrief" component={MissionBriefScreen} options={{ title: 'Mission Brief' }} />
      <Stack.Screen name="MissionDay1" component={MissionDay1Screen} options={{ title: 'Day 1 Mission' }} />
      <Stack.Screen name="ReportBack" component={ReportBackScreen} options={{ title: 'Report Back' }} />
      <Stack.Screen name="Artifacts" component={ArtifactsScreen} options={{ title: 'Artifacts' }} />
      <Stack.Screen name="StorySoFar" component={StorySoFarScreen} options={{ title: 'Story So Far' }} />
    </Stack.Navigator>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Missions" component={MissionsStack} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Badges" component={BadgesScreen} />
    </Tab.Navigator>
  );
}
