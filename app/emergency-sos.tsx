import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, SafeAreaView, Switch, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, PlusCircle, X, Heart, AlertTriangle, Phone, Info, Bell, BellOff } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { emergencyService, EmergencyContact, EmergencyAgency } from '../services/EmergencyService';

export default function EmergencySOSScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [agencies, setAgencies] = useState<EmergencyAgency[]>([]);
  const [emergencyMessage, setEmergencyMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSOSActive, setIsSOSActive] = useState<boolean>(false);
  const [showAddContactForm, setShowAddContactForm] = useState<boolean>(false);
  
  // New contact form state
  const [newContact, setNewContact] = useState<{
    name: string;
    phoneNumber: string;
    relation: string;
    notifyOnSOS: boolean;
  }>({
    name: '',
    phoneNumber: '',
    relation: '',
    notifyOnSOS: true,
  });
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load emergency contacts
        const loadedContacts = await emergencyService.getEmergencyContacts();
        setContacts(loadedContacts);
        
        // Get emergency agencies
        const loadedAgencies = emergencyService.getEmergencyAgencies();
        setAgencies(loadedAgencies);
        
        // Check if SOS is active
        const sosActive = emergencyService.isSOSActive();
        setIsSOSActive(sosActive);
      } catch (error) {
        console.error('Failed to load emergency data:', error);
        Alert.alert('Error', 'Failed to load emergency contacts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleBackPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };
  
  const toggleAddContactForm = () => {
    setShowAddContactForm(!showAddContactForm);
    setNewContact({
      name: '',
      phoneNumber: '',
      relation: '',
      notifyOnSOS: true,
    });
  };
  
  const addContact = async () => {
    if (!newContact.name || !newContact.phoneNumber) {
      Alert.alert('Missing Information', 'Please provide both name and phone number.');
      return;
    }
    
    try {
      const addedContact = await emergencyService.addEmergencyContact(newContact);
      setContacts([...contacts, addedContact]);
      toggleAddContactForm();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to add contact:', error);
      Alert.alert('Error', 'Failed to add emergency contact. Please try again.');
    }
  };
  
  const deleteContact = async (contactId: string) => {
    Alert.alert(
      'Delete Contact',
      'Are you sure you want to remove this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await emergencyService.deleteEmergencyContact(contactId);
              setContacts(contacts.filter(c => c.id !== contactId));
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Failed to delete contact:', error);
              Alert.alert('Error', 'Failed to delete emergency contact. Please try again.');
            }
          }
        }
      ]
    );
  };
  
  const toggleContactNotification = async (contact: EmergencyContact) => {
    try {
      const updatedContact = {
        ...contact,
        notifyOnSOS: !contact.notifyOnSOS
      };
      
      await emergencyService.updateEmergencyContact(updatedContact);
      setContacts(contacts.map(c => 
        c.id === contact.id ? updatedContact : c
      ));
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Failed to update contact:', error);
      Alert.alert('Error', 'Failed to update emergency contact. Please try again.');
    }
  };
  
  const handleSOSPress = () => {
    // Provide haptic feedback to indicate critical action
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    if (isSOSActive) {
      // Confirm SOS cancellation
      Alert.alert(
        'Cancel Emergency SOS',
        'Are you sure you want to cancel the emergency SOS alert?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel SOS',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsLoading(true);
                const result = await emergencyService.cancelSOS();
                if (result.success) {
                  setIsSOSActive(false);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  Alert.alert('SOS Cancelled', result.message);
                } else {
                  Alert.alert('Error', result.message);
                }
              } catch (error) {
                console.error('Failed to cancel SOS:', error);
                Alert.alert('Error', 'Failed to cancel SOS. Please try again.');
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    } else {
      // Confirm SOS activation
      if (contacts.filter(c => c.notifyOnSOS).length === 0) {
        Alert.alert(
          'No Emergency Contacts',
          'You don\'t have any emergency contacts set to notify. Add contacts before triggering SOS.'
        );
        return;
      }
      
      Alert.alert(
        'Confirm Emergency SOS',
        'This will notify your emergency contacts with your current location. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'SEND SOS ALERT',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsLoading(true);
                const result = await emergencyService.triggerSOS(emergencyMessage || 'Emergency assistance needed!');
                if (result.success) {
                  setIsSOSActive(true);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  Alert.alert('SOS Activated', result.message);
                } else {
                  Alert.alert('Error', result.message);
                }
              } catch (error) {
                console.error('Failed to trigger SOS:', error);
                Alert.alert('Error', 'Failed to trigger SOS. Please try again.');
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF385C" />
        <Text style={styles.loadingText}>Loading emergency information...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency SOS</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content}>
        {/* SOS Button */}
        <View style={styles.sosSection}>
          <Text style={styles.sosSectionTitle}>
            {isSOSActive ? 'SOS ALERT ACTIVE' : 'Emergency SOS Alert'}
          </Text>
          <Text style={styles.sosSectionDescription}>
            {isSOSActive 
              ? 'Your emergency contacts have been notified with your location.' 
              : 'In case of emergency, press the SOS button to alert your contacts with your location.'}
          </Text>
          
          {!isSOSActive && (
            <TextInput
              style={styles.messageInput}
              placeholder="Add emergency message (optional)"
              value={emergencyMessage}
              onChangeText={setEmergencyMessage}
              multiline
              maxLength={200}
            />
          )}
          
          <TouchableOpacity
            style={[
              styles.sosButton,
              isSOSActive ? styles.sosButtonActive : {}
            ]}
            onPress={handleSOSPress}
          >
            <Text style={styles.sosButtonText}>
              {isSOSActive ? 'CANCEL SOS ALERT' : 'SEND SOS ALERT'}
            </Text>
            <AlertTriangle size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        {/* Emergency Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            <TouchableOpacity onPress={toggleAddContactForm}>
              {showAddContactForm ? (
                <X size={24} color="#FF385C" />
              ) : (
                <PlusCircle size={24} color="#FF385C" />
              )}
            </TouchableOpacity>
          </View>
          
          {/* Add Contact Form */}
          {showAddContactForm && (
            <View style={styles.addContactForm}>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={newContact.name}
                onChangeText={(text) => setNewContact({...newContact, name: text})}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={newContact.phoneNumber}
                onChangeText={(text) => setNewContact({...newContact, phoneNumber: text})}
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                placeholder="Relation (e.g., Family, Friend)"
                value={newContact.relation}
                onChangeText={(text) => setNewContact({...newContact, relation: text})}
              />
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Notify on SOS</Text>
                <Switch
                  value={newContact.notifyOnSOS}
                  onValueChange={(value) => setNewContact({...newContact, notifyOnSOS: value})}
                  trackColor={{ false: '#767577', true: '#FF385C' }}
                  thumbColor={newContact.notifyOnSOS ? '#FFFFFF' : '#f4f3f4'}
                />
              </View>
              <TouchableOpacity style={styles.addButton} onPress={addContact}>
                <Text style={styles.addButtonText}>Add Contact</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Contact List */}
          {contacts.length > 0 ? (
            contacts.map(contact => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
                  {contact.relation && (
                    <Text style={styles.contactRelation}>{contact.relation}</Text>
                  )}
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity 
                    style={styles.contactAction}
                    onPress={() => toggleContactNotification(contact)}
                  >
                    {contact.notifyOnSOS ? (
                      <Bell size={20} color="#FF385C" />
                    ) : (
                      <BellOff size={20} color="#72777A" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.contactAction}
                    onPress={() => deleteContact(contact.id)}
                  >
                    <X size={20} color="#FF385C" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No emergency contacts added yet. Add contacts who should be notified in case of emergency.
              </Text>
            </View>
          )}
        </View>
        
        {/* Emergency Agencies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Services in Nepal</Text>
          {agencies.map(agency => (
            <View key={agency.id} style={styles.agencyCard}>
              <View style={styles.agencyInfo}>
                <Text style={styles.agencyName}>{agency.name}</Text>
                <Text style={styles.agencyPhone}>{agency.phoneNumber}</Text>
                <Text style={styles.agencyDescription}>{agency.description}</Text>
                <Text style={styles.agencyCoverage}>
                  Coverage: {agency.coverageAreas.join(', ')}
                </Text>
              </View>
              <TouchableOpacity style={styles.callButton}>
                <Phone size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        
        {/* Safety Information */}
        <View style={styles.section}>
          <View style={styles.infoBox}>
            <Info size={20} color="#FF385C" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              SOS alerts will send your current location and emergency message to your selected contacts.
              In remote areas with limited connectivity, the app will attempt to send SMS messages directly.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  sosSection: {
    marginBottom: 24,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sosSectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#E02954',
    marginBottom: 8,
    textAlign: 'center',
  },
  sosSectionDescription: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 16,
  },
  messageInput: {
    width: '100%',
    height: 80,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  sosButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF385C',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    gap: 12,
  },
  sosButtonActive: {
    backgroundColor: '#D00000',
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  contactCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  contactPhone: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 2,
  },
  contactRelation: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 12,
  },
  contactAction: {
    padding: 8,
  },
  agencyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  agencyInfo: {
    flex: 1,
  },
  agencyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  agencyPhone: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 2,
  },
  agencyDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  agencyCoverage: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#6B7280',
    marginTop: 2,
  },
  callButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 10,
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  addContactForm: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#FF385C',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});
