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

async function setPendingApproval() {
  try {
    await connectDB();
    console.log('🔍 Setting some users to pending approval for testing...\n');
    
    // Find all coordinators and educators
    const staffUsers = await User.find({
      role: { $in: ['coordinator', 'educator'] }
    }).select('firstName lastName email role isApproved');

    console.log(`Found ${staffUsers.length} coordinators and educators:\n`);
    
    if (staffUsers.length === 0) {
      console.log('No coordinators or educators found. Creating test users...');
      
      // Create test users
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const testUsers = [
        {
          firstName: 'John',
          lastName: 'Coordinator',
          email: 'coordinator1@test.com',
          role: 'coordinator',
          isApproved: false
        },
        {
          firstName: 'Sarah',
          lastName: 'Manager',
          email: 'coordinator2@test.com',
          role: 'coordinator',
          isApproved: false
        },
        {
          firstName: 'Mike',
          lastName: 'Teacher',
          email: 'educator1@test.com',
          role: 'educator',
          isApproved: false
        },
        {
          firstName: 'Lisa',
          lastName: 'Professor',
          email: 'educator2@test.com',
          role: 'educator',
          isApproved: false
        }
      ];

      for (const testUser of testUsers) {
        const existingUser = await User.findOne({ email: testUser.email });
        if (!existingUser) {
          await User.create({
            ...testUser,
            password: hashedPassword,
            dob: new Date('1985-01-01'),
            sex: 'Male',
            isActive: true
          });
          console.log(`✅ Created ${testUser.role}: ${testUser.email} (Pending approval)`);
        }
      }
    } else {
      // Set some existing users to pending approval
      let count = 0;
      for (const user of staffUsers) {
        if (count < 3) { // Set first 3 to pending
          await User.findByIdAndUpdate(user._id, { isApproved: false });
          console.log(`🔄 Set ${user.firstName} ${user.lastName} (${user.role}) to pending approval`);
          count++;
        }
      }
    }

    // Show final status
    const pendingUsers = await User.find({
      role: { $in: ['coordinator', 'educator'] },
      isApproved: false
    }).select('firstName lastName email role');

    console.log(`\n📊 Users now pending approval: ${pendingUsers.length}`);
    pendingUsers.forEach(user => {
      console.log(`  - ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`);
    });

    console.log('\n✅ Done! Refresh the admin dashboard to see pending approvals.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

setPendingApproval(); 