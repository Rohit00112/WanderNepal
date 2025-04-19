import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  FlatList, 
  Dimensions, 
  Animated,
  StatusBar,
  SafeAreaView 
} from 'react-native';
import { router } from 'expo-router';
import { 
  ChevronLeft, 
  Coffee, 
  Star, 
  MapPin, 
  Tag, 
  Search, 
  Filter,
  ChevronRight,
  Info,
  Clock,
  Utensils,
  ChefHat,
  Flame
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.8;
const SPACING = 10;

// Cuisine categories
const CUISINE_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'staples', label: 'Staples' },
  { id: 'street', label: 'Street Food' },
  { id: 'festive', label: 'Festive' },
  { id: 'high-altitude', label: 'Mountain' },
  { id: 'newari', label: 'Newari' },
  { id: 'dessert', label: 'Sweets' }
];

// Updated cuisine data with categories and preparation time
const NEPALI_DISHES = [
  {
    id: '1',
    name: 'Dal Bhat',
    description: 'The national dish of Nepal consisting of steamed rice, lentil soup, and various side dishes including vegetables, pickles, and sometimes meat curry.',
    image: 'https://images.unsplash.com/photo-1589308454676-21178e33c6d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    spiceLevel: 'Medium',
    isVegetarian: true,
    region: 'Nationwide',
    categories: ['staples'],
    prepTime: '30-45 min',
    ingredients: ['Rice', 'Lentils', 'Vegetables', 'Spices', 'Pickles'],
    bestPlaces: [
      'Thakali Kitchen, Kathmandu',
      'Mitho Restaurant, Pokhara',
      'Local homes (homestays)'
    ]
  },
  {
    id: '2',
    name: 'Momo',
    description: 'Nepali dumplings filled with spiced meat or vegetables, served with a spicy dipping sauce. A popular snack and meal throughout Nepal.',
    image: 'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    spiceLevel: 'Medium to High',
    isVegetarian: 'Both options available',
    region: 'Nationwide',
    categories: ['street', 'staples'],
    prepTime: '45-60 min',
    ingredients: ['Flour', 'Meat/Vegetables', 'Onions', 'Garlic', 'Tomato sauce'],
    bestPlaces: [
      'Yangling Tibetan Restaurant, Kathmandu',
      'Momo Queen, Thamel',
      'Roadside stalls in any city'
    ]
  },
  {
    id: '3',
    name: 'Sel Roti',
    description: 'Sweet, ring-shaped bread made from rice flour, typically served during Tihar festival and other celebrations.',
    image: 'https://images.unsplash.com/photo-1589511868030-84c9ea26ae61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    spiceLevel: 'None (Sweet)',
    isVegetarian: true,
    region: 'Nationwide',
    categories: ['festive', 'dessert'],
    prepTime: '30 min',
    ingredients: ['Rice flour', 'Sugar', 'Ghee', 'Cardamom', 'Banana'],
    bestPlaces: [
      'Local street vendors',
      'Morning markets',
      'Festival celebrations'
    ]
  },
  {
    id: '4',
    name: 'Thukpa',
    description: 'Hearty noodle soup with vegetables and meat, popularized by the Tibetan influence in Nepal, especially common in mountainous regions.',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    spiceLevel: 'Medium',
    isVegetarian: 'Both options available',
    region: 'Himalayan Region',
    categories: ['high-altitude', 'staples'],
    prepTime: '40 min',
    ingredients: ['Noodles', 'Vegetables', 'Meat (optional)', 'Ginger', 'Garlic'],
    bestPlaces: [
      'Tibetan restaurants in Boudhanath',
      'Namche Bazaar restaurants',
      'Sherpa homestays'
    ]
  },
  {
    id: '5',
    name: 'Newari Khaja Set',
    description: 'Traditional feast from Kathmandu Valley featuring multiple dishes served on a single plate, including beaten rice, meat, lentil patties, and more.',
    image: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    spiceLevel: 'Medium to High',
    isVegetarian: 'Non-vegetarian (Vegetarian options available)',
    region: 'Kathmandu Valley',
    categories: ['newari'],
    prepTime: '60+ min',
    ingredients: ['Beaten rice', 'Marinated meat', 'Lentil patties', 'Local spices', 'Achar (pickle)'],
    bestPlaces: [
      'Honacha, Patan',
      'Newari Kitchen, Thamel',
      'Bhojan Griha, Kathmandu'
    ]
  },
  {
    id: '6',
    name: 'Yomari',
    description: 'Sweet steamed dumplings made from rice flour with molasses or condensed milk filling. A special delicacy served during the Yomari Punhi festival.',
    image: 'https://images.unsplash.com/photo-1606245931600-9b508e9f4065?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    spiceLevel: 'None (Sweet)',
    isVegetarian: true,
    region: 'Kathmandu Valley',
    categories: ['festive', 'dessert', 'newari'],
    prepTime: '45 min',
    ingredients: ['Rice flour', 'Molasses/Condensed milk', 'Sesame seeds', 'Ghee'],
    bestPlaces: [
      'Newari households during Yomari Punhi',
      'Newa Lahana, Kirtipur',
      'The Village Café, Patan'
    ]
  },
  {
    id: '7',
    name: 'Gundruk',
    description: 'Fermented leafy green vegetable, a popular side dish and soup ingredient in Nepal. A great source of nutrients during winter months.',
    image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    spiceLevel: 'Medium',
    isVegetarian: true,
    region: 'Nationwide, especially hilly regions',
    categories: ['staples', 'high-altitude'],
    prepTime: 'Fermentation: 7-15 days, Cooking: 20 min',
    ingredients: ['Fermented leafy greens', 'Onions', 'Tomatoes', 'Spices'],
    bestPlaces: [
      'Local traditional restaurants',
      'Rural homestays',
      'Himalayan trail teahouses'
    ]
  },
  {
    id: '8',
    name: 'Chatamari',
    description: 'Often called "Newari pizza," a rice flour crepe topped with minced meat, eggs, and spices. A traditional delicacy from the Newar community.',
    image: 'https://images.unsplash.com/photo-1593560708920-61b98ae52d42?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    spiceLevel: 'Medium',
    isVegetarian: 'Both options available',
    region: 'Kathmandu Valley',
    categories: ['newari', 'street'],
    prepTime: '30 min',
    ingredients: ['Rice flour', 'Meat/Egg', 'Spices', 'Herbs', 'Ghee'],
    bestPlaces: [
      'Jhamsikhel food stalls',
      'The Village Café, Patan',
      'Local Newari restaurants'
    ]
  }
];

