import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  ActivityIndicator, 
  SafeAreaView,
  
  Dimensions,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Map, Mountain, Clock, Calendar, Shield, Download, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { LineChart } from 'react-native-chart-kit';
import { routesService, TrekkingRoute, RouteWaypoint } from '../services/RoutesService';
import { connectivityService } from '../services/ConnectivityService';

const { width } = Dimensions.get('window');

export default function RouteDetailsScreen() {
  const router = useRouter();
  const { routeId } = useLocalSearchParams();
  const [route, setRoute] = useState<TrekkingRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const loadRouteDetails = async () => {
      try {
        setLoading(true);
        const connectionStatus = await connectivityService.getCurrentConnectivityStatus();
        setIsOnline(connectionStatus.isConnected || false);
        
        if (typeof routeId === 'string') {
          const routeDetails = await routesService.getRouteDetails(routeId);
          setRoute(routeDetails);
          
          // Check if route is already downloaded
          const downloadedRoutes = await routesService.getDownloadedRoutes();
          setIsDownloaded(downloadedRoutes.some(r => r.id === routeId));
          
          // Check if route is currently downloading
          if (routeDetails?.downloadStatus === 'downloading') {
            setIsDownloading(true);
            setDownloadProgress(routeDetails.downloadProgress || 0);
          }
        }
      } catch (error) {
        console.error('Error loading route details:', error);
        Alert.alert('Error', 'Failed to load route details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadRouteDetails();
    
    const progressCheckInterval = setInterval(async () => {
      if (typeof routeId === 'string') {
        try {
          const routeDetails = await routesService.getRouteDetails(routeId);
          if (routeDetails) {
            setDownloadProgress(routeDetails.downloadProgress || 0);
            setIsDownloading(routeDetails.downloadStatus === 'downloading');
            
            if (routeDetails.downloadStatus === 'completed') {
              setIsDownloaded(true);
              setIsDownloading(false);
            } else if (routeDetails.downloadStatus === 'failed') {
              setIsDownloading(false);
              Alert.alert('Download Failed', 'Failed to download route. Please try again.');
            }
          }
        } catch (error) {
          console.error('Error checking download progress:', error);
        }
      }
    }, 1000);
    
    return () => {
      clearInterval(progressCheckInterval);
    };
  }, [routeId]);
  
  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };
  
  const handleDownloadPress = async () => {
    if (!route) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (isDownloaded) {
      // Confirm deletion
      Alert.alert(
        'Remove Offline Route',
        'Are you sure you want to remove this route from your offline collection?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              try {
                await routesService.deleteDownloadedRoute(route.id);
                setIsDownloaded(false);
                Alert.alert('Success', 'Route removed from offline collection');
              } catch (error) {
                console.error('Error removing route:', error);
                Alert.alert('Error', 'Failed to remove route. Please try again.');
              }
            }
          }
        ]
      );
    } else if (!isDownloading) {
      // Start download
      try {
        setIsDownloading(true);
        setDownloadProgress(0);
        await routesService.downloadRoute(route.id);
      } catch (error) {
        console.error('Error downloading route:', error);
        setIsDownloading(false);
        Alert.alert('Error', 'Failed to download route. Please try again.');
      }
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF385C" />
        <Text style={styles.loadingText}>Loading route details...</Text>
      </SafeAreaView>
    );
  }
  
  if (!route) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Route not found</Text>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleBookPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/booking?name=${encodeURIComponent(route.name)}`);
  };
  
  // Prepare data for the elevation chart
  const elevationData = {
    labels: route.elevationProfile.map(p => `${p.distance.toFixed(1)}`),
    datasets: [
      {
        data: route.elevationProfile.map(p => p.altitude),
        color: () => '#FF385C',
        strokeWidth: 2
      }
    ]
  };
  
  // Calculate route path for the map
  const routePath = route.waypoints.map(waypoint => ({
    latitude: waypoint.latitude,
    longitude: waypoint.longitude
  }));
  
  // Calculate the region for the map to display based on waypoints
  const latitudes = route.waypoints.map(w => w.latitude);
  const longitudes = route.waypoints.map(w => w.longitude);
  
  // Default region (Nepal) in case waypoints are empty
  const defaultRegion = {
    latitude: 28.3949,
    longitude: 84.124,
    latitudeDelta: 3,
    longitudeDelta: 3,
  };
  
  // Only calculate region if waypoints exist
  const mapRegion = route.waypoints.length > 0 
    ? {
        latitude: (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
        longitude: (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
        latitudeDelta: (Math.max(...latitudes) - Math.min(...latitudes)) * 1.5 || 0.1,
        longitudeDelta: (Math.max(...longitudes) - Math.min(...longitudes)) * 1.5 || 0.1,
      }
    : defaultRegion;
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookPress}>
          <Calendar size={20} color="#FFFFFF" />
          <Text style={styles.bookButtonText}>Book This Trek</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Route Details</Text>
        <TouchableOpacity 
          onPress={handleDownloadPress} 
          style={styles.actionButton}
          disabled={isDownloading}
        >
          {isDownloaded ? (
            <Trash2 size={22} color="#FF3B30" />
          ) : isDownloading ? (
            <ActivityIndicator size="small" color="#FF385C" />
          ) : (
            <Download size={22} color="#FF385C" />
          )}
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: route.imageUrls[0] }} 
            style={styles.mainImage}
            resizeMode="cover"
          />
          <View style={styles.routeTitleContainer}>
            <Text style={styles.routeTitle}>{route.name}</Text>
            <View style={[styles.difficultyBadge, 
              route.difficulty === 'Easy' ? styles.easyBadge : 
              route.difficulty === 'Moderate' ? styles.moderateBadge :
              route.difficulty === 'Hard' ? styles.hardBadge :
              styles.extremeBadge
            ]}>
              <Text style={styles.difficultyText}>{route.difficulty}</Text>
            </View>
          </View>
        </View>
        
        {/* Quick Info */}
        <View style={styles.quickInfoContainer}>
          <View style={styles.infoItem}>
            <Mountain size={20} color="#FF385C" />
            <Text style={styles.infoText}>{route.maxAltitudeM}m altitude</Text>
          </View>
          <View style={styles.infoItem}>
            <Map size={20} color="#FF385C" />
            <Text style={styles.infoText}>{route.distanceKm}km distance</Text>
          </View>
          <View style={styles.infoItem}>
            <Clock size={20} color="#FF385C" />
            <Text style={styles.infoText}>{route.durationHours}h duration</Text>
          </View>
          {route.permitRequired && (
            <View style={styles.infoItem}>
              <Shield size={20} color="#FF385C" />
              <Text style={styles.infoText}>Permit Required</Text>
            </View>
          )}
        </View>
        
        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this Trek</Text>
          <Text style={styles.description}>{route.description}</Text>
        </View>
        
        {/* Map */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route Map</Text>
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              region={mapRegion}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              {route.waypoints.length > 0 && (
                <>
                  <Polyline
                    coordinates={routePath}
                    strokeColor="#FF385C"
                    strokeWidth={3}
                  />
                  {route.waypoints.map((waypoint) => (
                    <Marker
                      key={waypoint.id}
                      coordinate={{
                        latitude: waypoint.latitude,
                        longitude: waypoint.longitude
                      }}
                      title={waypoint.name}
                      description={waypoint.description}
                    />
                  ))}
                </>
              )}
            </MapView>
            <TouchableOpacity 
              style={styles.viewFullMapButton}
              onPress={() => router.push({
                pathname: '/full-map',
                params: { routeId: route.id }
              })}
            >
              <Text style={styles.viewFullMapText}>View Full Map</Text>
              <Map size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Elevation Profile */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Elevation Profile</Text>
          <LineChart
            data={elevationData}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#f5f5f5',
              backgroundGradientFrom: '#f5f5f5',
              backgroundGradientTo: '#f5f5f5',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 56, 92, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: "2",
                strokeWidth: "1",
                stroke: "#FF385C"
              },
              propsForBackgroundLines: {
                strokeWidth: 1,
                stroke: '#e0e0e0',
              }
            }}
            bezier
            style={styles.chart}
            yAxisSuffix="m"
            xAxisLabel="km"
            fromZero={false}
          />
        </View>
        
        {/* Waypoints */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Waypoints</Text>
          <View style={styles.waypointsList}>
            {route.waypoints.map((waypoint, index) => (
              <View key={waypoint.id} style={styles.waypointItem}>
                <View style={styles.waypointDot} />
                {index < route.waypoints.length - 1 && <View style={styles.waypointLine} />}
                <View style={styles.waypointContent}>
                  <Text style={styles.waypointName}>{waypoint.name}</Text>
                  {waypoint.description && (
                    <Text style={styles.waypointDescription}>{waypoint.description}</Text>
                  )}
                  {waypoint.altitude && (
                    <Text style={styles.waypointAltitude}>{waypoint.altitude}m altitude</Text>
                  )}
                  {waypoint.estimatedTimeFromStart !== undefined && (
                    <Text style={styles.waypointTime}>
                      {Math.floor(waypoint.estimatedTimeFromStart / 60)}h 
                      {waypoint.estimatedTimeFromStart % 60 > 0 
                        ? ` ${waypoint.estimatedTimeFromStart % 60}m` 
                        : ''} from start
                    </Text>
                  )}
                  {waypoint.services && Object.values(waypoint.services).some(v => v) && (
                    <View style={styles.waypointServices}>
                      <Text style={styles.waypointServicesTitle}>Available services:</Text>
                      <Text style={styles.waypointServicesText}>
                        {[
                          waypoint.services.food && 'Food',
                          waypoint.services.accommodation && 'Accommodation',
                          waypoint.services.water && 'Water',
                          waypoint.services.medical && 'Medical',
                          waypoint.services.wifi && 'WiFi'
                        ].filter(Boolean).join(', ')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
        
        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          <View style={styles.additionalInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Region:</Text>
              <Text style={styles.infoValue}>{route.region}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Best Seasons:</Text>
              <Text style={styles.infoValue}>{route.seasons.join(', ')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Starting Point:</Text>
              <Text style={styles.infoValue}>{route.startingPoint}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ending Point:</Text>
              <Text style={styles.infoValue}>{route.endingPoint}</Text>
            </View>
            {route.permitRequired && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Permit Cost:</Text>
                <Text style={styles.infoValue}>
                  {route.permitCost ? `$${route.permitCost} USD` : 'Contact local authorities'}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Offline Availability Notice */}
        {isDownloaded ? (
          <View style={styles.offlineNotice}>
            <Text style={styles.offlineNoticeText}>
              This route is available offline. Maps and images can be accessed without internet connection.
            </Text>
          </View>
        ) : isDownloading ? (
          <View style={styles.downloadingNotice}>
            <Text style={styles.downloadingNoticeText}>
              Downloading route... {Math.round(downloadProgress * 100)}%
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${downloadProgress * 100}%` }]} />
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.downloadButton} 
            onPress={handleDownloadPress}
            disabled={!isOnline}
          >
            <Download size={20} color="#FFFFFF" />
            <Text style={styles.downloadButtonText}>Download for Offline Use</Text>
          </TouchableOpacity>
        )}
        
        <View style={{ height: 30 }} />
      </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Medium',
    color: '#1A1D1E',
  },
  backButton: {
    padding: 8,
  },
  actionButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: 250,
  },
  routeTitleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'DMSans-Bold',
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  easyBadge: {
    backgroundColor: '#4CAF50',
  },
  moderateBadge: {
    backgroundColor: '#FF9800',
  },
  hardBadge: {
    backgroundColor: '#F44336',
  },
  extremeBadge: {
    backgroundColor: '#7B1FA2',
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
  },
  quickInfoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#72777A',
  },
  section: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: '#1A1D1E',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    fontFamily: 'DMSans-Regular',
    color: '#72777A',
    lineHeight: 22,
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginTop: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  viewFullMapButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#FF385C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewFullMapText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    marginRight: 8,
  },
  chart: {
    marginVertical: 16,
    borderRadius: 16,
  },
  waypointsList: {
    marginTop: 16,
  },
  waypointItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  waypointDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF385C',
    marginRight: 16,
    marginTop: 2,
    zIndex: 1,
  },
  waypointLine: {
    position: 'absolute',
    left: 10,
    top: 22,
    bottom: -8,
    width: 2,
    backgroundColor: '#EEEEEE',
  },
  waypointContent: {
    flex: 1,
  },
  waypointName: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: '#1A1D1E',
    marginBottom: 8,
  },
  waypointDescription: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#72777A',
    marginBottom: 8,
  },
  waypointAltitude: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: '#72777A',
    marginBottom: 4,
  },
  waypointTime: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: '#72777A',
    marginBottom: 8,
  },
  waypointServices: {
    marginTop: 8,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  waypointServicesTitle: {
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
    color: '#1A1D1E',
    marginBottom: 8,
  },
  waypointServicesText: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: '#72777A',
  },
  additionalInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    width: 120,
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    color: '#1A1D1E',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#72777A',
  },
  downloadButton: {
    backgroundColor: '#FF385C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
    marginLeft: 8,
  },
  offlineNotice: {
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  offlineNoticeText: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#2E7D32',
  },
  downloadingNotice: {
    backgroundColor: '#FFEBEE',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF385C',
  },
  downloadingNoticeText: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#C62828',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#FFCDD2',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF385C',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#72777A',
    fontFamily: 'DMSans-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#1A1D1E',
    fontFamily: 'DMSans-Medium',
    marginBottom: 16,
    textAlign: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#FF385C',
    fontFamily: 'DMSans-Medium',
  },
  bookButton: {
    backgroundColor: '#FF385C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    position: 'absolute',
    bottom: 16,
    right: 16,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    marginLeft: 8,
  }
});
