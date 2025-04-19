import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Platform, ScrollView, Animated, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState, useEffect } from 'react';
import { notificationService } from '../services/NotificationService';
import { paymentService } from '../services/PaymentService';
import { LinearGradient } from 'expo-linear-gradient';

export default function BookingScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams();
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    travelers: '1',
    paymentMethod: 'card',
  });

  const [pricing, setPricing] = useState({
    basePrice: 100, // Base price per person
    totalPrice: 100,
    seasonMultiplier: 1,
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Update price whenever travelers count or date changes
    const updatePrice = () => {
      const seasonMultiplier = paymentService.getSeasonMultiplier(date);
      const totalPrice = paymentService.calculateDynamicPrice({
        basePrice: pricing.basePrice * parseInt(formData.travelers),
        seasonMultiplier,
        groupSize: parseInt(formData.travelers)
      });
      setPricing(prev => ({
        ...prev,
        totalPrice,
        seasonMultiplier
      }));
    };
    updatePrice();
  }, [formData.travelers, date]);

  const handleBooking = async () => {
    if (!formData.fullName || !formData.email) {
      setErrorMessage('Please fill all required fields');
      setShowError(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      return;
    }

    try {
      // Process payment
      const paymentResult = await paymentService.processPayment(
        pricing.totalPrice,
        formData.paymentMethod as any
      );

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || 'Payment failed');
      }

      // Schedule a trip reminder notification
      const notificationId = await notificationService.scheduleTripReminder(name.toString(), date);
      
      setShowConfirmation(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to book your trip. Please try again.');
      setShowError(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#FF385C', '#FF1C48']}
        style={styles.header}
      >
        <Text style={styles.title}>Book {name}</Text>
      </LinearGradient>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          value={formData.fullName}
          onChangeText={(text) => setFormData({...formData, fullName: text})}
        />

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={styles.input}
          placeholder="john@example.com"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(text) => setFormData({...formData, email: text})}
        />

        <Text style={styles.label}>Number of Travelers</Text>
        <TextInput
          style={styles.input}
          placeholder="1"
          keyboardType="numeric"
          value={formData.travelers}
          onChangeText={(text) => setFormData({...formData, travelers: text})}
        />

        <Text style={styles.label}>Payment Method</Text>
        <View style={styles.paymentMethodContainer}>
          {Platform.OS === 'ios' ? (
            <>
              <TouchableOpacity
                style={[styles.paymentOption, formData.paymentMethod === 'card' && styles.selectedPayment]}
                onPress={() => setFormData({...formData, paymentMethod: 'card'})}
              >
                <Text style={styles.paymentOptionText}>Card</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.paymentOption, formData.paymentMethod === 'apple-pay' && styles.selectedPayment]}
                onPress={() => setFormData({...formData, paymentMethod: 'apple-pay'})}
              >
                <Text style={styles.paymentOptionText}>Apple Pay</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.paymentOption, formData.paymentMethod === 'card' && styles.selectedPayment]}
                onPress={() => setFormData({...formData, paymentMethod: 'card'})}
              >
                <Text style={styles.paymentOptionText}>Card</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.paymentOption, formData.paymentMethod === 'google-pay' && styles.selectedPayment]}
                onPress={() => setFormData({...formData, paymentMethod: 'google-pay'})}
              >
                <Text style={styles.paymentOptionText}>Google Pay</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.pricingContainer}>
          <Text style={styles.pricingTitle}>Trip Summary</Text>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Base Price (per person)</Text>
            <Text style={styles.pricingValue}>${pricing.basePrice}</Text>
          </View>
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Season Multiplier</Text>
            <Text style={styles.pricingValue}>x{pricing.seasonMultiplier}</Text>
          </View>
          {parseInt(formData.travelers) >= 5 && (
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Group Discount</Text>
              <Text style={styles.pricingValue}>-10%</Text>
            </View>
          )}
          <View style={[styles.pricingRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalValue}>${pricing.totalPrice}</Text>
          </View>
        </View>

        <Text style={styles.label}>Trip Date</Text>
        <TouchableOpacity 
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && Platform.OS === 'ios' && (
          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              selectedDate && setDate(selectedDate);
            }}
          />
        )}
        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              selectedDate && setDate(selectedDate);
            }}
          />
        )}
      </View>

      <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
        <Text style={styles.bookButtonText}>Confirm Booking</Text>
      </TouchableOpacity>

      <Modal
        visible={showConfirmation}
        transparent={true}
        animationType="fade"
      >
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#FF385C', '#FF1C48']}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Booking Confirmed!</Text>
            </LinearGradient>
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                Thank you {formData.fullName}!
              </Text>
              <Text style={styles.modalDetails}>
                You've booked {name} for {formData.travelers} travelers on {date.toLocaleDateString()}.
              </Text>
              <Text style={styles.modalInfo}>
                A confirmation has been sent to your email.
              </Text>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  setShowConfirmation(false);
                  router.push('/(tabs)');
                }}
              >
                <Text style={styles.modalButtonText}>Return Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Modal>

      <Modal
        visible={showError}
        transparent={true}
        animationType="fade"
      >
        <Animated.View style={[styles.modalOverlay, { opacity: fadeAnim }]}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#FF385C', '#FF1C48']}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Booking Error</Text>
            </LinearGradient>
            <View style={styles.modalBody}>
              <Text style={styles.modalText}>{errorMessage}</Text>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  setShowError(false);
                  setErrorMessage('');
                }}
              >
                <Text style={styles.modalButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  paymentMethodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  paymentOption: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  selectedPayment: {
    borderColor: '#FF385C',
    backgroundColor: '#FFF0F3',
  },
  paymentOptionText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#1A1D1E',
  },
  pricingContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  pricingTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#1A1D1E',
    marginBottom: 16,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pricingLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#72777A',
  },
  pricingValue: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: '#1A1D1E',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  totalLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#1A1D1E',
  },
  totalValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#FF385C',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 72 : 32,
  },
  title: {
    fontFamily: 'DMSans-Bold',
    fontSize: 36,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  formContainer: {
    margin: 24,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  label: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: '#72777A',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  dateInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  dateText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: '#1A1D1E',
  },
  bookButton: {
    backgroundColor: '#FF385C',
    borderRadius: 30,
    paddingVertical: 18,
    paddingHorizontal: 36,
    margin: 24,
    shadowColor: '#FF385C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bookButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    padding: 24,
  },
  modalTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  modalBody: {
    padding: 24,
  },
  modalText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: '#1A1D1E',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalDetails: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: '#72777A',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalInfo: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: '#72777A',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#FF385C',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#FF385C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});