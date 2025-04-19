import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, StatusBar, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Search, MapPin, Calendar, Users, Coffee, Compass, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useState, useEffect } from 'react';
import dataService, { Destination } from '../../services/DataService';

export default function DiscoverScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Destination[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const [featuredDestinations, setFeaturedDestinations] = useState<Destination[]>([]);
  const [popularTreks, setPopularTreks] = useState<Destination[]>([]);
  const [culturalExperiences, setCulturalExperiences] = useState<Destination[]>([]);
  const [recommendations, setRecommendations] = useState<Destination[]>([]);
  const [localCuisine, setLocalCuisine] = useState<Destination[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize data service when the app first loads
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Force reinitialize data to make sure we have the latest data including cuisine items
        await dataService.reinitializeData();
        await dataService.initialize();
      } catch (err) {
        console.error('Failed to initialize data:', err);
      }
    };
    
    initializeData();
  }, []);

  // Load destinations data on component mount
  useEffect(() => {
    const loadDestinations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get destinations by type
        const destinations = await dataService.getDestinationsByType('destination');
        setFeaturedDestinations(destinations.slice(0, 3));
        
        const treks = await dataService.getDestinationsByType('trek');
        setPopularTreks(treks.slice(0, 3));
        
        const experiences = await dataService.getDestinationsByType('experience');
        setCulturalExperiences(experiences.slice(0, 3));
        
        // Get recommended destinations
        const recommended = await dataService.getRecommendedDestinations(2);
        setRecommendations(recommended);
        
        // Get cuisine data
        const cuisines = await dataService.getDestinationsByType('cuisine');
        setLocalCuisine(cuisines.slice(0, 3));
      } catch (err) {
        console.error('Error loading destinations:', err);
        setError('Failed to load destinations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadDestinations();
  }, []);

  // Handle search
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.length > 2) {
        try {
          const results = await dataService.searchDestinations(searchQuery);
          setSearchResults(results);
          setShowSearchResults(true);
        } catch (err) {
          console.error('Search error:', err);
        }
      } else {
        setShowSearchResults(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleDestinationPress = (destination: Destination) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/destination-details?id=${destination.id}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF385C" />
        <Text style={styles.loadingText}>Loading destinations...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.greeting}>Namaste! 🙏</Text>
        <Text style={styles.title}>Discover Nepal's Hidden Gems</Text>
        <View style={styles.searchBar}>
          <Search size={24} color="#1A1D1E" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
            placeholder="Search destinations, treks, or experiences"
          />
        </View>
      </View>

      {showSearchResults && (
        <View style={styles.searchResultsContainer}>
          <Text style={styles.searchResultsTitle}>Search Results</Text>
          {searchResults.length > 0 ? (
            searchResults.map((result) => (
              <TouchableOpacity
                key={result.id}
                style={styles.searchResultItem}
                onPress={() => handleDestinationPress(result)}
              >
                <Image source={{ uri: result.image }} style={styles.searchResultImage} />
                <View style={styles.searchResultInfo}>
                  <Text style={styles.searchResultName}>{result.name}</Text>
                  <Text style={styles.searchResultDescription} numberOfLines={2}>
                    {result.description}
                  </Text>
                </View>
                <ChevronRight size={20} color="#6B7280" />
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noResultsText}>No results found for "{searchQuery}"</Text>
          )}
        </View>
      )}

      {!showSearchResults && (
        <>
          <View style={styles.quickLinksContainer}>
            <TouchableOpacity 
              style={styles.quickLinkItem}
              onPress={() => {
                router.push('/transportation');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={styles.quickLinkIconContainer}>
                <Compass size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.quickLinkText}>Explore</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickLinkItem}
              onPress={() => {
                router.push('/itinerary-planner');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={[styles.quickLinkIconContainer, {backgroundColor: '#4C1D95'}]}>
                <Calendar size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.quickLinkText}>Itinerary</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickLinkItem}
              onPress={() => {
                router.push('/festivals');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={[styles.quickLinkIconContainer, {backgroundColor: '#BE185D'}]}>
                <Users size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.quickLinkText}>Festivals</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickLinkItem}
              onPress={() => {
                router.push('/cuisine-guide');
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={[styles.quickLinkIconContainer, {backgroundColor: '#B45309'}]}>
                <Coffee size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.quickLinkText}>Cuisine</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Destinations</Text>
              <TouchableOpacity 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/see-all?type=destination&title=${encodeURIComponent("Featured Destinations")}`);
                }}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {featuredDestinations.map((destination) => (
                <TouchableOpacity
                key={destination.id}
                style={styles.destinationCard}
                onPress={() => handleDestinationPress(destination)}>
                  <Image
                    source={{ uri: destination.image }}
                    style={styles.destinationImage}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gradient}
                  >
                    <Text style={styles.destinationName}>{destination.name}</Text>
                    <Text style={styles.destinationDescription}>
                      {destination.description}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Popular Treks</Text>
              <TouchableOpacity 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/see-all?type=trek&title=${encodeURIComponent("Popular Treks")}`);
                }}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {popularTreks.map((trek) => (
                <TouchableOpacity 
                key={trek.id} 
                style={styles.destinationCard}
                onPress={() => handleDestinationPress(trek)}>
                  <Image
                    source={{ uri: trek.image }}
                    style={styles.destinationImage}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gradient}
                  >
                    <Text style={styles.destinationName}>{trek.name}</Text>
                    <Text style={styles.destinationDescription}>
                      {trek.description}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Cultural Experiences</Text>
              <TouchableOpacity 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/see-all?type=experience&title=${encodeURIComponent("Cultural Experiences")}`);
                }}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {culturalExperiences.map((experience) => (
                <TouchableOpacity 
                key={experience.id} 
                style={styles.destinationCard}
                onPress={() => handleDestinationPress(experience)}>
                  <Image
                    source={{ uri: experience.image }}
                    style={styles.destinationImage}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gradient}
                  >
                    <Text style={styles.destinationName}>{experience.name}</Text>
                    <Text style={styles.destinationDescription}>
                      {experience.description}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommended For You</Text>
              <TouchableOpacity 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/see-all?type=recommended&title=${encodeURIComponent("Recommended For You")}`);
                }}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recommendations.map((recommendation) => (
                <TouchableOpacity
                  key={recommendation.id}
                  style={styles.destinationCard}
                  onPress={() => handleDestinationPress(recommendation)}>
                  <Image
                    source={{ uri: recommendation.image }}
                    style={styles.destinationImage}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gradient}
                  >
                    <Text style={styles.destinationName}>{recommendation.name}</Text>
                    <View style={styles.recommendationTagContainer}>
                      <Text style={styles.recommendationReason}>
                        {recommendation.region || 'Trending'}
                      </Text>
                    </View>
                    <Text style={styles.destinationDescription}>{recommendation.description}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={[styles.featuredSection, styles.lastSection]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Local Cuisine</Text>
              <TouchableOpacity 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/see-all?type=cuisine&title=${encodeURIComponent("Local Cuisine")}`);
                }}
              >
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {localCuisine.map((cuisine) => (
                <TouchableOpacity 
                key={cuisine.id} 
                style={styles.destinationCard}
                onPress={() => handleDestinationPress(cuisine)}>
                  <Image
                    source={{ uri: cuisine.image }}
                    style={styles.destinationImage}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gradient}
                  >
                    <Text style={styles.destinationName}>{cuisine.name}</Text>
                    <Text style={styles.destinationDescription}>
                      {cuisine.description}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingTop: 100,
  },
  loadingText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#4B5563',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 24,
    paddingTop: 100,
  },
  errorText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: '#FF385C',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  greeting: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'DMSans-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    lineHeight: 38,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: '#1A1D1E',
    marginLeft: 12,
  },
  searchResultsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchResultsTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#1A1D1E',
    marginBottom: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchResultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#1A1D1E',
    marginBottom: 4,
  },
  searchResultDescription: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  noResultsText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    padding: 24,
  },
  quickLinksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  quickLinkItem: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLinkIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF385C',
  },
  quickLinkText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#1A1D1E',
    marginTop: 8,
  },
  featuredSection: {
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 24,
    color: '#1A1D1E',
    letterSpacing: 0.5,
  },
  seeAllText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#FF385C',
  },
  destinationCard: {
    width: 300,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  destinationImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  destinationName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  destinationDescription: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  recommendationTagContainer: {
    marginTop: 6,
    marginBottom: 4,
  },
  recommendationReason: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: '#FF385C',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  lastSection: {
    marginBottom: 90,
  }
});