import { View, Text, StyleSheet, Platform, TextInput } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, X } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useState } from 'react';

export default function Header() {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = () => {
    // Implement search functionality here
    console.log('Searching for:', searchQuery);
    setShowSearch(false);
    setSearchQuery('');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF385C', '#FF1C48']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.main}>
          <Link href="/" style={styles.logo}>
            <Text style={styles.logoText}>WanderNepal</Text>
          </Link>
          <View style={styles.actions}>
            {showSearch ? (
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search destinations..."
                  placeholderTextColor="#72777A"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearch}
                  autoFocus
                />
                <TouchableOpacity
                  style={styles.closeSearch}
                  onPress={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                  }}
                >
                  <X color="#72777A" size={20} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setShowSearch(true)}
              >
                <Search color="#FFFFFF" size={24} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 0,
        zIndex: 100,
      },
    }),
  },
  gradient: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 72 : 32,
  },
  logo: {
    paddingVertical: 8,
  },
  logoText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 28,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: '#1A1D1E',
  },
  closeSearch: {
    padding: 8,
  },

});