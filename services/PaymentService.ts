import { Platform } from 'react-native';

type PaymentMethod = 'card' | 'paypal' | 'apple-pay' | 'google-pay';

type PriceFactors = {
  basePrice: number;
  seasonMultiplier: number;
  groupSize: number;
};

class PaymentService {
  private readonly PEAK_SEASON_MONTHS = [6, 7, 8, 12]; // June, July, August, December
  private readonly GROUP_DISCOUNT_THRESHOLD = 5;
  private readonly GROUP_DISCOUNT_RATE = 0.1; // 10% discount for groups

  calculateDynamicPrice(factors: PriceFactors): number {
    let finalPrice = factors.basePrice;

    // Apply season multiplier
    finalPrice *= factors.seasonMultiplier;

    // Apply group discount if applicable
    if (factors.groupSize >= this.GROUP_DISCOUNT_THRESHOLD) {
      const discount = finalPrice * this.GROUP_DISCOUNT_RATE;
      finalPrice -= discount;
    }

    return Math.round(finalPrice);
  }

  getSeasonMultiplier(date: Date): number {
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    return this.PEAK_SEASON_MONTHS.includes(month) ? 1.2 : 1.0;
  }

  async processPayment(amount: number, paymentMethod: PaymentMethod): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // This is a mock implementation. In a real app, you would integrate with a payment processor
      const isSupported = this.isPaymentMethodSupported(paymentMethod);
      if (!isSupported) {
        throw new Error(`Payment method ${paymentMethod} is not supported on this platform`);
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        success: true,
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  private isPaymentMethodSupported(method: PaymentMethod): boolean {
    if (Platform.OS === 'ios') {
      return ['card', 'paypal', 'apple-pay'].includes(method);
    } else if (Platform.OS === 'android') {
      return ['card', 'paypal', 'google-pay'].includes(method);
    }
    return ['card', 'paypal'].includes(method);
  }
}

export const paymentService = new PaymentService();