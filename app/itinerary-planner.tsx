import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, PlusCircle, Trash2, Save, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface ItineraryDay {
  id: string;
  date: Date;
  activities: {
    id: string;
    time: string;
    description: string;
    location: string;
  }[];
}

interface Itinerary {
  id: string;
  name: string;
  days: ItineraryDay[];
  createdAt: Date;
  updatedAt: Date;
}

export default function ItineraryPlanner() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [currentItinerary, setCurrentItinerary] = useState<Itinerary | null>(null);
  const [showNewItinerary, setShowNewItinerary] = useState(false);
  const [newItineraryName, setNewItineraryName] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState<ItineraryDay | null>(null);
  const [newActivityDate, setNewActivityDate] = useState(new Date());
  const [newActivityTime, setNewActivityTime] = useState('');
  const [newActivityDescription, setNewActivityDescription] = useState('');
  const [newActivityLocation, setNewActivityLocation] = useState('');
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadItineraries();
  }, []);

  const loadItineraries = async () => {
    try {
      const itinerariesData = await AsyncStorage.getItem('itineraries');
      if (itinerariesData) {
        const parsedData = JSON.parse(itinerariesData);
        // Convert string dates back to Date objects
        const formattedItineraries = parsedData.map((itinerary: any) => ({
          ...itinerary,
          createdAt: new Date(itinerary.createdAt),
          updatedAt: new Date(itinerary.updatedAt),
          days: itinerary.days.map((day: any) => ({
            ...day,
            date: new Date(day.date)
          }))
        }));
        setItineraries(formattedItineraries);
      }
    } catch (error) {
      console.error('Failed to load itineraries:', error);
    }
  };

  const saveItineraries = async (updatedItineraries: Itinerary[]) => {
    try {
      await AsyncStorage.setItem('itineraries', JSON.stringify(updatedItineraries));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to save itineraries:', error);
      Alert.alert('Error', 'Failed to save your itinerary.');
    }
  };

  const createNewItinerary = () => {
    if (!newItineraryName.trim()) {
      Alert.alert('Error', 'Please enter an itinerary name');
      return;
    }

    const newItinerary: Itinerary = {
      id: Date.now().toString(),
      name: newItineraryName,
      days: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedItineraries = [...itineraries, newItinerary];
    setItineraries(updatedItineraries);
    saveItineraries(updatedItineraries);
    setCurrentItinerary(newItinerary);
    setShowNewItinerary(false);
    setNewItineraryName('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const addDayToItinerary = () => {
    if (!currentItinerary) return;
    
    setShowDatePicker(true);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || newActivityDate;
    setShowDatePicker(false);
    
    if (selectedDate && currentItinerary) {
      // Check if we already have a day with this date
      const dateExists = currentItinerary.days.some(
        day => day.date.toDateString() === selectedDate.toDateString()
      );

      if (dateExists) {
        Alert.alert('Date Exists', 'This date is already in your itinerary. Please select a different date.');
        return;
      }

      const newDay: ItineraryDay = {
        id: Date.now().toString(),
        date: currentDate,
        activities: []
      };

      const updatedDays = [...currentItinerary.days, newDay].sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );

      const updatedItinerary = {
        ...currentItinerary,
        days: updatedDays,
        updatedAt: new Date()
      };

      updateItinerary(updatedItinerary);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const updateItinerary = (updatedItinerary: Itinerary) => {
    const updatedItineraries = itineraries.map(itinerary => 
      itinerary.id === updatedItinerary.id ? updatedItinerary : itinerary
    );
    
    setItineraries(updatedItineraries);
    setCurrentItinerary(updatedItinerary);
    saveItineraries(updatedItineraries);
  };

  const deleteItinerary = (itineraryId: string) => {
    Alert.alert(
      'Delete Itinerary',
      'Are you sure you want to delete this itinerary? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const updatedItineraries = itineraries.filter(itinerary => itinerary.id !== itineraryId);
            setItineraries(updatedItineraries);
            saveItineraries(updatedItineraries);
            setCurrentItinerary(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        },
      ]
    );
  };

  const deleteDay = (dayId: string) => {
    if (!currentItinerary) return;
    
    Alert.alert(
      'Delete Day',
      'Are you sure you want to delete this day and all its activities?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            const updatedDays = currentItinerary.days.filter(day => day.id !== dayId);
            const updatedItinerary = {
              ...currentItinerary,
              days: updatedDays,
              updatedAt: new Date()
            };
            updateItinerary(updatedItinerary);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        },
      ]
    );
  };

  const addActivity = () => {
    if (!selectedDay || !currentItinerary) return;
    
    if (!newActivityDescription.trim()) {
      Alert.alert('Error', 'Please enter an activity description');
      return;
    }

    const newActivity = {
      id: Date.now().toString(),
      time: newActivityTime,
      description: newActivityDescription,
      location: newActivityLocation
    };

    const updatedDay = {
      ...selectedDay,
      activities: [...selectedDay.activities, newActivity]
    };

    const updatedDays = currentItinerary.days.map(day => 
      day.id === selectedDay.id ? updatedDay : day
    );

    const updatedItinerary = {
      ...currentItinerary,
      days: updatedDays,
      updatedAt: new Date()
    };

    updateItinerary(updatedItinerary);
    setSelectedDay(updatedDay);
    setNewActivityTime('');
    setNewActivityDescription('');
    setNewActivityLocation('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const deleteActivity = (dayId: string, activityId: string) => {
    if (!currentItinerary) return;
    
    const updatedDays = currentItinerary.days.map(day => {
      if (day.id === dayId) {
        return {
          ...day,
          activities: day.activities.filter(activity => activity.id !== activityId)
        };
      }
      return day;
    });

    const updatedItinerary = {
      ...currentItinerary,
      days: updatedDays,
      updatedAt: new Date()
    };

    updateItinerary(updatedItinerary);
    if (selectedDay && selectedDay.id === dayId) {
      setSelectedDay({
        ...selectedDay,
        activities: selectedDay.activities.filter(activity => activity.id !== activityId)
      });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const renderItineraryList = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>My Itineraries</Text>
      </View>

      <FlatList
        data={itineraries}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No itineraries yet</Text>
            <Text style={styles.emptyStateSubtext}>Start planning your adventure!</Text>
          </View>
        }
        renderItem={({item}) => (
          <TouchableOpacity 
            style={styles.itineraryItem}
            onPress={() => {
              setCurrentItinerary(item);
              setEditMode(true);
            }}
          >
            <View style={styles.itineraryHeader}>
              <Text style={styles.itineraryName}>{item.name}</Text>
              <Text style={styles.itineraryDates}>
                {item.days.length > 0 
                  ? `${formatDate(item.days[0].date)} - ${formatDate(item.days[item.days.length - 1].date)}`
                  : 'No dates selected'}
              </Text>
              <Text style={styles.itineraryDayCount}>
                {item.days.length} {item.days.length === 1 ? 'day' : 'days'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => deleteItinerary(item.id)}
            >
              <Trash2 size={20} color="#FF385C" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => setShowNewItinerary(true)}
      >
        <PlusCircle size={24} color="#FFFFFF" />
        <Text style={styles.floatingButtonText}>New Itinerary</Text>
      </TouchableOpacity>

      {showNewItinerary && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Create New Itinerary</Text>
            <TextInput
              style={styles.input}
              placeholder="Itinerary Name"
              value={newItineraryName}
              onChangeText={setNewItineraryName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowNewItinerary(false);
                  setNewItineraryName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.createButton]}
                onPress={createNewItinerary}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderItineraryDetail = () => {
    if (!currentItinerary) return null;
    
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => {
              setCurrentItinerary(null);
              setSelectedDay(null);
              setEditMode(false);
            }} 
            style={styles.backButton}
          >
            <ChevronLeft size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>{currentItinerary.name}</Text>
        </View>

        {selectedDay ? (
          <View style={styles.dayDetailContainer}>
            <View style={styles.dayHeader}>
              <TouchableOpacity 
                onPress={() => setSelectedDay(null)}
                style={styles.backButton}
              >
                <ChevronLeft size={20} color="#000" />
              </TouchableOpacity>
              <Text style={styles.dayTitle}>{formatDate(selectedDay.date)}</Text>
            </View>

            <ScrollView style={styles.activitiesList}>
              {selectedDay.activities.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No activities planned</Text>
                  <Text style={styles.emptyStateSubtext}>Add activities below</Text>
                </View>
              ) : (
                selectedDay.activities.map(activity => (
                  <View key={activity.id} style={styles.activityItem}>
                    {activity.time ? (
                      <Text style={styles.activityTime}>{activity.time}</Text>
                    ) : null}
                    <View style={styles.activityContent}>
                      <Text style={styles.activityDescription}>{activity.description}</Text>
                      {activity.location ? (
                        <Text style={styles.activityLocation}>{activity.location}</Text>
                      ) : null}
                    </View>
                    <TouchableOpacity 
                      style={styles.deleteActivityButton}
                      onPress={() => deleteActivity(selectedDay.id, activity.id)}
                    >
                      <Trash2 size={16} color="#FF385C" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.addActivityForm}>
              <Text style={styles.formLabel}>Add New Activity</Text>
              <TextInput
                style={styles.input}
                placeholder="Time (optional)"
                value={newActivityTime}
                onChangeText={setNewActivityTime}
              />
              <TextInput
                style={styles.input}
                placeholder="Description"
                value={newActivityDescription}
                onChangeText={setNewActivityDescription}
              />
              <TextInput
                style={styles.input}
                placeholder="Location (optional)"
                value={newActivityLocation}
                onChangeText={setNewActivityLocation}
              />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={addActivity}
              >
                <PlusCircle size={16} color="#FFFFFF" />
                <Text style={styles.addButtonText}>Add Activity</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <ScrollView style={styles.daysContainer}>
              {currentItinerary.days.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No days added yet</Text>
                  <Text style={styles.emptyStateSubtext}>Start by adding days to your itinerary</Text>
                </View>
              ) : (
                currentItinerary.days.map(day => (
                  <TouchableOpacity 
                    key={day.id} 
                    style={styles.dayItem}
                    onPress={() => setSelectedDay(day)}
                  >
                    <View style={styles.dayInfo}>
                      <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
                      <Text style={styles.activityCount}>
                        {day.activities.length} {day.activities.length === 1 ? 'activity' : 'activities'}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.deleteDayButton}
                      onPress={() => deleteDay(day.id)}
                    >
                      <Trash2 size={20} color="#FF385C" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>

            <TouchableOpacity 
              style={styles.floatingButton}
              onPress={addDayToItinerary}
            >
              <Calendar size={24} color="#FFFFFF" />
              <Text style={styles.floatingButtonText}>Add Day</Text>
            </TouchableOpacity>
          </>
        )}

        {showDatePicker && (
          <DateTimePicker
            value={newActivityDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </View>
    );
  };

  return (
    <>
      {!currentItinerary ? renderItineraryList() : renderItineraryDetail()}
    </>
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    padding: 24,
  },
  emptyStateText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: '#1A1D1E',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 110,
    right: 24,
    backgroundColor: '#FF385C',
    borderRadius: 28,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  floatingButtonText: {
    color: '#FFFFFF',
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    marginLeft: 8,
  },
  itineraryItem: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itineraryHeader: {
    flex: 1,
  },
  itineraryName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#1A1D1E',
    marginBottom: 8,
  },
  itineraryDates: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  itineraryDayCount: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#FF385C',
  },
  deleteButton: {
    padding: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '80%',
  },
  modalTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: '#1A1D1E',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#4B5563',
  },
  createButton: {
    backgroundColor: '#FF385C',
  },
  createButtonText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  daysContainer: {
    flex: 1,
    padding: 24,
  },
  dayItem: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayInfo: {
    flex: 1,
  },
  dayDate: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#1A1D1E',
    marginBottom: 8,
  },
  activityCount: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  deleteDayButton: {
    padding: 8,
  },
  dayDetailContainer: {
    flex: 1,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dayTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#1A1D1E',
  },
  activitiesList: {
    flex: 1,
    padding: 24,
  },
  activityItem: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityTime: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: '#FF385C',
    marginRight: 12,
    width: 60,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#1A1D1E',
    marginBottom: 4,
  },
  activityLocation: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  deleteActivityButton: {
    padding: 8,
  },
  addActivityForm: {
    padding: 24,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  formLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#1A1D1E',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#FF385C',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
