import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Mountain, ArrowLeft, Heart, Wind, Users, Trophy, ThermometerSun } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';

import { aiFeatureService } from '../services/AIFeatureService';

const TERRAIN_TYPES = [
  { id: '1', name: 'Rocky' },
  { id: '2', name: 'Forest' },
  { id: '3', name: 'Snow' },
  { id: '4', name: 'Grassland' },
  { id: '5', name: 'Desert' },
  { id: '6', name: 'Mixed' }
];

const SEASONS = [
  { id: '1', name: 'Spring' },
  { id: '2', name: 'Summer' },
  { id: '3', name: 'Autumn' },
  { id: '4', name: 'Winter' },
  { id: '5', name: 'Monsoon' }
];


type AnalysisResult = {
  difficulty?: string;
  reasons?: string[];
  recommendations?: string[];
  healthRisks?: string[];
  fitnessRequirements?: string[];
};

type HealthData = {
  heartRate: number;
  bloodOxygen: number;
  altitude: number;
  symptoms: string[];
};

type WeatherData = {
  temperature: number;
  humidity: number;
  windSpeed: number;
  visibility: number;
  safetyScore: number;
  recommendations: string[];
};

type TrekBuddy = {
  id: string;
  name: string;
  compatibility: number;
  experience: string;
  interests: string[];
};

