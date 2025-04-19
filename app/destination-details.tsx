import { View, Text, StyleSheet, ScrollView, Image, Dimensions, TouchableOpacity, ActivityIndicator, SafeAreaView, useWindowDimensions, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { weatherService } from '../services/WeatherService';
import dataService, { Destination } from '../services/DataService';
import { ChevronLeft, MapPin, Star, Calendar, Share2, Bookmark, Clock, ArrowRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function DestinationDetails() {
  const { id } = useLocalSearchParams();
  const { width, height } = useWindowDimensions();
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<{ temperature: number; condition: string; icon: string; humidity: number; windSpeed: number } | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const imageHeight = height * 0.4; // 40% of screen height
  const contentPadding = width * 0.06; // 6% of screen width for padding, minimum 16px
  const fontSize = {
    small: Math.max(12, width * 0.03),
    medium: Math.max(14, width * 0.035),
    large: Math.max(16, width * 0.04),
    xlarge: Math.max(20, width * 0.05),
    xxlarge: Math.max(24, width * 0.06),
  };

  useEffect(() => {
    const fetchDestination = async () => {
      setLoading(true);
      try {
        if (!id) {
          setError('No destination ID provided');
          setLoading(false);
          return;
        }
        
        const destData = await dataService.getDestinationById(id.toString());
        if (!destData) {
          setError('Destination not found');
          setLoading(false);
          return;
        }
        
        setDestination(destData);
        setError(null);
      } catch (err) {
        setError('Failed to load destination');
        console.error('Error fetching destination:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDestination();
  }, [id]);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!destination) return;
      
      // Skip weather fetching for cuisine items
      if (destination.type === 'cuisine') {
        setWeather(null);
        return;
      }
      
      try {
        setWeatherError(null);
        // Format city name to handle special characters and spaces
        const formattedCity = destination.name
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        const weatherData = await weatherService.getWeather(formattedCity);
        setWeather(weatherData);
      } catch (error) {
        setWeather(null);
        setWeatherError(error instanceof Error ? error.message : 'Failed to fetch weather data');
        console.error('Error fetching weather:', error);
      }
    };
    
    if (destination) {
      fetchWeather();
    }
  }, [destination]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF385C" />
        <Text style={styles.loadingText}>Loading destination details...</Text>
      </View>
    );
  }

  if (error || !destination) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Error</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Destination not found'}</Text>
          <TouchableOpacity 
            style={styles.backHomeButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.backHomeText}>Back to Discover</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <View style={styles.starsContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={16} color="#FF385C" fill="#FF385C" />
        ))}
        {halfStar && (
          <Star key="half" size={16} color="#FF385C" fill="#FF385C" strokeWidth={0} strokeDasharray={[15, 15]} />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={16} color="#D1D5DB" />
        ))}
      </View>
    );
  };

  const averageRating = destination.reviews?.length 
    ? destination.reviews.reduce((sum, review) => sum + review.rating, 0) / destination.reviews.length
    : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={[styles.imageContainer, { height: imageHeight }]}>
          <TouchableOpacity 
            style={[styles.backButton, { top: Platform.OS === 'ios' ? 50 : 30 }]}
            onPress={() => {
              router.back();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <View style={styles.backButtonCircle}>
              <ChevronLeft size={24} color="#000" />
            </View>
          </TouchableOpacity>
          
          <Image
            source={{ uri: destination.image }}
            style={styles.image}
          />
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          >
            <Text style={[styles.title, { fontSize: fontSize.xxlarge }]}>{destination.name}</Text>
            
            <View style={styles.locationContainer}>
              <MapPin size={16} color="#FFFFFF" />
              <Text style={[styles.location, { fontSize: fontSize.medium }]}>{destination.region || 'Nepal'}</Text>
            </View>
            
            <View style={styles.badgeContainer}>
              <View style={styles.typeBadge}>
                <Text style={[styles.badgeText, { fontSize: fontSize.small }]}>
                  {destination.type.charAt(0).toUpperCase() + destination.type.slice(1)}
                </Text>
              </View>
              
              {destination.elevation && (
                <View style={[styles.typeBadge, styles.elevationBadge]}>
                  <Text style={[styles.badgeText, { fontSize: fontSize.small }]}>Elevation: {destination.elevation}</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        <View style={[styles.content, { padding: contentPadding }]}>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push(`/booking?name=${encodeURIComponent(destination.name)}`);
              }}
            >
              <Calendar size={20} color="#FF385C" />
              <Text style={styles.actionButtonText}>Book Now</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Share2 size={20} color="#1A1D1E" />
              <Text style={[styles.actionButtonText, { fontSize: fontSize.medium }]}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Bookmark size={20} color="#1A1D1E" />
              <Text style={[styles.actionButtonText, { fontSize: fontSize.medium }]}>Save</Text>
            </TouchableOpacity>
            
            {/* Only show Plan Trip button for non-cuisine destinations */}
            {destination.type !== 'cuisine' && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.planButton]}
                onPress={() => {
                  router.push('/itinerary-planner');
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                <Calendar size={20} color="#FFFFFF" />
                <Text style={[styles.planButtonText, { fontSize: fontSize.medium }]}>Plan Trip</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={[styles.description, { fontSize: fontSize.medium }]}>{destination.fullDescription}</Text>
          
          <Text style={[styles.sectionTitle, { fontSize: fontSize.xlarge }]}>Highlights</Text>
          
          {destination.highlights.map((highlight, index) => (
            <View key={index} style={styles.highlightItem}>
              <View style={styles.bulletPoint} />
              <Text style={[styles.highlight, { fontSize: fontSize.medium }]}>{highlight}</Text>
            </View>
          ))}
          
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Clock size={20} color="#6B7280" />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { fontSize: fontSize.small }]}>Duration</Text>
                  <Text style={[styles.infoValue, { fontSize: fontSize.medium }]}>{destination.duration}</Text>
                </View>
              </View>
              
              <View style={styles.infoItem}>
                <Calendar size={20} color="#6B7280" />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { fontSize: fontSize.small }]}>Best Time</Text>
                  <Text style={[styles.infoValue, { fontSize: fontSize.medium }]}>{destination.bestTimeToVisit}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              {destination.type !== 'cuisine' && (
                <View style={styles.infoItem}>
                  <Star size={20} color="#6B7280" />
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, { fontSize: fontSize.small }]}>Difficulty</Text>
                    <Text style={[styles.infoValue, { fontSize: fontSize.medium }]}>{destination.difficulty}</Text>
                  </View>
                </View>
              )}
              
              {/* Only show weather for non-cuisine destinations */}
              {destination.type !== 'cuisine' && weather && (
                <View style={styles.infoItem}>
                  <Image 
                    source={{ uri: weather.icon }} 
                    style={styles.weatherIcon} 
                  />
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, { fontSize: fontSize.small }]}>Weather Now</Text>
                    <Text style={[styles.infoValue, { fontSize: fontSize.medium }]}>{weather.temperature}°C, {weather.condition}</Text>
                  </View>
                </View>
              )}
              
              {/* For cuisine, add a Region info item to balance the layout */}
              {destination.type === 'cuisine' && (
                <View style={styles.infoItem}>
                  <MapPin size={20} color="#6B7280" />
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoLabel, { fontSize: fontSize.small }]}>Region</Text>
                    <Text style={[styles.infoValue, { fontSize: fontSize.medium }]}>{destination.region || 'Nationwide'}</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
          
          {destination.reviews && destination.reviews.length > 0 && (
            <>
              <View style={styles.reviewHeader}>
                <Text style={[styles.sectionTitle, { fontSize: fontSize.xlarge }]}>Reviews</Text>
                <View style={styles.ratingWrapper}>
                  <View style={styles.averageRating}>
                    <Text style={[styles.ratingNumber, { fontSize: fontSize.large }]}>{averageRating.toFixed(1)}</Text>
                    {renderRating(averageRating)}
                  </View>
                  <Text style={[styles.reviewCount, { fontSize: fontSize.small }]}>
                    {destination.reviews.length} {destination.reviews.length === 1 ? 'review' : 'reviews'}
                  </Text>
                </View>
              </View>
              
              {destination.reviews.slice(0, 2).map((review, index) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={[styles.reviewer, { fontSize: fontSize.medium }]}>{review.user}</Text>
                    <Text style={[styles.reviewDate, { fontSize: fontSize.small }]}>{review.date}</Text>
                  </View>
                  {renderRating(review.rating)}
                  <Text style={[styles.reviewText, { fontSize: fontSize.medium }]}>{review.comment}</Text>
                </View>
              ))}
              
              {destination.reviews.length > 2 && (
                <TouchableOpacity 
                  style={styles.allReviewsButton}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <Text style={[styles.allReviewsText, { fontSize: fontSize.medium }]}>See all reviews</Text>
                  <ArrowRight size={16} color="#FF385C" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#4B5563',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: '#1A1D1E',
    marginLeft: 16,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  backHomeButton: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backHomeText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  backButton: {
    position: 'absolute',
    left: 24,
    zIndex: 10,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontFamily: 'DMSans-Bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    fontFamily: 'DMSans-Medium',
    color: '#FFFFFF',
    marginLeft: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  typeBadge: {
    backgroundColor: 'rgba(255, 56, 92, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  elevationBadge: {
    backgroundColor: 'rgba(79, 70, 229, 0.9)',
  },
  badgeText: {
    fontFamily: 'DMSans-Medium',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginRight: 12,
    marginBottom: 10,
  },
  actionButtonText: {
    fontFamily: 'DMSans-Medium',
    color: '#1A1D1E',
    marginLeft: 6,
  },
  planButton: {
    backgroundColor: '#FF385C',
    borderColor: '#FF385C',
    flex: 1,
    minWidth: 120,
  },
  planButtonText: {
    fontFamily: 'DMSans-Medium',
    color: '#FFFFFF',
    marginLeft: 6,
  },
  description: {
    fontFamily: 'DMSans-Regular',
    lineHeight: 24,
    color: '#4B5563',
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    color: '#1A1D1E',
    marginBottom: 16,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingRight: 10,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF385C',
    marginTop: 8,
    marginRight: 10,
  },
  highlight: {
    fontFamily: 'DMSans-Regular',
    color: '#4B5563',
    flex: 1,
  },
  infoSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  infoTextContainer: {
    marginLeft: 12,
  },
  infoLabel: {
    fontFamily: 'DMSans-Regular',
    color: '#6B7280',
  },
  infoValue: {
    fontFamily: 'DMSans-Medium',
    color: '#1A1D1E',
  },
  weatherIcon: {
    width: 24,
    height: 24,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ratingWrapper: {
    alignItems: 'flex-end',
  },
  averageRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontFamily: 'DMSans-Bold',
    color: '#1A1D1E',
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  reviewCount: {
    fontFamily: 'DMSans-Regular',
    color: '#6B7280',
    marginTop: 4,
  },
  reviewCard: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  reviewer: {
    fontFamily: 'DMSans-Bold',
    color: '#1A1D1E',
  },
  reviewDate: {
    fontFamily: 'DMSans-Regular',
    color: '#6B7280',
  },
  reviewText: {
    fontFamily: 'DMSans-Regular',
    color: '#4B5563',
    marginTop: 8,
  },
  allReviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  allReviewsText: {
    fontFamily: 'DMSans-Medium',
    color: '#FF385C',
    marginRight: 8,
  },
});