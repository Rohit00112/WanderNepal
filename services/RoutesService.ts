import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import * as Location from 'expo-location';
import { connectivityService } from './ConnectivityService';

// Types
export interface TrekkingRoute {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Extreme';
  distanceKm: number;
  durationHours: number;
  maxAltitudeM: number;
  startingPoint: string;
  endingPoint: string;
  region: string;
  seasons: string[];
  permitRequired: boolean;
  permitCost?: number;
  waypoints: RouteWaypoint[];
  elevationProfile: ElevationPoint[];
  imageUrls: string[];
  downloadedAt?: number;
  downloadStatus?: 'pending' | 'downloading' | 'completed' | 'failed';
  downloadProgress?: number;
  downloadSize?: number;
  localMapPath?: string;
  localImagesPath?: string;
}

export interface RouteWaypoint {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  waypointType: 'start' | 'end' | 'rest' | 'viewpoint' | 'checkpoint' | 'danger' | 'shelter' | 'water';
  services?: {
    food?: boolean;
    accommodation?: boolean;
    water?: boolean;
    medical?: boolean;
    wifi?: boolean;
  };
  estimatedTimeFromStart?: number;
}

export interface ElevationPoint {
  distance: number; // distance in km from start
  altitude: number; // in meters
}

export interface DownloadProgress {
  routeId: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  error?: string;
}

// Service class
class RoutesService {
  private baseApiUrl = 'https://api.wandernepal.com/routes';
  private offlineRoutesStorageKey = 'offline_trekking_routes';
  private offlineBaseDir = FileSystem.documentDirectory + 'offline_routes/';

