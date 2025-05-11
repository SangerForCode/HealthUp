import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Only set notification handler for native platforms
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function showNotification(
  message: string,
  type: NotificationType = 'info'
) {
  const title = type.charAt(0).toUpperCase() + type.slice(1);

  if (Platform.OS === 'web') {
    // Use browser notifications for web
    if ("Notification" in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          new Notification(title, {
            body: message,
          });
        }
      } catch (error) {
        console.warn('Browser notifications not supported:', error);
      }
    }
  } else {
    // Use Expo notifications for native platforms
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: message,
      },
      trigger: null,
    });
  }
}

export async function scheduleMeasurementReminder(
  userId: string,
  time: string,
  enabled: boolean
) {
  if (Platform.OS === 'web') {
    console.warn('Scheduled reminders not supported on web');
    return;
  }

  // Cancel any existing reminders for this user
  await cancelMeasurementReminder(userId);

  if (!enabled) return;

  const [hours, minutes] = time.split(':').map(Number);

  // Schedule daily reminder
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Blood Pressure Measurement Reminder',
      body: "It's time to measure your blood pressure!",
      data: { userId },
    },
    trigger: {
      type: 'calendar',
      hour: hours,
      minute: minutes,
      repeats: true,
    },
  });
}

export async function cancelMeasurementReminder(userId: string) {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(`reminder-${userId}`);
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

export function handleError(error: unknown, fallbackMessage: string = 'An error occurred') {
  console.error('Error:', error);
  const errorMessage = error instanceof Error ? error.message : fallbackMessage;
  showNotification(errorMessage, 'error');
}

export const BP_MESSAGES = {
  GOOD: 'Your blood pressure is in a healthy range.',
  NORMAL: 'Your blood pressure is normal but monitor it regularly.',
  HIGH: 'Your blood pressure is high. Consider consulting a healthcare provider.',
};