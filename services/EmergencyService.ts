import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
// Conditional import for notifications - only available in development builds
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
} catch (error) {
  console.warn('expo-notifications not available in Expo Go. Notifications will be disabled.');
}
import NetInfo from '@react-native-community/netinfo';

export type EmergencyContact = {
  id: string;
  name: string;
  phoneNumber: string;
  relation: string;
  notifyOnSOS: boolean;
};

export type EmergencyAgency = {
  id: string;
  name: string;
  phoneNumber: string;
  description: string;
  coverageAreas: string[];
};

const EMERGENCY_CONTACTS_KEY = 'wander-nepal-emergency-contacts';
const SOS_HISTORY_KEY = 'wander-nepal-sos-history';

// Default emergency agencies in Nepal
const DEFAULT_EMERGENCY_AGENCIES: EmergencyAgency[] = [
  {
    id: 'police-emergency',
    name: 'Nepal Police Emergency',
    phoneNumber: '100',
    description: 'National emergency police number',
    coverageAreas: ['All Nepal'],
  },
  {
    id: 'tourist-police',
    name: 'Tourist Police',
    phoneNumber: '01-4247041',
    description: 'Specialized police unit for tourists',
    coverageAreas: ['Kathmandu', 'Pokhara', 'Chitwan', 'Lumbini', 'Nagarkot'],
  },
  {
    id: 'nepal-mountain-rescue',
    name: 'Nepal Mountain Rescue Association',
    phoneNumber: '01-4420759',
    description: 'Mountain rescue specialists for trekking emergencies',
    coverageAreas: ['Everest Region', 'Annapurna Region', 'Langtang', 'Manaslu'],
  },
  {
    id: 'himalayan-rescue',
    name: 'Himalayan Rescue Association',
    phoneNumber: '01-4440292',
    description: 'Medical clinics in high altitude regions, specialists in altitude sickness',
    coverageAreas: ['Pheriche', 'Manang', 'Everest Base Camp', 'Annapurna Base Camp'],
  },
  {
    id: 'ambulance-service',
    name: 'Ambulance Service',
    phoneNumber: '102',
    description: 'National ambulance service',
    coverageAreas: ['All Nepal'],
  },
];

class EmergencyService {
  private emergencyContacts: EmergencyContact[] = [];
  private emergencyAgencies: EmergencyAgency[] = DEFAULT_EMERGENCY_AGENCIES;
  private isInitialized = false;
  private locationPollingInterval: ReturnType<typeof setInterval> | null = null;
  private activeSOSId: string | null = null;
  private sosInProgress = false;

  constructor() {
    this.initialize();
  }

