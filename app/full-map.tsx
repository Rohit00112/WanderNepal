import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import { ChevronLeft, Compass } from 'lucide-react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { routesService, TrekkingRoute, RouteWaypoint } from '../services/RoutesService';

export default function FullMapScreen() {
  const router = useRouter();
  const { routeId } = useLocalSearchParams<{ routeId: string }>();
  const [route, setRoute] = useState<TrekkingRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 27.7172,
    longitude: 85.3240,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [routePath, setRoutePath] = useState<{ latitude: number; longitude: number }[]>([]);

  useEffect(() => {
    if (!routeId) return;
    
    const fetchRoute = async () => {
      try {
        setLoading(true);
        const fetchedRoute = await routesService.getRouteDetails(routeId);
        setRoute(fetchedRoute);
        
        if (fetchedRoute?.waypoints && fetchedRoute.waypoints.length > 0) {
          // Calculate route path from waypoints
          const path = fetchedRoute.waypoints.map((waypoint: RouteWaypoint) => ({
            latitude: waypoint.latitude,
            longitude: waypoint.longitude,
          }));
          setRoutePath(path);
          
          // Set map region to fit the route
          const firstWaypoint = fetchedRoute.waypoints[0];
          setMapRegion({
            latitude: firstWaypoint.latitude,
            longitude: firstWaypoint.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          });
        }
      } catch (err) {
        console.error('Error fetching route:', err);
        setError('Failed to load route information');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoute();
  }, [routeId]);

  const handleBackPress = () => {
    router.back();
  };

  const recenterMap = () => {
    if (route?.waypoints && route.waypoints.length > 0) {
      const firstWaypoint = route.waypoints[0];
      setMapRegion({
        latitude: firstWaypoint.latitude,
        longitude: firstWaypoint.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    }
  };

  if (!route) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <ChevronLeft size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Route Map</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {loading ? 'Loading map...' : error || 'No map data available'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{route.name}</Text>
        <View style={styles.placeholder} />
      </View>
      
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={mapRegion}
          onRegionChangeComplete={region => setMapRegion(region)}
        >
          {routePath.length > 0 && (
            <>
              <Polyline
                coordinates={routePath}
                strokeColor="#FF385C"
                strokeWidth={4}
                lineDashPattern={[0]}
              />
              {route.waypoints.map((waypoint: RouteWaypoint) => (
                <Marker
                  key={waypoint.id}
                  coordinate={{
                    latitude: waypoint.latitude,
                    longitude: waypoint.longitude
                  }}
                  title={waypoint.name}
                  description={waypoint.description || ''}
                  pinColor="#FF385C"
                />
              ))}
            </>
          )}
        </MapView>
        
        <TouchableOpacity style={styles.recenterButton} onPress={recenterMap}>
          <Compass size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Medium',
    color: '#1A1D1E',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  recenterButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    backgroundColor: '#FF385C',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#72777A',
    fontFamily: 'DMSans-Regular',
    textAlign: 'center',
  }
});
