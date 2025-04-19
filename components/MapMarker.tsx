import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { MapPin } from 'lucide-react-native';

interface MapMarkerProps {
  type: 'destination' | 'trek' | 'experience' | 'cuisine';
  selected?: boolean;
  animated?: boolean;
}

const MapMarker: React.FC<MapMarkerProps> = ({ type, selected = false, animated = false }) => {
  const scaleAnimation = React.useRef(new Animated.Value(1)).current;
  
  React.useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnimation, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scaleAnimation.setValue(selected ? 1.3 : 1);
    }
  }, [animated, selected]);

  // Different colors for different types
  const getColor = () => {
    switch (type) {
      case 'destination':
        return '#FF385C'; // red
      case 'trek':
        return '#4E8A3D'; // green
      case 'experience':
        return '#4361EE'; // blue
      case 'cuisine':
        return '#F59E0B'; // amber
      default:
        return '#FF385C';
    }
  };

  return (
    <Animated.View style={[
      styles.markerContainer,
      { transform: [{ scale: scaleAnimation }] }
    ]}>
      <MapPin 
        size={selected ? 32 : 28} 
        color={getColor()} 
        fill={selected ? getColor() : 'white'} 
        strokeWidth={selected ? 2 : 1.5}
      />
      {selected && (
        <View style={[styles.selectedCircle, { borderColor: getColor() }]} />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCircle: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
  }
});

export default MapMarker;
