import React from 'react';
import { StyleSheet } from 'react-native';
import { Polygon, Circle } from 'react-native-maps';

// Define connectivity types
export type ConnectivityLevel = 'high' | 'medium' | 'low' | 'none' | 'emergency-only';

export type ConnectivityPoint = {
  id: string;
  type: 'area' | 'spot';
  level: ConnectivityLevel;
  coordinates: {
    latitude: number;
    longitude: number;
    radius?: number; // For spot type
  } | {
    latitude: number;
    longitude: number;
  }[];  // For area type
  provider?: string;
  notes?: string;
  lastVerified?: string; // ISO date
};

interface ConnectivityLayerProps {
  connectivityData: ConnectivityPoint[];
  visible: boolean;
}

// Color mapping for different connectivity levels
const getConnectivityColor = (level: ConnectivityLevel): string => {
  switch (level) {
    case 'high':
      return 'rgba(0, 200, 83, 0.3)';
    case 'medium':
      return 'rgba(255, 193, 7, 0.3)';
    case 'low':
      return 'rgba(255, 87, 34, 0.3)';
    case 'none':
      return 'rgba(213, 0, 0, 0.2)';
    case 'emergency-only':
      return 'rgba(156, 39, 176, 0.3)';
    default:
      return 'rgba(158, 158, 158, 0.3)';
  }
};

const ConnectivityLayer: React.FC<ConnectivityLayerProps> = ({ connectivityData, visible }) => {
  if (!visible) return null;

  return (
    <>
      {connectivityData.map((point) => {
        const fillColor = getConnectivityColor(point.level);
        const strokeColor = fillColor.replace('0.3', '0.8');

        if (point.type === 'area' && Array.isArray(point.coordinates)) {
          return (
            <Polygon
              key={point.id}
              coordinates={point.coordinates as {latitude: number; longitude: number}[]}
              fillColor={fillColor}
              strokeColor={strokeColor}
              strokeWidth={1}
            />
          );
        } else if (point.type === 'spot' && !Array.isArray(point.coordinates)) {
          const { latitude, longitude, radius = 500 } = point.coordinates;
          return (
            <Circle
              key={point.id}
              center={{ latitude, longitude }}
              radius={radius}
              fillColor={fillColor}
              strokeColor={strokeColor}
              strokeWidth={1}
            />
          );
        }
        return null;
      })}
    </>
  );
};

const styles = StyleSheet.create({
  // Styles would go here if needed
});

export default ConnectivityLayer;
