const mongoose = require('mongoose');
const User = require('./models/User');

async function checkEducators() {
  try {
    await mongoose.connect('mongodb+srv://cluster0.93yzoyo.mongodb.net/learning_dashboard', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Find all educators
    const allEducators = await User.find({ role: 'educator' }).select('-password');
    console.log('\n=== ALL EDUCATORS ===');
    console.log('Total educators found:', allEducators.length);
    allEducators.forEach((edu, index) => {
      console.log(`${index + 1}. ${edu.firstName} ${edu.lastName}`);
      console.log(`   Email: ${edu.email}`);
      console.log(`   Active: ${edu.isActive}`);
      console.log(`   Approved: ${edu.isApproved}`);
      console.log('   ID:', edu._id);
      console.log('');
    });
    
    // Find active and approved educators (what the dropdown should show)
    const activeApprovedEducators = await User.find({ 
      role: 'educator', 
      isActive: true, 
      isApproved: true 
    }).select('-password');
    
    console.log('\n=== ACTIVE & APPROVED EDUCATORS (Dropdown should show these) ===');
    console.log('Count:', activeApprovedEducators.length);
    activeApprovedEducators.forEach((edu, index) => {
      console.log(`${index + 1}. ${edu.firstName} ${edu.lastName} (${edu.email})`);
    });
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkEducators(); 