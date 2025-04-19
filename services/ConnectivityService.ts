import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ConnectivityPoint, ConnectivityLevel } from '../components/ConnectivityLayer';

// Sample data - in production, this would come from an API or external source
const initialConnectivityData: ConnectivityPoint[] = [
  // High connectivity areas (major cities)
  {
    id: 'ktm-area',
    type: 'area',
    level: 'high',
    coordinates: [
      { latitude: 27.7172, longitude: 85.3240 }, // Kathmandu
      { latitude: 27.7372, longitude: 85.3440 },
      { latitude: 27.7372, longitude: 85.3040 },
      { latitude: 27.7172, longitude: 85.2840 },
      { latitude: 27.6972, longitude: 85.3040 },
      { latitude: 27.6972, longitude: 85.3440 },
      { latitude: 27.7172, longitude: 85.3240 }, // Close the polygon
    ],
    provider: 'Multiple providers',
    notes: 'Excellent 4G coverage throughout Kathmandu Valley',
    lastVerified: '2025-02-15',
  },
  {
    id: 'pokhara-area',
    type: 'area',
    level: 'high',
    coordinates: [
      { latitude: 28.2096, longitude: 83.9856 }, // Pokhara
      { latitude: 28.2296, longitude: 84.0056 },
      { latitude: 28.2296, longitude: 83.9656 },
      { latitude: 28.2096, longitude: 83.9456 },
      { latitude: 28.1896, longitude: 83.9656 },
      { latitude: 28.1896, longitude: 84.0056 },
      { latitude: 28.2096, longitude: 83.9856 }, // Close the polygon
    ],
    provider: 'Ncell, NTC',
    notes: 'Good 4G coverage in Pokhara and Lakeside areas',
    lastVerified: '2025-01-20',
  },
  
  // Medium connectivity (smaller towns)
  {
    id: 'namche-bazaar',
    type: 'spot',
    level: 'medium',
    coordinates: {
      latitude: 27.8069, 
      longitude: 86.7140,
      radius: 1000, // 1km radius
    },
    provider: 'Ncell, NTC',
    notes: 'Moderate connectivity in Namche Bazaar, may be unreliable during peak tourist season',
    lastVerified: '2025-02-01',
  },
  
  // Low connectivity (remote trekking areas)
  {
    id: 'annapurna-circuit-section',
    type: 'area',
    level: 'low',
    coordinates: [
      { latitude: 28.5384, longitude: 84.0234 },
      { latitude: 28.5784, longitude: 84.0634 },
      { latitude: 28.5784, longitude: 83.9834 },
      { latitude: 28.5384, longitude: 83.9434 },
      { latitude: 28.4984, longitude: 83.9834 },
      { latitude: 28.4984, longitude: 84.0634 },
      { latitude: 28.5384, longitude: 84.0234 }, // Close the polygon
    ],
    provider: 'Sporadic NTC',
    notes: 'Intermittent service on parts of the Annapurna Circuit, better on high points',
    lastVerified: '2025-01-10',
  },
  
  // No connectivity areas
  {
    id: 'upper-dolpo',
    type: 'area',
    level: 'none',
    coordinates: [
      { latitude: 29.0000, longitude: 83.0000 },
      { latitude: 29.2000, longitude: 83.2000 },
      { latitude: 29.2000, longitude: 82.8000 },
      { latitude: 29.0000, longitude: 82.6000 },
      { latitude: 28.8000, longitude: 82.8000 },
      { latitude: 28.8000, longitude: 83.2000 },
      { latitude: 29.0000, longitude: 83.0000 }, // Close the polygon
    ],
    provider: 'None',
    notes: 'No cellular coverage in Upper Dolpo region, satellite phone recommended',
    lastVerified: '2024-12-05',
  },
  
  // Emergency points
  {
    id: 'lukla-emergency',
    type: 'spot',
    level: 'emergency-only',
    coordinates: {
      latitude: 27.6866, 
      longitude: 86.7300,
      radius: 800, // 800m radius
    },
    provider: 'Emergency Services Only',
    notes: 'Emergency communications available at Lukla airport and police station',
    lastVerified: '2025-02-10',
  },
  {
    id: 'thorong-la-pass',
    type: 'spot',
    level: 'emergency-only',
    coordinates: {
      latitude: 28.7909, 
      longitude: 83.9266,
      radius: 500, // 500m radius
    },
    provider: 'Emergency Services Only',
    notes: 'Emergency radio at Thorong La Pass high point (5416m)',
    lastVerified: '2025-01-15',
  },
];

