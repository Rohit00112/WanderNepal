import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Platform, Alert } from 'react-native';
import { Settings, BookMarked, Heart, MapPin, LogOut, Star, Camera, MessageCircle, Cloud, Calendar, Menu, Flag, Users, Car, Coffee, Wifi, AlertTriangle, Map, Mountain } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#FF385C', '#FF1C48']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.profileInfo}>
            <TouchableOpacity onPress={handleEditProfile}>
              <Image
                source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde' }}
                style={styles.avatar}
              />
              <View style={styles.cameraIconContainer}>
                <Camera size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.name}>{user?.fullName || 'Guest User'}</Text>
            <Text style={styles.location}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={handleSignOut}>
            <LogOut size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Trips</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>48</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>156</Text>
          <Text style={styles.statLabel}>Photos</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Trips</Text>
        <View style={styles.tripCard}>
          <Text style={styles.tripName}>Annapurna Base Camp</Text>
          <Text style={styles.tripDate}>June 15, 2024</Text>
          <Text style={styles.tripDetails}>7-day trek • 2 travelers</Text>
          <View style={styles.tripStatus}>
            <Star size={16} color="#FF385C" />
            <Text style={styles.tripStatusText}>Confirmed</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Past Trips</Text>
        <View style={styles.tripCard}>
          <Text style={styles.tripName}>Everest Base Camp</Text>
          <Text style={styles.tripDate}>March 10, 2024</Text>
          <Text style={styles.tripDetails}>14-day trek • 3 travelers</Text>
          <View style={styles.tripStatus}>
            <Star size={16} color="#72777A" />
            <Text style={[styles.tripStatusText, { color: '#72777A' }]}>Completed</Text>
          </View>
        </View>
      </View>

      <View style={styles.menu}>
        <Text style={styles.menuSectionTitle}>Saved Content</Text>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/saved-places')}>
          <BookMarked size={24} color="#1A1D1E" />
          <Text style={styles.menuText}>Saved Places</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/favorites')}>
          <Heart size={24} color="#1A1D1E" />
          <Text style={styles.menuText}>Favorites</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/my-contributions')}>
          <MapPin size={24} color="#1A1D1E" />
          <Text style={styles.menuText}>My Contributions</Text>
        </TouchableOpacity>
        
        <Text style={styles.menuSectionTitle}>Travel Tools</Text>
        
        {/* Routes category - Collapsible section */}
        <View style={styles.categoryContainer}>
          <TouchableOpacity 
            style={styles.categoryHeader}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // In a real implementation, you would toggle state here to expand/collapse
              router.push('/routes-hub');
            }}
          >
            <View style={styles.categoryTitleContainer}>
              <Map size={24} color="#FF385C" />
              <Text style={styles.categoryTitle}>Routes & Navigation</Text>
            </View>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
          
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity 
              style={styles.gridItem}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/offline-routes');
              }}
            >
              <View style={styles.gridItemIcon}>
                <Map size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.gridItemText}>Trekking Routes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.gridItem}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/altitude-monitor');
              }}
            >
              <View style={[styles.gridItemIcon, {backgroundColor: '#4CAF50'}]}>
                <Mountain size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.gridItemText}>Altitude Monitor</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.gridItem}
              onPress={() => router.push('/transportation')}
            >
              <View style={[styles.gridItemIcon, {backgroundColor: '#FF9800'}]}>
                <Car size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.gridItemText}>Transportation</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.gridItem}
              onPress={() => router.push('/connectivity-map')}
            >
              <View style={[styles.gridItemIcon, {backgroundColor: '#03A9F4'}]}>
                <Wifi size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.gridItemText}>Connectivity</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Planning category */}
        <View style={styles.categoryContainer}>
          <TouchableOpacity 
            style={styles.categoryHeader}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/planning-hub');
            }}
          >
            <View style={styles.categoryTitleContainer}>
              <Calendar size={24} color="#FF385C" />
              <Text style={styles.categoryTitle}>Trip Planning</Text>
            </View>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
          
          <View style={styles.quickAccessGrid}>
            <TouchableOpacity 
              style={styles.gridItem}
              onPress={() => router.push('/itinerary-planner')}
            >
              <View style={[styles.gridItemIcon, {backgroundColor: '#9C27B0'}]}>
                <Calendar size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.gridItemText}>Itinerary</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.gridItem}
              onPress={() => router.push('/weather-guide')}
            >
              <View style={[styles.gridItemIcon, {backgroundColor: '#2196F3'}]}>
                <Cloud size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.gridItemText}>Weather</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.gridItem}
              onPress={() => router.push('/festivals')}
            >
              <View style={[styles.gridItemIcon, {backgroundColor: '#E91E63'}]}>
                <Flag size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.gridItemText}>Festivals</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.gridItem}
              onPress={() => router.push('/trek-analyzer')}
            >
              <View style={[styles.gridItemIcon, {backgroundColor: '#4CAF50'}]}>
                <Mountain size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.gridItemText}>Trek Analyzer</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Keep essential tools directly accessible */}
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/emergency-sos');
          }}
        >
          <AlertTriangle size={24} color="#D00000" />
          <Text style={[styles.menuText, styles.emergencyText]}>Emergency SOS</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/language-translator')}>
          <MessageCircle size={24} color="#1A1D1E" />
          <Text style={styles.menuText}>Language Translator</Text>
        </TouchableOpacity>
        
        <Text style={styles.menuSectionTitle}>Community</Text>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/community')}>
          <Users size={24} color="#1A1D1E" />
          <Text style={styles.menuText}>Traveler Community</Text>
        </TouchableOpacity>
        
        <Text style={styles.menuSectionTitle}>Settings</Text>
        <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
          <Settings size={24} color="#1A1D1E" />
          <Text style={styles.menuText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/privacy-settings')}>
          <Menu size={24} color="#1A1D1E" />
          <Text style={styles.menuText}>Privacy Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cameraIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 12,
    backgroundColor: '#FF385C',
    borderRadius: 12,
    padding: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  tripStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  tripStatusText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#FF385C',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 72 : 32,
  },
  headerContent: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  name: {
    fontFamily: 'DMSans-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  location: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  settingsButton: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  statNumber: {
    fontFamily: 'DMSans-Bold',
    fontSize: 28,
    color: '#FF385C',
  },
  statLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#72777A',
    marginTop: 4,
  },
  section: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#1A1D1E',
    marginBottom: 16,
  },
  tripCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  tripName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#1A1D1E',
    marginBottom: 4,
  },
  tripDate: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#FF385C',
    marginBottom: 4,
  },
  tripDetails: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#72777A',
  },
  menu: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 60, // Add marginBottom for spacing
  },
  menuSectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#1A1D1E',
    marginTop: 16,
    marginBottom: 12,
    paddingLeft: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#1A1D1E',
    marginLeft: 12,
  },
  emergencyItem: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
  },
  emergencyText: {
    color: '#D00000',
    fontWeight: '600',
  },
  categoryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#1A1D1E',
    marginLeft: 8,
  },
  viewAllText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#72777A',
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
  },
  gridItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF385C',
  },
  gridItemText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#1A1D1E',
    marginTop: 8,
  },
});