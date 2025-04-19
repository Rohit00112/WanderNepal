import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { ChevronLeft, AlertCircle, ExternalLink } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../contexts/AuthContext';

export default function PrivacySettings() {
  const { user, updateProfile } = useAuth();
  
  const [locationTracking, setLocationTracking] = useState(true);
  const [shareActivityHistory, setShareActivityHistory] = useState(false);
  const [saveSearchHistory, setSaveSearchHistory] = useState(true);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(true);
  const [marketingNotifications, setMarketingNotifications] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled || false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // In a real app, you would save all settings to a backend
      // For this demo, we'll just update the notifications setting in user profile
      await updateProfile({
        notificationsEnabled
      });
      
      // Simulate saving delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Privacy settings updated successfully.');
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      Alert.alert('Error', 'Failed to save privacy settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear Data',
      'Are you sure you want to clear all your app data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear Data', 
          style: 'destructive',
          onPress: () => {
            // In a real app, this would clear user data from storage
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert('Data Cleared', 'All your app data has been cleared.');
          }
        }
      ]
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      'Download Your Data',
      'Your data will be prepared and sent to your email address within 24 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Request Data', 
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('Request Submitted', 'We will process your data request and send you an email when it\'s ready.');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <AlertCircle size={24} color="#FF385C" style={styles.infoIcon} />
          <Text style={styles.infoText}>
            Your privacy matters to us. These settings control how your data is used in the app.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Collection</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Location Tracking</Text>
              <Text style={styles.settingDescription}>Allow app to track your location for nearby recommendations</Text>
            </View>
            <Switch 
              value={locationTracking}
              onValueChange={(value) => {
                setLocationTracking(value);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              trackColor={{ false: '#D1D5DB', true: '#FF385C' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Share Activity History</Text>
              <Text style={styles.settingDescription}>Share your activity with other travelers</Text>
            </View>
            <Switch 
              value={shareActivityHistory}
              onValueChange={(value) => {
                setShareActivityHistory(value);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              trackColor={{ false: '#D1D5DB', true: '#FF385C' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Save Search History</Text>
              <Text style={styles.settingDescription}>Save your search history for faster access</Text>
            </View>
            <Switch 
              value={saveSearchHistory}
              onValueChange={(value) => {
                setSaveSearchHistory(value);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              trackColor={{ false: '#D1D5DB', true: '#FF385C' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personalization</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Personalized Recommendations</Text>
              <Text style={styles.settingDescription}>Get recommendations based on your preferences</Text>
            </View>
            <Switch 
              value={personalizedRecommendations}
              onValueChange={(value) => {
                setPersonalizedRecommendations(value);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              trackColor={{ false: '#D1D5DB', true: '#FF385C' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive app notifications about your bookings and trips</Text>
            </View>
            <Switch 
              value={notificationsEnabled}
              onValueChange={(value) => {
                setNotificationsEnabled(value);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              trackColor={{ false: '#D1D5DB', true: '#FF385C' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Marketing Emails</Text>
              <Text style={styles.settingDescription}>Receive emails about promotions and special offers</Text>
            </View>
            <Switch 
              value={marketingNotifications}
              onValueChange={(value) => {
                setMarketingNotifications(value);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              trackColor={{ false: '#D1D5DB', true: '#FF385C' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Data</Text>
          
          <TouchableOpacity 
            style={styles.dataButton}
            onPress={handleDownloadData}
          >
            <View style={styles.dataButtonContent}>
              <ExternalLink size={20} color="#FF385C" />
              <Text style={styles.dataButtonText}>Download Your Data</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.dataButton, styles.clearDataButton]}
            onPress={handleClearData}
          >
            <View style={styles.dataButtonContent}>
              <AlertCircle size={20} color="#FF385C" />
              <Text style={styles.dataButtonText}>Clear All Data</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.savingButton]}
          onPress={handleSaveSettings}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Read our <Text style={styles.link}>Privacy Policy</Text> and <Text style={styles.link}>Terms of Service</Text> for more information.</Text>
        </View>
      </ScrollView>
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
  content: {
    padding: 24,
    paddingBottom: 60,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#1A1D1E',
    flex: 1,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#1A1D1E',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#1A1D1E',
    marginBottom: 4,
  },
  settingDescription: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  dataButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  dataButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#1A1D1E',
    marginLeft: 12,
  },
  clearDataButton: {
    backgroundColor: '#FFF5F5',
  },
  saveButton: {
    backgroundColor: '#FF385C',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  savingButton: {
    backgroundColor: '#D1D5DB',
  },
  saveButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  footerText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  link: {
    color: '#FF385C',
    textDecorationLine: 'underline',
  },
});