class ConnectivityService {
  private STORAGE_KEY = 'wander-nepal-connectivity-data';
  private connectivityData: ConnectivityPoint[] = [];
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  async initialize(): Promise<void> {
    try {
      // Try to load data from storage
      const storedData = await AsyncStorage.getItem(this.STORAGE_KEY);
      
      if (storedData) {
        this.connectivityData = JSON.parse(storedData);
      } else {
        // Use initial data if nothing is stored
        this.connectivityData = initialConnectivityData;
        // Save initial data to storage
        await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialConnectivityData));
      }
      
      this.isInitialized = true;
      console.log('Connectivity data initialized with', this.connectivityData.length, 'areas');
    } catch (error) {
      console.error('Failed to initialize connectivity data:', error);
      // Fallback to initial data if error
      this.connectivityData = initialConnectivityData;
      this.isInitialized = true;
    }
  }

  async getAllConnectivityData(): Promise<ConnectivityPoint[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.connectivityData;
  }

  async getConnectivityByLevel(level: ConnectivityLevel): Promise<ConnectivityPoint[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.connectivityData.filter(point => point.level === level);
  }

  // Get current device connectivity status
  async getCurrentConnectivityStatus(): Promise<{
    isConnected: boolean | null;
    type: string | null;
    strength?: 'strong' | 'weak' | null;
  }> {
    const netInfo = await NetInfo.fetch();
    
    let strength: 'strong' | 'weak' | null = null;
    
    // Determine connection strength (this is a simple approximation)
    if (netInfo.isConnected) {
      if (netInfo.type === 'wifi' || netInfo.type === 'cellular' && netInfo.details?.cellularGeneration === '4g') {
        strength = 'strong';
      } else if (netInfo.type === 'cellular' && (netInfo.details?.cellularGeneration === '3g' || netInfo.details?.cellularGeneration === '2g')) {
        strength = 'weak';
      }
    }
    
    return {
      isConnected: netInfo.isConnected,
      type: netInfo.type,
      strength
    };
  }

  // User contribution - allow users to report connectivity in their current area
  async reportConnectivity(location: { latitude: number; longitude: number }, level: ConnectivityLevel, notes: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // Create a new user-reported spot
    const newPoint: ConnectivityPoint = {
      id: `user-report-${Date.now()}`,
      type: 'spot',
      level,
      coordinates: {
        latitude: location.latitude,
        longitude: location.longitude,
        radius: 300, // Default 300m radius for user reports
      },
      notes: `User reported: ${notes}`,
      lastVerified: new Date().toISOString().split('T')[0],
    };
    
    // Add to local data
    this.connectivityData.push(newPoint);
    
    // Save to storage
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.connectivityData));
    
    // In a production app, this would also send the report to a server
    console.log('User reported connectivity:', newPoint);
  }

  // Get nearest connectivity point based on location
  async getNearestConnectivityPoints(location: { latitude: number; longitude: number }, radius: number = 10000): Promise<ConnectivityPoint[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    // Filter points within the given radius (in meters)
    // This is a simplified calculation and not accurate for long distances
    const points = this.connectivityData.filter(point => {
      // For area type, use the first coordinate (approximate)
      const pointLat = point.type === 'area' 
        ? (point.coordinates as {latitude: number; longitude: number}[])[0].latitude
        : (point.coordinates as {latitude: number; longitude: number}).latitude;
        
      const pointLng = point.type === 'area'
        ? (point.coordinates as {latitude: number; longitude: number}[])[0].longitude
        : (point.coordinates as {latitude: number; longitude: number}).longitude;
      
      // Simple distance calculation (not accurate for long distances)
      const distance = this.calculateDistance(
        location.latitude, location.longitude,
        pointLat, pointLng
      );
      
      return distance <= radius;
    });
    
    return points;
  }
  
  // Calculate distance between two points using the Haversine formula
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }
}

export const connectivityService = new ConnectivityService();
export default connectivityService;
