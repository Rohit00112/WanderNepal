import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  SafeAreaView,
  Dimensions 
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ChevronLeft, 
  Calendar, 
  Flag, 
  Cloud, 
  Coffee,
  Sun, 
  Hotel,
  Footprints,
  Snowflake,
  Umbrella,
  Utensils,
  LucideProps
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

// Use the correct type for Lucide icons
type LucideIcon = React.ComponentType<LucideProps>;

interface PlanningCategory {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  route: string;
  image: string;
}

interface SeasonalGuide {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  activities: string[];
}

interface Experience {
  id: string;
  title: string;
  image: string;
}

export default function PlanningHubScreen() {
  const router = useRouter();

  const planningCategories: PlanningCategory[] = [
    {
      id: 'itinerary',
      title: 'Itinerary Planner',
      description: 'Create detailed day-by-day plans for your trip',
      icon: Calendar,
      color: '#9C27B0',
      route: '/itinerary-planner',
      image: 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd'
    },
    {
      id: 'weather',
      title: 'Weather Guide',
      description: 'Check weather conditions by region and season',
      icon: Cloud,
      color: '#2196F3',
      route: '/weather-guide',
      image: 'https://images.unsplash.com/photo-1500740516770-92bd004b996e'
    },
    {
      id: 'festivals',
      title: 'Festivals & Events',
      description: 'Discover cultural celebrations across Nepal',
      icon: Flag,
      color: '#E91E63',
      route: '/festivals',
      image: 'https://images.unsplash.com/photo-1599922090156-938d10cc81ae'
    },
    {
      id: 'cuisine',
      title: 'Cuisine Guide',
      description: 'Explore local delicacies and food recommendations',
      icon: Coffee,
      color: '#FF5722',
      route: '/cuisine-guide',
      image: 'https://images.unsplash.com/photo-1547782101-68708ce7951e'
    }
  ];

  const seasonalGuides: SeasonalGuide[] = [
    {
      id: 'spring',
      title: 'Spring (Mar-May)',
      description: 'Clear skies, moderate temperatures, blooming rhododendrons',
      icon: Sun,
      color: '#4CAF50',
      activities: ['Annapurna Circuit', 'Langtang Valley']
    },
    {
      id: 'monsoon',
      title: 'Monsoon (Jun-Aug)',
      description: 'Rainfall, lush landscapes, limited visibility but fewer tourists',
      icon: Umbrella,
      color: '#03A9F4',
      activities: ['Mustang Valley', 'Lower Altitude Treks']
    },
    {
      id: 'autumn',
      title: 'Autumn (Sep-Nov)',
      description: 'Peak season with clear views and comfortable temperatures',
      icon: Footprints,
      color: '#FF9800',
      activities: ['Everest Base Camp', 'Manaslu Circuit']
    },
    {
      id: 'winter',
      title: 'Winter (Dec-Feb)',
      description: 'Cold temperatures, snow at high altitudes, quiet trails',
      icon: Snowflake,
      color: '#607D8B',
      activities: ['Poon Hill', 'Jungle Safaris']
    }
  ];

  const popularExperiences: Experience[] = [
    {
      id: 'homestay',
      title: 'Village Homestays',
      image: 'https://images.unsplash.com/photo-1620041536133-ce400159d7de'
    },
    {
      id: 'cooking',
      title: 'Nepali Cooking Class',
      image: 'https://images.unsplash.com/photo-1556910138-3eb5882c5e02'
    },
    {
      id: 'yoga',
      title: 'Yoga & Meditation',
      image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0'
    },
    {
      id: 'rafting',
      title: 'White Water Rafting',
      image: 'https://images.unsplash.com/photo-1530866495561-83bc69b25151'
    }
  ];

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleCategoryPress = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any); // Type assertion to bypass type check for now
  };

  const renderPlanningCard = (item: PlanningCategory) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.planningCard}
        onPress={() => handleCategoryPress(item.route)}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.cardImage}
        />
        <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
          <item.icon size={24} color="#FFFFFF" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDescription}>{item.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSeasonalGuide = (item: SeasonalGuide) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.seasonalCard}
        onPress={() => handleCategoryPress('/weather-guide')}
      >
        <View style={styles.seasonalHeader}>
          <View style={[styles.seasonIcon, { backgroundColor: item.color }]}>
            <item.icon size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.seasonalTitle}>{item.title}</Text>
        </View>
        <Text style={styles.seasonalDescription}>{item.description}</Text>
        <Text style={styles.recommendedLabel}>Recommended</Text>
        {item.activities.map((activity: string, index: number) => (
          <Text key={index} style={styles.activityItem}>• {activity}</Text>
        ))}
      </TouchableOpacity>
    );
  };

  const renderExperienceCard = (item: Experience) => {
    return (
      <TouchableOpacity
        key={item.id}
        style={styles.experienceCard}
        onPress={() => handleCategoryPress('/experiences')}
      >
        <Image
          source={{ uri: item.image }}
          style={styles.experienceImage}
        />
        <View style={styles.experienceOverlay}>
          <Text style={styles.experienceTitle}>{item.title}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ChevronLeft size={24} color="#1A1D1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Planning</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Planning Tools</Text>
          <View style={styles.planningGrid}>
            {planningCategories.map(renderPlanningCard)}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seasonal Travel Guide</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seasonalScroll}>
            {seasonalGuides.map(renderSeasonalGuide)}
          </ScrollView>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Experiences</Text>
            <TouchableOpacity onPress={() => handleCategoryPress('/experiences')}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.experiencesGrid}>
            {popularExperiences.map(renderExperienceCard)}
          </View>
        </View>
        
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.itineraryBuilder}
            onPress={() => handleCategoryPress('/itinerary-planner')}
          >
            <View style={styles.itineraryContent}>
              <Calendar size={24} color="#FFFFFF" />
              <View style={styles.itineraryText}>
                <Text style={styles.itineraryTitle}>Create Your Itinerary</Text>
                <Text style={styles.itineraryDescription}>Plan your perfect Nepal adventure day by day</Text>
              </View>
            </View>
            <Text style={styles.startButton}>Start</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1D1E',
    marginBottom: 16,
  },
  viewAllLink: {
    fontSize: 14,
    color: '#FF385C',
    fontWeight: '500',
  },
  planningGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  planningCard: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    height: 100,
    width: '100%',
    resizeMode: 'cover',
  },
  iconContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF385C',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D1E',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: '#72777A',
    lineHeight: 18,
  },
  seasonalScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  seasonalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: width * 0.7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  seasonalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  seasonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  seasonalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1D1E',
  },
  seasonalDescription: {
    fontSize: 14,
    color: '#72777A',
    marginBottom: 16,
    lineHeight: 20,
  },
  recommendedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1D1E',
    marginBottom: 8,
  },
  activityItem: {
    fontSize: 14,
    color: '#1A1D1E',
    marginBottom: 4,
    lineHeight: 20,
  },
  experiencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  experienceCard: {
    width: cardWidth,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  experienceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  experienceOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  experienceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  itineraryBuilder: {
    backgroundColor: '#FF385C',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itineraryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itineraryText: {
    marginLeft: 12,
  },
  itineraryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  itineraryDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  startButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