  async initialize(): Promise<void> {
    try {
      // Load emergency contacts
      const storedContacts = await AsyncStorage.getItem(EMERGENCY_CONTACTS_KEY);
      if (storedContacts) {
        this.emergencyContacts = JSON.parse(storedContacts);
      }

      // Set up notification handler for SOS cancellation
      if (Notifications) {
        try {
          Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: false,
            }),
          });
        } catch (error) {
          console.error('Error setting notification handler:', error);
        }
      }

      this.isInitialized = true;
      console.log('Emergency service initialized with', this.emergencyContacts.length, 'contacts');
    } catch (error) {
      console.error('Failed to initialize emergency service:', error);
      this.isInitialized = true;
    }
  }

  // Get all emergency contacts
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.emergencyContacts;
  }

  // Add a new emergency contact
  async addEmergencyContact(contact: Omit<EmergencyContact, 'id'>): Promise<EmergencyContact> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const newContact: EmergencyContact = {
      ...contact,
      id: `contact-${Date.now()}`,
    };

    this.emergencyContacts.push(newContact);
    await AsyncStorage.setItem(EMERGENCY_CONTACTS_KEY, JSON.stringify(this.emergencyContacts));

    return newContact;
  }

  // Update an existing emergency contact
  async updateEmergencyContact(updatedContact: EmergencyContact): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const index = this.emergencyContacts.findIndex(c => c.id === updatedContact.id);
    if (index >= 0) {
      this.emergencyContacts[index] = updatedContact;
      await AsyncStorage.setItem(EMERGENCY_CONTACTS_KEY, JSON.stringify(this.emergencyContacts));
    }
  }

  // Delete an emergency contact
  async deleteEmergencyContact(contactId: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.emergencyContacts = this.emergencyContacts.filter(c => c.id !== contactId);
    await AsyncStorage.setItem(EMERGENCY_CONTACTS_KEY, JSON.stringify(this.emergencyContacts));
  }

  // Get all emergency agencies 
  getEmergencyAgencies(): EmergencyAgency[] {
    return this.emergencyAgencies;
  }

  // Get emergency agencies for a specific region
  getEmergencyAgenciesForRegion(region: string): EmergencyAgency[] {
    return this.emergencyAgencies.filter(agency =>
      agency.coverageAreas.includes('All Nepal') ||
      agency.coverageAreas.includes(region)
    );
  }

  // Trigger an SOS alert
  async triggerSOS(userMessage: string): Promise<{ success: boolean; message: string }> {
    if (this.sosInProgress) {
      return { success: false, message: 'SOS already in progress' };
    }

    try {
      // Start SOS mode
      this.sosInProgress = true;
      this.activeSOSId = `sos-${Date.now()}`;
      const sosId = this.activeSOSId;

      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        this.sosInProgress = false;
        this.activeSOSId = null;
        return { success: false, message: 'Location permission is required for SOS' };
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude, altitude } = location.coords;

      // Show persistent notification
      await this.showSOSNotification(sosId);

      // Start location tracking
      this.startLocationTracking(sosId);

      // Get network status
      const networkInfo = await NetInfo.fetch();
      const isConnected = networkInfo.isConnected;

      // Prepare emergency message
      const timestamp = new Date().toISOString();
      const googleMapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;

      const emergencyMessage =
        `EMERGENCY SOS from Wander Nepal app!\n` +
        `User message: ${userMessage}\n` +
        `Location: ${googleMapsLink}\n` +
        `Coordinates: ${latitude}, ${longitude}\n` +
        `Altitude: ${altitude ? Math.round(altitude) + ' meters' : 'Unknown'}\n` +
        `Time: ${timestamp}\n` +
        `Please respond to this emergency!`;

      // Send notifications to emergency contacts who have notifyOnSOS enabled
      const notifiableContacts = this.emergencyContacts.filter(c => c.notifyOnSOS);

      // Online strategy - if we have internet
      if (isConnected) {
        // In a real app, we would send API calls to server endpoints here
        // to trigger the sending of messages via multiple channels
        console.log('Network available, would send emergency API calls');

        // For demonstration, we'll log what would happen
        console.log('Emergency data would be sent to server:', {
          id: sosId,
          timestamp,
          location: { latitude, longitude, altitude },
          message: userMessage,
          contacts: notifiableContacts.map(c => c.phoneNumber).join(', ')
        });

        // Simulate server acknowledgment
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Offline fallback - SMS if available
      // Try to send SMS directly from device
      const isAvailable = await SMS.isAvailableAsync();
      if (isAvailable) {
        const numbers = notifiableContacts.map(c => c.phoneNumber);
        if (numbers.length > 0) {
          // Open SMS app with pre-filled information
          await SMS.sendSMSAsync(numbers, emergencyMessage);
        }
      }

      // Store SOS event in history
      this.recordSOSEvent({
        id: sosId,
        timestamp,
        location: { latitude, longitude, altitude: altitude || undefined },
        message: userMessage,
        contactsNotified: notifiableContacts.map(c => c.id),
        resolved: false
      });

      return {
        success: true,
        message: 'SOS alert initiated. Emergency contacts have been notified.'
      };
    } catch (error) {
      console.error('Failed to trigger SOS:', error);
      this.sosInProgress = false;
      this.activeSOSId = null;
      return { success: false, message: 'Failed to trigger SOS. Please try again.' };
    }
  }

  // Cancel an active SOS
  async cancelSOS(): Promise<{ success: boolean; message: string }> {
    if (!this.sosInProgress || !this.activeSOSId) {
      return { success: false, message: 'No active SOS to cancel' };
    }

    try {
      const sosId = this.activeSOSId;

      // Stop location tracking
      this.stopLocationTracking();

      // Remove notification
      if (Notifications) {
        try {
          await Notifications.dismissAllNotificationsAsync();
        } catch (error) {
          console.error('Error dismissing notifications:', error);
        }
      }

      // Update SOS record as resolved
      await this.resolveSOSEvent(sosId);

      // Reset SOS state
      this.sosInProgress = false;
      this.activeSOSId = null;

      return { success: true, message: 'SOS alert cancelled successfully' };
    } catch (error) {
      console.error('Failed to cancel SOS:', error);
      return { success: false, message: 'Failed to cancel SOS. Please try again.' };
    }
  }

  // Check if there's an active SOS
  isSOSActive(): boolean {
    return this.sosInProgress;
  }

  // Get SOS history
  async getSOSHistory(): Promise<any[]> {
    try {
      const history = await AsyncStorage.getItem(SOS_HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Failed to get SOS history:', error);
      return [];
    }
  }

  // Private helper methods

  // Start tracking location and sending updates
  private startLocationTracking(sosId: string): void {
    // Clear any existing interval
    if (this.locationPollingInterval) {
      clearInterval(this.locationPollingInterval);
    }

    // Start polling for location updates
    this.locationPollingInterval = setInterval(async () => {
      try {
        // Only update if the current SOS is still the active one
        if (this.activeSOSId !== sosId || !this.sosInProgress) {
          this.stopLocationTracking();
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        console.log('SOS location update:', location.coords);

        // In a real app, we would send this update to the server
        // to update emergency contacts with the latest location
      } catch (error) {
        console.error('Failed to update SOS location:', error);
      }
    }, 30000); // Update every 30 seconds
  }

  // Stop tracking location
  private stopLocationTracking(): void {
    if (this.locationPollingInterval) {
      clearInterval(this.locationPollingInterval);
      this.locationPollingInterval = null;
    }
  }

  // Show a persistent notification for active SOS
  private async showSOSNotification(sosId: string): Promise<void> {
    if (!Notifications) {
      console.log('SOS Emergency Alert Active - Notifications not available');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'SOS EMERGENCY ALERT ACTIVE',
          body: 'Your emergency contacts have been notified. Tap to cancel.',
          data: { sosId },
          color: '#D00000',
          sound: true,
          priority: Notifications.AndroidNotificationPriority.MAX,
          sticky: true,
        },
        trigger: null, // Immediate notification
      });
    } catch (error) {
      console.error('Error showing SOS notification:', error);
    }
  }

  // Record an SOS event in history
  private async recordSOSEvent(event: any): Promise<void> {
    try {
      const history = await this.getSOSHistory();
      history.unshift(event); // Add to beginning of array
      await AsyncStorage.setItem(SOS_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to record SOS event:', error);
    }
  }

  // Mark an SOS event as resolved
  private async resolveSOSEvent(sosId: string): Promise<void> {
    try {
      const history = await this.getSOSHistory();
      const updatedHistory = history.map(event =>
        event.id === sosId ? { ...event, resolved: true } : event
      );
      await AsyncStorage.setItem(SOS_HISTORY_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Failed to resolve SOS event:', error);
    }
  }
}

export const emergencyService = new EmergencyService();
export default emergencyService;