  // Placeholder routes data
  private placeholderRoutes: TrekkingRoute[] = [
    {
      id: 'ebc-001',
      name: 'Everest Base Camp Trek',
      description: 'The classic trek to the base of the world\'s highest mountain, offering stunning views of Mt. Everest and surrounding peaks.',
      difficulty: 'Hard',
      distanceKm: 130,
      durationHours: 168, // 14 days * 12 hours
      maxAltitudeM: 5545, // Kala Patthar
      startingPoint: 'Lukla',
      endingPoint: 'Lukla',
      region: 'Khumbu',
      seasons: ['Spring', 'Autumn'],
      permitRequired: true,
      permitCost: 50,
      waypoints: [
        {
          id: 'ebc-wp-001',
          name: 'Lukla',
          description: 'Starting point of the trek',
          latitude: 27.6857,
          longitude: 86.7278,
          altitude: 2860,
          waypointType: 'start',
          services: {
            food: true,
            accommodation: true,
            water: true,
            medical: true,
            wifi: true
          },
          estimatedTimeFromStart: 0
        },
        {
          id: 'ebc-wp-002',
          name: 'Namche Bazaar',
          description: 'Main trading center and hub for the Khumbu region',
          latitude: 27.8069,
          longitude: 86.7140,
          altitude: 3440,
          waypointType: 'rest',
          services: {
            food: true,
            accommodation: true,
            water: true,
            medical: true,
            wifi: true
          },
          estimatedTimeFromStart: 12
        },
        {
          id: 'ebc-wp-003',
          name: 'Tengboche Monastery',
          description: 'Famous monastery with stunning views of Ama Dablam',
          latitude: 27.8369,
          longitude: 86.7641,
          altitude: 3867,
          waypointType: 'viewpoint',
          services: {
            food: true,
            accommodation: true,
            water: true,
            wifi: false
          },
          estimatedTimeFromStart: 24
        },
        {
          id: 'ebc-wp-004',
          name: 'Everest Base Camp',
          description: 'Final destination at the foot of Mount Everest',
          latitude: 28.0025,
          longitude: 86.8555,
          altitude: 5364,
          waypointType: 'checkpoint',
          services: {
            food: false,
            accommodation: false,
            water: false,
            medical: false,
            wifi: false
          },
          estimatedTimeFromStart: 60
        },
        {
          id: 'ebc-wp-005',
          name: 'Kala Patthar',
          description: 'Popular viewpoint for Mount Everest',
          latitude: 27.9960,
          longitude: 86.8292,
          altitude: 5545,
          waypointType: 'viewpoint',
          services: {
            food: false,
            accommodation: false,
            water: false,
            medical: false,
            wifi: false
          },
          estimatedTimeFromStart: 72
        }
      ],
      elevationProfile: Array.from({ length: 20 }, (_, i) => ({
        distance: i * 6.5,
        altitude: 2800 + (i < 10 ? i * 300 : (20 - i) * 300)
      })),
      imageUrls: [
        'https://images.unsplash.com/photo-1516302350523-4c29d47b89e9',
        'https://images.unsplash.com/photo-1488654715439-fbf461f0eb8d',
        'https://images.unsplash.com/photo-1488226941616-4b0afbee6c3b'
      ]
    },
    {
      id: 'anp-002',
      name: 'Annapurna Circuit',
      description: 'A diverse trek around the Annapurna massif, passing through various climate zones and crossing the challenging Thorong La Pass.',
      difficulty: 'Moderate',
      distanceKm: 160,
      durationHours: 240, // 20 days * 12 hours
      maxAltitudeM: 5416, // Thorong La Pass
      startingPoint: 'Besisahar',
      endingPoint: 'Pokhara',
      region: 'Annapurna',
      seasons: ['Spring', 'Autumn'],
      permitRequired: true,
      permitCost: 30,
      waypoints: [
        {
          id: 'anp-wp-001',
          name: 'Besisahar',
          description: 'Starting point of the trek',
          latitude: 28.2330,
          longitude: 84.3747,
          altitude: 760,
          waypointType: 'start',
          services: {
            food: true,
            accommodation: true,
            water: true,
            medical: true,
            wifi: true
          },
          estimatedTimeFromStart: 0
        },
        {
          id: 'anp-wp-002',
          name: 'Chame',
          description: 'District headquarters of Manang',
          latitude: 28.5569,
          longitude: 84.2394,
          altitude: 2670,
          waypointType: 'rest',
          services: {
            food: true,
            accommodation: true,
            water: true,
            medical: true,
            wifi: true
          },
          estimatedTimeFromStart: 48
        },
        {
          id: 'anp-wp-003',
          name: 'Thorong La Pass',
          description: 'Highest point of the circuit',
          latitude: 28.7906,
          longitude: 83.9300,
          altitude: 5416,
          waypointType: 'checkpoint',
          services: {
            food: false,
            accommodation: false,
            water: false,
            medical: false,
            wifi: false
          },
          estimatedTimeFromStart: 120
        },
        {
          id: 'anp-wp-004',
          name: 'Muktinath',
          description: 'Sacred place for both Hindus and Buddhists',
          latitude: 28.8172,
          longitude: 83.8717,
          altitude: 3800,
          waypointType: 'viewpoint',
          services: {
            food: true,
            accommodation: true,
            water: true,
            medical: true,
            wifi: true
          },
          estimatedTimeFromStart: 132
        },
        {
          id: 'anp-wp-005',
          name: 'Pokhara',
          description: 'End point of the trek',
          latitude: 28.2096,
          longitude: 83.9856,
          altitude: 827,
          waypointType: 'end',
          services: {
            food: true,
            accommodation: true,
            water: true,
            medical: true,
            wifi: true
          },
          estimatedTimeFromStart: 240
        }
      ],
      elevationProfile: Array.from({ length: 20 }, (_, i) => ({
        distance: i * 8,
        altitude: 800 + (i < 10 ? i * 460 : (20 - i) * 460)
      })),
      imageUrls: [
        'https://images.unsplash.com/photo-1526718583451-e88ebf774771',
        'https://images.unsplash.com/photo-1458442310124-dde6edb43d10',
        'https://images.unsplash.com/photo-1582920783422-7b5e4252346b'
      ]
    },
    {
      id: 'abc-003',
      name: 'Annapurna Base Camp',
      description: 'A shorter but equally stunning trek to the sanctuary at the foot of the Annapurna massif.',
      difficulty: 'Moderate',
      distanceKm: 80,
      durationHours: 96, // 8 days * 12 hours
      maxAltitudeM: 4130, // ABC
      startingPoint: 'Nayapul',
      endingPoint: 'Nayapul',
      region: 'Annapurna',
      seasons: ['Spring', 'Autumn', 'Winter'],
      permitRequired: true,
      permitCost: 30,
      waypoints: [
        {
          id: 'abc-wp-001',
          name: 'Nayapul',
          description: 'Starting point of the trek',
          latitude: 28.3994,
          longitude: 83.6838,
          altitude: 1070,
          waypointType: 'start',
          services: {
            food: true,
            accommodation: true,
            water: true,
            medical: true,
            wifi: true
          },
          estimatedTimeFromStart: 0
        },
        {
          id: 'abc-wp-002',
          name: 'Ghorepani',
          description: 'Village with excellent views of Dhaulagiri and Annapurna',
          latitude: 28.3948,
          longitude: 83.7525,
          altitude: 2874,
          waypointType: 'rest',
          services: {
            food: true,
            accommodation: true,
            water: true,
            medical: true,
            wifi: true
          },
          estimatedTimeFromStart: 24
        },
        {
          id: 'abc-wp-003',
          name: 'Poon Hill',
          description: 'Famous sunrise viewpoint',
          latitude: 28.4028,
          longitude: 83.7534,
          altitude: 3210,
          waypointType: 'viewpoint',
          services: {
            food: false,
            accommodation: false,
            water: false,
            medical: false,
            wifi: false
          },
          estimatedTimeFromStart: 30
        },
        {
          id: 'abc-wp-004',
          name: 'Annapurna Base Camp',
          description: 'Final destination surrounded by mountain peaks',
          latitude: 28.5308,
          longitude: 83.8773,
          altitude: 4130,
          waypointType: 'checkpoint',
          services: {
            food: true,
            accommodation: true,
            water: true,
            medical: false,
            wifi: false
          },
          estimatedTimeFromStart: 72
        }
      ],
      elevationProfile: Array.from({ length: 15 }, (_, i) => ({
        distance: i * 5.3,
        altitude: 1000 + (i < 8 ? i * 390 : (15 - i) * 390)
      })),
      imageUrls: [
        'https://images.unsplash.com/photo-1597913943427-c7e48f1a86b4',
        'https://images.unsplash.com/photo-1527093624021-33c2254a6268',
        'https://images.unsplash.com/photo-1623207613517-f52c65eaa96d'
      ]
    },
    {
      id: 'lngt-004',
      name: 'Langtang Valley Trek',
      description: 'A less crowded trek through beautiful rhododendron forests and traditional Tamang villages with views of Langtang Lirung.',
      difficulty: 'Easy',
      distanceKm: 65,
      durationHours: 84, // 7 days * 12 hours
      maxAltitudeM: 3800, // Kyanjin Ri
      startingPoint: 'Syabrubesi',
      endingPoint: 'Syabrubesi',
      region: 'Langtang',
      seasons: ['Spring', 'Autumn', 'Winter'],
      permitRequired: true,
      permitCost: 20,
      waypoints: [
        {
          id: 'lngt-wp-001',
          name: 'Syabrubesi',
          description: 'Starting point of the trek',
          latitude: 28.2192,
          longitude: 85.3733,
          altitude: 1600,
          waypointType: 'start',
          services: {
            food: true,
            accommodation: true,
            water: true,
            medical: true,
            wifi: true
          },
          estimatedTimeFromStart: 0
        },
        {
          id: 'lngt-wp-002',
          name: 'Lama Hotel',
          description: 'Basic accommodation and food services',
          latitude: 28.2344,
          longitude: 85.4575,
          altitude: 2470,
          waypointType: 'rest',
          services: {
            food: true,
            accommodation: true,
            water: true,
            medical: false,
            wifi: false
          },
          estimatedTimeFromStart: 12
        },
        {
          id: 'lngt-wp-003',
          name: 'Langtang Village',
          description: 'Traditional Tamang village with stunning views',
          latitude: 28.2742,
          longitude: 85.5281,
          altitude: 3430,
          waypointType: 'viewpoint',
          services: {
            food: true,
            accommodation: true,
            water: true,
            medical: false,
            wifi: false
          },
          estimatedTimeFromStart: 24
        },
        {
          id: 'lngt-wp-004',
          name: 'Kyanjin Ri',
          description: 'Highest point of the trek with panoramic views',
          latitude: 28.2947,
          longitude: 85.5556,
          altitude: 3800,
          waypointType: 'checkpoint',
          services: {
            food: false,
            accommodation: false,
            water: false,
            medical: false,
            wifi: false
          },
          estimatedTimeFromStart: 48
        }
      ],
      elevationProfile: Array.from({ length: 12 }, (_, i) => ({
        distance: i * 5.4,
        altitude: 1400 + (i < 6 ? i * 400 : (12 - i) * 400)
      })),
      imageUrls: [
        'https://images.unsplash.com/photo-1622015663319-e97e697503ee',
        'https://images.unsplash.com/photo-1628624747186-a941c476b7ef',
        'https://images.unsplash.com/photo-1592975546557-ea3c05955576'
      ]
    },
    {
      id: 'mana-005',
      name: 'Manaslu Circuit',
      description: 'A remote and challenging trek around Mt. Manaslu, the eighth highest mountain in the world.',
      difficulty: 'Hard',
      distanceKm: 177,
      durationHours: 192, // 16 days * 12 hours
      maxAltitudeM: 5106, // Larkya La Pass
      startingPoint: 'Soti Khola',
      endingPoint: 'Besisahar',
      region: 'Manaslu',
      seasons: ['Spring', 'Autumn'],
      permitRequired: true,
      permitCost: 100,
      waypoints: [
        {
          id: 'mana-wp-001',
          name: 'Soti Khola',
          description: 'Starting point of the trek',
          latitude: 28.3722,
          longitude: 84.9878,
          altitude: 710,
          waypointType: 'start',
          services: {
            food: true,
            accommodation: true,
            water: true,
            medical: true,
            wifi: true
          },
          estimatedTimeFromStart: 0
        },
        {
          id: 'mana-wp-002',
          name: 'Machha Khola',
          description: 'Basic accommodation and food services',
          latitude: 28.4211,
          longitude: 84.9153,
          altitude: 930,
          waypointType: 'rest',
          services: {
            food: true,
            accommodation: true,
            water: true,
            medical: false,
            wifi: false
          },
          estimatedTimeFromStart: 12
        },
        {
          id: 'mana-wp-003',
          name: 'Jagat',
          description: 'Traditional village with stunning views',
          latitude: 28.4639,
          longitude: 84.8339,
          altitude: 1340,
          waypointType: 'viewpoint',
          services: {
            food: true,
            accommodation: true,
            water: true,
            medical: false,
            wifi: false
          },
          estimatedTimeFromStart: 24
        },
        {
          id: 'mana-wp-004',
          name: 'Larkya La Pass',
          description: 'Highest point of the trek with panoramic views',
          latitude: 28.5639,
          longitude: 84.5850,
          altitude: 5106,
          waypointType: 'checkpoint',
          services: {
            food: false,
            accommodation: false,
            water: false,
            medical: false,
            wifi: false
          },
          estimatedTimeFromStart: 96
        }
      ],
      elevationProfile: Array.from({ length: 18 }, (_, i) => ({
        distance: i * 9.8,
        altitude: 700 + (i < 9 ? i * 490 : (18 - i) * 490)
      })),
      imageUrls: [
        'https://images.unsplash.com/photo-1554993981-f8cb1da763d5',
        'https://images.unsplash.com/photo-1580311752463-9a5b324fef3c',
        'https://images.unsplash.com/photo-1587579708961-fb3c61120be3'
      ]
    }
  ];

