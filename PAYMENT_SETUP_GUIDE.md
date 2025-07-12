# 💳 Payment Gateway & Bank Details Setup Guide

## 📋 Overview
This guide will help you configure your company bank details to receive online payments through various payment gateways like Razorpay, Stripe, and UPI.

---

## 🏦 Step 1: Prepare Your Bank Details

### Required Information:
```
✅ Company Bank Account Number
✅ IFSC Code
✅ Bank Name & Branch
✅ Account Holder Name (Company Name)
✅ PAN Number
✅ GST Number (if applicable)
✅ Business Email & Phone
```

### Example Configuration:
```bash
COMPANY_NAME=Your Learning Platform Pvt Ltd
COMPANY_BANK_NAME=State Bank of India
COMPANY_ACCOUNT_NUMBER=1234567890123456
COMPANY_IFSC_CODE=SBIN0001234
COMPANY_ACCOUNT_HOLDER=Your Learning Platform Pvt Ltd
COMPANY_BRANCH=Main Branch, Your City
COMPANY_PAN=ABCDE1234F
COMPANY_GST=12ABCDE1234F1Z5
```

---

## 💰 Step 2: Choose Your Payment Gateway

### 🇮🇳 **Option A: Razorpay (Recommended for India)**

#### Why Razorpay?
- ✅ Easy integration with Indian banks
- ✅ Supports UPI, Cards, Net Banking, Wallets
- ✅ T+1 settlement (next working day)
- ✅ 2.36% transaction fee
- ✅ Excellent customer support

