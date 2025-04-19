import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  TextInput,
  FlatList,
  Dimensions,
  Animated,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { router } from 'expo-router';
import { 
  ChevronLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  Search, 
  Flag, 
  Filter,
  Bell,
  Share2,
  Heart,
  Info,
  ChevronRight,
  ChevronsRight,
  Gift,
  Music,
  Users
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');
const CAROUSEL_ITEM_WIDTH = width * 0.85;
const CAROUSEL_ITEM_HEIGHT = height * 0.35;

// Sample festival data
const FESTIVALS = [
  {
    id: '1',
    name: 'Dashain',
    image: 'https://images.unsplash.com/photo-1625046437744-20892bb6841c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    description: 'Dashain is the longest and most auspicious festival in the Nepalese annual calendar, celebrated by Nepalis of all castes throughout the country.',
    startDate: 'October 12, 2024',
    endDate: 'October 26, 2024',
    location: 'Throughout Nepal',
    category: 'Major Festival',
    featured: true,
    month: 'oct',
    shortDescription: 'The most important 15-day festival celebrating good over evil',
    activities: [
      'Family gatherings',
      'Flying kites',
      'Bamboo swings',
      'Tika ceremonies',
      'Feasting'
    ],
    tips: [
      'Expect most businesses to be closed during the main days of celebration',
      'Public transportation will be limited',
      'Book accommodations well in advance',
      'Prepare for crowds at major temples and shrines'
    ]
  },
  {
    id: '2',
    name: 'Tihar (Diwali)',
    image: 'https://images.unsplash.com/photo-1606466123170-d39e5346aa76?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    description: 'Tihar, also known as Deepawali, is a five-day Hindu festival of lights celebrated in Nepal. It includes worship of crows, dogs, cows, and the goddess Lakshmi.',
    startDate: 'November 1, 2024',
    endDate: 'November 5, 2024',
    location: 'Throughout Nepal',
    category: 'Major Festival',
    featured: true,
    month: 'nov',
    shortDescription: 'Festival of lights with beautiful decorations and ceremonies',
    activities: [
      'Decorating homes with oil lamps and candles',
      'Rangoli (colorful floor designs)',
      'Worship of animals',
      'Lakshmi Puja (prayer to goddess of wealth)',
      'Bhai Tika (brother-sister ceremony)'
    ],
    tips: [
      'The best time to experience Tihar is in the evening when lights are lit',
      'Participate in the festivities by lighting candles at your accommodation',
      'Photography is welcome but ask permission before taking photos of ceremonies',
      'Dress respectfully when visiting temples'
    ]
  },
  {
    id: '3',
    name: 'Holi',
    image: 'https://images.unsplash.com/photo-1544735716-ea9ef790f501?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    description: 'Holi, the festival of colors, celebrates the victory of good over evil and the arrival of spring. People throw colored powders and water at each other in joyful celebration.',
    startDate: 'March 14, 2025',
    endDate: 'March 15, 2025',
    location: 'Throughout Nepal (especially Kathmandu and Terai region)',
    category: 'Seasonal Festival',
    featured: true,
    month: 'mar',
    shortDescription: 'The colorful spring festival filled with joy and celebration',
    activities: [
      'Playing with colors and water',
      'Music and dancing',
      'Special food and drinks (especially bhang, a cannabis-based drink)',
      'Bonfires (in some regions the night before)',
      'Community celebrations'
    ],
    tips: [
      'Wear old clothes that you don\'t mind getting stained',
      'Apply coconut oil to your skin and hair for easier color removal',
      'Keep your valuables and electronics in waterproof bags',
      'Stay in groups, especially women travelers',
      'Some locals can be aggressive with colors, especially in busy areas'
    ]
  },
  {
    id: '4',
    name: 'Buddha Jayanti',
    image: 'https://images.unsplash.com/photo-1582637558873-e72726f0998e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    description: 'Buddha Jayanti celebrates the birth, enlightenment, and death of Lord Buddha. It\'s a day of peace, reflection, and spiritual practices.',
    startDate: 'May 26, 2025',
    endDate: 'May 26, 2025',
    location: 'Lumbini, Swayambhunath and Boudhanath in Kathmandu',
    category: 'Religious Festival',
    featured: false,
    month: 'may',
    shortDescription: 'Celebration of Buddha\'s birth, enlightenment and death',
    activities: [
      'Visiting Buddhist temples and stupas',
      'Prayer ceremonies',
      'Offering of incense, flowers, and candles',
      'Alms-giving to monks',
      'Meditation sessions'
    ],
    tips: [
      'Dress modestly when visiting religious sites',
      'Remove shoes before entering temples',
      'Walk clockwise around stupas as a sign of respect',
      'Maintain quiet and respectful behavior',
      'The most significant celebrations are in Lumbini, Buddha\'s birthplace'
    ]
  },
  {
    id: '5',
    name: 'Indra Jatra',
    image: 'https://images.unsplash.com/photo-1625072446484-5e0e1f473992?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    description: 'Indra Jatra is one of the biggest festivals in Kathmandu. It\'s dedicated to Indra, the god of rain and heaven, and features the display of the living goddess Kumari.',
    startDate: 'September 15, 2024',
    endDate: 'September 22, 2024',
    location: 'Kathmandu Durbar Square',
    category: 'Cultural Festival',
    featured: false,
    month: 'sep',
    shortDescription: 'Ancient festival featuring the living goddess Kumari',
    activities: [
      'Procession of Kumari (living goddess)',
      'Mask dances',
      'Raising of the Yosin pole',
      'Display of Bhairab\'s mask',
      'Street performances and cultural shows'
    ],
    tips: [
      'The best viewpoint is Kathmandu Durbar Square, but it gets very crowded',
      'Arrive early to get a good spot for viewing the processions',
      'Be respectful when photographing the Kumari',
      'Some events happen at night, so plan accordingly',
      'Check local schedules as dates can vary based on the lunar calendar'
    ]
  },
  {
    id: '6',
    name: 'Losar (Tibetan New Year)',
    image: 'https://images.unsplash.com/photo-1575450311950-5b4f69942332?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    description: 'Losar marks the Tibetan New Year. It\'s celebrated by Sherpas, Tamangs, and Tibetan communities in Nepal with rituals to purify and bring good fortune for the new year.',
    startDate: 'February 16, 2025',
    endDate: 'February 18, 2025',
    location: 'Himalayan regions, Boudhanath and Swayambhunath in Kathmandu',
    category: 'Cultural Festival',
    featured: false,
    month: 'feb',
    shortDescription: 'Tibetan new year celebrations with rituals and feasts',
    activities: [
      'Buddhist ceremonies',
      'Monastery rituals and mask dances',
      'Family gatherings and feasts',
      'Traditional games',
      'Prayer flag raising'
    ],
    tips: [
      'Visit Boudhanath Stupa in Kathmandu for accessible celebrations',
      'For a more authentic experience, visit Sherpa villages in the Everest region',
      'Bring small denominations of money for offerings',
      'Try traditional Tibetan foods like khapse (fried pastries)',
      'Respect religious customs and dress modestly'
    ]
  }
];

// Filter categories
const CATEGORIES = [
  { id: 'all', name: 'All Festivals' },
  { id: 'major', name: 'Major Festivals' },
  { id: 'religious', name: 'Religious' },
  { id: 'cultural', name: 'Cultural' },
  { id: 'seasonal', name: 'Seasonal' }
];

// Month filters
const MONTHS = [
  { id: 'all', name: 'Any Time' },
  { id: 'jan', name: 'January' },
  { id: 'feb', name: 'February' },
  { id: 'mar', name: 'March' },
  { id: 'apr', name: 'April' },
  { id: 'may', name: 'May' },
  { id: 'jun', name: 'June' },
  { id: 'jul', name: 'July' },
  { id: 'aug', name: 'August' },
  { id: 'sep', name: 'September' },
  { id: 'oct', name: 'October' },
  { id: 'nov', name: 'November' },
  { id: 'dec', name: 'December' }
];

export default function Festivals() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedFestival, setSelectedFestival] = useState<typeof FESTIVALS[0] | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const featuredFestivals = FESTIVALS.filter(festival => festival.featured);

  // Filter festivals based on search query, category, and month
  const filteredFestivals = FESTIVALS.filter(festival => {
    const matchesSearch = festival.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        festival.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                          festival.category.toLowerCase().includes(selectedCategory.toLowerCase());
    
    const matchesMonth = selectedMonth === 'all' || festival.month === selectedMonth;
    
    return matchesSearch && matchesCategory && matchesMonth;
  });

  // Calendar-based view for upcoming festivals
  const upcomingFestivals = [...FESTIVALS].sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateA.getTime() - dateB.getTime();
  }).filter(festival => {
    const festivalDate = new Date(festival.startDate);
    return festivalDate >= new Date();
  }).slice(0, 5);

  // Render featured festival item in carousel
  const renderFeaturedFestival = ({ item, index }) => {
    const inputRange = [
      (index - 1) * CAROUSEL_ITEM_WIDTH,
      index * CAROUSEL_ITEM_WIDTH,
      (index + 1) * CAROUSEL_ITEM_WIDTH
    ];
    
    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [20, 0, 20],
      extrapolate: 'clamp'
    });
    
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp'
    });
    
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp'
    });

    return (
      <TouchableOpacity 
        onPress={() => {
          setSelectedFestival(item);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        activeOpacity={0.9}
      >
        <Animated.View 
          style={[
            styles.featuredFestivalCard,
            { 
              transform: [{ translateY }, { scale }],
              opacity,
              marginLeft: index === 0 ? 20 : 0,
              marginRight: index === featuredFestivals.length - 1 ? 20 : 0
            }
          ]}
        >
          <Image source={{ uri: item.image }} style={styles.featuredFestivalImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
            style={styles.featuredGradient}
          >
            <Text style={styles.featuredFestivalName}>{item.name}</Text>
            <Text style={styles.featuredFestivalDescription} numberOfLines={2}>
              {item.shortDescription}
            </Text>
            <View style={styles.featuredMeta}>
              <View style={styles.metaItemFeatured}>
                <Calendar size={14} color="#FFFFFF" />
                <Text style={styles.metaTextFeatured}>
                  {item.startDate === item.endDate
                    ? item.startDate
                    : `${item.startDate.split(',')[0]} - ${item.endDate.split(',')[0]}`}
                </Text>
              </View>
              <View style={styles.metaItemFeatured}>
                <MapPin size={14} color="#FFFFFF" />
                <Text style={styles.metaTextFeatured} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderUpcomingFestival = ({ item }) => (
    <TouchableOpacity
      style={styles.upcomingFestivalCard}
      onPress={() => {
        setSelectedFestival(item);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }}
    >
      <Image source={{ uri: item.image }} style={styles.upcomingFestivalImage} />
      <View style={styles.upcomingFestivalContent}>
        <Text style={styles.upcomingFestivalName}>{item.name}</Text>
        <View style={styles.upcomingMeta}>
          <View style={styles.upcomingMetaItem}>
            <Calendar size={12} color="#6B7280" />
            <Text style={styles.upcomingMetaText}>{item.startDate.split(',')[0]}</Text>
          </View>
        </View>
      </View>
      <ChevronRight size={18} color="#6B7280" />
    </TouchableOpacity>
  );

  const FestivalDetailView = () => (
    <ScrollView style={styles.festivalDetailContainer} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.detailImageContainer}>
        <Image
          source={{ uri: selectedFestival.image }}
          style={styles.festivalDetailImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']}
          style={styles.detailImageGradient}
        >
          <View style={styles.detailNavButtons}>
            <TouchableOpacity
              style={styles.roundButton}
              onPress={() => {
                setSelectedFestival(null);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <ChevronLeft size={20} color="#FFF" />
            </TouchableOpacity>
            
            <View style={styles.rightButtons}>
              <TouchableOpacity style={styles.roundButton}>
                <Heart size={20} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.roundButton}>
                <Share2 size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.detailFestivalName}>{selectedFestival.name}</Text>
          
          <View style={styles.detailCategoryContainer}>
            <Text style={styles.detailCategoryText}>{selectedFestival.category}</Text>
          </View>
        </LinearGradient>
      </View>
      
      <View style={styles.detailContent}>
        <View style={styles.detailInfoCards}>
          <View style={styles.detailInfoCard}>
            <Calendar size={20} color="#FF385C" />
            <View style={styles.detailInfoCardText}>
              <Text style={styles.detailInfoTitle}>Date</Text>
              <Text style={styles.detailInfoValue}>
                {selectedFestival.startDate === selectedFestival.endDate
                  ? selectedFestival.startDate
                  : `${selectedFestival.startDate} - ${selectedFestival.endDate}`}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailInfoCard}>
            <MapPin size={20} color="#FF385C" />
            <View style={styles.detailInfoCardText}>
              <Text style={styles.detailInfoTitle}>Location</Text>
              <Text style={styles.detailInfoValue}>{selectedFestival.location}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.detailSection}>
          <Text style={styles.detailSectionTitle}>About the Festival</Text>
          <Text style={styles.detailDescription}>{selectedFestival.description}</Text>
        </View>
        
        <View style={styles.detailSection}>
          <View style={styles.sectionTitleRow}>
            <Music size={20} color="#FF385C" />
            <Text style={styles.detailSectionTitle}>Activities & Traditions</Text>
          </View>
          {selectedFestival.activities.map((activity, index) => (
            <View key={index} style={styles.bulletItem}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>{activity}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.detailSection}>
          <View style={styles.sectionTitleRow}>
            <Info size={20} color="#FF385C" />
            <Text style={styles.detailSectionTitle}>Traveler Tips</Text>
          </View>
          {selectedFestival.tips.map((tip, index) => (
            <View key={index} style={styles.bulletItem}>
              <View style={styles.bullet} />
              <Text style={styles.bulletText}>{tip}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity style={styles.reminderButton}>
          <Bell size={18} color="#FFFFFF" />
          <Text style={styles.reminderButtonText}>Set Festival Reminder</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  if (selectedFestival) {
    return <FestivalDetailView />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Festivals & Events</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#6B7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search festivals..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#FF385C" />
        </TouchableOpacity>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Festivals</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronsRight size={16} color="#FF385C" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={featuredFestivals}
            keyExtractor={(item) => item.id}
            renderItem={renderFeaturedFestival}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CAROUSEL_ITEM_WIDTH + 20}
            decelerationRate="fast"
            contentContainerStyle={styles.featuredListContent}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          />
        </View>
        
        <View style={styles.filterStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterStripContent}>
            {CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.filterChip,
                  selectedCategory === category.id && styles.selectedFilterChip
                ]}
                onPress={() => {
                  setSelectedCategory(category.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategory === category.id && styles.selectedFilterChipText
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Festivals</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>Calendar</Text>
              <Calendar size={16} color="#FF385C" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.upcomingFestivalsContainer}>
            {upcomingFestivals.map(festival => renderUpcomingFestival({ item: festival }))}
          </View>
        </View>
        
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Festival Categories</Text>
          </View>
          
          <View style={styles.categoriesGrid}>
            <TouchableOpacity 
              style={styles.categoryCard}
              onPress={() => setSelectedCategory('major')}
            >
              <View style={[styles.categoryIcon, { backgroundColor: '#FFE8EC' }]}>
                <Gift size={24} color="#FF385C" />
              </View>
              <Text style={styles.categoryName}>Major Festivals</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.categoryCard}
              onPress={() => setSelectedCategory('religious')}
            >
              <View style={[styles.categoryIcon, { backgroundColor: '#E6F7FF' }]}>
                <Flag size={24} color="#0070F3" />
              </View>
              <Text style={styles.categoryName}>Religious</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.categoryCard}
              onPress={() => setSelectedCategory('cultural')}
            >
              <View style={[styles.categoryIcon, { backgroundColor: '#E6FFFA' }]}>
                <Users size={24} color="#00A99D" />
              </View>
              <Text style={styles.categoryName}>Cultural</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.categoryCard}
              onPress={() => setSelectedCategory('seasonal')}
            >
              <View style={[styles.categoryIcon, { backgroundColor: '#FFF7E6' }]}>
                <Calendar size={24} color="#F59E0B" />
              </View>
              <Text style={styles.categoryName}>Seasonal</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.spacer} />
      </ScrollView>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontFamily: 'DMSans-Bold',
    fontSize: 24,
    color: '#1A1D1E',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: '#1A1D1E',
  },
  filterButton: {
    position: 'absolute',
    right: 24,
    top: 24,
    padding: 8,
    backgroundColor: '#FF385C',
    borderRadius: 8,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#1A1D1E',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#FF385C',
    marginRight: 4,
  },
  featuredListContent: {
    paddingHorizontal: 24,
  },
  featuredFestivalCard: {
    width: CAROUSEL_ITEM_WIDTH,
    height: CAROUSEL_ITEM_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featuredFestivalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  featuredFestivalName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuredFestivalDescription: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featuredMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaItemFeatured: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaTextFeatured: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  filterStrip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  filterStripContent: {
    paddingHorizontal: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
  },
  selectedFilterChip: {
    backgroundColor: '#FF385C',
  },
  filterChipText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#4B5563',
  },
  selectedFilterChipText: {
    color: '#FFFFFF',
  },
  upcomingFestivalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  upcomingFestivalCard: {
    width: '48%',
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  upcomingFestivalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  upcomingFestivalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  upcomingFestivalName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  upcomingMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  upcomingMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  upcomingMetaText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  categoryCard: {
    width: '48%',
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#1A1D1E',
    position: 'absolute',
    bottom: 16,
    left: 16,
  },
  spacer: {
    height: 100,
  },
  festivalDetailContainer: {
    flex: 1,
  },
  detailImageContainer: {
    height: 250,
    overflow: 'hidden',
  },
  festivalDetailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  detailImageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 16,
  },
  detailNavButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  rightButtons: {
    flexDirection: 'row',
  },
  detailFestivalName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  detailCategoryContainer: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  detailCategoryText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },
  detailContent: {
    padding: 24,
  },
  detailInfoCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  detailInfoCard: {
    width: '48%',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
  },
  detailInfoCardText: {
    marginLeft: 16,
  },
  detailInfoTitle: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailInfoValue: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: '#1A1D1E',
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#1A1D1E',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailDescription: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingRight: 16,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF385C',
    marginTop: 8,
    marginRight: 8,
  },
  bulletText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
    flex: 1,
  },
  reminderButton: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  reminderButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