export default function CuisineGuide() {
  const [selectedDish, setSelectedDish] = useState<typeof NEPALI_DISHES[0] | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Nepali Cuisine Guide</Text>
      </View>

      {selectedDish ? (
        <ScrollView style={styles.detailContainer} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.backToListButton}
            onPress={() => {
              setSelectedDish(null);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <ChevronLeft size={20} color="#FF385C" />
            <Text style={styles.backToListText}>Back to all dishes</Text>
          </TouchableOpacity>

          <Image
            source={{ uri: selectedDish.image }}
            style={styles.detailImage}
          />

          <View style={styles.detailContent}>
            <Text style={styles.detailName}>{selectedDish.name}</Text>
            
            <View style={styles.tagsContainer}>
              <View style={styles.tagItem}>
                <Star size={16} color="#FF385C" />
                <Text style={styles.tagText}>Spice: {selectedDish.spiceLevel}</Text>
              </View>
              
              <View style={styles.tagItem}>
                <Tag size={16} color="#FF385C" />
                <Text style={styles.tagText}>{typeof selectedDish.isVegetarian === 'boolean' 
                  ? (selectedDish.isVegetarian ? 'Vegetarian' : 'Non-vegetarian') 
                  : selectedDish.isVegetarian}</Text>
              </View>
              
              <View style={styles.tagItem}>
                <MapPin size={16} color="#FF385C" />
                <Text style={styles.tagText}>{selectedDish.region}</Text>
              </View>
            </View>
            
            <Text style={styles.description}>{selectedDish.description}</Text>
            
            <Text style={styles.sectionTitle}>Where to Try</Text>
            {selectedDish.bestPlaces.map((place, index) => (
              <View key={index} style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>{place}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={styles.dishListContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.guideIntro}>
            <Text style={styles.guideTitle}>Nepali Food Essentials</Text>
            <Text style={styles.guideDescription}>
              Nepali cuisine reflects the country's diverse cultures and landscapes. 
              From hearty mountain dishes to fiery Newari feasts, here are some must-try foods during your visit.
            </Text>
          </View>

          {NEPALI_DISHES.map(dish => (
            <TouchableOpacity
              key={dish.id}
              style={styles.dishCard}
              onPress={() => {
                setSelectedDish(dish);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <Image source={{ uri: dish.image }} style={styles.dishImage} />
              <View style={styles.dishInfo}>
                <Text style={styles.dishName}>{dish.name}</Text>
                <View style={styles.dishMeta}>
                  <View style={styles.metaItem}>
                    <MapPin size={16} color="#6B7280" />
                    <Text style={styles.metaText}>{dish.region}</Text>
                  </View>
                </View>
                <Text style={styles.dishDescription} numberOfLines={2}>
                  {dish.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Coffee size={24} color="#FF385C" />
              <Text style={styles.tipsTitle}>Dining Tips</Text>
            </View>
            <Text style={styles.tipsText}>
              In Nepal, it's customary to eat with your right hand, especially traditional foods like Dal Bhat. Most restaurants in tourist areas offer utensils if you prefer.
            </Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Try local specialties in their region of origin for the most authentic flavors</Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Street food is delicious but choose vendors with high turnover for freshness</Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Many dishes can be adjusted for spice level - just ask!</Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Look for restaurants full of locals for the best quality and value</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
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
  dishListContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 30,
  },
  guideIntro: {
    marginVertical: 24,
  },
  guideTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 22,
    color: '#1A1D1E',
    marginBottom: 8,
  },
  guideDescription: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
  },
  dishCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  dishImage: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  dishInfo: {
    flex: 1,
    padding: 16,
  },
  dishName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#1A1D1E',
    marginBottom: 8,
  },
  dishMeta: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  dishDescription: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: '#FFF8F8',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF385C',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#1A1D1E',
    marginLeft: 8,
  },
  tipsText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  bulletList: {
    marginTop: 8,
  },
  detailContainer: {
    flex: 1,
  },
  backToListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backToListText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#FF385C',
    marginLeft: 4,
  },
  detailImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  detailContent: {
    padding: 24,
    paddingBottom: 50,
  },
  detailName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 24,
    color: '#1A1D1E',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8F8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 6,
  },
  description: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#1A1D1E',
    marginBottom: 16,
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
});
