import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

type NotificationData = {
  title: string;
  body: string;
  data?: Record<string, any>;
};

class NotificationService {
  constructor() {
    this.configure();
  }

  private async configure() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF385C',
      });
    }
  }

  async scheduleLocalNotification(notification: NotificationData, trigger: any) {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
      },
      trigger,
    });
  }

  async scheduleTripReminder(tripName: string, date: Date) {
    const trigger = new Date(date);
    trigger.setDate(trigger.getDate() - 1); // Reminder one day before

    return this.scheduleLocalNotification(
      {
        title: 'Trip Reminder',
        body: `Your trip to ${tripName} is tomorrow! Don't forget to pack your essentials.`,
        data: { tripName, date: date.toISOString() },
      },
      trigger
    );
  }

  async cancelNotification(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export const notificationService = new NotificationService();