import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  Alert,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  TextInput,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ChevronLeft, 
  Map, 
  Download, 
  Trash2, 
  Search, 
  Filter, 
  Mountain, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { routesService, TrekkingRoute } from '../services/RoutesService';
import { connectivityService } from '../services/ConnectivityService';

const { width } = Dimensions.get('window');

export default function OfflineRoutesScreen() {
  const router = useRouter();
  const [routes, setRoutes] = useState<TrekkingRoute[]>([]);
  const [downloadedRoutes, setDownloadedRoutes] = useState<TrekkingRoute[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'explore' | 'downloaded'>('explore');
  const [isConnected, setIsConnected] = useState(true);

  const loadRoutes = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Check connection status
      const connected = await connectivityService.getCurrentConnectivityStatus();
      setIsConnected(connected.isConnected === true); // Convert to boolean
      
      // Load downloaded routes
      const offline = await routesService.getDownloadedRoutes();
      setDownloadedRoutes(offline);
      
      // Load popular routes if connected
      if (connected.isConnected) {
        const popular = await routesService.getPopularRoutes();
        setRoutes(popular);
      } else if (offline.length > 0) {
        // If offline but we have downloaded routes, switch to downloaded tab
        setActiveTab('downloaded');
      }
    } catch (error) {
      console.error('Error loading routes:', error);
      Alert.alert(
        'Error', 
        'Could not load trekking routes. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRoutes();
    setIsRefreshing(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return await loadRoutes();
    }
    
    try {
      setIsLoading(true);
      const results = await routesService.searchRoutes(searchQuery);
      setRoutes(results);
    } catch (error) {
      console.error('Error searching routes:', error);
      Alert.alert('Error', 'Failed to search routes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (route: TrekkingRoute) => {
    if (!isConnected) {
      return Alert.alert(
        'No Connection', 
        'You need an internet connection to download routes.'
      );
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Check if already downloading
    if (route.downloadStatus === 'downloading') {
      return Alert.alert('Download in Progress', 'This route is already being downloaded.');
    }
    
    Alert.alert(
      'Download Route',
      `Download "${route.name}" for offline use? This will use approximately ${route.downloadSize || '10-20'} MB of storage.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: async () => {
            try {
              // Update UI immediately to show download started
              const updatingRoute: TrekkingRoute = { 
                ...route, 
                downloadStatus: 'downloading' as const, 
                downloadProgress: 0 
              };
              
              setRoutes(current => 
                current.map(r => r.id === route.id ? updatingRoute : r)
              );
              
              // Start download
              const result = await routesService.downloadRoute(route.id);
              
              if (result.status === 'completed') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert('Download Complete', `"${route.name}" is now available offline.`);
                
                // Refresh routes lists
                await loadRoutes();
              } else {
                throw new Error(result.error || 'Download failed');
              }
            } catch (error) {
              console.error(`Error downloading route ${route.id}:`, error);
              Alert.alert('Download Failed', `Failed to download "${route.name}". Please try again.`);
              
              // Reset UI
              setRoutes(current => 
                current.map(r => r.id === route.id ? { ...r, downloadStatus: undefined, downloadProgress: undefined } : r)
              );
            }
          }
        }
      ]
    );
  };

  const handleDeleteRoute = async (route: TrekkingRoute) => {
    Alert.alert(
      'Delete Offline Route',
      `Are you sure you want to delete "${route.name}" from your device? You'll need an internet connection to download it again.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await routesService.deleteDownloadedRoute(route.id);
              
              if (success) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                // Update downloaded routes list
                setDownloadedRoutes(current => 
                  current.filter(r => r.id !== route.id)
                );
              } else {
                throw new Error('Failed to delete route');
              }
            } catch (error) {
              console.error(`Error deleting route ${route.id}:`, error);
              Alert.alert('Error', `Failed to delete "${route.name}". Please try again.`);
            }
          }
        }
      ]
    );
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleRoutePress = (route: TrekkingRoute) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to route details
    router.push({
      pathname: '/route-details',
      params: { routeId: route.id }
    });
  };

  const renderRouteItem = ({ item }: { item: TrekkingRoute }) => {
    const isDownloaded = downloadedRoutes.some(r => r.id === item.id);
    const isDownloading = item.downloadStatus === 'downloading';
    
    return (
      <TouchableOpacity
        style={styles.routeCard}
        onPress={() => handleRoutePress(item)}
      >
        <Image
          source={{ 
            uri: item.imageUrls && item.imageUrls.length > 0 
              ? item.imageUrls[0] 
              : 'https://images.unsplash.com/photo-1595059356610-1f2cdc0715df' 
          }}
          style={styles.routeImage}
        />
        
        <View style={styles.routeDetails}>
          <Text style={styles.routeName}>{item.name}</Text>
          
          <View style={styles.routeBadges}>
            <View style={[
              styles.difficultyBadge, 
              {
                backgroundColor: 
                  item.difficulty === 'Easy' ? '#10B981' : 
                  item.difficulty === 'Moderate' ? '#F59E0B' : 
                  item.difficulty === 'Hard' ? '#EF4444' : '#7C3AED'
              }
            ]}>
              <Text style={styles.difficultyText}>{item.difficulty}</Text>
            </View>
            
            {item.permitRequired && (
              <View style={styles.permitBadge}>
                <Text style={styles.permitText}>Permit Required</Text>
              </View>
            )}
          </View>
          
          <View style={styles.routeStats}>
            <View style={styles.routeStat}>
              <Mountain size={14} color="#6B7280" />
              <Text style={styles.routeStatText}>{item.maxAltitudeM}m</Text>
            </View>
            <View style={styles.routeStat}>
              <Map size={14} color="#6B7280" />
              <Text style={styles.routeStatText}>{item.distanceKm} km</Text>
            </View>
            <View style={styles.routeStat}>
              <Clock size={14} color="#6B7280" />
              <Text style={styles.routeStatText}>{item.durationHours} {item.durationHours === 1 ? 'hour' : 'hours'}</Text>
            </View>
          </View>
          
          <Text style={styles.routeRegion}>{item.region}</Text>
        </View>
        
        <View style={styles.routeActions}>
          {isDownloaded ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteRoute(item)}
            >
              <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>
          ) : isDownloading ? (
            <View style={styles.downloadingContainer}>
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text style={styles.downloadingText}>
                {item.downloadProgress ? `${item.downloadProgress}%` : 'Starting...'}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDownload(item)}
              disabled={!isConnected}
            >
              <Download size={20} color={isConnected ? "#3B82F6" : "#9CA3AF"} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (isLoading) return null;
    
    if (activeTab === 'explore' && !isConnected) {
      return (
        <View style={styles.emptyState}>
          <WifiOff size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>No Internet Connection</Text>
          <Text style={styles.emptyStateDescription}>
            You need to be online to explore new trekking routes. Check your connection and try again.
          </Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => setActiveTab('downloaded')}
          >
            <Text style={styles.emptyStateButtonText}>View Downloaded Routes</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (activeTab === 'downloaded' && downloadedRoutes.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Map size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>No Downloaded Routes</Text>
          <Text style={styles.emptyStateDescription}>
            You haven't downloaded any trekking routes yet. Download routes to access them offline during your trek.
          </Text>
          {isConnected && (
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => setActiveTab('explore')}
            >
              <Text style={styles.emptyStateButtonText}>Explore Routes</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    
    if (activeTab === 'explore' && routes.length === 0) {
      return (
        <View style={styles.emptyState}>
          <AlertCircle size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>No Routes Found</Text>
          <Text style={styles.emptyStateDescription}>
            We couldn't find any trekking routes matching your search. Try different keywords or reset your search.
          </Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => {
              setSearchQuery('');
              loadRoutes();
            }}
          >
            <Text style={styles.emptyStateButtonText}>Reset Search</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trekking Routes</Text>
        <View style={styles.connectionStatus}>
          {isConnected ? (
            <Wifi size={18} color="#10B981" />
          ) : (
            <WifiOff size={18} color="#F59E0B" />
          )}
        </View>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search routes by name or region"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                loadRoutes();
              }}
              style={styles.clearSearch}
            >
              <Text style={styles.clearSearchText}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'explore' && styles.activeTab]}
          onPress={() => setActiveTab('explore')}
        >
          <Text style={[styles.tabText, activeTab === 'explore' && styles.activeTabText]}>
            Explore
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'downloaded' && styles.activeTab]}
          onPress={() => setActiveTab('downloaded')}
        >
          <Text style={[styles.tabText, activeTab === 'downloaded' && styles.activeTabText]}>
            Downloaded ({downloadedRoutes.length})
          </Text>
          {downloadedRoutes.length > 0 && (
            <CheckCircle2 size={16} color={activeTab === 'downloaded' ? "#3B82F6" : "#6B7280"} />
          )}
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading trekking routes...</Text>
        </View>
      ) : (
        <FlatList
          data={activeTab === 'explore' ? routes : downloadedRoutes}
          renderItem={renderRouteItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.routesList}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#3B82F6"]}
            />
          }
        />
      )}
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
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Medium',
    color: '#333333',
  },
  backButton: {
    padding: 8,
  },
  connectionStatus: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 8,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
    color: '#333333',
  },
  clearSearch: {
    padding: 6,
  },
  clearSearchText: {
    fontSize: 20,
    color: '#72777A',
    fontFamily: 'DMSans-Bold',
  },
  filterButton: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginRight: 24,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF385C',
  },
  tabText: {
    fontSize: 16,
    fontFamily: 'DMSans-Medium',
    color: '#72777A',
  },
  activeTabText: {
    color: '#FF385C',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#72777A',
    fontFamily: 'DMSans-Regular',
  },
  routesList: {
    padding: 16,
  },
  routeCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  routeImage: {
    width: 120,
    height: 'auto',
    aspectRatio: 2/3,
    backgroundColor: '#F5F5F5',
  },
  routeDetails: {
    flex: 1,
    padding: 12,
  },
  routeName: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: '#333333',
    marginBottom: 4,
  },
  routeBadges: {
    flexDirection: 'row',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 6,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
    color: '#FFFFFF',
  },
  permitBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  permitText: {
    fontSize: 12,
    color: '#555555',
    fontFamily: 'DMSans-Regular',
  },
  routeStats: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 12,
  },
  routeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  routeStatText: {
    fontSize: 14,
    color: '#555555',
    fontFamily: 'DMSans-Regular',
  },
  routeRegion: {
    fontSize: 14,
    color: '#555555',
    fontStyle: 'italic',
    fontFamily: 'DMSans-Regular',
  },
  routeActions: {
    justifyContent: 'center',
    paddingRight: 12,
  },
  actionButton: {
    padding: 8,
  },
  downloadingContainer: {
    alignItems: 'center',
    gap: 4,
  },
  downloadingText: {
    fontSize: 12,
    color: '#FF385C',
    fontFamily: 'DMSans-Medium',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: 300,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'DMSans-Regular',
  },
  emptyStateButton: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontFamily: 'DMSans-Medium',
  },
});
