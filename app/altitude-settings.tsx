import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Bell, Clock, Mountain, Save, Heart, AlertTriangle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { altitudeService, AltitudeSettings, AltitudeProfile } from '../services/AltitudeService';
import { Picker } from '@react-native-picker/picker';

export default function AltitudeSettingsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<AltitudeSettings | null>(null);
  // We still need setProfile for the loadSettings function
  const [, setProfile] = useState<AltitudeProfile | null>(null);

  // Profile fields
  const [userHeight, setUserHeight] = useState<string>('');
  const [userWeight, setUserWeight] = useState<string>('');
  const [userAge, setUserAge] = useState<string>('');
  const [userGender, setUserGender] = useState<'male' | 'female' | 'other'>('male');
  const [userFitnessLevel, setUserFitnessLevel] = useState<'low' | 'moderate' | 'high'>('moderate');
  const [previousAMSHistory, setPreviousAMSHistory] = useState<boolean>(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);

      // Load settings
      const currentSettings = await altitudeService.getSettings();
      setSettings(currentSettings);

      // Load profile
      const userProfile = await altitudeService.getProfile();
      setProfile(userProfile);

      // Set form values
      if (userProfile.userHeightCm) setUserHeight(userProfile.userHeightCm.toString());
      if (userProfile.userWeightKg) setUserWeight(userProfile.userWeightKg.toString());
      if (userProfile.userAge) setUserAge(userProfile.userAge.toString());
      if (userProfile.userGender) setUserGender(userProfile.userGender);
      if (userProfile.userFitnessLevel) setUserFitnessLevel(userProfile.userFitnessLevel);
      if (userProfile.previousAMSHistory !== undefined) setPreviousAMSHistory(userProfile.previousAMSHistory);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsSaving(true);

      // Update settings
      if (settings) {
        await altitudeService.updateSettings(settings);
      }

      // Update profile
      const profileUpdates: Partial<AltitudeProfile> = {
        userHeightCm: userHeight ? parseInt(userHeight, 10) : undefined,
        userWeightKg: userWeight ? parseInt(userWeight, 10) : undefined,
        userAge: userAge ? parseInt(userAge, 10) : undefined,
        userGender,
        userFitnessLevel,
        previousAMSHistory,
      };

      await altitudeService.updateProfile(profileUpdates);

      // Show success message
      Alert.alert(
        'Settings Saved',
        'Your altitude monitoring settings have been updated.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleTrackingToggle = (value: boolean) => {
    if (settings) {
      setSettings({
        ...settings,
        trackingEnabled: value
      });
    }
  };

  const handleNotificationsToggle = (value: boolean) => {
    if (settings) {
      setSettings({
        ...settings,
        notificationsEnabled: value
      });
    }
  };

  const handleAutoRecordingToggle = (value: boolean) => {
    if (settings) {
      setSettings({
        ...settings,
        autoRecording: value
      });
    }
  };

  const handleTrackingIntervalChange = (value: string) => {
    const interval = parseInt(value, 10);
    if (!isNaN(interval) && settings) {
      setSettings({
        ...settings,
        trackingInterval: interval
      });
    }
  };

  const handleAltitudeThresholdChange = (value: string) => {
    const threshold = parseInt(value, 10);
    if (!isNaN(threshold) && settings) {
      setSettings({
        ...settings,
        dangerousAltitudeThreshold: threshold
      });
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronLeft size={24} color="#1A1D1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Altitude Settings</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView style={styles.content}>
        {/* Tracking Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tracking Settings</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Mountain size={20} color="#FF385C" />
              <Text style={styles.settingLabel}>Altitude Tracking</Text>
            </View>
            <Switch
              value={settings?.trackingEnabled || false}
              onValueChange={handleTrackingToggle}
              trackColor={{ false: '#767577', true: '#FF385C' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Bell size={20} color="#FF385C" />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={settings?.notificationsEnabled || false}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: '#767577', true: '#FF385C' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Clock size={20} color="#FF385C" />
              <Text style={styles.settingLabel}>Auto Recording</Text>
            </View>
            <Switch
              value={settings?.autoRecording || false}
              onValueChange={handleAutoRecordingToggle}
              trackColor={{ false: '#767577', true: '#FF385C' }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.inputSettingItem}>
            <Text style={styles.inputLabel}>Tracking Interval (minutes)</Text>
            <TextInput
              style={styles.textInput}
              value={settings?.trackingInterval.toString()}
              onChangeText={handleTrackingIntervalChange}
              keyboardType="number-pad"
              placeholder="10"
            />
          </View>

          <View style={styles.inputSettingItem}>
            <Text style={styles.inputLabel}>Altitude Threshold (meters)</Text>
            <Text style={styles.inputDescription}>
              Altitude at which to start monitoring for AMS symptoms
            </Text>
            <TextInput
              style={styles.textInput}
              value={settings?.dangerousAltitudeThreshold.toString()}
              onChangeText={handleAltitudeThresholdChange}
              keyboardType="number-pad"
              placeholder="3000"
            />
          </View>
        </View>

        {/* User Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Profile</Text>
          <Text style={styles.sectionDescription}>
            Providing your personal information helps us provide more accurate AMS risk assessments.
          </Text>

          <View style={styles.inputSettingItem}>
            <Text style={styles.inputLabel}>Height (cm)</Text>
            <TextInput
              style={styles.textInput}
              value={userHeight}
              onChangeText={setUserHeight}
              keyboardType="number-pad"
              placeholder="175"
            />
          </View>

          <View style={styles.inputSettingItem}>
            <Text style={styles.inputLabel}>Weight (kg)</Text>
            <TextInput
              style={styles.textInput}
              value={userWeight}
              onChangeText={setUserWeight}
              keyboardType="number-pad"
              placeholder="70"
            />
          </View>

          <View style={styles.inputSettingItem}>
            <Text style={styles.inputLabel}>Age</Text>
            <TextInput
              style={styles.textInput}
              value={userAge}
              onChangeText={setUserAge}
              keyboardType="number-pad"
              placeholder="30"
            />
          </View>

          <View style={styles.inputSettingItem}>
            <Text style={styles.inputLabel}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={userGender}
                onValueChange={(itemValue) => setUserGender(itemValue as 'male' | 'female' | 'other')}
                style={styles.picker}
              >
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputSettingItem}>
            <Text style={styles.inputLabel}>Fitness Level</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={userFitnessLevel}
                onValueChange={(itemValue) => setUserFitnessLevel(itemValue as 'low' | 'moderate' | 'high')}
                style={styles.picker}
              >
                <Picker.Item label="Low" value="low" />
                <Picker.Item label="Moderate" value="moderate" />
                <Picker.Item label="High" value="high" />
              </Picker>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <AlertTriangle size={20} color="#FF385C" />
              <View style={{marginLeft: 8}}>
                <Text style={styles.settingLabel}>Previous AMS History</Text>
                <Text style={styles.settingDescription}>
                  Have you experienced altitude sickness before?
                </Text>
              </View>
            </View>
            <Switch
              value={previousAMSHistory}
              onValueChange={setPreviousAMSHistory}
              trackColor={{ false: '#767577', true: '#FF385C' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveSettings}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Save size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.footerButtons}>
        <TouchableOpacity
          style={[styles.footerButton, styles.primaryButton]}
          onPress={() => router.push('/altitude-monitor')}
        >
          <Mountain size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Altitude Monitor</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerButton, styles.secondaryButton]}
          onPress={() => router.push('/altitude-symptoms')}
        >
          <Heart size={20} color="#FF385C" />
          <Text style={styles.secondaryButtonText}>Log Symptoms</Text>
        </TouchableOpacity>
      </View>
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
    fontFamily: 'DMSans-Regular',
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
    fontFamily: 'DMSans-Medium',
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
    paddingBottom: 80, // Add padding to account for footer buttons
  },
  section: {
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
    fontFamily: 'DMSans-Medium',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    fontFamily: 'DMSans-Regular',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    fontFamily: 'DMSans-Medium',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'DMSans-Regular',
  },
  inputSettingItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'DMSans-Medium',
  },
  inputDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'DMSans-Regular',
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontFamily: 'DMSans-Regular',
  },
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    fontFamily: 'DMSans-Regular',
  },
  saveButton: {
    backgroundColor: '#FF385C',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'DMSans-Medium',
  },
  footerButtons: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  footerButton: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginHorizontal: 4,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#FF385C',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF385C',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans-Medium',
  },
  secondaryButtonText: {
    color: '#FF385C',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans-Medium',
  },
});
