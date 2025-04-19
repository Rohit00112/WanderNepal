import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Heart, Send } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { altitudeService, AMSSymptom } from '../services/AltitudeService';
import Slider from '@react-native-community/slider';

// AMS symptoms with descriptions
const SYMPTOMS: {id: AMSSymptom, label: string, description: string}[] = [
  {id: 'headache', label: 'Headache', description: 'Most common symptom of AMS'},
  {id: 'nausea', label: 'Nausea', description: 'Feeling of sickness or disgust'},
  {id: 'vomiting', label: 'Vomiting', description: 'Forceful expulsion of stomach contents'},
  {id: 'fatigue', label: 'Fatigue', description: 'Extreme tiredness or lack of energy'},
  {id: 'dizziness', label: 'Dizziness', description: 'Feeling faint or unsteady'},
  {id: 'insomnia', label: 'Insomnia', description: 'Difficulty falling or staying asleep'},
  {id: 'loss_of_appetite', label: 'Loss of Appetite', description: 'Reduced desire to eat'},
  {id: 'shortness_of_breath', label: 'Shortness of Breath', description: 'Difficult or labored breathing'},
  {id: 'rapid_heartbeat', label: 'Rapid Heartbeat', description: 'Heart beating faster than normal'},
  {id: 'weakness', label: 'Weakness', description: 'Lack of physical strength'},
  {id: 'confusion', label: 'Confusion', description: 'Difficulty thinking clearly'},
];

export default function AltitudeSymptomsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentAltitude, setCurrentAltitude] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [symptoms, setSymptoms] = useState<{[key in AMSSymptom]?: 0 | 1 | 2 | 3}>({});

  useEffect(() => {
    loadCurrentAltitude();
  }, []);

  const loadCurrentAltitude = async () => {
    try {
      setIsLoading(true);
      const altitude = await altitudeService.getCurrentAltitude();
      setCurrentAltitude(altitude);
    } catch (error) {
      console.error('Error loading altitude:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeverityChange = (symptom: AMSSymptom, value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSymptoms(prev => ({
      ...prev,
      [symptom]: value as 0 | 1 | 2 | 3
    }));
  };

  const handleSubmit = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setSubmitting(true);
      
      // Filter out symptoms with severity 0
      const filteredSymptoms: {[key in AMSSymptom]?: 0 | 1 | 2 | 3} = {};
      for (const [symptom, severity] of Object.entries(symptoms)) {
        if (severity && severity > 0) {
          filteredSymptoms[symptom as AMSSymptom] = severity;
        }
      }
      
      // Log symptoms
      await altitudeService.logSymptoms(filteredSymptoms, notes);
      
      // Show success message
      Alert.alert(
        'Symptoms Logged',
        'Your symptoms have been recorded. Check the altitude monitor for recommendations.',
        [
          { 
            text: 'OK', 
            onPress: () => router.back() 
          }
        ]
      );
    } catch (error) {
      console.error('Error logging symptoms:', error);
      Alert.alert('Error', 'Failed to log symptoms. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF385C" />
        <Text style={styles.loadingText}>Getting current altitude...</Text>
      </SafeAreaView>
    );
  }

  // Calculate if any symptoms have been selected
  const hasSelectedSymptoms = Object.values(symptoms).some(severity => severity && severity > 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log AMS Symptoms</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView style={styles.content}>
        {/* Current Altitude */}
        <View style={styles.altitudeCard}>
          <Text style={styles.altitudeLabel}>Current Altitude</Text>
          <Text style={styles.altitudeValue}>
            {currentAltitude !== undefined 
              ? `${Math.round(currentAltitude)} meters`
              : 'Unknown'}
          </Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={loadCurrentAltitude}
          >
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {/* Symptoms Selection */}
        <View style={styles.symptomsContainer}>
          <Text style={styles.sectionTitle}>Select Symptoms</Text>
          <Text style={styles.instructionText}>
            Rate the severity of each symptom from 0 (none) to 3 (severe).
          </Text>
          
          {SYMPTOMS.map(symptom => (
            <View key={symptom.id} style={styles.symptomItem}>
              <View style={styles.symptomHeader}>
                <Text style={styles.symptomName}>{symptom.label}</Text>
                <Text style={styles.symptomValue}>
                  {symptoms[symptom.id] === undefined || symptoms[symptom.id] === 0 
                    ? 'None' 
                    : symptoms[symptom.id] === 1 
                    ? 'Mild' 
                    : symptoms[symptom.id] === 2 
                    ? 'Moderate' 
                    : 'Severe'}
                </Text>
              </View>
              
              <Text style={styles.symptomDescription}>{symptom.description}</Text>
              
              <Text style={styles.sliderLabel}>Severity: {symptoms[symptom.id] === undefined || symptoms[symptom.id] === 0 ? 'None' : symptoms[symptom.id] === 1 ? 'Mild' : symptoms[symptom.id] === 2 ? 'Moderate' : 'Severe'}</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={3}
                step={1}
                value={symptoms[symptom.id] || 0}
                onValueChange={(value: number) => handleSeverityChange(symptom.id, value)}
                minimumTrackTintColor="#FF385C"
                maximumTrackTintColor="#E5E7EB"
                thumbTintColor="#FF385C"
              />
              
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>None</Text>
                <Text style={styles.sliderLabel}>Mild</Text>
                <Text style={styles.sliderLabel}>Moderate</Text>
                <Text style={styles.sliderLabel}>Severe</Text>
              </View>
            </View>
          ))}
        </View>
        
        {/* Notes */}
        <View style={styles.notesContainer}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any additional symptoms or notes here..."
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </View>
        
        {/* Submit Button */}
        <TouchableOpacity 
          style={[
            styles.submitButton,
            (!hasSelectedSymptoms && !notes) ? styles.submitButtonDisabled : {}
          ]}
          onPress={handleSubmit}
          disabled={(!hasSelectedSymptoms && !notes) || submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Send size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Log Symptoms</Text>
            </>
          )}
        </TouchableOpacity>
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
  content: {
    flex: 1,
    padding: 16,
  },
  altitudeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  altitudeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  altitudeValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  refreshButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  refreshButtonText: {
    fontSize: 14,
    color: '#4B5563',
  },
  symptomsContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  symptomItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  symptomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  symptomName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  symptomValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF385C',
  },
  symptomDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
    marginVertical: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  notesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notesInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    height: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FF385C',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