#### Setup Process:
1. **Sign up at [Razorpay.com](https://razorpay.com/)**
2. **Complete KYC verification**
3. **Add your bank account details**
4. **Get API credentials**

#### Required Details for Razorpay:
```bash
# Business Information
Business Name: Your Learning Platform Pvt Ltd
Business Type: Education
Website: https://yourlearningplatform.com
PAN: ABCDE1234F
GST: 12ABCDE1234F1Z5

# Bank Account
Account Number: 1234567890123456
IFSC Code: SBIN0001234
Account Holder: Your Learning Platform Pvt Ltd
Bank: State Bank of India
```

#### Configuration:
```javascript
// Add to your .env file
RAZORPAY_KEY_ID=rzp_live_your_actual_key_id
RAZORPAY_KEY_SECRET=your_actual_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

---

### 🌍 **Option B: Stripe (International)**

#### Why Stripe?
- ✅ Global payment processing
- ✅ Excellent developer tools
- ✅ Supports international cards
- ✅ 2.9% + ₹2 transaction fee
- ✅ Advanced fraud protection

#### Setup Process:
1. **Sign up at [Stripe.com](https://stripe.com/)**
2. **Complete business verification**
3. **Add bank account for payouts**
4. **Configure webhooks**

#### Configuration:
```javascript
// Add to your .env file
STRIPE_SECRET_KEY=sk_live_your_actual_secret_key
STRIPE_PUBLIC_KEY=pk_live_your_actual_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

---

### 📱 **Option C: UPI Direct**

#### Why UPI?
- ✅ Lowest transaction fees (0.7%)
- ✅ Instant payments
- ✅ No chargebacks
- ✅ Popular in India

#### Setup Process:
1. **Get UPI ID from your bank**
2. **Register for merchant UPI**
3. **Integrate with UPI gateway providers**

#### Configuration:
```javascript
// Add to your .env file
COMPANY_UPI_ID=yourcompany@paytm
UPI_MERCHANT_CODE=EDU001
PAYU_MERCHANT_KEY=your_payu_key
CASHFREE_APP_ID=your_cashfree_id
```

---

## ⚙️ Step 3: Environment Configuration

### Create `.env` file in your backend folder:
```bash
# ================================
# PAYMENT GATEWAY CONFIGURATION
# ================================

# RAZORPAY (Primary)
RAZORPAY_KEY_ID=rzp_live_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# COMPANY BANK DETAILS
COMPANY_NAME=Your Learning Platform Pvt Ltd
COMPANY_BANK_NAME=State Bank of India
COMPANY_ACCOUNT_NUMBER=1234567890123456
COMPANY_IFSC_CODE=SBIN0001234
COMPANY_ACCOUNT_HOLDER=Your Learning Platform Pvt Ltd
COMPANY_PAN=ABCDE1234F
COMPANY_GST=12ABCDE1234F1Z5

# BUSINESS INFORMATION
BUSINESS_EMAIL=payments@yourlearningplatform.com
BUSINESS_PHONE=+91-9876543210
BUSINESS_ADDRESS=123 Education Street, Learning City, State - 123456
BUSINESS_WEBSITE=https://yourlearningplatform.com

# CURRENCY SETTINGS
DEFAULT_CURRENCY=INR
CURRENCY_SYMBOL=₹
LOCALE=en-IN
TIMEZONE=Asia/Kolkata
```

---

## 🔧 Step 4: Integration Code

### Update Payment Controller:
```javascript
// backend/controllers/paymentController.js
const { RAZORPAY_CONFIG, COMPANY_BANK_DETAILS } = require('../config/paymentGatewayConfig');
const Razorpay = require('razorpay');

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_CONFIG.keyId,
  key_secret: RAZORPAY_CONFIG.keySecret
});

// Create payment order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount, courseId } = req.body;
    
    const order = await razorpayInstance.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `course_${courseId}_${Date.now()}`,
      payment_capture: 1,
      notes: {
        courseId,
        studentId: req.user._id,
        companyAccount: COMPANY_BANK_DETAILS.accountNumber
      }
    });
    
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_CONFIG.keyId,
      companyName: COMPANY_BANK_DETAILS.companyName
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

---

## 🔔 Step 5: Webhook Configuration

### Set up webhooks to receive payment notifications:
```javascript
// backend/routes/webhookRoutes.js
const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// Razorpay webhook
router.post('/razorpay', (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
  
  if (signature === expectedSignature) {
    // Payment successful - money will be settled to your bank account
    const { event, payload } = req.body;
    
    if (event === 'payment.captured') {
      // Update enrollment status
      // Send confirmation email
      // Add to settlement tracking
    }
  }
  
  res.status(200).json({ status: 'ok' });
});
```

---

## 🏦 Step 6: Bank Account Verification

### For Razorpay:
1. **Login to Razorpay Dashboard**
2. **Go to Settings → Payment Methods**
3. **Add your bank account details**
4. **Complete penny drop verification**
5. **Set settlement schedule (Daily/Weekly)**

### For Stripe:
1. **Login to Stripe Dashboard**
2. **Go to Settings → Payouts**
3. **Add bank account details**
4. **Verify with micro-deposits**
5. **Set payout schedule**

---

## 💸 Step 7: Settlement Configuration

### Settlement Timing:
```javascript
// Settlement schedules by gateway
const SETTLEMENT_CONFIG = {
  razorpay: {
    schedule: 'T+1', // Next working day
    minimumAmount: 100, // ₹100
    fees: '2.36% + GST'
  },
  
  stripe: {
    schedule: 'T+2', // 2 working days
    minimumAmount: 0,
    fees: '2.9% + ₹2 + GST'
  },
  
  upi: {
    schedule: 'T+1', // Next working day
    minimumAmount: 1,
    fees: '0.7% + GST'
  }
};
```

### Auto-Settlement Setup:
- **Enable auto-settlement** for faster money transfer
- **Set minimum settlement amount** (₹100 recommended)
- **Configure settlement timing** (daily recommended)

---

## 📊 Step 8: Testing & Monitoring

### Test Mode Configuration:
```javascript
// Use test credentials first
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_secret_key

// Test bank account (provided by Razorpay)
TEST_ACCOUNT_NUMBER=1234567890123456
TEST_IFSC_CODE=RAZR0000001
```

### Monitoring Dashboard:
1. **Payment success/failure rates**
2. **Settlement tracking**
3. **Transaction volumes**
4. **Refund management**

---

## ⚠️ Step 9: Compliance & Security

### Required Compliance:
- ✅ **PCI DSS Compliance** (handled by payment gateway)
- ✅ **RBI Guidelines** (data localization)
- ✅ **GST Registration** (for Indian businesses)
- ✅ **Income Tax Registration**

### Security Checklist:
- ✅ **Encrypt payment data**
- ✅ **Use HTTPS only**
- ✅ **Validate webhook signatures**
- ✅ **Store minimal payment info**
- ✅ **Regular security audits**

---

## 📋 Step 10: Go Live Checklist

### Before Going Live:
- [ ] Bank account verified
- [ ] KYC completed
- [ ] Test payments successful
- [ ] Webhooks configured
- [ ] SSL certificate installed
- [ ] Production API keys configured
- [ ] Settlement schedule set
- [ ] Customer support ready

### Production Configuration:
```javascript
// Switch to production mode
NODE_ENV=production
RAZORPAY_KEY_ID=rzp_live_your_production_key
RAZORPAY_KEY_SECRET=your_production_secret
API_BASE_URL=https://yourlearningplatform.com
```

---

## 💡 Pro Tips

### 🚀 **Optimization Tips:**
1. **Enable multiple payment methods** (UPI, Cards, Net Banking)
2. **Set up automated reconciliation**
3. **Configure retry logic** for failed payments
4. **Implement refund automation**
5. **Set up real-time notifications**

### 📈 **Business Tips:**
1. **Monitor conversion rates** by payment method
2. **Optimize checkout flow** for mobile users
3. **Set up abandoned cart recovery**
4. **Implement dynamic pricing** based on payment method
5. **Create payment analytics dashboard**

### 🔒 **Security Tips:**
1. **Never store card details** (use tokenization)
2. **Implement rate limiting** on payment APIs
3. **Set up fraud detection** rules
4. **Use 3D Secure** for card payments
5. **Regular security audits**

---

## 🆘 Troubleshooting

### Common Issues:
```javascript
// Issue 1: Settlement delays
// Solution: Check bank account details, verify KYC status

// Issue 2: Payment failures
// Solution: Verify API keys, check webhook configuration

// Issue 3: Reconciliation mismatches
// Solution: Implement automated reconciliation system

// Issue 4: Refund processing delays
// Solution: Set up automated refund workflows
```

### Support Contacts:
- **Razorpay Support:** support@razorpay.com
- **Stripe Support:** support@stripe.com
- **Your Bank:** Contact your relationship manager

---

## 📞 Next Steps

1. **Choose your payment gateway** (Razorpay recommended for India)
2. **Sign up and complete verification**
3. **Add your bank details** using the configuration file
4. **Test payments** in sandbox mode
5. **Go live** with production credentials
6. **Monitor settlements** in your bank account

---

**🎉 Congratulations! Your payment system is now ready to receive online payments directly to your bank account!**

---

*For technical support, contact your development team or payment gateway support.* 