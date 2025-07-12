const { validateConfig, COMPANY_BANK_DETAILS, RAZORPAY_CONFIG, PAYMENT_SETTINGS } = require('./config/paymentGatewayConfig');
require('dotenv').config();

async function setupPaymentGateway() {
  console.log('🚀 Payment Gateway Setup Validator\n');
  console.log('=====================================');

  // Step 1: Validate Configuration
  console.log('📋 Step 1: Validating Configuration...\n');
  
  const validation = validateConfig();
  
  if (validation.isValid) {
    console.log('✅ Configuration is valid!\n');
  } else {
    console.log('❌ Configuration errors found:');
    validation.errors.forEach(error => {
      console.log(`   - ${error}`);
    });
    console.log('\n🔧 Please update your .env file with correct values.\n');
  }

  // Step 2: Display Bank Details
  console.log('🏦 Step 2: Company Bank Details');
  console.log('=====================================');
  console.log(`Company Name: ${COMPANY_BANK_DETAILS.companyName}`);
  console.log(`Bank Name: ${COMPANY_BANK_DETAILS.bankName}`);
  console.log(`Account Number: ${COMPANY_BANK_DETAILS.accountNumber}`);
  console.log(`IFSC Code: ${COMPANY_BANK_DETAILS.ifscCode}`);
  console.log(`Account Holder: ${COMPANY_BANK_DETAILS.accountHolderName}`);
  console.log(`PAN Number: ${COMPANY_BANK_DETAILS.panNumber}`);
  console.log(`GST Number: ${COMPANY_BANK_DETAILS.gstNumber}`);
  console.log(`Business Email: ${COMPANY_BANK_DETAILS.businessEmail}`);
  console.log(`Business Phone: ${COMPANY_BANK_DETAILS.businessPhone}\n`);

  // Step 3: Display Payment Gateway Config
  console.log('💳 Step 3: Payment Gateway Configuration');
  console.log('=====================================');
  console.log(`Razorpay Key ID: ${RAZORPAY_CONFIG.keyId}`);
  console.log(`Settlement Account: ${RAZORPAY_CONFIG.settlementAccount.accountNumber}`);
  console.log(`Settlement IFSC: ${RAZORPAY_CONFIG.settlementAccount.ifsc}`);
  console.log(`Auto Settlement: ${RAZORPAY_CONFIG.autoSettlement.enabled ? 'Enabled' : 'Disabled'}`);
  console.log(`Settlement Cycle: ${RAZORPAY_CONFIG.autoSettlement.settlementCycle}`);
  console.log(`Minimum Settlement: ₹${RAZORPAY_CONFIG.autoSettlement.minimumAmount}\n`);

  // Step 4: Payment Settings
  console.log('⚙️ Step 4: Payment Settings');
  console.log('=====================================');
  console.log(`Currency: ${PAYMENT_SETTINGS.currency}`);
  console.log(`Currency Symbol: ${PAYMENT_SETTINGS.currencySymbol}`);
  console.log(`Minimum Amount: ₹${PAYMENT_SETTINGS.limits.minimum}`);
  console.log(`Maximum Amount: ₹${PAYMENT_SETTINGS.limits.maximum}`);
  console.log(`Daily Limit: ₹${PAYMENT_SETTINGS.limits.dailyLimit}`);
  console.log(`Razorpay Fee: ${PAYMENT_SETTINGS.fees.razorpay.percentage}% + ${PAYMENT_SETTINGS.fees.razorpay.gst}% GST`);
  console.log(`UPI Fee: ${PAYMENT_SETTINGS.fees.upi.percentage}% + ${PAYMENT_SETTINGS.fees.upi.gst}% GST\n`);

  // Step 5: Test Connection (if API keys are configured)
  if (!RAZORPAY_CONFIG.keyId.includes('your_key_id_here')) {
    console.log('🔗 Step 5: Testing Razorpay Connection...');
    console.log('=====================================');
    
    try {
      const Razorpay = require('razorpay');
      const razorpayInstance = new Razorpay({
        key_id: RAZORPAY_CONFIG.keyId,
        key_secret: RAZORPAY_CONFIG.keySecret
      });

      // Test creating an order
      const testOrder = await razorpayInstance.orders.create({
        amount: 100, // ₹1 in paise
        currency: 'INR',
        receipt: `test_${Date.now()}`,
        payment_capture: 1
      });

      console.log('✅ Razorpay connection successful!');
      console.log(`Test Order ID: ${testOrder.id}`);
      console.log(`Test Amount: ₹${testOrder.amount / 100}`);
      console.log('💡 You can now accept payments!\n');

    } catch (error) {
      console.log('❌ Razorpay connection failed:');
      console.log(`Error: ${error.message}\n`);
    }
  } else {
    console.log('⚠️  Step 5: Razorpay Connection Test Skipped');
    console.log('=====================================');
    console.log('Please configure your Razorpay API keys to test connection.\n');
  }

  // Step 6: Next Steps
  console.log('📝 Step 6: Next Steps');
  console.log('=====================================');
  
  if (validation.isValid && !RAZORPAY_CONFIG.keyId.includes('your_key_id_here')) {
    console.log('🎉 Your payment gateway is ready!');
    console.log('✅ You can now receive payments directly to your bank account.');
    console.log('✅ Settlements will happen according to your gateway settings.');
    console.log('✅ Monitor payments in your payment gateway dashboard.\n');
    
    console.log('📊 Recommended Actions:');
    console.log('1. Set up webhook endpoints for payment notifications');
    console.log('2. Configure email notifications for successful payments');
    console.log('3. Set up automated reconciliation with your bank account');
    console.log('4. Monitor settlement timing and amounts');
    console.log('5. Set up refund automation if needed\n');
    
  } else {
    console.log('🔧 Configuration Required:');
    
    if (!validation.isValid) {
      console.log('1. Update your bank details in the .env file');
      console.log('2. Add your company information (PAN, GST, etc.)');
    }
    
    if (RAZORPAY_CONFIG.keyId.includes('your_key_id_here')) {
      console.log('3. Sign up for Razorpay account at https://razorpay.com/');
      console.log('4. Complete KYC verification');
      console.log('5. Add your bank account details to Razorpay');
      console.log('6. Get your API keys and update .env file');
      console.log('7. Configure webhook URLs');
    }
    
    console.log('8. Test payments in sandbox mode');
    console.log('9. Go live with production credentials\n');
  }

  // Step 7: Sample Environment Variables
  console.log('📄 Step 7: Sample .env Configuration');
  console.log('=====================================');
  console.log('# Copy this to your .env file and update with your actual details:');
  console.log('');
  console.log('# Company Bank Details');
  console.log('COMPANY_NAME=Your Learning Platform Pvt Ltd');
  console.log('COMPANY_BANK_NAME=State Bank of India');
  console.log('COMPANY_ACCOUNT_NUMBER=1234567890123456');
  console.log('COMPANY_IFSC_CODE=SBIN0001234');
  console.log('COMPANY_ACCOUNT_HOLDER=Your Learning Platform Pvt Ltd');
  console.log('COMPANY_PAN=ABCDE1234F');
  console.log('COMPANY_GST=12ABCDE1234F1Z5');
  console.log('');
  console.log('# Business Information');
  console.log('BUSINESS_EMAIL=payments@yourlearningplatform.com');
  console.log('BUSINESS_PHONE=+91-9876543210');
  console.log('BUSINESS_WEBSITE=https://yourlearningplatform.com');
  console.log('');
  console.log('# Razorpay Configuration');
  console.log('RAZORPAY_KEY_ID=rzp_live_your_actual_key_id');
  console.log('RAZORPAY_KEY_SECRET=your_actual_secret_key');
  console.log('RAZORPAY_WEBHOOK_SECRET=your_webhook_secret');
  console.log('');
  console.log('# Currency Settings');
  console.log('DEFAULT_CURRENCY=INR');
  console.log('CURRENCY_SYMBOL=₹');
  console.log('LOCALE=en-IN');
  console.log('TIMEZONE=Asia/Kolkata\n');

  console.log('🎯 Quick Start:');
  console.log('1. Read the PAYMENT_SETUP_GUIDE.md for detailed instructions');
  console.log('2. Update your .env file with actual bank details');
  console.log('3. Sign up for Razorpay and complete verification');
  console.log('4. Test payments and go live!');
  console.log('');
  console.log('📞 Support: Contact your development team or payment gateway support.');
  console.log('');
  console.log('🔗 Useful Links:');
  console.log('- Razorpay Signup: https://razorpay.com/');
  console.log('- Razorpay Documentation: https://razorpay.com/docs/');
  console.log('- Stripe Signup: https://stripe.com/');
  console.log('- Payment Gateway Comparison: Compare fees and features');
  console.log('');
  console.log('=====================================');
  console.log('🎉 Payment Gateway Setup Complete!');
  console.log('=====================================');
}

// Run the setup
setupPaymentGateway().catch(console.error); 