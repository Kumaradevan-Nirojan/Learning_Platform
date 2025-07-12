// Payment Gateway Configuration
export const PAYMENT_CONFIG = {
  // In production, these would be environment variables
  STRIPE_PUBLIC_KEY: process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_mock_key',
  RAZORPAY_KEY_ID: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_mock_key',
  PAYPAL_CLIENT_ID: process.env.REACT_APP_PAYPAL_CLIENT_ID || 'paypal_mock_client_id',
  
  // Supported payment methods
  PAYMENT_METHODS: [
    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'upi', name: 'UPI Payment', icon: '📱' },
    { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
    { id: 'wallet', name: 'Digital Wallet', icon: '💰' }
  ],
  
  // Currency settings
  CURRENCY: 'INR',
  CURRENCY_SYMBOL: '₹',
  
  // Payment processing settings
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3
};

// Mock payment gateway utilities
export const PaymentGateway = {
  // Initialize payment session
  initializePayment: async (amount, currency = PAYMENT_CONFIG.CURRENCY) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          sessionId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          amount,
          currency,
          status: 'initialized'
        });
      }, 1000);
    });
  },

  // Process card payment
  processCardPayment: async (paymentData) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate payment processing
        const success = Math.random() > 0.1; // 90% success rate
        
        if (success) {
          resolve({
            transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'success',
            amount: paymentData.amount,
            currency: paymentData.currency,
            paymentMethod: paymentData.method,
            timestamp: new Date().toISOString(),
            gatewayResponse: {
              reference: `ref_${Date.now()}`,
              authCode: Math.random().toString(36).substr(2, 6).toUpperCase()
            }
          });
        } else {
          reject({
            error: 'payment_failed',
            message: 'Payment processing failed. Please try again.',
            code: 'PAYMENT_DECLINED'
          });
        }
      }, 2000 + Math.random() * 3000); // 2-5 second processing time
    });
  },

  // Verify payment status
  verifyPayment: async (transactionId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          transactionId,
          status: 'verified',
          timestamp: new Date().toISOString()
        });
      }, 500);
    });
  }
};

// Card validation utilities
export const CardValidator = {
  validateCardNumber: (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  },

  validateExpiryDate: (expiry) => {
    const [month, year] = expiry.split('/');
    if (!month || !year) return false;
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const expMonth = parseInt(month);
    const expYear = parseInt(year);
    
    if (expMonth < 1 || expMonth > 12) return false;
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    
    return true;
  },

  validateCVV: (cvv) => {
    return /^\d{3,4}$/.test(cvv);
  },

  getCardType: (cardNumber) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6/.test(cleaned)) return 'discover';
    
    return 'unknown';
  }
};

// Format utilities
export const PaymentUtils = {
  formatCardNumber: (value) => {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/\d{4}/g);
    return match ? match.join(' ').substr(0, 19) : cleaned;
  },

  formatExpiryDate: (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substr(0, 2) + '/' + cleaned.substr(2, 2);
    }
    return cleaned;
  },

  formatAmount: (amount, currency = PAYMENT_CONFIG.CURRENCY) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  generateOrderId: () => {
    return `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
}; 