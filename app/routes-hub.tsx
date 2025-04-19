import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Image, 
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Map, Mountain, Search, Filter, Star, Smile, Download } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { routesService, TrekkingRoute } from '../services/RoutesService';
import { connectivityService } from '../services/ConnectivityService';

const { width } = Dimensions.get('window');

interface RouteCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  routes: TrekkingRoute[];
  loading: boolean;
  error?: string;
}

export default function RoutesHubScreen() {
  const router = useRouter();
  const [routeCategories, setRouteCategories] = useState<RouteCategory[]>([
    {
      id: 'popular',
      title: 'Popular Routes',
      icon: 'Map',
      color: '#FF385C',
      routes: [],
      loading: true
    },
    {
      id: 'downloaded',
      title: 'Your Downloaded Routes',
      icon: 'Download',
      color: '#10B981',
      routes: [],
      loading: true
    },
    {
      id: 'recommended',
      title: 'Recommended For You',
      icon: 'Star',
      color: '#F59E0B',
      routes: [],
      loading: true
    },
    {
      id: 'beginner',
      title: 'Beginner Friendly',
      icon: 'Smile',
      color: '#3B82F6',
      routes: [],
      loading: true
    }
  ]);
  const [isConnected, setIsConnected] = useState(true);

  const loadRouteData = useCallback(async () => {
    try {
      // Check connection status
      const connected = await connectivityService.getCurrentConnectivityStatus();
      setIsConnected(connected.isConnected === true);

      // Update categories with actual routes
      const categories = [...routeCategories];
      
      // Load downloaded routes for all cases
      const downloadedRoutes = await routesService.getDownloadedRoutes();
      const downloadedCategory = categories.find(c => c.id === 'downloaded');
      if (downloadedCategory) {
        downloadedCategory.routes = downloadedRoutes;
        downloadedCategory.loading = false;
      }
      
      if (connected.isConnected) {
        // Load popular routes
        const popularRoutes = await routesService.getPopularRoutes();
        const popularCategory = categories.find(c => c.id === 'popular');
        if (popularCategory) {
          popularCategory.routes = popularRoutes;
          popularCategory.loading = false;
        }
        
        // Get recommended routes
        const recommendedRoutes = await routesService.getRecommendedRoutes();
        const recommendedCategory = categories.find(c => c.id === 'recommended');
        if (recommendedCategory) {
          recommendedCategory.routes = recommendedRoutes;
          recommendedCategory.loading = false;
        }
        
        // Get beginner routes
        const beginnerRoutes = await routesService.getBeginnerRoutes();
        const beginnerCategory = categories.find(c => c.id === 'beginner');
        if (beginnerCategory) {
          beginnerCategory.routes = beginnerRoutes;
          beginnerCategory.loading = false;
        }
      } else {
        // If offline, mark online sections as failed
        categories.forEach(cat => {
          if (cat.id !== 'downloaded') {
            cat.loading = false;
            cat.error = 'No internet connection';
          }
        });
      }
      
      setRouteCategories(categories);
    } catch (error) {
      console.error('Error loading route categories:', error);
    }
  }, [routeCategories]);

  useEffect(() => {
    loadRouteData();
  }, [loadRouteData]);

  const handleRoutePress = (route: TrekkingRoute) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/route-details',
      params: { routeId: route.id }
    });
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleViewAllPress = (categoryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (categoryId === 'downloaded') {
      router.push({
        pathname: '/offline-routes',
        params: { activeTab: 'downloaded' }
      });
    } else {
      router.push({
        pathname: '/offline-routes',
        params: { categoryFilter: categoryId }
      });
    }
  };

  const renderRouteItem = ({ item }: { item: TrekkingRoute }) => {
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
        
        <View style={styles.routeBadge}>
          <Text style={styles.routeBadgeText}>{item.difficulty}</Text>
        </View>
        
        <View style={styles.routeDetails}>
          <Text style={styles.routeName}>{item.name}</Text>
          <Text style={styles.routeRegion}>{item.region}</Text>
          
          <View style={styles.routeStats}>
            <Text style={styles.routeStat}>
              {item.distanceKm} km • {item.durationHours} hrs
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategorySection = (category: RouteCategory, index: number) => {
    return (
      <View key={category.id} style={styles.categorySection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{category.title}</Text>
          <TouchableOpacity onPress={() => handleViewAllPress(category.id)}>
            <Text style={styles.viewAllButton}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {category.loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FF385C" />
            <Text style={styles.loadingText}>Loading routes...</Text>
          </View>
        ) : category.error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{category.error}</Text>
          </View>
        ) : category.routes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {category.id === 'downloaded' 
                ? 'No downloaded routes yet. Download routes to view them offline.'
                : 'No routes available in this category.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={category.routes.slice(0, 5)}
            renderItem={renderRouteItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.routesList}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ChevronLeft size={24} color="#1A1D1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trekking Routes</Text>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => router.push('/route-search' as any)}
        >
          <Search size={24} color="#1A1D1E" />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={routeCategories}
        renderItem={({ item, index }) => renderCategorySection(item, index)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
      
      <View style={styles.footerButtons}>
        <TouchableOpacity 
          style={[styles.footerButton, styles.primaryButton]}
          onPress={() => router.push('/offline-routes' as any)}
        >
          <Map size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Browse All Routes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.footerButton, styles.secondaryButton]}
          onPress={() => router.push('/altitude-monitor' as any)}
        >
          <Mountain size={20} color="#FF385C" />
          <Text style={styles.secondaryButtonText}>Altitude Monitor</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1D1E',
  },
  searchButton: {
    padding: 8,
  },
  content: {
    padding: 16,
    paddingBottom: 100, // Add padding for footer buttons
  },
  categorySection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1D1E',
  },
  viewAllButton: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF385C',
  },
  routesList: {
    paddingVertical: 8,
  },
  routeCard: {
    width: width * 0.65,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeImage: {
    height: 120,
    width: '100%',
    resizeMode: 'cover',
  },
  routeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  routeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  routeDetails: {
    padding: 12,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D1E',
    marginBottom: 4,
  },
  routeRegion: {
    fontSize: 14,
    color: '#72777A',
    marginBottom: 8,
  },
  routeStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeStat: {
    fontSize: 13,
    color: '#6B7280',
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loadingText: {
    fontSize: 14,
    color: '#72777A',
    marginLeft: 8,
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#72777A',
    textAlign: 'center',
  },
  footerButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#FF385C',
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: '#F7F8FA',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#1A1D1E',
    fontWeight: '600',
    marginLeft: 8,
  },
});
