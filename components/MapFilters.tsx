import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions, Platform, Image } from 'react-native';
import { MapPin, Navigation, Mountain, Coffee, Calendar, Bus, Users, BookOpenText, Globe } from 'lucide-react-native';

interface FilterOption {
  id: string;
  label: string;
  type: 'destination' | 'trek' | 'experience' | 'cuisine' | 'transportation' | 'festival' | 'community' | 'language' | 'weather';
  icon: React.ElementType;
  color: string;
  gradient?: string[];
}

interface MapFiltersProps {
  activeFilters: string[];
  onFilterChange: (filterId: string) => void;
  screenWidth?: number;
  isTablet?: boolean;
}

const MapFilters: React.FC<MapFiltersProps> = ({ 
  activeFilters, 
  onFilterChange,
  screenWidth,
  isTablet = false
}) => {
  // Use passed screen width or get it from hook
  const { width } = useWindowDimensions();
  const actualWidth = screenWidth || width;
  
  // Calculate sizes based on screen dimensions
  const isLargePhone = actualWidth >= 414 && actualWidth < 768;
  const isSmallPhone = actualWidth < 414;
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'explore' | 'utilities'>('explore');
  
  const exploreTabs: FilterOption[] = [
    {
      id: 'destination',
      label: 'Destinations',
      type: 'destination',
      icon: MapPin,
      color: '#FF385C',
      gradient: ['#FF385C', '#FF7E79']
    },
    {
      id: 'trek',
      label: 'Treks',
      type: 'trek',
      icon: Mountain,
      color: '#4E8A3D',
      gradient: ['#4E8A3D', '#7BBF69']
    },
    {
      id: 'experience',
      label: 'Experiences',
      type: 'experience',
      icon: Navigation,
      color: '#4361EE',
      gradient: ['#4361EE', '#7B98FF']
    },
    {
      id: 'cuisine',
      label: 'Cuisine',
      type: 'cuisine',
      icon: Coffee,
      color: '#F59E0B',
      gradient: ['#F59E0B', '#FBC15F']
    }
  ];

  const utilityTabs: FilterOption[] = [
    {
      id: 'transportation',
      label: 'Transport',
      type: 'transportation',
      icon: Bus,
      color: '#8B5CF6',
      gradient: ['#8B5CF6', '#BB8DFF']
    },
    {
      id: 'festival',
      label: 'Festivals',
      type: 'festival',
      icon: Calendar,
      color: '#EC4899',
      gradient: ['#EC4899', '#F87BC1']
    },
    {
      id: 'community',
      label: 'Community',
      type: 'community',
      icon: Users,
      color: '#059669',
      gradient: ['#059669', '#34D399']
    },
    {
      id: 'weather',
      label: 'Weather',
      type: 'weather',
      icon: Globe,
      color: '#2563EB',
      gradient: ['#2563EB', '#60A5FA']
    }
  ];

  // Adjust sizes based on device
  const cardSize = isTablet ? 100 : (isLargePhone ? 85 : 70);
  const iconSize = isTablet ? 26 : (isLargePhone ? 22 : 18);
  const fontSize = isTablet ? 14 : (isLargePhone ? 12 : 10);
  const marginRight = isTablet ? 16 : (isLargePhone ? 12 : 8);
  const tabFontSize = isTablet ? 16 : (isLargePhone ? 14 : 12);

  // Display filters based on active tab
  const filtersToDisplay = activeTab === 'explore' ? exploreTabs : utilityTabs;

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        {/* Tab headers */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'explore' && styles.activeTab
            ]}
            onPress={() => setActiveTab('explore')}
          >
            <Text style={[
              styles.tabText, 
              { 
                fontSize: tabFontSize,
                color: activeTab === 'explore' ? '#1A1D1E' : '#9CA3AF'
              }
            ]}>Explore</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              activeTab === 'utilities' && styles.activeTab
            ]}
            onPress={() => setActiveTab('utilities')}
          >
            <Text style={[
              styles.tabText, 
              {
                fontSize: tabFontSize,
                color: activeTab === 'utilities' ? '#1A1D1E' : '#9CA3AF'
              }
            ]}>Utilities</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {filtersToDisplay.map((filter, index) => {
            const isActive = activeFilters.includes(filter.id);
            const IconComponent = filter.icon;
            
            return (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterCard,
                  {
                    width: cardSize,
                    height: cardSize,
                    marginRight: index < 3 ? marginRight : 0,
                    backgroundColor: isActive ? filter.color : '#FFFFFF',
                    borderColor: filter.color,
                  }
                ]}
                onPress={() => onFilterChange(filter.id)}
              >
                <View style={[
                  styles.iconContainer,
                  {
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                    width: iconSize * 1.8,
                    height: iconSize * 1.8,
                    borderRadius: iconSize * 0.9,
                  }
                ]}>
                  <IconComponent 
                    size={iconSize} 
                    color={isActive ? '#FFFFFF' : filter.color} 
                  />
                </View>
                <Text
                  style={[
                    styles.filterLabel,
                    { 
                      color: isActive ? '#FFFFFF' : '#1A1D1E',
                      fontSize: fontSize,
                      marginTop: 8
                    }
                  ]}
                  numberOfLines={1}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
    zIndex: 100,
  },
  filtersContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    paddingBottom: 8,
    marginRight: 24,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF385C',
  },
  tabText: {
    fontFamily: 'DMSans-Bold',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterCard: {
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterLabel: {
    fontFamily: 'DMSans-Bold',
    textAlign: 'center',
  },
});

export default MapFilters;
