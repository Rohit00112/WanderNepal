// Conditional import for notifications - only available in development builds
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.warn('expo-notifications not available in Expo Go. Notifications will be disabled.');
}
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
    if (!Notifications) {
      console.log('Notifications not available - running in Expo Go');
      return;
    }

    try {
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
    } catch (error) {
      console.error('Error configuring notifications:', error);
    }
  }

  async scheduleLocalNotification(notification: NotificationData, trigger: any) {
    if (!Notifications) {
      console.log(`Notification scheduled: ${notification.title} - ${notification.body}`);
      return null;
    }

    try {
      return await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
        },
        trigger,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
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
    if (!Notifications) {
      console.log(`Notification cancelled: ${notificationId}`);
      return;
    }

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error cancelling notification:', error);
    }
  }

  async cancelAllNotifications() {
    if (!Notifications) {
      console.log('All notifications cancelled');
      return;
    }

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error cancelling all notifications:', error);
    }
  }
}

export const notificationService = new NotificationService();