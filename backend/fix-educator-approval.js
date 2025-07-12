const mongoose = require('mongoose');
const User = require('./models/User');

async function fixEducatorApproval() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://cluster0.93yzoyo.mongodb.net/learning_dashboard';
    await mongoose.connect(mongoURI);
    
    console.log('🔌 Connected to MongoDB');
    
    // Find educators who are active but not approved
    const unapprovedEducators = await User.find({ 
      role: 'educator', 
      isActive: true, 
      $or: [
        { isApproved: false },
        { isApproved: { $exists: false } }
      ]
    });
    
    console.log('\n📊 UNAPPROVED ACTIVE EDUCATORS:');
    console.log('Count:', unapprovedEducators.length);
    
    if (unapprovedEducators.length === 0) {
      console.log('✅ All active educators are already approved!');
    } else {
      for (const edu of unapprovedEducators) {
        console.log(`\n🔧 Approving: ${edu.firstName} ${edu.lastName} (${edu.email})`);
        
        edu.isApproved = true;
        await edu.save();
        
        console.log('✅ Approved successfully!');
      }
    }
    
    // Verify the results
    const approvedEducators = await User.find({ 
      role: 'educator', 
      isActive: true, 
      isApproved: true 
    }).select('-password');
    
    console.log('\n🎯 FINAL RESULT - EDUCATORS THAT WILL SHOW IN DROPDOWN:');
    console.log('Count:', approvedEducators.length);
    
    approvedEducators.forEach((edu, index) => {
      console.log(`${index + 1}. ${edu.firstName} ${edu.lastName} (${edu.email})`);
    });
    
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    console.log('✅ Fix completed! Please refresh your frontend to see the changes.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixEducatorApproval(); 