import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { ChevronLeft, Car, AlertCircle, DollarSign, Clock, MapPin, ThumbsUp, ThumbsDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// Sample transportation data
const TRANSPORTATION_TYPES = [
  {
    id: '1',
    name: 'Local Buses',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    description: 'The most common and affordable way to travel in Nepal. Local buses connect most towns and villages, though they can be crowded and slow.',
    cost: 'Very Low',
    costRange: '20-200 NPR depending on distance',
    speed: 'Slow',
    comfort: 'Basic',
    routes: 'Extensive network covering most of Nepal',
    pros: [
      'Extremely affordable',
      'Authentic local experience',
      'Frequent departures on main routes',
      'No need to book in advance'
    ],
    cons: [
      'Often overcrowded',
      'No AC in most buses',
      'Slow due to frequent stops',
      'Uncomfortable for long journeys',
      'Limited space for luggage'
    ],
    tips: [
      'Morning departures are recommended as schedules become less reliable as the day progresses',
      'Keep your valuables secure and within sight',
      'For longer routes, try to get a seat by the window',
      'Buses typically leave when full, not on a fixed schedule',
      'Have small bills ready for payment'
    ]
  },
  {
    id: '2',
    name: 'Tourist Buses',
    image: 'https://images.unsplash.com/photo-1590579442133-a666b5bc8474?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    description: 'Higher quality buses specifically catering to tourists, offering more comfort and direct routes between major tourist destinations.',
    cost: 'Moderate',
    costRange: '800-2000 NPR depending on distance',
    speed: 'Medium',
    comfort: 'Good',
    routes: 'Between major tourist destinations (Kathmandu, Pokhara, Chitwan, Lumbini)',
    pros: [
      'More comfortable than local buses',
      'Air conditioning on most routes',
      'Direct routes with fewer stops',
      'Reserved seating',
      'Space for luggage'
    ],
    cons: [
      'More expensive than local buses',
      'Limited to major tourist routes',
      'Need to book in advance during peak season',
      'Still subject to road conditions and traffic'
    ],
    tips: [
      'Book at least a day in advance during peak tourist season',
      'Tourist buses typically depart from specific areas in major cities',
      'Most companies offer online booking or through your hotel',
      'Kathmandu to Pokhara is the most popular route with multiple daily departures',
      'Many tourist buses include a lunch stop on longer journeys'
    ]
  },
  {
    id: '3',
    name: 'Domestic Flights',
    image: 'https://images.unsplash.com/photo-1634999692021-928c33acf600?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    description: 'The fastest way to travel longer distances in Nepal, particularly to remote areas. Essential for reaching certain mountain regions quickly.',
    cost: 'High',
    costRange: '4000-15000 NPR depending on destination',
    speed: 'Fast',
    comfort: 'Good',
    routes: 'Connects Kathmandu to regional airports and mountain airstrips',
    pros: [
      'Save significant time on longer routes',
      'Often the only practical way to reach remote mountain areas',
      'Spectacular views of the Himalayas',
      'Avoid difficult road journeys'
    ],
    cons: [
      'Expensive compared to ground transportation',
      'Frequent delays or cancellations due to weather, especially in mountain regions',
      'Limited baggage allowance',
      'Environmental impact'
    ],
    tips: [
      'Book in advance during peak tourist season (October-November, March-April)',
      'Morning flights have a higher chance of operating as scheduled due to clearer weather',
      'Flights to mountain airstrips (Lukla, Jomsom) are frequently delayed or cancelled due to weather',
      'Reconfirm your flight 24 hours before departure',
      'Be prepared for schedule changes'
    ]
  },
  {
    id: '4',
    name: 'Taxis',
    image: 'https://images.unsplash.com/photo-1602523343809-bcfa4cb28e41?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    description: 'Convenient for short distances within cities or between nearby towns. Taxis in Nepal are typically small hatchbacks or sedans.',
    cost: 'Moderate to High',
    costRange: '300-3000 NPR depending on distance',
    speed: 'Medium to Fast (subject to traffic)',
    comfort: 'Good',
    routes: 'Within cities and to nearby destinations',
    pros: [
      'Convenient and direct',
      'No need to wait for departure times',
      'Can reach places buses don\'t go',
      'Door-to-door service',
      'Air conditioning in most taxis'
    ],
    cons: [
      'Relatively expensive for longer distances',
      'Need to negotiate fares or insist on meter use',
      'Quality of vehicles varies',
      'Language barriers possible with drivers'
    ],
    tips: [
      'Always agree on the fare before starting your journey or insist on using the meter',
      'Taxis from the airport to Kathmandu city typically have fixed rates',
      'For longer distances, negotiate a waiting fee if you want the driver to wait',
      'Keep small denominations of cash for payment',
      'Save trusted driver contacts for future use'
    ]
  },
  {
    id: '5',
    name: 'Jeeps & 4WD',
    image: 'https://images.unsplash.com/photo-1654870476992-4bffc92001c7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    description: 'Essential for remote and mountainous regions with rough roads. Often the only ground transportation option for certain trekking routes.',
    cost: 'High',
    costRange: '3000-15000 NPR depending on destination',
    speed: 'Medium (depends on road conditions)',
    comfort: 'Basic to Moderate',
    routes: 'Remote mountain regions, off-road destinations, trekking starting points',
    pros: [
      'Access to remote areas with poor roads',
      'Can handle difficult terrain and weather conditions',
      'Option to share costs with other travelers',
      'More reliable than buses in mountainous regions'
    ],
    cons: [
      'Expensive, especially for private hire',
      'Can be extremely bumpy and uncomfortable',
      'Often crowded when shared',
      'Journeys can be long and tiring'
    ],
    tips: [
      'For popular trekking routes, look for shared jeep services to split costs',
      'Bring motion sickness medication if you\'re prone to it',
      'Pack essential items in an accessible bag as luggage may be stored on the roof',
      'Private jeep hire gives you more flexibility for photo stops and breaks',
      'Prepare for dusty conditions on unpaved roads'
    ]
  },
  {
    id: '6',
    name: 'Motorcycles & Scooters',
    image: 'https://images.unsplash.com/photo-1568708231120-9d24b1953e28?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    description: 'Renting a motorcycle or scooter offers freedom and flexibility for independent travelers comfortable with challenging road conditions.',
    cost: 'Moderate',
    costRange: '800-1500 NPR per day for rental + fuel costs',
    speed: 'Medium to Fast',
    comfort: 'Depends on rider experience',
    routes: 'Flexible, but best on paved roads and easier terrain',
    pros: [
      'Complete freedom and flexibility',
      'Ability to stop anywhere and explore on your own schedule',
      'More economical than taxis for multiple destinations',
      'Easier to navigate through traffic in cities',
      'Fun way to experience the countryside'
    ],
    cons: [
      'Dangerous due to road conditions and traffic',
      'Requires experience and confidence',
      'Exposure to pollution, dust, and weather',
      'Risk of accidents and injury',
      'Insurance issues and liability concerns'
    ],
    tips: [
      'Only consider this option if you have previous motorcycling experience',
      'Always wear a helmet (bring your own if possible for better quality)',
      'Carry your international driving permit and check insurance coverage',
      'Avoid riding at night or in heavy rain',
      'Be extremely cautious on mountain roads with steep drops and no guardrails',
      'Check the vehicle thoroughly before accepting it'
    ]
  }
];

export default function Transportation() {
  const [selectedTransport, setSelectedTransport] = useState<typeof TRANSPORTATION_TYPES[0] | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Transportation Guide</Text>
      </View>

      {selectedTransport ? (
        <ScrollView style={styles.detailContainer} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.backToListButton}
            onPress={() => {
              setSelectedTransport(null);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <ChevronLeft size={20} color="#FF385C" />
            <Text style={styles.backToListText}>Back to all options</Text>
          </TouchableOpacity>

          <Image
            source={{ uri: selectedTransport.image }}
            style={styles.detailImage}
          />

          <View style={styles.detailContent}>
            <Text style={styles.detailName}>{selectedTransport.name}</Text>
            <Text style={styles.description}>{selectedTransport.description}</Text>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <DollarSign size={18} color="#6B7280" />
                  <View>
                    <Text style={styles.infoLabel}>Cost</Text>
                    <Text style={styles.infoValue}>{selectedTransport.cost}</Text>
                    <Text style={styles.infoDetail}>{selectedTransport.costRange}</Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <Clock size={18} color="#6B7280" />
                  <View>
                    <Text style={styles.infoLabel}>Speed</Text>
                    <Text style={styles.infoValue}>{selectedTransport.speed}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <ThumbsUp size={18} color="#6B7280" />
                  <View>
                    <Text style={styles.infoLabel}>Comfort</Text>
                    <Text style={styles.infoValue}>{selectedTransport.comfort}</Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <MapPin size={18} color="#6B7280" />
                  <View>
                    <Text style={styles.infoLabel}>Routes</Text>
                    <Text style={styles.infoValue} numberOfLines={2}>{selectedTransport.routes}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThumbsUp size={20} color="#22C55E" />
                <Text style={styles.sectionTitle}>Advantages</Text>
              </View>
              {selectedTransport.pros.map((pro, index) => (
                <View key={index} style={styles.bulletItem}>
                  <View style={[styles.bullet, styles.proBullet]} />
                  <Text style={styles.bulletText}>{pro}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThumbsDown size={20} color="#EF4444" />
                <Text style={styles.sectionTitle}>Disadvantages</Text>
              </View>
              {selectedTransport.cons.map((con, index) => (
                <View key={index} style={styles.bulletItem}>
                  <View style={[styles.bullet, styles.conBullet]} />
                  <Text style={styles.bulletText}>{con}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AlertCircle size={20} color="#FF385C" />
                <Text style={styles.sectionTitle}>Traveler Tips</Text>
              </View>
              {selectedTransport.tips.map((tip, index) => (
                <View key={index} style={styles.bulletItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.bulletText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={styles.transportListContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.guideIntro}>
            <Text style={styles.guideTitle}>Getting Around Nepal</Text>
            <Text style={styles.guideDescription}>
              Nepal offers a wide range of transportation options, from local buses to domestic flights. 
              Each has its advantages and challenges depending on your budget, time constraints, and the regions you plan to visit.
            </Text>
          </View>

          {TRANSPORTATION_TYPES.map(transport => (
            <TouchableOpacity
              key={transport.id}
              style={styles.transportCard}
              onPress={() => {
                setSelectedTransport(transport);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <Image source={{ uri: transport.image }} style={styles.transportImage} />
              <View style={styles.transportInfo}>
                <Text style={styles.transportName}>{transport.name}</Text>
                <View style={styles.transportMeta}>
                  <View style={styles.metaItem}>
                    <DollarSign size={16} color="#6B7280" />
                    <Text style={styles.metaText}>{transport.cost}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.metaText}>{transport.speed}</Text>
                  </View>
                </View>
                <Text style={styles.transportDescription} numberOfLines={2}>
                  {transport.description}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.safetyCard}>
            <View style={styles.safetyHeader}>
              <AlertCircle size={24} color="#FF385C" />
              <Text style={styles.safetyTitle}>Safety Considerations</Text>
            </View>
            <Text style={styles.safetyText}>
              Road safety in Nepal can be challenging due to mountainous terrain, poor road conditions, and different driving practices. Always prioritize safety over convenience or cost savings.
            </Text>
            <View style={styles.safetyTips}>
              <View style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Choose reputable transportation providers, even if they cost more</Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Avoid night travel on mountain roads whenever possible</Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Be aware of weather conditions that can affect roads and flights</Text>
              </View>
              <View style={styles.bulletItem}>
                <View style={styles.bullet} />
                <Text style={styles.bulletText}>Build buffer days into your itinerary for potential delays</Text>
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
  transportListContainer: {
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
  transportCard: {
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
  transportImage: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  transportInfo: {
    flex: 1,
    padding: 16,
  },
  transportName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#1A1D1E',
    marginBottom: 8,
  },
  transportMeta: {
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
  transportDescription: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  safetyCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF385C',
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  safetyTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#1A1D1E',
    marginLeft: 8,
  },
  safetyText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  safetyTips: {
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
  description: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: '#4B5563',
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  infoValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#1A1D1E',
    marginLeft: 8,
  },
  infoDetail: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#1A1D1E',
    marginLeft: 8,
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
  proBullet: {
    backgroundColor: '#22C55E',
  },
  conBullet: {
    backgroundColor: '#EF4444',
  },
  bulletText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
    flex: 1,
  },
});
