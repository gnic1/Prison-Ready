import React from 'react';
import AppNavigator from './src/navigation';
import { MainMenuAudioProvider } from './src/components/MainMenuAudio';
import './src/features/missions/services/missionBackgroundTask';
import { MissionNotificationService } from './src/features/missions/services/missionNotificationService';

export default function App() {
  React.useEffect(() => {
    MissionNotificationService.initialize().catch(() => {
      // Notifications are best-effort and may be unavailable in unsupported runtimes.
    });
  }, []);

  return (
    <MainMenuAudioProvider>
      <AppNavigator />
    </MainMenuAudioProvider>
  );
}
