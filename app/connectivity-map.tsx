import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, SafeAreaView, ScrollView, Alert } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Region } from 'react-native-maps';
import { useRouter } from 'expo-router';
import { ChevronLeft, HelpCircle, MapPin, Wifi, WifiOff, AlertTriangle } from 'lucide-react-native';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import ConnectivityLayer, { ConnectivityPoint, ConnectivityLevel } from '../components/ConnectivityLayer';
import connectivityService from '../services/ConnectivityService';
import { LinearGradient } from 'expo-linear-gradient';

type LegendItem = {
  level: ConnectivityLevel;
  label: string;
  color: string;
  icon: React.ReactNode;
};

export default function ConnectivityMapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [connectivityData, setConnectivityData] = useState<ConnectivityPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConnectivityLayer, setShowConnectivityLayer] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 28.3949, // Center of Nepal
    longitude: 84.1240,
    latitudeDelta: 3,
    longitudeDelta: 3,
  });

  // Legend data for connectivity levels
  const legendItems: LegendItem[] = [
    { 
      level: 'high', 
      label: 'High Connectivity', 
      color: 'rgba(0, 200, 83, 0.3)',
      icon: <Wifi size={16} color="#00C853" />
    },
    { 
      level: 'medium', 
      label: 'Medium Connectivity', 
      color: 'rgba(255, 193, 7, 0.3)',
      icon: <Wifi size={16} color="#FFC107" />
    },
    { 
      level: 'low', 
      label: 'Low Connectivity', 
      color: 'rgba(255, 87, 34, 0.3)',
      icon: <Wifi size={16} color="#FF5722" />
    },
    { 
      level: 'none', 
      label: 'No Connectivity', 
      color: 'rgba(213, 0, 0, 0.2)',
      icon: <WifiOff size={16} color="#D50000" />
    },
    { 
      level: 'emergency-only', 
      label: 'Emergency Only', 
      color: 'rgba(156, 39, 176, 0.3)',
      icon: <AlertTriangle size={16} color="#9C27B0" />
    },
  ];

  // Load connectivity data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = location.coords;
          setUserLocation({ latitude, longitude });
          
          // Adjust map region to focus on user location
          setMapRegion({
            latitude,
            longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          });
        }
        
        // Load connectivity data
        const data = await connectivityService.getAllConnectivityData();
        setConnectivityData(data);
      } catch (error) {
        console.error('Error loading connectivity data:', error);
        Alert.alert(
          'Error',
          'Failed to load connectivity data. Please try again later.'
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };
  
  const handleInfoPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      'About Connectivity Map',
      'The connectivity map shows network coverage across different regions of Nepal. Areas are color-coded based on connectivity levels, from high (green) to no connectivity (red). Emergency-only points are marked in purple.\n\nThis data is based on user reports and may not be 100% accurate. Always prepare for offline travel in remote areas.',
      [{ text: 'Got it', style: 'default' }]
    );
  };
  
  const handleReportPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!userLocation) {
      Alert.alert(
        'Location Required',
        'Please enable location services to report connectivity status.'
      );
      return;
    }
    
    Alert.alert(
      'Report Connectivity',
      'What is the connectivity level at your current location?',
      [
        { 
          text: 'High', 
          onPress: () => reportConnectivity('high', 'Good connectivity at this location')
        },
        { 
          text: 'Medium', 
          onPress: () => reportConnectivity('medium', 'Moderate connectivity at this location')
        },
        { 
          text: 'Low', 
          onPress: () => reportConnectivity('low', 'Poor connectivity at this location')
        },
        { 
          text: 'None', 
          onPress: () => reportConnectivity('none', 'No connectivity at this location')
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };
  
  const reportConnectivity = async (level: ConnectivityLevel, notes: string) => {
    if (!userLocation) return;
    
    try {
      await connectivityService.reportConnectivity(userLocation, level, notes);
      
      // Refresh connectivity data
      const updatedData = await connectivityService.getAllConnectivityData();
      setConnectivityData(updatedData);
      
      Alert.alert(
        'Thank You!',
        'Your connectivity report has been submitted. This helps other travelers plan their journey.'
      );
    } catch (error) {
      console.error('Error reporting connectivity:', error);
      Alert.alert(
        'Error',
        'Failed to submit your report. Please try again later.'
      );
    }
  };
  
  const handleLayerToggle = (value: boolean) => {
    setShowConnectivityLayer(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  
  const zoomToUserLocation = () => {
    if (!userLocation || !mapRef.current) return;
    
    mapRef.current.animateToRegion({
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }, 1000);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connectivity Map</Text>
        <TouchableOpacity onPress={handleInfoPress} style={styles.infoButton}>
          <HelpCircle size={24} color="#000" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={mapRegion}
          showsUserLocation
          showsMyLocationButton={false}
        >
          <ConnectivityLayer 
            connectivityData={connectivityData} 
            visible={showConnectivityLayer} 
          />
          
          {/* Emergency Points Markers */}
          {connectivityData
            .filter(point => point.level === 'emergency-only' && point.type === 'spot')
            .map(point => {
              if (point.type === 'spot' && !Array.isArray(point.coordinates)) {
                return (
                  <Marker
                    key={point.id}
                    coordinate={{
                      latitude: point.coordinates.latitude,
                      longitude: point.coordinates.longitude
                    }}
                    title="Emergency Communications"
                    description={point.notes}
                  >
                    <View style={styles.emergencyMarker}>
                      <AlertTriangle size={16} color="#FFFFFF" />
                    </View>
                  </Marker>
                );
              }
              return null;
            })
          }
        </MapView>
        
        {/* Controls Overlay */}
        <View style={styles.mapControls}>
          {userLocation && (
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={zoomToUserLocation}
            >
              <MapPin size={24} color="#FF385C" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Map Legend */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>Connectivity Levels</Text>
          {legendItems.map((item) => (
            <View key={item.level} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]}>
                {item.icon}
              </View>
              <Text style={styles.legendText}>{item.label}</Text>
            </View>
          ))}
          
          <View style={styles.layerToggleContainer}>
            <Text style={styles.toggleLabel}>Show Connectivity Overlay</Text>
            <Switch
              value={showConnectivityLayer}
              onValueChange={handleLayerToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={showConnectivityLayer ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>
        </View>
      </View>
      
      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={styles.reportButton}
          onPress={handleReportPress}
        >
          <LinearGradient
            colors={['#FF385C', '#E02954']}
            style={styles.reportButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.reportButtonText}>Report Connectivity</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  backButton: {
    padding: 8,
  },
  infoButton: {
    padding: 8,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    bottom: 180,
    alignItems: 'center',
  },
  locationButton: {
    backgroundColor: '#FFFFFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  legendContainer: {
    position: 'absolute',
    left: 16,
    bottom: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1F2937',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendText: {
    fontSize: 14,
    color: '#4B5563',
  },
  layerToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  toggleLabel: {
    fontSize: 14,
    color: '#4B5563',
  },
  actionBar: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  reportButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  reportButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emergencyMarker: {
    backgroundColor: '#9C27B0',
    padding: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