export default function TrekAnalyzerScreen() {
  const insets = useSafeAreaInsets();
  const [elevation, setElevation] = useState('');
  const [distance, setDistance] = useState('');
  const [terrain, setTerrain] = useState('');
  const [season, setSeason] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [healthData, setHealthData] = useState<HealthData>({
    heartRate: 75,
    bloodOxygen: 95,
    altitude: 2500,
    symptoms: []
  });
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [trekBuddies, setTrekBuddies] = useState<TrekBuddy[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
        // Fetch weather data for current location
        fetchWeatherData(location);

        // Start monitoring health data
        const monitorHealth = async () => {
          try {
            const healthMonitoringData = await aiFeatureService.monitorHealthData();
            setHealthData({
              heartRate: healthMonitoringData.heartRate,
              bloodOxygen: healthMonitoringData.bloodOxygen,
              altitude: healthMonitoringData.altitude,
              symptoms: healthMonitoringData.symptoms
            });

            // Alert for concerning health metrics
            if (healthMonitoringData.bloodOxygen < 85 || healthMonitoringData.heartRate > 180) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              Alert.alert(
                'Health Warning',
                'Your vital signs are outside the safe range. Consider descending or resting.',
                [{ text: 'OK', style: 'cancel' }]
              );
            }
          } catch (error) {
            console.error('Error monitoring health data:', error);
          }
        };

        // Monitor health every minute
        const healthMonitorInterval = setInterval(monitorHealth, 60000);
        return () => clearInterval(healthMonitorInterval);
      }
    })();
  }, []);

  const fetchWeatherData = async (location: Location.LocationObject) => {
    try {
      setIsAnalyzing(true);
      const weather = await aiFeatureService.predictWeatherImpact(
        `${location.coords.latitude},${location.coords.longitude}`,
        new Date().toISOString()
      );
      setWeatherData(weather);
      
      // Provide haptic feedback based on weather safety score
      if (weather.safetyScore < 5) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          'Weather Warning',
          'Current weather conditions may be dangerous for trekking. Please review the recommendations carefully.',
          [{ text: 'OK', style: 'cancel' }]
        );
      } else if (weather.safetyScore > 7) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Auto-refresh weather data every 30 minutes
      setTimeout(() => {
        if (userLocation) {
          fetchWeatherData(userLocation);
        }
      }, 1800000);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      Alert.alert('Weather Update Failed', 'Unable to fetch current weather conditions.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeTrek = async () => {
    if (!elevation || !distance || !terrain || !season) {
      Alert.alert('Missing Information', 'Please fill in all trek details before analyzing.');
      return;
    }

    const elevationNum = Number(elevation);
    const distanceNum = Number(distance);

    if (isNaN(elevationNum) || isNaN(distanceNum) || elevationNum <= 0 || distanceNum <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid numbers for elevation and distance.');
      return;
    }

    try {
      setIsAnalyzing(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      const result = await aiFeatureService.predictTrekDifficulty(
        elevationNum,
        distanceNum,
        terrain,
        season
      );

      setAnalysisResult(result);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error analyzing trek:', error);
      Alert.alert(
        'Analysis Error',
        'Unable to analyze trek details. Please try again later.'
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Mountain size={24} color="#000" />
          <Text style={styles.headerTitle}>Trek Analyzer</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Health Monitoring Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Heart size={20} color="#FF385C" />
              <Text style={styles.sectionTitle}>Health Monitor</Text>
            </View>
            <View style={styles.healthStats}>
              <View style={styles.healthStat}>
                <Text style={styles.statValue}>{healthData.heartRate}</Text>
                <Text style={styles.statLabel}>Heart Rate</Text>
              </View>
              <View style={styles.healthStat}>
                <Text style={styles.statValue}>{healthData.bloodOxygen}%</Text>
                <Text style={styles.statLabel}>Blood Oxygen</Text>
              </View>
              <View style={styles.healthStat}>
                <Text style={styles.statValue}>{healthData.altitude}m</Text>
                <Text style={styles.statLabel}>Altitude</Text>
              </View>
            </View>
          </View>

          {/* Weather Section */}
          {weatherData && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <ThermometerSun size={20} color="#FF385C" />
                <Text style={styles.sectionTitle}>Weather Conditions</Text>
              </View>
              <View style={styles.weatherInfo}>
                <Text style={styles.weatherTemp}>{weatherData.temperature}°C</Text>
                <View style={styles.weatherDetails}>
                  <Text style={styles.weatherDetail}>Humidity: {weatherData.humidity}%</Text>
                  <Text style={styles.weatherDetail}>Wind: {weatherData.windSpeed} km/h</Text>
                  <Text style={styles.weatherDetail}>Visibility: {weatherData.visibility/1000} km</Text>
                </View>
                <View style={[styles.safetyScore, { backgroundColor: weatherData.safetyScore > 7 ? '#4CAF50' : '#FF9800' }]}>
                  <Text style={styles.safetyScoreText}>Safety Score: {weatherData.safetyScore}/10</Text>
                </View>
              </View>
            </View>
          )}

          <Text style={styles.title}>AI Trek Difficulty Predictor</Text>
          <Text style={styles.subtitle}>
            Enter trek details to get an AI-powered difficulty assessment
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Elevation (meters)"
              value={elevation}
              onChangeText={setElevation}
              keyboardType="numeric"
              placeholderTextColor="#666"
            />
            <TextInput
              style={styles.input}
              placeholder="Distance (km)"
              value={distance}
              onChangeText={setDistance}
              keyboardType="numeric"
              placeholderTextColor="#666"
            />
          </View>

          <Text style={styles.sectionLabel}>Select Terrain Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsScroll}
          >
            {TERRAIN_TYPES.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.optionButton,
                  terrain === type.name && styles.selectedOptionButton
                ]}
                onPress={() => setTerrain(type.name)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    terrain === type.name && styles.selectedOptionButtonText
                  ]}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionLabel}>Select Season</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.optionsScroll}
          >
            {SEASONS.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.optionButton,
                  season === item.name && styles.selectedOptionButton
                ]}
                onPress={() => setSeason(item.name)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    season === item.name && styles.selectedOptionButtonText
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={analyzeTrek}
            disabled={isAnalyzing}
          >
            <LinearGradient
              colors={['#FF385C', '#FF1C48']}
              style={styles.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze Trek'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {analysisResult && (
            <View style={styles.resultContainer}>
              <Text style={styles.difficultyText}>
                Difficulty: {analysisResult.difficulty}
              </Text>

              <Text style={styles.sectionTitle}>Reasons:</Text>
              {analysisResult.reasons?.map((reason, index) => (
                <Text key={index} style={styles.listItem}>
                  • {reason}
                </Text>
              ))}

              <Text style={styles.sectionTitle}>Recommendations:</Text>
              {analysisResult.recommendations?.map((rec, index) => (
                <Text key={index} style={styles.listItem}>
                  • {rec}
                </Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
    marginTop: 20,
  },
  optionsScroll: {
    paddingBottom: 8,
    marginBottom: 16,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#F3F4F6',
  },
  selectedOptionButton: {
    backgroundColor: '#FF385C',
  },
  optionButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#4B5563',
  },
  selectedOptionButtonText: {
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 24,
    color: '#1A1D1E',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontFamily: 'DMSans-Bold',
    fontSize: 28,
    color: '#1F2937',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    fontFamily: 'DMSans-Regular',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  analyzeButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 32,
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
  gradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  resultContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  difficultyText: {
    fontSize: 24,
    fontFamily: 'DMSans-Bold',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: '#374151',
    marginTop: 12,
    letterSpacing: 0.1,
  },
  listItem: {
    fontSize: 15,
    fontFamily: 'DMSans-Regular',
    color: '#4B5563',
    marginLeft: 8,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  healthStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthStat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'DMSans-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#6B7280',
  },
  weatherInfo: {
    alignItems: 'center',
  },
  weatherTemp: {
    fontSize: 36,
    fontFamily: 'DMSans-Bold',
    color: '#111827',
    marginBottom: 12,
  },
  weatherDetails: {
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  weatherDetail: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: '#6B7280',
  },
  safetyScore: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  safetyScoreText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
  }
});