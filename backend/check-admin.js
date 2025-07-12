const mongoose = require('mongoose');
require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function checkAdminSetup() {
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('🔍 Checking admin setup...');
    
    // Check for existing admin users
    const adminUsers = await User.find({ role: 'admin' }).select('firstName lastName email isApproved');
    console.log('\n👑 Admin Users:');
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found!');
      
      // Create a default admin user
      const adminPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@learningplatform.com',
        password: adminPassword,
        dob: new Date('1990-01-01'),
        sex: 'Male',
        role: 'admin',
        isApproved: true,
        isActive: true
      });
      console.log('✅ Created default admin user:');
      console.log(`   Email: admin@learningplatform.com`);
      console.log(`   Password: admin123`);
      console.log(`   ID: ${newAdmin._id}`);
    } else {
      adminUsers.forEach(admin => {
        console.log(`✅ ${admin.firstName} ${admin.lastName} (${admin.email}) | Approved: ${admin.isApproved}`);
      });
    }

    // Check for pending approval users
    const pendingUsers = await User.find({
      role: { $in: ['coordinator', 'educator'] },
      isApproved: false
    }).select('firstName lastName email role createdAt');
    
    console.log('\n⏳ Pending Approval Users:');
    if (pendingUsers.length === 0) {
      console.log('✅ No users pending approval');
    } else {
      pendingUsers.forEach(user => {
        console.log(`- ${user.firstName} ${user.lastName} (${user.email}) | Role: ${user.role} | Registered: ${user.createdAt}`);
      });
    }

    // Check all coordinators and educators
    const allStaff = await User.find({
      role: { $in: ['coordinator', 'educator'] }
    }).select('firstName lastName email role isApproved isActive');
    
    console.log('\n👥 All Coordinators & Educators:');
    allStaff.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) | Role: ${user.role} | Approved: ${user.isApproved} | Active: ${user.isActive}`);
    });

    // Statistics
    const stats = {
      totalCoordinators: await User.countDocuments({ role: 'coordinator' }),
      totalEducators: await User.countDocuments({ role: 'educator' }),
      totalLearners: await User.countDocuments({ role: 'learner' }),
      approvedCoordinators: await User.countDocuments({ role: 'coordinator', isApproved: true }),
      approvedEducators: await User.countDocuments({ role: 'educator', isApproved: true }),
      pendingCoordinators: await User.countDocuments({ role: 'coordinator', isApproved: false }),
      pendingEducators: await User.countDocuments({ role: 'educator', isApproved: false })
    };

    console.log('\n📊 Statistics:');
    console.log(`   Total Users: ${stats.totalCoordinators + stats.totalEducators + stats.totalLearners}`);
    console.log(`   Coordinators: ${stats.totalCoordinators} (${stats.approvedCoordinators} approved, ${stats.pendingCoordinators} pending)`);
    console.log(`   Educators: ${stats.totalEducators} (${stats.approvedEducators} approved, ${stats.pendingEducators} pending)`);
    console.log(`   Learners: ${stats.totalLearners}`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkAdminSetup(); 