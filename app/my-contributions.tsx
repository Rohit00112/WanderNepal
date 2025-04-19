import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function MyContributionsScreen() {
  const router = useRouter();

  // Mock data for user contributions
  const contributions = [
    {
      id: 1,
      name: 'Gosaikunda Lake',
      location: 'Rasuwa',
      type: 'Lake',
      reviews: 12,
      date: '2024-03-15',
    },
    {
      id: 2,
      name: 'Swayambhunath',
      location: 'Kathmandu',
      type: 'Heritage',
      reviews: 8,
      date: '2024-02-28',
    },
    {
      id: 3,
      name: 'Manaslu Circuit',
      location: 'Gorkha',
      type: 'Trek',
      reviews: 15,
      date: '2024-02-10',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#FF385C', '#FF1C48']}
        style={styles.header}
      >
        <Text style={styles.title}>My Contributions</Text>
        <Text style={styles.subtitle}>Places and reviews you've shared</Text>
      </LinearGradient>

      <View style={styles.content}>
        {contributions.map((contribution) => (
          <TouchableOpacity
            key={contribution.id}
            style={styles.contributionCard}
            onPress={() => router.push(`/destination-details?id=${contribution.id}`)}
          >
            <View style={styles.contributionInfo}>
              <Text style={styles.placeName}>{contribution.name}</Text>
              <View style={styles.locationContainer}>
                <MapPin size={16} color="#72777A" />
                <Text style={styles.location}>{contribution.location}</Text>
              </View>
              <View style={styles.details}>
                <View style={styles.reviews}>
                  <MessageCircle size={16} color="#FF385C" />
                  <Text style={styles.reviewsText}>{contribution.reviews} Reviews</Text>
                </View>
                <Text style={styles.type}>{contribution.type}</Text>
              </View>
              <Text style={styles.date}>Added on {new Date(contribution.date).toLocaleDateString()}</Text>
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
  contributionCard: {
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
  contributionInfo: {
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
    marginBottom: 8,
  },
  reviews: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewsText: {
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
  date: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: '#72777A',
    marginTop: 4,
  },
});