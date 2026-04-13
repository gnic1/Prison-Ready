import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { MissionDebugScreen } from '../features/missions/screens/MissionDebugScreen';
import { MissionDay1Screen } from '../features/missions/screens/MissionDay1Screen';
import { ReportBackScreen } from '../features/reportBack/screens/ReportBackScreen';
import { ArtifactsScreen } from '../features/artifacts/screens/ArtifactsScreen';
import { StorySoFarScreen } from '../features/story/screens/StorySoFarScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MissionDay1">
        <Stack.Screen name="MissionDay1" component={MissionDay1Screen} options={{ title: 'Day 1 Mission' }} />
        <Stack.Screen name="MissionDebug" component={MissionDebugScreen} options={{ title: 'Mission Debug' }} />
        <Stack.Screen name="ReportBack" component={ReportBackScreen} options={{ title: 'Report Back' }} />
        <Stack.Screen name="Artifacts" component={ArtifactsScreen} options={{ title: 'Artifacts' }} />
        <Stack.Screen name="StorySoFar" component={StorySoFarScreen} options={{ title: 'Story So Far' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
