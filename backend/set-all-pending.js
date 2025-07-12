const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully.');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

async function setAllPending() {
  try {
    await connectDB();
    console.log('🔍 Setting ALL coordinators and educators to pending approval...\n');
    
    // Find all coordinators and educators
    const staffUsers = await User.find({
      role: { $in: ['coordinator', 'educator'] }
    }).select('firstName lastName email role isApproved');

    console.log(`Found ${staffUsers.length} coordinators and educators:\n`);
    
    if (staffUsers.length === 0) {
      console.log('❌ No coordinators or educators found in database!');
      process.exit(1);
    }

    // Set ALL to pending approval
    let updatedCount = 0;
    for (const user of staffUsers) {
      const wasApproved = user.isApproved;
      await User.findByIdAndUpdate(user._id, { isApproved: false });
      
      const status = wasApproved ? '🔄 Changed from approved to pending' : '⏳ Already pending';
      console.log(`${status}: ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`);
      updatedCount++;
    }

    // Show final status
    const finalStats = {
      totalCoordinators: await User.countDocuments({ role: 'coordinator' }),
      totalEducators: await User.countDocuments({ role: 'educator' }),
      pendingCoordinators: await User.countDocuments({ role: 'coordinator', isApproved: false }),
      pendingEducators: await User.countDocuments({ role: 'educator', isApproved: false }),
      approvedCoordinators: await User.countDocuments({ role: 'coordinator', isApproved: true }),
      approvedEducators: await User.countDocuments({ role: 'educator', isApproved: true })
    };

    console.log('\n📊 Final Statistics:');
    console.log('=====================================');
    console.log(`Total Coordinators: ${finalStats.totalCoordinators}`);
    console.log(`  - Pending: ${finalStats.pendingCoordinators}`);
    console.log(`  - Approved: ${finalStats.approvedCoordinators}`);
    console.log(`Total Educators: ${finalStats.totalEducators}`);
    console.log(`  - Pending: ${finalStats.pendingEducators}`);
    console.log(`  - Approved: ${finalStats.approvedEducators}`);
    console.log(`Total Pending: ${finalStats.pendingCoordinators + finalStats.pendingEducators}`);

    console.log('\n✅ All coordinators and educators are now pending approval!');
    console.log('🔄 Refresh the admin dashboard to see all pending approvals.');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

setAllPending(); 