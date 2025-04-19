import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Types
export interface AltitudeData {
  altitude: number; // in meters
  timestamp: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface AltitudeProfile {
  id: string;
  userHeightCm?: number;
  userWeightKg?: number;
  userAge?: number;
  userGender?: 'male' | 'female' | 'other';
  userFitnessLevel?: 'low' | 'moderate' | 'high';
  medicalConditions?: string[];
  previousAMSHistory?: boolean;
  medications?: string[];
  startingAltitude?: number;
}

export interface AltitudeSettings {
  trackingEnabled: boolean;
  notificationsEnabled: boolean;
  trackingInterval: number; // in minutes
  dangerousAscentRate: number; // meters per hour
  dangerousAltitudeThreshold: number; // meters
  autoRecording: boolean;
}

export type AltitudeEvent = {
  id: string;
  type: 'ascent' | 'descent' | 'threshold' | 'rapid-ascent' | 'high-altitude';
  startTime: number;
  endTime?: number;
  startAltitude: number;
  endAltitude?: number;
  rate?: number; // in meters per hour
  location?: {
    latitude: number;
    longitude: number;
  };
  resolved: boolean;
  severity: 'info' | 'warning' | 'danger';
  message: string;
};

export type AMSSymptom = 
  'headache' | 
  'nausea' | 
  'vomiting' | 
  'fatigue' | 
  'dizziness' | 
  'insomnia' | 
  'loss_of_appetite' | 
  'shortness_of_breath' | 
  'rapid_heartbeat' | 
  'weakness' | 
  'confusion';

export interface SymptomLog {
  id: string;
  timestamp: number;
  altitude: number;
  symptoms: {[key in AMSSymptom]?: 0 | 1 | 2 | 3}; // 0=none, 1=mild, 2=moderate, 3=severe
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

const MAX_HISTORY_ITEMS = 24 * 60; // 24 hours of data

class AltitudeService {
  private settings: AltitudeSettings = {
    trackingEnabled: false,
    notificationsEnabled: true,
    trackingInterval: 10, // 10 minutes
    dangerousAscentRate: 500, // 500 meters per hour is dangerous
    dangerousAltitudeThreshold: 3000, // 3000 meters is considered high altitude
    autoRecording: true,
  };
  
  private profile: AltitudeProfile = {
    id: 'default',
  };
  
  private altitudeHistory: AltitudeData[] = [];
  private events: AltitudeEvent[] = [];
  private symptoms: SymptomLog[] = [];
  private trackingTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;
  
  // Storage keys
  private readonly SETTINGS_KEY = 'altitude_settings';
  private readonly HISTORY_KEY = 'altitude_history';
  private readonly PROFILE_KEY = 'altitude_profile';
  private readonly EVENTS_KEY = 'altitude_events';
  private readonly SYMPTOMS_KEY = 'altitude_symptoms';
  
  constructor() {
    this.initialize();
  }
  
