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

async function approveSomeUsers() {
  try {
    await connectDB();
    console.log('🔍 Approving some users for testing...\n');
    
    // Find all pending coordinators and educators
    const pendingUsers = await User.find({
      role: { $in: ['coordinator', 'educator'] },
      isApproved: false
    }).select('firstName lastName email role');

    console.log(`Found ${pendingUsers.length} pending users:\n`);
    
    if (pendingUsers.length === 0) {
      console.log('❌ No pending users found!');
      process.exit(1);
    }

    // Approve first half of users (for testing purposes)
    const usersToApprove = pendingUsers.slice(0, Math.ceil(pendingUsers.length / 2));
    
    console.log(`Approving ${usersToApprove.length} users:\n`);
    
    for (const user of usersToApprove) {
      await User.findByIdAndUpdate(user._id, { isApproved: true });
      console.log(`✅ Approved: ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`);
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
    console.log(`  - Approved: ${finalStats.approvedCoordinators}`);
    console.log(`  - Pending: ${finalStats.pendingCoordinators}`);
    console.log(`Total Educators: ${finalStats.totalEducators}`);
    console.log(`  - Approved: ${finalStats.approvedEducators}`);
    console.log(`  - Pending: ${finalStats.pendingEducators}`);

    console.log('\n✅ Some users are now approved! You can test the "Remove Approval" feature.');
    console.log('🔄 Refresh the admin dashboard to see both approved and pending users.');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

approveSomeUsers(); 