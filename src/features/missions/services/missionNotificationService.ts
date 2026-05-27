import * as Haptics from 'expo-haptics';
import Constants from 'expo-constants';
import type * as ExpoNotifications from 'expo-notifications';
import { Platform } from 'react-native';
import { MissionQueuedBeat } from '../models/missionEngine.types';

const CHANNEL_ID = 'mission-updates';

let notificationsModulePromise: Promise<typeof ExpoNotifications> | null = null;

function isExpoGoAndroidDev() {
  const isExpoGo =
    Constants.executionEnvironment === 'storeClient' || Constants.appOwnership === 'expo';
  return __DEV__ && Platform.OS === 'android' && isExpoGo;
}

async function getNotificationsModule() {
  if (!notificationsModulePromise) {
    notificationsModulePromise = import('expo-notifications');
  }
  return notificationsModulePromise;
}

export const MissionNotificationService = {
  async initialize() {
    if (isExpoGoAndroidDev()) {
      return;
    }

    const Notifications = await getNotificationsModule();

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Mission Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 150, 250],
        lightColor: '#FF6A00',
        sound: 'default',
      });
    }
  },

  async requestPermissions() {
    if (isExpoGoAndroidDev()) {
      return null;
    }

    const Notifications = await getNotificationsModule();
    const settings = await Notifications.getPermissionsAsync();
    if (settings.granted) {
      return settings;
    }
    return Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: true,
      },
    });
  },

  async notifyMilestone(beat: MissionQueuedBeat) {
    if (isExpoGoAndroidDev()) {
      return;
    }

    const Notifications = await getNotificationsModule();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: beat.title,
        body: beat.text,
        data: {
          missionBeatId: beat.id,
          route: 'Missions',
        },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        color: '#FF6A00',
        vibrate: [0, 250, 150, 250],
      },
      trigger: Platform.OS === 'android' ? { channelId: CHANNEL_ID } : null,
    });
  },

  async triggerForegroundFeedback() {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Haptics are best-effort.
    }
  },
};
