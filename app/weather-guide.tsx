import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

// Define regions and their climate information
const REGIONS = [
  {
    id: '1',
    name: 'Kathmandu Valley',
    image: 'https://images.unsplash.com/photo-1588262462786-5e5344fa68bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    elevation: '1,400m',
    description: 'The capital region has a mild climate with four distinct seasons. Summers are warm and monsoon brings heavy rainfall.',
    seasons: [
      {
        name: 'Spring (March-May)',
        weather: 'Mild temperatures (15-25°C), occasional showers, clear skies',
        activities: 'City sightseeing, cultural festivals, day hikes',
        clothing: 'Light layers, rain jacket'
      },
      {
        name: 'Summer/Monsoon (June-August)',
        weather: 'Warm temperatures (20-30°C), heavy rainfall, high humidity',
        activities: 'Indoor cultural sites, museums, short treks between rain',
        clothing: 'Lightweight, quick-dry clothing, rain gear, waterproof footwear'
      },
      {
        name: 'Autumn (September-November)',
        weather: 'Pleasant temperatures (12-22°C), clear skies, low humidity',
        activities: 'Outdoor sightseeing, festivals, trekking',
        clothing: 'Light layers, light jacket for evenings'
      },
      {
        name: 'Winter (December-February)',
        weather: 'Cool temperatures (2-15°C), mostly clear, occasional frost',
        activities: 'Heritage sites, warm cafes, day trips',
        clothing: 'Warm layers, jacket, hat, gloves for mornings/evenings'
      }
    ]
  },
  {
    id: '2',
    name: 'Everest Region',
    image: 'https://images.unsplash.com/photo-1575450311950-5b4f69942332?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    elevation: '2,800m - 8,848m',
    description: 'Home to the world\'s highest peak, this region has extreme variations in temperature and climate conditions based on altitude.',
    seasons: [
      {
        name: 'Spring (March-May)',
        weather: 'Mild at lower elevations (5-15°C), cold at higher elevations (-10-5°C), clear mornings, afternoon clouds',
        activities: 'Trekking to Everest Base Camp, mountain climbing, photography',
        clothing: 'Layered clothing, down jacket, thermal underwear, good boots, hat, gloves'
      },
      {
        name: 'Summer/Monsoon (June-August)',
        weather: 'Warmer temperatures but heavy rainfall, cloud cover, possible landslides',
        activities: 'Lower elevation treks only, not recommended for high altitude',
        clothing: 'Waterproof everything, warm layers, trekking poles'
      },
      {
        name: 'Autumn (September-November)',
        weather: 'Stable temperatures, clear skies, excellent visibility',
        activities: 'Peak trekking season, high passes, base camp treks',
        clothing: 'Warm layers, down jacket, hat, gloves, sunglasses, sunscreen'
      },
      {
        name: 'Winter (December-February)',
        weather: 'Very cold (-15-5°C), limited snowfall at higher elevations, clear days',
        activities: 'Lower elevation treks, fewer crowds, cold-weather trekking',
        clothing: 'Extreme cold weather gear, expedition quality down jacket, warm sleeping bag'
      }
    ]
  },
  {
    id: '3',
    name: 'Annapurna Region',
    image: 'https://images.unsplash.com/photo-1544735716-ea9ef790f501?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    elevation: '1,000m - 8,091m',
    description: 'This diverse region offers varied climate zones from subtropical to alpine, making it one of the most biodiverse trekking destinations.',
    seasons: [
      {
        name: 'Spring (March-May)',
        weather: 'Mild temperatures, rhododendron blooms, clear mornings, possible afternoon showers',
        activities: 'Annapurna Circuit, Annapurna Base Camp trek, Poon Hill',
        clothing: 'Layers, rain jacket, sun protection'
      },
      {
        name: 'Summer/Monsoon (June-August)',
        weather: 'Warm but wet, leeches at lower elevations, muddy trails',
        activities: 'Rain-shadow areas like Upper Mustang, Dolpo',
        clothing: 'Waterproof gear, leech socks, insect repellent'
      },
      {
        name: 'Autumn (September-November)',
        weather: 'Ideal weather, clear skies, comfortable temperatures',
        activities: 'All treks, cultural experiences, photography',
        clothing: 'Layers for temperature variations, sun protection'
      },
      {
        name: 'Winter (December-February)',
        weather: 'Cold, especially at higher elevations, passes may be snowed in',
        activities: 'Lower elevation treks, cultural experiences',
        clothing: 'Warm layers, down jacket, hat, gloves'
      }
    ]
  },
  {
    id: '4',
    name: 'Terai (Southern Plains)',
    image: 'https://images.unsplash.com/photo-1625046437330-6a1ce7c21fd5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    elevation: '70m - 300m',
    description: 'The tropical lowlands of Nepal featuring national parks, wildlife reserves, and cultural heritage sites. Home to Chitwan and Bardia National Parks.',
    seasons: [
      {
        name: 'Spring (March-May)',
        weather: 'Very hot (25-38°C), increasing humidity, clear skies',
        activities: 'Wildlife safaris, cultural tours, bird watching',
        clothing: 'Lightweight, breathable fabrics, sun hat, sunscreen'
      },
      {
        name: 'Summer/Monsoon (June-August)',
        weather: 'Hot and extremely humid, heavy rainfall, some flooding',
        activities: 'Limited activities, not ideal for wildlife viewing',
        clothing: 'Quick-dry clothing, rain gear, insect repellent'
      },
      {
        name: 'Autumn (September-November)',
        weather: 'Warm days, cooler nights, clear skies',
        activities: 'Peak wildlife viewing season, cultural tours',
        clothing: 'Light clothing for day, light jacket for evenings'
      },
      {
        name: 'Winter (December-February)',
        weather: 'Pleasant days (15-25°C), cooler nights, misty mornings',
        activities: 'Wildlife safaris, jungle walks, elephant bathing',
        clothing: 'Layers, light jacket for mornings/evenings'
      }
    ]
  },
  {
    id: '5',
    name: 'Pokhara & Lakes',
    image: 'https://images.unsplash.com/photo-1589308454676-21178e33c6d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    elevation: '827m',
    description: 'A laid-back city nestled by Phewa Lake with stunning mountain views. Gateway to Annapurna range and several shorter treks.',
    seasons: [
      {
        name: 'Spring (March-May)',
        weather: 'Warm days (18-28°C), clear mornings, afternoon clouds possible',
        activities: 'Boating, paragliding, short treks, mountain viewing',
        clothing: 'Light clothing, sun protection, light jacket for evenings'
      },
      {
        name: 'Summer/Monsoon (June-August)',
        weather: 'Warm and wet, heavy rainfall, high humidity',
        activities: 'Indoor activities, occasional lake activities between rain',
        clothing: 'Lightweight, quick-dry, rain gear, waterproof footwear'
      },
      {
        name: 'Autumn (September-November)',
        weather: 'Pleasant (15-25°C), clear skies, excellent mountain views',
        activities: 'All outdoor activities, perfect for paragliding',
        clothing: 'Light layers, sun protection'
      },
      {
        name: 'Winter (December-February)',
        weather: 'Mild days (10-20°C), cooler nights, occasional morning fog',
        activities: 'Boating, paragliding, relaxation, day hikes',
        clothing: 'Layers, light jacket, sweater for evenings'
      }
    ]
  }
];

