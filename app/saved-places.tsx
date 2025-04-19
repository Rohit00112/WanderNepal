import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Star } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function SavedPlacesScreen() {
  const router = useRouter();

  // Mock data for saved places
  const savedPlaces = [
    {
      id: 1,
      name: 'Annapurna Base Camp',
      location: 'Annapurna Region',
      rating: 4.8,
      type: 'Trek',
    },
    {
      id: 2,
      name: 'Patan Durbar Square',
      location: 'Lalitpur',
      rating: 4.6,
      type: 'Heritage',
    },
    {
      id: 3,
      name: 'Phewa Lake',
      location: 'Pokhara',
      rating: 4.5,
      type: 'Lake',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#FF385C', '#FF1C48']}
        style={styles.header}
      >
        <Text style={styles.title}>Saved Places</Text>
        <Text style={styles.subtitle}>Your bookmarked destinations</Text>
      </LinearGradient>

      <View style={styles.content}>
        {savedPlaces.map((place) => (
          <TouchableOpacity
            key={place.id}
            style={styles.placeCard}
            onPress={() => router.push(`/destination-details?id=${place.id}`)}
          >
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>{place.name}</Text>
              <View style={styles.locationContainer}>
                <MapPin size={16} color="#72777A" />
                <Text style={styles.location}>{place.location}</Text>
              </View>
              <View style={styles.details}>
                <View style={styles.rating}>
                  <Star size={16} color="#FF385C" />
                  <Text style={styles.ratingText}>{place.rating}</Text>
                </View>
                <Text style={styles.type}>{place.type}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 72 : 32,
  },
  title: {
    fontFamily: 'DMSans-Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    padding: 16,
  },
  placeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: '#1A1D1E',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  location: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#72777A',
    marginLeft: 4,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#1A1D1E',
  },
  type: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#72777A',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
});