  constructor() {
    this.initializeStorage();
  }

  private async initializeStorage() {
    try {
      const directoryInfo = await FileSystem.getInfoAsync(this.offlineBaseDir);
      if (!directoryInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.offlineBaseDir, { intermediates: true });
        console.log('Created offline routes directory');
      }
    } catch (error) {
      console.error('Error initializing offline routes storage:', error);
    }
  }

  // Get a list of popular trekking routes 
  async getPopularRoutes(): Promise<TrekkingRoute[]> {
    try {
      const connectionStatus = await connectivityService.getCurrentConnectivityStatus();
      const isConnected = connectionStatus.isConnected === true;

      if (isConnected) {
        // Return placeholder data instead of making API call
        return Promise.resolve(this.placeholderRoutes);
      } else {
        // Return cached routes if available, otherwise return placeholder data
        const cachedRoutes = await this.getCachedRoutes();
        return cachedRoutes.length > 0 ? cachedRoutes : this.placeholderRoutes;
      }
    } catch (error) {
      console.error('Error fetching popular routes:', error);
      // Return placeholder data if error occurs
      return this.placeholderRoutes;
    }
  }

  // Search for routes by name, region, or difficulty
  async searchRoutes(query: string): Promise<TrekkingRoute[]> {
    try {
      const connectionStatus = await connectivityService.getCurrentConnectivityStatus();
      const isConnected = connectionStatus.isConnected === true;

      if (isConnected) {
        // Filter placeholder data based on query instead of making API call
        const lowercaseQuery = query.toLowerCase();
        return this.placeholderRoutes.filter(route =>
          route.name.toLowerCase().includes(lowercaseQuery) ||
          route.region.toLowerCase().includes(lowercaseQuery) ||
          route.difficulty.toLowerCase().includes(lowercaseQuery)
        );
      } else {
        // Return filtered cached routes if available
        const cachedRoutes = await this.getCachedRoutes();
        const lowercaseQuery = query.toLowerCase();
        return cachedRoutes.filter(route =>
          route.name.toLowerCase().includes(lowercaseQuery) ||
          route.region.toLowerCase().includes(lowercaseQuery) ||
          route.difficulty.toLowerCase().includes(lowercaseQuery)
        );
      }
    } catch (error) {
      console.error('Error searching routes:', error);
      // Return filtered placeholder data if error occurs
      const lowercaseQuery = query.toLowerCase();
      return this.placeholderRoutes.filter(route =>
        route.name.toLowerCase().includes(lowercaseQuery) ||
        route.region.toLowerCase().includes(lowercaseQuery) ||
        route.difficulty.toLowerCase().includes(lowercaseQuery)
      );
    }
  }

  // Get detailed information about a specific route
  async getRouteDetails(routeId: string): Promise<TrekkingRoute | null> {
    try {
      // First check if we have this route downloaded
      const offlineRoutes = await this.getDownloadedRoutes();
      const offlineRoute = offlineRoutes.find(r => r.id === routeId);

      if (offlineRoute) {
        return offlineRoute;
      }

      // If not downloaded, check placeholder data
      const placeholderRoute = this.placeholderRoutes.find(r => r.id === routeId);
      if (placeholderRoute) {
        return placeholderRoute;
      }

      // If not in placeholder data, check if we're online to fetch it
      const connectionStatus = await connectivityService.getCurrentConnectivityStatus();
      const isConnected = connectionStatus.isConnected === true;

      if (isConnected) {
        // Return null as we don't have this route in our placeholder data
        return null;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching route details:', error);
      return null;
    }
  }

  // Download a route for offline use
  async downloadRoute(routeId: string): Promise<DownloadProgress> {
    try {
      // Get route details first
      const route = await this.getRouteDetails(routeId);
      if (!route) {
        throw new Error('Route not found');
      }

      // Update download status
      await this.updateRouteDownloadStatus(routeId, {
        status: 'downloading',
        progress: 0
      });

      // Create directory for this route
      const routeDir = `${this.offlineBaseDir}${routeId}/`;
      const routeInfo = await FileSystem.getInfoAsync(routeDir);
      if (!routeInfo.exists) {
        await FileSystem.makeDirectoryAsync(routeDir, { intermediates: true });
      }

      // Download map tiles
      await this.downloadMapTiles(route, routeDir);

      // Download route images
      await this.downloadRouteImages(route, routeDir);

      // Mark as downloaded and save
      const downloadedRoute = {
        ...route,
        downloadedAt: Date.now(),
        downloadStatus: 'completed' as const,
        downloadProgress: 100,
        localMapPath: `${routeDir}map/`,
        localImagesPath: `${routeDir}images/`
      };

      await this.saveDownloadedRoute(downloadedRoute);

      return {
        routeId,
        progress: 100,
        status: 'completed'
      };
    } catch (error) {
      console.error(`Error downloading route ${routeId}:`, error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // Update download status to failed
      await this.updateRouteDownloadStatus(routeId, {
        status: 'failed',
        progress: 0,
        error: errorMessage
      });

      return {
        routeId,
        progress: 0,
        status: 'failed',
        error: errorMessage
      };
    }
  }

  // Delete a downloaded route
  async deleteDownloadedRoute(routeId: string): Promise<boolean> {
    try {
      // Get current downloaded routes
      const routes = await this.getDownloadedRoutes();
      const routeIndex = routes.findIndex(r => r.id === routeId);

      if (routeIndex === -1) {
        return false; // Route not found
      }

      // Delete route directory
      const routeDir = `${this.offlineBaseDir}${routeId}/`;
      await FileSystem.deleteAsync(routeDir, { idempotent: true });

      // Remove from downloaded routes list
      routes.splice(routeIndex, 1);
      await AsyncStorage.setItem(this.offlineRoutesStorageKey, JSON.stringify(routes));

      return true;
    } catch (error) {
      console.error(`Error deleting downloaded route ${routeId}:`, error);
      return false;
    }
  }

  // Get all downloaded routes
  async getDownloadedRoutes(): Promise<TrekkingRoute[]> {
    try {
      const routes = await AsyncStorage.getItem(this.offlineRoutesStorageKey);
      return routes ? JSON.parse(routes) : [];
    } catch (error) {
      console.error('Error getting downloaded routes:', error);
      return [];
    }
  }

  // Check if a specific route is downloaded
  async isRouteDownloaded(routeId: string): Promise<boolean> {
    try {
      const routes = await this.getDownloadedRoutes();
      return routes.some(r => r.id === routeId && r.downloadStatus === 'completed');
    } catch (error) {
      console.error(`Error checking if route ${routeId} is downloaded:`, error);
      return false;
    }
  }

  // Get user's current location and find the nearest route
  async findNearestRoute(): Promise<TrekkingRoute | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Get all routes
      const routes = await this.getPopularRoutes();

      // Find nearest route based on start point
      let nearestRoute: TrekkingRoute | null = null;
      let shortestDistance = Infinity;

      for (const route of routes) {
        const startPoint = route.waypoints.find(wp => wp.waypointType === 'start');

        if (startPoint) {
          const distance = this.calculateDistance(
            latitude,
            longitude,
            startPoint.latitude,
            startPoint.longitude
          );

          if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestRoute = route;
          }
        }
      }

      return nearestRoute;
    } catch (error) {
      console.error('Error finding nearest route:', error);
      return null;
    }
  }

  // Calculate distance between two points using Haversine formula
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Get routes that are good for beginners
  async getBeginnerRoutes(): Promise<TrekkingRoute[]> {
    try {
      return this.placeholderRoutes.filter(route => route.difficulty === 'Easy');
    } catch (error) {
      console.error('Error getting beginner routes:', error);
      throw error;
    }
  }

  // Get recommended routes based on user preferences (simplified version)
  async getRecommendedRoutes(): Promise<TrekkingRoute[]> {
    try {
      // In a real app, this would use user preferences and history
      // For now, just return routes in a different region than the popular ones
      return this.placeholderRoutes.filter(route =>
        route.region === 'Langtang' || route.region === 'Mustang'
      ).slice(0, 5);
    } catch (error) {
      console.error('Error getting recommended routes:', error);
      throw error;
    }
  }

  // Private methods for handling cache and downloads

  private async getCachedRoutes(): Promise<TrekkingRoute[]> {
    try {
      const cachedRoutesJson = await AsyncStorage.getItem('cached_routes');
      return cachedRoutesJson ? JSON.parse(cachedRoutesJson) : [];
    } catch (error) {
      console.error('Error getting cached routes:', error);
      return [];
    }
  }

  private async cacheRoute(route: TrekkingRoute): Promise<void> {
    try {
      const cachedRoutes = await this.getCachedRoutes();
      const existingIndex = cachedRoutes.findIndex(r => r.id === route.id);

      if (existingIndex >= 0) {
        cachedRoutes[existingIndex] = route;
      } else {
        cachedRoutes.push(route);
      }

      await AsyncStorage.setItem('cached_routes', JSON.stringify(cachedRoutes));
    } catch (error) {
      console.error(`Error caching route ${route.id}:`, error);
    }
  }

  private async saveDownloadedRoute(route: TrekkingRoute): Promise<void> {
    try {
      const routes = await this.getDownloadedRoutes();
      const existingIndex = routes.findIndex(r => r.id === route.id);

      if (existingIndex >= 0) {
        routes[existingIndex] = route;
      } else {
        routes.push(route);
      }

      await AsyncStorage.setItem(this.offlineRoutesStorageKey, JSON.stringify(routes));
    } catch (error) {
      console.error(`Error saving downloaded route ${route.id}:`, error);
    }
  }

  private async updateRouteDownloadStatus(
    routeId: string,
    update: {
      status: 'pending' | 'downloading' | 'completed' | 'failed';
      progress: number;
      error?: string;
    }
  ): Promise<void> {
    try {
      const routes = await this.getDownloadedRoutes();
      const routeIndex = routes.findIndex(r => r.id === routeId);

      if (routeIndex >= 0) {
        routes[routeIndex] = {
          ...routes[routeIndex],
          downloadStatus: update.status,
          downloadProgress: update.progress,
        };
      } else {
        // Route might not be in downloaded list yet, so we'll add a minimal entry
        const route = await this.getRouteDetails(routeId);
        if (route) {
          routes.push({
            ...route,
            downloadStatus: update.status,
            downloadProgress: update.progress,
          });
        }
      }

      await AsyncStorage.setItem(this.offlineRoutesStorageKey, JSON.stringify(routes));
    } catch (error) {
      console.error(`Error updating download status for route ${routeId}:`, error);
    }
  }

  private async downloadMapTiles(route: TrekkingRoute, routeDir: string): Promise<void> {
    // Create map directory
    const mapDir = `${routeDir}map/`;
    const mapDirInfo = await FileSystem.getInfoAsync(mapDir);
    if (!mapDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(mapDir, { intermediates: true });
    }

    // In a real implementation, this would download map tiles for the route area
    // For this prototype, we'll simulate downloading a map file
    const mapFileUrl = `${this.baseApiUrl}/${route.id}/map`;
    const mapFilePath = `${mapDir}route_map.geojson`;

    try {
      // Simulating map download progress
      let progress = 0;
      const progressInterval = setInterval(async () => {
        progress += 10;
        if (progress <= 100) {
          await this.updateRouteDownloadStatus(route.id, {
            status: 'downloading',
            progress: Math.floor(progress * 0.7) // Map is 70% of total download
          });
        } else {
          clearInterval(progressInterval);
        }
      }, 300);

      // This would be a real download in production
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Create a dummy GeoJSON file for testing
      const dummyGeoJSON = this.generateDummyGeoJSON(route);
      await FileSystem.writeAsStringAsync(mapFilePath, JSON.stringify(dummyGeoJSON));

      clearInterval(progressInterval);
    } catch (error) {
      console.error(`Error downloading map for route ${route.id}:`, error);
      throw error;
    }
  }

  private async downloadRouteImages(route: TrekkingRoute, routeDir: string): Promise<void> {
    // Create images directory
    const imagesDir = `${routeDir}images/`;
    const imagesDirInfo = await FileSystem.getInfoAsync(imagesDir);
    if (!imagesDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(imagesDir, { intermediates: true });
    }

    try {
      // Update download status for images portion
      await this.updateRouteDownloadStatus(route.id, {
        status: 'downloading',
        progress: 70 // Map download is complete (70%)
      });

      // In a real implementation, we would download all route images
      // For this prototype, we'll simulate downloading images
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update progress to 100%
      await this.updateRouteDownloadStatus(route.id, {
        status: 'downloading',
        progress: 100
      });
    } catch (error) {
      console.error(`Error downloading images for route ${route.id}:`, error);
      throw error;
    }
  }

  private generateDummyGeoJSON(route: TrekkingRoute): any {
    // Generate a simple GeoJSON representation of the route
    const features = route.waypoints.map(waypoint => ({
      type: 'Feature',
      properties: {
        name: waypoint.name,
        description: waypoint.description || '',
        type: waypoint.waypointType,
        altitude: waypoint.altitude || 0,
        services: waypoint.services || {}
      },
      geometry: {
        type: 'Point',
        coordinates: [waypoint.longitude, waypoint.latitude]
      }
    }));

    // Create a LineString for the path
    const sortedWaypoints = [...route.waypoints].sort((a, b) =>
      (a.estimatedTimeFromStart || 0) - (b.estimatedTimeFromStart || 0)
    );

    const pathFeature: any = {
      type: 'Feature',
      properties: {
        name: `${route.name} Path`,
        description: route.description,
        type: 'path' as 'start' | 'end' | 'danger' | 'rest' | 'viewpoint' | 'checkpoint' | 'shelter' | 'water',
        altitude: route.maxAltitudeM,
        services: {
          food: false,
          accommodation: false,
          water: false,
          medical: false,
          wifi: false
        }
      },
      geometry: {
        type: 'LineString',
        coordinates: sortedWaypoints.map(wp => [wp.longitude, wp.latitude])
      }
    };

    features.push(pathFeature);

    return {
      type: 'FeatureCollection',
      properties: {
        name: route.name,
        description: route.description,
        difficulty: route.difficulty,
        distance: route.distanceKm,
        duration: route.durationHours,
        maxAltitude: route.maxAltitudeM
      },
      features
    };
  }
}

export const routesService = new RoutesService();
