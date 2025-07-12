const mongoose = require('mongoose');
const User = require('./models/User');

async function debugEducators() {
  try {
    // Use the same connection string from your environment
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://cluster0.93yzoyo.mongodb.net/learning_dashboard';
    await mongoose.connect(mongoURI);
    
    console.log('🔌 Connected to MongoDB');
    
    // Check all educators
    const allEducators = await User.find({ role: 'educator' }).select('-password');
    console.log('\n📊 ALL EDUCATORS IN DATABASE:');
    console.log('Total count:', allEducators.length);
    
    allEducators.forEach((edu, index) => {
      console.log(`\n${index + 1}. ${edu.firstName} ${edu.lastName}`);
      console.log(`   📧 Email: ${edu.email}`);
      console.log(`   ✅ Active: ${edu.isActive}`);
      console.log(`   👍 Approved: ${edu.isApproved}`);
      console.log(`   🆔 ID: ${edu._id}`);
      
      // Check if this educator should show in dropdown
      const shouldShow = edu.isActive === true && edu.isApproved === true;
      console.log(`   🎯 Should show in dropdown: ${shouldShow}`);
    });
    
    // Check what the API filter would return
    const filteredEducators = await User.find({ 
      role: 'educator', 
      isActive: true, 
      isApproved: true 
    }).select('-password');
    
    console.log('\n🎯 EDUCATORS THAT SHOULD SHOW IN DROPDOWN:');
    console.log('Count:', filteredEducators.length);
    
    if (filteredEducators.length === 0) {
      console.log('❌ No educators meet all criteria (role=educator, isActive=true, isApproved=true)');
    } else {
      filteredEducators.forEach((edu, index) => {
        console.log(`${index + 1}. ${edu.firstName} ${edu.lastName} (${edu.email})`);
      });
    }
    
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debugEducators(); 