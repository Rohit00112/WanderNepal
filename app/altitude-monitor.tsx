import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ChevronLeft, 
  Mountain, 
  ArrowUp, 
  ArrowDown, 
  Bell, 
  Clock, 
  AlertTriangle, 
  CheckCircle2,
  Heart, 
  Settings as SettingsIcon
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { altitudeService, AltitudeData, AltitudeSettings, AltitudeEvent, AMSSymptom } from '../services/AltitudeService';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function AltitudeMonitorScreen() {
  const router = useRouter();
  const [currentAltitude, setCurrentAltitude] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [settings, setSettings] = useState<AltitudeSettings | null>(null);
  const [altitudeHistory, setAltitudeHistory] = useState<AltitudeData[]>([]);
  const [events, setEvents] = useState<AltitudeEvent[]>([]);
  const [recommendation, setRecommendation] = useState<{
    message: string;
    severity: 'info' | 'warning' | 'danger';
    actions: string[];
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Get current altitude
      const altitude = await altitudeService.getCurrentAltitude();
      setCurrentAltitude(altitude);
      
      // Get settings
      const settings = await altitudeService.getSettings();
      setSettings(settings);
      setIsTracking(settings.trackingEnabled);
      
      // Get altitude history
      const history = await altitudeService.getAltitudeHistory(24); // Last 24 hours
      setAltitudeHistory(history);
      
      // Get events
      const events = await altitudeService.getAltitudeEvents();
      setEvents(events);
      
      // Get recommendation
      const rec = await altitudeService.getRecommendation();
      setRecommendation(rec);
    } catch (error) {
      console.error('Error loading altitude data:', error);
      Alert.alert('Error', 'Failed to load altitude data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTracking = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (isTracking) {
        await altitudeService.stopTracking();
      } else {
        const success = await altitudeService.startTracking();
        if (!success) {
          Alert.alert(
            'Permission Required', 
            'Location permission is required for altitude tracking. Please enable it in settings.'
          );
          return;
        }
      }
      
      // Update settings
      const updatedSettings = await altitudeService.getSettings();
      setSettings(updatedSettings);
      setIsTracking(updatedSettings.trackingEnabled);
      
      // Update current altitude
      const altitude = await altitudeService.getCurrentAltitude();
      setCurrentAltitude(altitude);
      
      // Show confirmation
      Alert.alert(
        isTracking ? 'Tracking Stopped' : 'Tracking Started',
        isTracking 
          ? 'Altitude tracking has been stopped.' 
          : 'Altitude tracking has been started. You will be notified of significant altitude changes.'
      );
    } catch (error) {
      console.error('Error toggling tracking:', error);
      Alert.alert('Error', 'Failed to change tracking settings. Please try again.');
    }
  };

  const logSymptoms = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/altitude-symptoms');
  };

  const viewSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/altitude-settings');
  };

  const resolveEvent = async (eventId: string) => {
    try {
      await altitudeService.resolveEvent(eventId);
      // Refresh events list
      const updatedEvents = await altitudeService.getAltitudeEvents();
      setEvents(updatedEvents);
    } catch (error) {
      console.error('Error resolving event:', error);
      Alert.alert('Error', 'Failed to resolve the alert. Please try again.');
    }
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Format altitude for display
  const formatAltitude = (altitude?: number) => {
    if (altitude === undefined) return 'Unknown';
    return `${Math.round(altitude)} m`;
  };

  // Get severity color
  const getSeverityColor = (severity: 'info' | 'warning' | 'danger') => {
    switch (severity) {
      case 'info': return '#3B82F6';
      case 'warning': return '#F59E0B';
      case 'danger': return '#EF4444';
      default: return '#3B82F6';
    }
  };

  // Prepare chart data
  const prepareChartData = () => {
    if (altitudeHistory.length === 0) return null;
    
    // Sort by timestamp
    const sortedData = [...altitudeHistory].sort((a, b) => a.timestamp - b.timestamp);
    
    // Extract data points (limit to max 24 points for visibility)
    const step = Math.max(1, Math.floor(sortedData.length / 24));
    const dataPoints = [];
    for (let i = 0; i < sortedData.length; i += step) {
      dataPoints.push(sortedData[i]);
    }
    
    // Ensure we have the most recent point
    if (dataPoints[dataPoints.length - 1] !== sortedData[sortedData.length - 1]) {
      dataPoints.push(sortedData[sortedData.length - 1]);
    }
    
    return {
      labels: dataPoints.map(d => {
        const date = new Date(d.timestamp);
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      }),
      datasets: [
        {
          data: dataPoints.map(d => d.altitude),
          color: () => '#FF385C', // Red
          strokeWidth: 2
        }
      ],
    };
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF385C" />
        <Text style={styles.loadingText}>Loading altitude data...</Text>
      </SafeAreaView>
    );
  }

  const chartData = prepareChartData();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Altitude Monitor</Text>
        <TouchableOpacity onPress={viewSettings} style={styles.settingsButton}>
          <SettingsIcon size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Current Altitude Card */}
        <View style={styles.altitudeCard}>
          <View style={styles.altitudeHeader}>
            <Mountain size={24} color="#FF385C" />
            <Text style={styles.altitudeTitle}>Current Altitude</Text>
          </View>
          <Text style={styles.altitudeValue}>{formatAltitude(currentAltitude)}</Text>
          
          <View style={styles.trackingToggle}>
            <Text style={styles.trackingText}>Altitude Tracking</Text>
            <Switch
              value={isTracking}
              onValueChange={toggleTracking}
              trackColor={{ false: '#767577', true: '#FF385C' }}
              thumbColor={isTracking ? '#FFFFFF' : '#f4f3f4'}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.updateButton}
            onPress={async () => {
              const altitude = await altitudeService.getCurrentAltitude();
              setCurrentAltitude(altitude);
            }}
          >
            <Text style={styles.updateButtonText}>Update Altitude</Text>
          </TouchableOpacity>
        </View>
        
        {/* Altitude Chart */}
        {chartData && altitudeHistory.length > 0 ? (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Altitude History (24h)</Text>
            <LineChart
              data={chartData}
              width={width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#FFFFFF',
                backgroundGradientTo: '#FFFFFF',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 56, 92, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(31, 41, 55, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '1',
                  stroke: '#FF385C',
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        ) : (
          <View style={styles.emptyChartCard}>
            <Text style={styles.emptyStateTitle}>No Altitude Data</Text>
            <Text style={styles.emptyStateText}>
              Start altitude tracking to collect data for your altitude profile.
            </Text>
          </View>
        )}
        
        {/* Recommendation Card */}
        {recommendation && (
          <View style={[
            styles.recommendationCard,
            { borderColor: getSeverityColor(recommendation.severity) }
          ]}>
            <Text style={[
              styles.recommendationTitle,
              { color: getSeverityColor(recommendation.severity) }
            ]}>
              {recommendation.severity === 'info' ? 'Information' : 
               recommendation.severity === 'warning' ? 'Warning' : 'Danger'}
            </Text>
            <Text style={styles.recommendationMessage}>{recommendation.message}</Text>
            
            <View style={styles.recommendationActions}>
              {recommendation.actions.map((action, index) => (
                <View key={index} style={styles.actionItem}>
                  <CheckCircle2 size={16} color={getSeverityColor(recommendation.severity)} />
                  <Text style={styles.actionText}>{action}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Active Alerts */}
        {events.length > 0 && (
          <View style={styles.alertsCard}>
            <Text style={styles.alertsTitle}>Active Alerts</Text>
            {events.map(event => (
              <View key={event.id} style={styles.alertItem}>
                <View style={styles.alertHeader}>
                  <AlertTriangle size={20} color={getSeverityColor(event.severity)} />
                  <Text style={styles.alertType}>
                    {event.type === 'rapid-ascent' ? 'Rapid Ascent' :
                     event.type === 'threshold' ? 'Altitude Threshold' :
                     event.type === 'high-altitude' ? 'High Altitude' : 'Altitude Event'}
                  </Text>
                </View>
                <Text style={styles.alertMessage}>{event.message}</Text>
                <Text style={styles.alertTime}>
                  {new Date(event.startTime).toLocaleString()}
                </Text>
                <TouchableOpacity 
                  style={styles.dismissButton}
                  onPress={() => resolveEvent(event.id)}
                >
                  <Text style={styles.dismissButtonText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
        
        {/* Actions Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={logSymptoms}
          >
            <Heart size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Log Symptoms</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#FF385C' }]}
            onPress={() => router.push('/altitude-info')}
          >
            <AlertTriangle size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>AMS Information</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  backButton: {
    padding: 8,
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  altitudeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  altitudeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  altitudeTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginLeft: 8,
  },
  altitudeValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  trackingToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trackingText: {
    fontSize: 16,
    color: '#4B5563',
  },
  updateButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  updateButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4B5563',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyChartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  recommendationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  recommendationMessage: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 12,
    lineHeight: 22,
  },
  recommendationActions: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
  },
  alertsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 12,
  },
  alertItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertType: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    color: '#1F2937',
  },
  alertMessage: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
  },
  alertTime: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  dismissButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: '#F3F4F6',
  },
  dismissButtonText: {
    fontSize: 12,
    color: '#4B5563',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF385C',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