  private async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Load settings
      const storedSettings = await AsyncStorage.getItem(this.SETTINGS_KEY);
      if (storedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(storedSettings) };
      } else {
        // Save default settings
        await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings));
      }
      
      // Load profile
      const storedProfile = await AsyncStorage.getItem(this.PROFILE_KEY);
      if (storedProfile) {
        this.profile = JSON.parse(storedProfile);
      }
      
      // Load altitude history (last 24 hours only)
      const storedHistory = await AsyncStorage.getItem(this.HISTORY_KEY);
      if (storedHistory) {
        const fullHistory: AltitudeData[] = JSON.parse(storedHistory);
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        this.altitudeHistory = fullHistory.filter(data => data.timestamp > oneDayAgo);
      }
      
      // Load events
      const storedEvents = await AsyncStorage.getItem(this.EVENTS_KEY);
      if (storedEvents) {
        this.events = JSON.parse(storedEvents);
      }
      
      // Load symptoms
      const storedSymptoms = await AsyncStorage.getItem(this.SYMPTOMS_KEY);
      if (storedSymptoms) {
        this.symptoms = JSON.parse(storedSymptoms);
      }
      
      // Start tracking if enabled
      if (this.settings.trackingEnabled) {
        this.startTracking();
      }
      
      this.isInitialized = true;
      console.log('AltitudeService initialized');
    } catch (error) {
      console.error('Error initializing AltitudeService:', error);
    }
  }
  
  // Start tracking altitude changes
  async startTracking(): Promise<boolean> {
    try {
      // Request location permissions if not granted
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission denied');
        return false;
      }
      
      // Clear any existing timer
      if (this.trackingTimer) {
        clearInterval(this.trackingTimer);
      }
      
      // Set up tracking interval
      const intervalMs = this.settings.trackingInterval * 60 * 1000;
      this.trackingTimer = setInterval(async () => {
        await this.recordCurrentAltitude();
      }, intervalMs);
      
      // Record initial altitude
      await this.recordCurrentAltitude();
      
      // Update settings
      this.settings.trackingEnabled = true;
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings));
      
      return true;
    } catch (error) {
      console.error('Error starting altitude tracking:', error);
      return false;
    }
  }
  
  // Stop tracking altitude changes
  async stopTracking(): Promise<boolean> {
    try {
      if (this.trackingTimer) {
        clearInterval(this.trackingTimer);
        this.trackingTimer = null;
      }
      
      // Update settings
      this.settings.trackingEnabled = false;
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings));
      
      return true;
    } catch (error) {
      console.error('Error stopping altitude tracking:', error);
      return false;
    }
  }
  
  // Record the current altitude
  async recordCurrentAltitude(): Promise<AltitudeData | undefined> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Platform.OS === 'android' ? Location.Accuracy.High : Location.Accuracy.BestForNavigation
      });
      
      const { altitude, latitude, longitude, accuracy } = location.coords;
      if (altitude === null || altitude === undefined) {
        console.error('No altitude data available');
        return undefined;
      }
      
      const altitudeData: AltitudeData = {
        altitude: altitude ?? 0, // Ensure altitude is a number
        latitude,
        longitude,
        accuracy: accuracy ?? undefined, // Convert null to undefined
        timestamp: Date.now(),
      };
      
      this.altitudeHistory.push(altitudeData);
      
      // Keep only the latest MAX_HISTORY_ITEMS records
      if (this.altitudeHistory.length > MAX_HISTORY_ITEMS) {
        this.altitudeHistory = this.altitudeHistory.slice(-MAX_HISTORY_ITEMS);
      }
      
      // Save to AsyncStorage
      await this.saveAltitudeHistory();
      
      this.checkAltitudeWarnings(altitude);
      
      return altitudeData;
    } catch (error) {
      console.error('Error recording altitude:', error);
      return undefined;
    }
  }
  
  // Check for altitude-related events and create notifications if needed
  private async checkAltitudeEvents(altitudeData: AltitudeData): Promise<void> {
    try {
      // Get previous altitude record to compare
      const prevRecords = this.altitudeHistory.slice(-10).sort((a, b) => b.timestamp - a.timestamp);
      if (prevRecords.length < 2) return; // Need at least 2 records to calculate rate
      
      const prevRecord = prevRecords[1]; // Second most recent record
      const timeDiffHours = (altitudeData.timestamp - prevRecord.timestamp) / (1000 * 60 * 60);
      const altitudeDiff = altitudeData.altitude - prevRecord.altitude;
      const ratePerHour = altitudeDiff / timeDiffHours;
      
      const events: AltitudeEvent[] = [];
      
      // Check for rapid ascent
      if (ratePerHour > this.settings.dangerousAscentRate && altitudeDiff > 0) {
        const event: AltitudeEvent = {
          id: `ascent-${Date.now()}`,
          type: 'rapid-ascent',
          startTime: prevRecord.timestamp,
          endTime: altitudeData.timestamp,
          startAltitude: prevRecord.altitude,
          endAltitude: altitudeData.altitude,
          rate: ratePerHour,
          location: {
            latitude: altitudeData.latitude,
            longitude: altitudeData.longitude
          },
          resolved: false,
          severity: 'warning',
          message: `Ascending too quickly at ${Math.round(ratePerHour)} meters/hour. Recommended rate is <300 meters/hour.`
        };
        
        events.push(event);
        
        if (this.settings.notificationsEnabled) {
          await this.sendNotification(
            'Ascending Too Quickly',
            `You are ascending at ${Math.round(ratePerHour)} meters/hour. This increases AMS risk.`
          );
        }
      }
      
      // Check if crossed the danger threshold
      if (altitudeData.altitude > this.settings.dangerousAltitudeThreshold && 
          prevRecord.altitude <= this.settings.dangerousAltitudeThreshold) {
        const event: AltitudeEvent = {
          id: `threshold-${Date.now()}`,
          type: 'threshold',
          startTime: altitudeData.timestamp,
          startAltitude: altitudeData.altitude,
          location: {
            latitude: altitudeData.latitude,
            longitude: altitudeData.longitude
          },
          resolved: false,
          severity: 'info',
          message: `Crossed altitude threshold of ${this.settings.dangerousAltitudeThreshold} meters. Monitor for AMS symptoms.`
        };
        
        events.push(event);
        
        if (this.settings.notificationsEnabled) {
          await this.sendNotification(
            'High Altitude Alert',
            `You've reached ${Math.round(altitudeData.altitude)} meters. Be alert for AMS symptoms.`
          );
        }
      }
      
      // Check for extremely high altitude (>4500m)
      if (altitudeData.altitude > 4500) {
        const event: AltitudeEvent = {
          id: `high-${Date.now()}`,
          type: 'high-altitude',
          startTime: altitudeData.timestamp,
          startAltitude: altitudeData.altitude,
          location: {
            latitude: altitudeData.latitude,
            longitude: altitudeData.longitude
          },
          resolved: false,
          severity: 'danger',
          message: `You are at extreme altitude (${Math.round(altitudeData.altitude)} meters). Risk of AMS is high.`
        };
        
        events.push(event);
        
        if (this.settings.notificationsEnabled) {
          await this.sendNotification(
            'Extreme Altitude Warning',
            `You are at ${Math.round(altitudeData.altitude)} meters. Extreme altitude increases AMS risk significantly.`,
            true
          );
        }
      }
      
      // Add events to storage
      if (events.length > 0) {
        this.events = [...this.events, ...events];
        await AsyncStorage.setItem(this.EVENTS_KEY, JSON.stringify(this.events));
      }
    } catch (error) {
      console.error('Error checking altitude events:', error);
    }
  }
  
  // Send a notification to the user
  private async sendNotification(title: string, body: string, isPriority: boolean = false): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: isPriority ? Notifications.AndroidNotificationPriority.HIGH : Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
  
  // Log AMS symptoms
  async logSymptoms(symptoms: {[key in AMSSymptom]?: 0 | 1 | 2 | 3}, notes?: string): Promise<SymptomLog> {
    try {
      // Get current location and altitude
      const location = await Location.getCurrentPositionAsync({
        accuracy: Platform.OS === 'android' ? Location.Accuracy.Balanced : Location.Accuracy.Balanced
      });
      
      const symptomLog: SymptomLog = {
        id: `symptom-${Date.now()}`,
        timestamp: Date.now(),
        altitude: location.coords.altitude ?? 0,
        symptoms,
        notes,
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        }
      };
      
      // Add to symptoms list
      this.symptoms.push(symptomLog);
      await AsyncStorage.setItem(this.SYMPTOMS_KEY, JSON.stringify(this.symptoms));
      
      // Check severity and notify if needed
      const severityScore = this.calculateSymptomSeverity(symptoms);
      if (severityScore >= 3 && this.settings.notificationsEnabled) {
        await this.sendNotification(
          'AMS Warning',
          'Your symptoms suggest possible altitude sickness. Consider descending if symptoms worsen.',
          severityScore >= 6 // High priority for severe symptoms
        );
      }
      
      return symptomLog;
    } catch (error) {
      console.error('Error logging symptoms:', error);
      throw error;
    }
  }
  
  // Calculate symptom severity score
  private calculateSymptomSeverity(symptoms: {[key in AMSSymptom]?: 0 | 1 | 2 | 3}): number {
    let score = 0;
    const criticalSymptoms: AMSSymptom[] = ['headache', 'nausea', 'vomiting', 'confusion', 'shortness_of_breath'];
    
    for (const [symptom, severity] of Object.entries(symptoms)) {
      if (severity) {
        // Critical symptoms are weighted more heavily
        const weight = criticalSymptoms.includes(symptom as AMSSymptom) ? 2 : 1;
        score += severity * weight;
      }
    }
    
    return score;
  }
  
  // Get a recommendation based on current altitude, ascent rate, and symptoms
  async getRecommendation(): Promise<{
    message: string;
    severity: 'info' | 'warning' | 'danger';
    actions: string[];
  }> {
    try {
      // Get latest altitude data
      const latestData = this.altitudeHistory.length > 0 
        ? this.altitudeHistory[this.altitudeHistory.length - 1]
        : null;
      
      if (!latestData) {
        return {
          message: "No altitude data available. Start tracking to get recommendations.",
          severity: 'info',
          actions: ['Start altitude tracking']
        };
      }
      
      // Get recent symptoms
      const recentSymptoms = this.symptoms
        .filter(s => s.timestamp > Date.now() - 24 * 60 * 60 * 1000)
        .sort((a, b) => b.timestamp - a.timestamp);
      
      const latestSymptoms = recentSymptoms.length > 0 ? recentSymptoms[0] : null;
      const symptomScore = latestSymptoms ? this.calculateSymptomSeverity(latestSymptoms.symptoms) : 0;
      
      // Calculate ascent rate (if we have enough data)
      let ascentRate = 0;
      if (this.altitudeHistory.length >= 2) {
        const prevRecord = this.altitudeHistory[this.altitudeHistory.length - 2];
        const timeDiffHours = (latestData.timestamp - prevRecord.timestamp) / (1000 * 60 * 60);
        const altitudeDiff = latestData.altitude - prevRecord.altitude;
        ascentRate = altitudeDiff / timeDiffHours;
      }
      
      // Determine recommendation based on altitude, ascent rate and symptoms
      if (latestData.altitude < 2500) {
        // Low altitude
        return {
          message: "You are at low altitude. Risk of AMS is minimal.",
          severity: 'info',
          actions: ['Continue monitoring', 'Stay hydrated']
        };
      } else if (latestData.altitude >= 2500 && latestData.altitude < 3500) {
        // Moderate altitude
        if (symptomScore >= 3) {
          return {
            message: "You are experiencing symptoms at moderate altitude. Take precautions.",
            severity: 'warning',
            actions: ['Rest for 24 hours', 'Avoid further ascent', 'Take pain relievers if needed', 'Stay hydrated']
          };
        }
        
        if (ascentRate > 500) {
          return {
            message: "You are ascending too quickly at moderate altitude.",
            severity: 'warning',
            actions: ['Slow down your ascent', 'Aim for <500m ascent per day', 'Stay hydrated']
          };
        }
        
        return {
          message: "You are at moderate altitude. Monitor for AMS symptoms.",
          severity: 'info',
          actions: ['Watch for headache or nausea', 'Stay hydrated', 'Avoid alcohol']
        };
      } else if (latestData.altitude >= 3500 && latestData.altitude < 5500) {
        // High altitude
        if (symptomScore >= 6) {
          return {
            message: "You have significant AMS symptoms at high altitude. Immediate action needed.",
            severity: 'danger',
            actions: ['Descend immediately', 'Seek medical attention', 'Use supplemental oxygen if available']
          };
        }
        
        if (symptomScore >= 3) {
          return {
            message: "You are showing signs of AMS at high altitude.",
            severity: 'warning',
            actions: ['Stop ascending', 'Rest for 24-48 hours', 'Descend if symptoms worsen', 'Consider medication']
          };
        }
        
        if (ascentRate > 300) {
          return {
            message: "You are ascending too quickly at high altitude.",
            severity: 'warning',
            actions: ['Slow down your ascent', 'Rest for a day', 'Maximum 300m ascent per day recommended']
          };
        }
        
        return {
          message: "You are at high altitude. Risk of AMS increases.",
          severity: 'warning',
          actions: ['Ascend slowly', 'Consider rest days', 'Monitor for symptoms', 'Stay well hydrated']
        };
      } else {
        // Extreme altitude (>5500m)
        if (symptomScore > 0) {
          return {
            message: "You have AMS symptoms at extreme altitude. High risk situation.",
            severity: 'danger',
            actions: ['Descend immediately', 'Seek medical help', 'Use supplemental oxygen if available']
          };
        }
        
        return {
          message: "You are at extreme altitude. Very high risk of AMS, HAPE and HACE.",
          severity: 'danger',
          actions: ['Minimize time at this altitude', 'Be alert for any symptoms', 'Descend at first sign of problems']
        };
      }
    } catch (error) {
      console.error('Error getting recommendation:', error);
      return {
        message: "Unable to generate recommendation due to an error.",
        severity: 'info',
        actions: ['Check your device settings', 'Ensure location services are enabled']
      };
    }
  }
  
  // Get altitude history
  async getAltitudeHistory(hoursBack: number = 24): Promise<AltitudeData[]> {
    try {
      const cutoffTime = Date.now() - hoursBack * 60 * 60 * 1000;
      return this.altitudeHistory.filter(data => data.timestamp > cutoffTime);
    } catch (error) {
      console.error('Error getting altitude history:', error);
      return [];
    }
  }
  
  // Get altitude events
  async getAltitudeEvents(resolvedToo: boolean = false): Promise<AltitudeEvent[]> {
    try {
      return resolvedToo 
        ? this.events 
        : this.events.filter(event => !event.resolved);
    } catch (error) {
      console.error('Error getting altitude events:', error);
      return [];
    }
  }
  
  // Get tracked symptoms
  async getSymptomLogs(hoursBack: number = 72): Promise<SymptomLog[]> {
    try {
      const cutoffTime = Date.now() - hoursBack * 60 * 60 * 1000;
      return this.symptoms
        .filter(log => log.timestamp > cutoffTime)
        .sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting symptom logs:', error);
      return [];
    }
  }
  
  // Update user profile
  async updateProfile(profile: Partial<AltitudeProfile>): Promise<AltitudeProfile> {
    try {
      this.profile = { ...this.profile, ...profile };
      await AsyncStorage.setItem(this.PROFILE_KEY, JSON.stringify(this.profile));
      return this.profile;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
  
  // Get user profile
  async getProfile(): Promise<AltitudeProfile> {
    return this.profile;
  }
  
  // Update settings
  async updateSettings(settings: Partial<AltitudeSettings>): Promise<AltitudeSettings> {
    try {
      const oldSettings = { ...this.settings };
      this.settings = { ...this.settings, ...settings };
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this.settings));
      
      // Handle tracking state change
      if (oldSettings.trackingEnabled !== this.settings.trackingEnabled) {
        if (this.settings.trackingEnabled) {
          await this.startTracking();
        } else {
          await this.stopTracking();
        }
      }
      
      return this.settings;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }
  
  // Get current settings
  async getSettings(): Promise<AltitudeSettings> {
    return this.settings;
  }
  
  // Get current altitude
  async getCurrentAltitude(): Promise<number | undefined> {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Platform.OS === 'android' ? Location.Accuracy.High : Location.Accuracy.BestForNavigation
      });
      
      return location.coords.altitude ?? undefined;
    } catch (error) {
      console.error('Error getting current altitude:', error);
      return undefined;
    }
  }
  
  // Resolve an altitude event (mark as handled)
  async resolveEvent(eventId: string): Promise<boolean> {
    try {
      const eventIndex = this.events.findIndex(e => e.id === eventId);
      if (eventIndex === -1) return false;
      
      this.events[eventIndex].resolved = true;
      await AsyncStorage.setItem(this.EVENTS_KEY, JSON.stringify(this.events));
      return true;
    } catch (error) {
      console.error('Error resolving event:', error);
      return false;
    }
  }
  
  // Get information about AMS for a given altitude
  getAMSInfo(altitude: number): {
    riskLevel: 'low' | 'moderate' | 'high' | 'extreme';
    symptoms: string[];
    recommendations: string[];
    maxAscentRate: number;
  } {
    if (altitude < 2500) {
      return {
        riskLevel: 'low',
        symptoms: ['Rarely any symptoms at this altitude'],
        recommendations: [
          'Normal activity',
          'Stay hydrated',
          'No special precautions needed'
        ],
        maxAscentRate: 1000, // Not critical at low altitude
      };
    } else if (altitude >= 2500 && altitude < 3500) {
      return {
        riskLevel: 'moderate',
        symptoms: [
          'Mild headache',
          'Nausea',
          'Loss of appetite',
          'Fatigue'
        ],
        recommendations: [
          'Ascend gradually',
          'Stay hydrated',
          'Avoid alcohol',
          'Be prepared for symptoms'
        ],
        maxAscentRate: 500, // meters per day
      };
    } else if (altitude >= 3500 && altitude < 5500) {
      return {
        riskLevel: 'high',
        symptoms: [
          'Persistent headache',
          'Vomiting',
          'Dizziness',
          'Shortness of breath',
          'Reduced performance',
          'Sleep disturbance'
        ],
        recommendations: [
          'Limit daily ascent to 300-500m',
          'Include rest days (every 1000m gained)',
          'Descend if symptoms are severe',
          'Consider preventative medications'
        ],
        maxAscentRate: 300, // meters per day
      };
    } else {
      return {
        riskLevel: 'extreme',
        symptoms: [
          'Severe headache',
          'Severe fatigue',
          'Vomiting',
          'Shortness of breath at rest',
          'Inability to walk straight',
          'Confusion',
          'Fluid buildup (pulmonary/cerebral edema)'
        ],
        recommendations: [
          'Minimize time spent at this altitude',
          'Descend immediately if symptoms occur',
          'Supplemental oxygen recommended',
          'Medical support should be available'
        ],
        maxAscentRate: 200, // meters per day
      };
    }
  }
  
  // Save altitude history to AsyncStorage
  private async saveAltitudeHistory(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.altitudeHistory));
    } catch (error) {
      console.error('Error saving altitude history:', error);
    }
  }
  
  // Check altitude warnings
  private async checkAltitudeWarnings(altitude: number): Promise<void> {
    try {
      // Check if altitude is above the danger threshold
      if (altitude > this.settings.dangerousAltitudeThreshold) {
        // Check if this is the first time crossing the threshold
        if (this.altitudeHistory.length > 1 && this.altitudeHistory[this.altitudeHistory.length - 2].altitude <= this.settings.dangerousAltitudeThreshold) {
          // Send a notification
          await this.sendNotification(
            'High Altitude Alert',
            `You've reached ${Math.round(altitude)} meters. Be alert for AMS symptoms.`
          );
        }
      }
    } catch (error) {
      console.error('Error checking altitude warnings:', error);
    }
  }

  getPreviousAltitude(): number | undefined {
    const prevRecord = this.getPreviousAltitudeRecord();
    return prevRecord ? prevRecord.altitude : undefined;
  }
  
  private getPreviousAltitudeRecord(): AltitudeData | undefined {
    if (this.altitudeHistory.length < 2) {
      return undefined;
    }
    return this.altitudeHistory[this.altitudeHistory.length - 2];
  }
}

export const altitudeService = new AltitudeService();