export default function WeatherGuide() {
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Nepal Weather Guide</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Nepal has diverse climate zones ranging from tropical in the south to alpine in the high mountains. 
          Plan your trip with our seasonal guide for each region.
        </Text>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.regionsScroll}
        >
          {REGIONS.map(region => (
            <TouchableOpacity
              key={region.id}
              style={[
                styles.regionButton,
                selectedRegion.id === region.id && styles.selectedRegionButton
              ]}
              onPress={() => setSelectedRegion(region)}
            >
              <Text 
                style={[
                  styles.regionButtonText,
                  selectedRegion.id === region.id && styles.selectedRegionButtonText
                ]}
              >
                {region.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.regionCard}>
          <Image source={{ uri: selectedRegion.image }} style={styles.regionImage} />
          <View style={styles.regionInfo}>
            <Text style={styles.regionName}>{selectedRegion.name}</Text>
            <Text style={styles.elevation}>Elevation: {selectedRegion.elevation}</Text>
            <Text style={styles.regionDescription}>{selectedRegion.description}</Text>
          </View>
        </View>

        <Text style={styles.seasonHeading}>Seasonal Guide</Text>

        {selectedRegion.seasons.map((season, index) => (
          <View key={index} style={styles.seasonCard}>
            <Text style={styles.seasonName}>{season.name}</Text>
            
            <View style={styles.seasonDetail}>
              <Text style={styles.detailLabel}>Weather:</Text>
              <Text style={styles.detailText}>{season.weather}</Text>
            </View>
            
            <View style={styles.seasonDetail}>
              <Text style={styles.detailLabel}>Recommended Activities:</Text>
              <Text style={styles.detailText}>{season.activities}</Text>
            </View>
            
            <View style={styles.seasonDetail}>
              <Text style={styles.detailLabel}>Suggested Clothing:</Text>
              <Text style={styles.detailText}>{season.clothing}</Text>
            </View>
          </View>
        ))}

        <View style={styles.tipBox}>
          <Text style={styles.tipTitle}>Pro Travel Tips</Text>
          <Text style={styles.tipText}>• Weather can change quickly in mountain regions - always pack layers</Text>
          <Text style={styles.tipText}>• The driest months with the clearest skies are October and November</Text>
          <Text style={styles.tipText}>• For trekking in high altitude regions, the best seasons are Spring (March-May) and Autumn (September-November)</Text>
          <Text style={styles.tipText}>• June to September is monsoon season with daily rainfall</Text>
        </View>
      </ScrollView>
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
  content: {
    padding: 24,
    paddingBottom: 120,
  },
  intro: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 24,
  },
  regionsScroll: {
    paddingBottom: 8,
    marginBottom: 24,
  },
  regionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  selectedRegionButton: {
    backgroundColor: '#FF385C',
  },
  regionButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#4B5563',
  },
  selectedRegionButtonText: {
    color: '#FFFFFF',
  },
  regionCard: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
    overflow: 'hidden',
  },
  regionImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  regionInfo: {
    padding: 16,
  },
  regionName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: '#1A1D1E',
    marginBottom: 8,
  },
  elevation: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  regionDescription: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  seasonHeading: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: '#1A1D1E',
    marginBottom: 16,
  },
  seasonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  seasonName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#FF385C',
    marginBottom: 12,
  },
  seasonDetail: {
    marginBottom: 12,
  },
  detailLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#1A1D1E',
    marginBottom: 4,
  },
  detailText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  tipBox: {
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#0EA5E9',
  },
  tipTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#1A1D1E',
    marginBottom: 12,
  },
  tipText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 8,
  },
});
