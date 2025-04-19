import { View, StyleSheet, Platform, Text, TouchableOpacity, Alert, ActivityIndicator, StatusBar, Dimensions, Modal, Image, useWindowDimensions, SafeAreaView } from 'react-native';
import { Compass, Navigation, MapPin, LocateFixed, Layers, ArrowLeft, Map, Satellite, Mountain, Route } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

import MapView, { Marker, Callout, PROVIDER_GOOGLE, Region, MapPressEvent, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import dataService, { Destination } from '../../services/DataService';
import MapMarker from '../../components/MapMarker';
import MapFilters from '../../components/MapFilters';
import { WebView } from 'react-native-webview';

// Define transportation locations
const TRANSPORTATION_HUBS = [
  {
    id: 'transport-1',
    name: 'Tribhuvan International Airport',
    description: 'Main international airport in Kathmandu',
    type: 'transportation',
    coordinate: { latitude: 27.6982, longitude: 85.3591 }
  },
  {
    id: 'transport-2',
    name: 'Kathmandu Tourist Bus Station',
    description: 'Main bus terminal for tourist routes',
    type: 'transportation',
    coordinate: { latitude: 27.7041, longitude: 85.3115 }
  },
  {
    id: 'transport-3',
    name: 'Pokhara Airport',
    description: 'Domestic airport in Pokhara',
    type: 'transportation',
    coordinate: { latitude: 28.2000, longitude: 83.9818 }
  }
];

// Define festivals and events
const FESTIVALS_EVENTS = [
  {
    id: 'festival-1',
    name: 'Dashain Festival',
    description: 'The biggest festival in Nepal celebrating victory of good over evil',
    type: 'festival',
    coordinate: { latitude: 27.7030, longitude: 85.3206 }
  },
  {
    id: 'festival-2',
    name: 'Tihar Festival',
    description: 'Festival of lights celebrating brother-sister relationships',
    type: 'festival',
    coordinate: { latitude: 27.6857, longitude: 85.3078 }
  },
  {
    id: 'festival-3',
    name: 'Indra Jatra',
    description: 'Street festival celebrating the deity Indra',
    type: 'festival',
    coordinate: { latitude: 27.7041, longitude: 85.3105 }
  }
];

// Define map types
const MAP_TYPES = [
  { id: 'standard', label: 'Standard', icon: Map, color: '#3B82F6' },
  { id: 'satellite', label: 'Satellite', icon: Satellite, color: '#8B5CF6' },
  { id: 'terrain', label: 'Terrain', icon: Mountain, color: '#10B981' },
  { id: 'hybrid', label: 'Hybrid', icon: Layers, color: '#F59E0B' },
];

// Nepal's default center coordinates
const NEPAL_CENTER = {
  latitude: 28.3949,
  longitude: 84.1240,
  latitudeDelta: 4,
  longitudeDelta: 4
};

export default function MapScreen() {
  // Screen dimensions
  const { width, height } = useWindowDimensions();
  const isTablet = width > 768;
  const isLargePhone = width >= 414 && width < 768;
  const isSmallPhone = width < 414;
  
  // Adjust size and spacing based on screen size
  const iconSize = isTablet ? 28 : (isLargePhone ? 24 : 20);
  const buttonSize = isTablet ? 56 : (isLargePhone ? 48 : 40);
  const buttonSpacing = isTablet ? 12 : (isLargePhone ? 8 : 6);
  const calloutWidth = isTablet ? 300 : (isLargePhone ? 220 : 180);
  const textSizes = {
    title: isTablet ? 18 : (isLargePhone ? 16 : 14),
    description: isTablet ? 16 : (isLargePhone ? 14 : 12),
    action: isTablet ? 16 : (isLargePhone ? 14 : 12),
    button: isTablet ? 14 : (isLargePhone ? 12 : 10),
  };

  // Map state
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(NEPAL_CENTER);
  const [currentPosition, setCurrentPosition] = useState<{latitude: number, longitude: number} | null>(null);
  const [headingAngle, setHeadingAngle] = useState(0);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapType, setMapType] = useState<'standard' | 'satellite' | 'terrain' | 'hybrid'>('standard');
  const [showMapTypeModal, setShowMapTypeModal] = useState(false);
  
  // Street View state
  const [showStreetView, setShowStreetView] = useState(false);
  const [streetViewLocation, setStreetViewLocation] = useState<{lat: number, lng: number} | null>(null);
  
  // Routing state
  const [routeStart, setRouteStart] = useState<{latitude: number, longitude: number} | null>(null);
  const [routeEnd, setRouteEnd] = useState<{latitude: number, longitude: number} | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{latitude: number, longitude: number}[]>([]);
  const [routeDistance, setRouteDistance] = useState<string | null>(null);
  const [routeDuration, setRouteDuration] = useState<string | null>(null);
  const [isRoutingMode, setIsRoutingMode] = useState(false);
  
  // Data and filters
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>(['destination', 'trek', 'experience']);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  
  // Location permissions and current location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Location permission denied');
          // Continue with default location
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        
        const userPosition = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        };
        
        setCurrentPosition(userPosition);
        
        // If we're in or near Nepal, zoom to user location, otherwise show all of Nepal
        const isNearNepal = 
          userPosition.latitude > 26 && userPosition.latitude < 31 &&
          userPosition.longitude > 80 && userPosition.longitude < 89;
          
        if (isNearNepal) {
          setRegion({
            ...userPosition,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1
          });
        }
      } catch (err) {
        console.error('Error getting location:', err);
        // Continue with default location
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  
  // Load destinations
  useEffect(() => {
    const loadDestinations = async () => {
      try {
        const allDestinations = await dataService.getAllDestinations();
        setDestinations(allDestinations);
      } catch (err) {
        console.error('Error loading map destinations:', err);
        setError('Failed to load destinations');
      }
    };
    
    loadDestinations();
  }, []);
  
  // Handle filter changes
  const handleFilterChange = (filterId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilters(prev => {
      if (prev.includes(filterId)) {
        return prev.filter(id => id !== filterId);
      } else {
        return [...prev, filterId];
      }
    });
  };
  
  // Filter markers based on active filters
  const getFilteredMarkers = () => {
    const filteredDestinations = destinations.filter(dest => 
      activeFilters.includes(dest.type)
    );
    
    const transportation = activeFilters.includes('transportation') ? TRANSPORTATION_HUBS : [];
    const festivals = activeFilters.includes('festival') ? FESTIVALS_EVENTS : [];
    
    return [...filteredDestinations, ...transportation, ...festivals];
  };
  
  // Navigate to destination details
  const handleMarkerPress = (id: string) => {
    setSelectedMarker(id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };
  
  const handleCalloutPress = (id: string) => {
    // For destinations in our data service
    const destination = destinations.find(dest => dest.id === id);
    if (destination) {
      router.push(`/destination-details?id=${id}`);
      return;
    }
    
    // For transportation and festivals, we could implement separate detail pages later
    if (id.startsWith('transport-')) {
      router.push('/transportation');
    } else if (id.startsWith('festival-')) {
      router.push('/festivals');
    }
  };
  
  // Center map on user
  const centerOnUser = () => {
    if (!currentPosition || !mapRef.current) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    mapRef.current.animateToRegion({
      ...currentPosition,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01
    }, 1000);
  };
  
  // Zoom out to see all Nepal
  const showAllNepal = () => {
    if (!mapRef.current) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    mapRef.current.animateToRegion(NEPAL_CENTER, 1000);
  };
  
  // Handle map rotation (compass)
  const rotateMap = () => {
    if (!mapRef.current) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (headingAngle !== 0) {
      // Reset to north
      setHeadingAngle(0);
      mapRef.current.animateCamera({
        heading: 0
      }, { duration: 500 });
    } else {
      // Rotate 45 degrees
      const newHeading = 45;
      setHeadingAngle(newHeading);
      mapRef.current.animateCamera({
        heading: newHeading
      }, { duration: 500 });
    }
  };
  
  // Toggle map type modal
  const toggleMapTypeModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowMapTypeModal(!showMapTypeModal);
  };
  
  // Change map type
  const changeMapType = (type: 'standard' | 'satellite' | 'terrain' | 'hybrid') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMapType(type);
    setShowMapTypeModal(false);
  };
  
  // Activate street view
  const activateStreetView = (location: {latitude: number, longitude: number}) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStreetViewLocation({lat: location.latitude, lng: location.longitude});
    setShowStreetView(true);
  };
  
  // Toggle routing mode
  const toggleRoutingMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRoutingMode(!isRoutingMode);
    
    // Reset routing data when exiting routing mode
    if (isRoutingMode) {
      setRouteStart(null);
      setRouteEnd(null);
      setRouteCoordinates([]);
      setRouteDistance(null);
      setRouteDuration(null);
    } else {
      Alert.alert(
        "Routing Mode",
        "Tap on two locations to create a route. First tap sets the starting point, second tap sets the destination.",
        [{ text: "OK" }]
      );
    }
  };
  
  // Handle map press for routing
  const handleMapPress = (e: MapPressEvent) => {
    if (isRoutingMode) {
      const coordinate = e.nativeEvent.coordinate;
      
      if (!routeStart) {
        // First tap sets start point
        setRouteStart(coordinate);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else if (!routeEnd) {
        // Second tap sets end point
        setRouteEnd(coordinate);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        
        // Calculate route
        calculateRoute(routeStart, coordinate);
      } else {
        // Reset and start over
        setRouteStart(coordinate);
        setRouteEnd(null);
        setRouteCoordinates([]);
        setRouteDistance(null);
        setRouteDuration(null);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } else {
      // Regular map click (deselect marker)
      setSelectedMarker(null);
    }
  };
  
  // Calculate route between two points
  const calculateRoute = async (start: {latitude: number, longitude: number}, end: {latitude: number, longitude: number}) => {
    try {
      // Instead of using Google Directions API which requires an API key,
      // we'll create a simple direct line route between points
      
      // Create a straight line path between start and end
      // For a more realistic route, we'll add some intermediate points
      const directPath = [
        start,
        // Add some intermediate points to make the route look more natural
        {
          latitude: (start.latitude * 0.7) + (end.latitude * 0.3),
          longitude: (start.longitude * 0.7) + (end.longitude * 0.3)
        },
        {
          latitude: (start.latitude * 0.5) + (end.latitude * 0.5),
          longitude: (start.longitude * 0.5) + (end.longitude * 0.5)
        },
        {
          latitude: (start.latitude * 0.3) + (end.latitude * 0.7),
          longitude: (start.longitude * 0.3) + (end.longitude * 0.7)
        },
        end
      ];
      
      setRouteCoordinates(directPath);
      
      // Calculate approximate distance and duration
      const distance = calculateDistance(start, end);
      const distanceText = distance < 1 ? 
        `${Math.round(distance * 1000)} m` : 
        `${distance.toFixed(1)} km`;
      
      // Rough estimate of travel time (assuming 30 km/h average speed in Nepal)
      const durationHours = distance / 30;
      let durationText = '';
      
      if (durationHours < 1/60) {
        // Less than a minute
        durationText = 'Less than a minute';
      } else if (durationHours < 1) {
        // Minutes
        const minutes = Math.round(durationHours * 60);
        durationText = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
      } else {
        // Hours and minutes
        const hours = Math.floor(durationHours);
        const minutes = Math.round((durationHours - hours) * 60);
        durationText = `${hours} hour${hours !== 1 ? 's' : ''}${minutes > 0 ? ` ${minutes} minute${minutes !== 1 ? 's' : ''}` : ''}`;
      }
      
      setRouteDistance(distanceText);
      setRouteDuration(durationText);
      
      // Fit map to show the entire route
      if (mapRef.current) {
        mapRef.current.fitToCoordinates(directPath, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true
        });
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      Alert.alert("Route Error", "Could not calculate route. Please try again.");
      setRouteEnd(null);
    }
  };
  
  // Calculate distance between two coordinates using the Haversine formula
  const calculateDistance = (start: {latitude: number, longitude: number}, end: {latitude: number, longitude: number}): number => {
    const R = 6371; // Earth's radius in km
    const dLat = toRadians(end.latitude - start.latitude);
    const dLon = toRadians(end.longitude - start.longitude);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRadians(start.latitude)) * Math.cos(toRadians(end.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    return distance;
  };
  
  // Convert degrees to radians
  const toRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
  };
  
  const filteredMarkers = getFilteredMarkers();
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'} />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={isTablet ? 'large' : 'small'} color="#FF385C" />
          <Text style={[styles.loadingText, { fontSize: textSizes.description }]}>Loading map...</Text>
        </View>
      ) : (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={region}
            showsCompass={false}
            rotateEnabled={true}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsScale={true}
            showsBuildings={true}
            showsTraffic={false}
            showsIndoors={true}
            zoomEnabled={true}
            pitchEnabled={true}
            onMapReady={() => setIsMapReady(true)}
            onPress={handleMapPress}
            mapType={mapType}
          >
            {filteredMarkers.map((marker) => (
              <Marker
                key={marker.id}
                coordinate={
                  'coordinate' in marker 
                    ? marker.coordinate 
                    : {
                        // For our data model, use hardcoded example coordinates until we add real data
                        latitude: 27.7 + Math.random() * 0.1, 
                        longitude: 85.3 + Math.random() * 0.1
                      }
                }
                tracksViewChanges={false}
                onPress={() => {
                  if (isRoutingMode) {
                    // In routing mode, markers set route points
                    const coord = 'coordinate' in marker ? marker.coordinate : {
                      latitude: 27.7 + Math.random() * 0.1, 
                      longitude: 85.3 + Math.random() * 0.1
                    };
                    
                    if (!routeStart) {
                      setRouteStart(coord);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    } else if (!routeEnd) {
                      setRouteEnd(coord);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      calculateRoute(routeStart, coord);
                    }
                  } else {
                    // Normal mode, select marker
                    handleMarkerPress(marker.id);
                  }
                }}
              >
                <MapMarker 
                  type={marker.type as any}
                  selected={selectedMarker === marker.id}
                />
                <Callout 
                  tooltip={false} 
                  onPress={() => {
                    if (!isRoutingMode) {
                      handleCalloutPress(marker.id);
                    }
                  }}
                  style={{ width: calloutWidth }}
                >
                  <View style={styles.callout}>
                    <Text style={[styles.calloutTitle, { fontSize: textSizes.title }]}>{marker.name}</Text>
                    <Text style={[styles.calloutDescription, { fontSize: textSizes.description }]}>{marker.description}</Text>
                    
                    {!isRoutingMode && (
                      <Text style={[styles.calloutAction, { fontSize: textSizes.action }]}>Tap to view details</Text>
                    )}
                    
                    {!isRoutingMode && (
                      <View style={styles.calloutButtons}>
                        <TouchableOpacity 
                          style={styles.calloutButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            const coord = 'coordinate' in marker ? marker.coordinate : {
                              latitude: 27.7 + Math.random() * 0.1, 
                              longitude: 85.3 + Math.random() * 0.1
                            };
                            activateStreetView(coord);
                          }}
                        >
                          <Text style={[styles.calloutButtonText, { fontSize: textSizes.button }]}>360° View</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </Callout>
              </Marker>
            ))}
            
            {/* Show start marker for routing */}
            {routeStart && (
              <Marker
                coordinate={routeStart}
                pinColor="green"
                title="Start"
                description="Route starting point"
              />
            )}
            
            {/* Show end marker for routing */}
            {routeEnd && (
              <Marker
                coordinate={routeEnd}
                pinColor="red"
                title="Destination"
                description="Route destination"
              />
            )}
            
            {/* Show route line */}
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeWidth={4}
                strokeColor="#FF385C"
              />
            )}
          </MapView>

          {/* Map controls */}
          <View style={[
            styles.controls, 
            Platform.OS === 'ios' ? { top: isTablet ? 60 : 50 } : { top: 16 }
          ]}>
            <TouchableOpacity 
              style={[styles.controlButton, { width: buttonSize, height: buttonSize }]}
              onPress={centerOnUser}
              disabled={!currentPosition}
            >
              <LocateFixed size={iconSize} color={currentPosition ? "#FF385C" : "#9CA3AF"} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, { width: buttonSize, height: buttonSize, marginTop: buttonSpacing }]}
              onPress={rotateMap}
            >
              <Compass 
                size={iconSize} 
                color="#FF385C" 
                style={{ transform: [{ rotate: `${headingAngle}deg` }] }} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, { width: buttonSize, height: buttonSize, marginTop: buttonSpacing }]}
              onPress={toggleMapTypeModal}
            >
              {mapType === 'standard' && <Map size={iconSize} color="#FF385C" />}
              {mapType === 'satellite' && <Satellite size={iconSize} color="#FF385C" />}
              {mapType === 'terrain' && <Mountain size={iconSize} color="#FF385C" />}
              {mapType === 'hybrid' && <Layers size={iconSize} color="#FF385C" />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.controlButton, 
                isRoutingMode ? styles.activeControlButton : null,
                { width: buttonSize, height: buttonSize, marginTop: buttonSpacing }
              ]}
              onPress={toggleRoutingMode}
            >
              <Route size={iconSize} color={isRoutingMode ? "#FFFFFF" : "#FF385C"} />
            </TouchableOpacity>
          </View>
          
          {/* Route information */}
          {routeDistance && routeDuration && (
            <View style={[
              styles.routeInfo, 
              { 
                top: Platform.OS === 'ios' ? (isTablet ? 60 : 50) : 16,
                maxWidth: isTablet ? 300 : (isLargePhone ? 220 : 180),
                padding: isTablet ? 16 : (isLargePhone ? 12 : 8),
              }
            ]}>
              <Text style={[styles.routeInfoTitle, { fontSize: textSizes.title }]}>Route Information</Text>
              <Text style={[styles.routeInfoText, { fontSize: textSizes.description }]}>Distance: {routeDistance}</Text>
              <Text style={[styles.routeInfoText, { fontSize: textSizes.description }]}>Duration: {routeDuration}</Text>
              <TouchableOpacity
                style={styles.resetRouteButton}
                onPress={() => {
                  setRouteStart(null);
                  setRouteEnd(null);
                  setRouteCoordinates([]);
                  setRouteDistance(null);
                  setRouteDuration(null);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={[styles.resetRouteButtonText, { fontSize: textSizes.button }]}>Reset Route</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Map type modal */}
          <Modal
            visible={showMapTypeModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowMapTypeModal(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowMapTypeModal(false)}
            >
              <View style={[
                styles.mapTypeContainer, 
                { 
                  width: isTablet ? '60%' : '80%',
                  maxWidth: isTablet ? 400 : 300,
                  padding: isTablet ? 24 : 16,
                }
              ]}>
                {MAP_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.mapTypeButton,
                      mapType === type.id ? { backgroundColor: type.color } : null,
                      { padding: isTablet ? 16 : 12 }
                    ]}
                    onPress={() => changeMapType(type.id as any)}
                  >
                    <type.icon 
                      size={iconSize} 
                      color={mapType === type.id ? "#FFFFFF" : type.color} 
                    />
                    <Text 
                      style={[
                        styles.mapTypeText,
                        mapType === type.id ? { color: "#FFFFFF" } : { color: "#1A1D1E" },
                        { fontSize: textSizes.title, marginLeft: isTablet ? 16 : 12 }
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableOpacity>
          </Modal>
          
          {/* 360 Street View Modal */}
          <Modal
            visible={showStreetView}
            transparent={false}
            animationType="slide"
            onRequestClose={() => setShowStreetView(false)}
          >
            <View style={styles.streetViewContainer}>
              <TouchableOpacity 
                style={[
                  styles.closeButton,
                  { 
                    top: Platform.OS === 'ios' ? (isTablet ? 60 : 50) : 16,
                    paddingVertical: isTablet ? 12 : 8,
                    paddingHorizontal: isTablet ? 16 : 12,
                  }
                ]}
                onPress={() => setShowStreetView(false)}
              >
                <ArrowLeft size={iconSize} color="#FFFFFF" />
                <Text style={[
                  styles.closeButtonText, 
                  { 
                    fontSize: textSizes.description,
                    marginLeft: isTablet ? 12 : 8
                  }
                ]}>Back to Map</Text>
              </TouchableOpacity>
              
              {streetViewLocation && (
                <WebView
                  style={styles.streetViewWebView}
                  source={{
                    uri: `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${streetViewLocation.lat},${streetViewLocation.lng}&heading=0&pitch=0&fov=80`
                  }}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                />
              )}
            </View>
          </Modal>
          
          {/* Filter buttons */}
          <View style={[
            styles.filterContainer,
            { 
              bottom: Platform.OS === 'ios' ? 
                (isTablet ? 40 : (isLargePhone ? 30 : 20)) : 
                (isTablet ? 30 : 20)
            }
          ]}>
            <MapFilters 
              activeFilters={activeFilters}
              onFilterChange={handleFilterChange}
              screenWidth={width}
              isTablet={isTablet}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F9FAFB',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontFamily: 'DMSans-Medium',
    color: '#4B5563',
    marginTop: 16,
  },
  controls: {
    position: 'absolute',
    right: 16,
    gap: 8,
    zIndex: 10,
  },
  controlButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  activeControlButton: {
    backgroundColor: '#FF385C',
  },
  callout: {
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  calloutTitle: {
    fontFamily: 'DMSans-Bold',
    color: '#1A1D1E',
    marginBottom: 4,
  },
  calloutDescription: {
    fontFamily: 'DMSans-Regular',
    color: '#72777A',
    marginBottom: 8,
  },
  calloutAction: {
    fontFamily: 'DMSans-Medium',
    color: '#FF385C',
    marginBottom: 8,
  },
  calloutButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  calloutButton: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  calloutButtonText: {
    fontFamily: 'DMSans-Medium',
    color: '#4F46E5',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapTypeContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
  },
  mapTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 8,
  },
  mapTypeText: {
    fontFamily: 'DMSans-Medium',
  },
  streetViewContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    left: 16,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  closeButtonText: {
    fontFamily: 'DMSans-Medium',
    color: '#FFFFFF',
  },
  streetViewWebView: {
    flex: 1,
  },
  routeInfo: {
    position: 'absolute',
    left: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    ...Platform.select({
      ios: {
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  routeInfoTitle: {
    fontFamily: 'DMSans-Bold',
    color: '#1A1D1E',
    marginBottom: 8,
  },
  routeInfoText: {
    fontFamily: 'DMSans-Regular',
    color: '#4B5563',
    marginBottom: 4,
  },
  resetRouteButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  resetRouteButtonText: {
    fontFamily: 'DMSans-Medium',
    color: '#B91C1C',
  },
  filterContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 5,
  },
});