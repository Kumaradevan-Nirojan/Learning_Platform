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

async function checkUsers() {
  try {
    await connectDB();
    console.log('🔍 Checking existing users...\n');
    
    // Get all users
    const allUsers = await User.find({}).select('firstName lastName email role isApproved isActive createdAt');
    
    console.log('👥 All Users:');
    console.log('=====================================');
    
    allUsers.forEach(user => {
      const status = user.isApproved ? '✅ Approved' : '⏳ Pending';
      const active = user.isActive ? '🟢 Active' : '🔴 Inactive';
      console.log(`${user.firstName} ${user.lastName}`);
      console.log(`  📧 Email: ${user.email}`);
      console.log(`  👤 Role: ${user.role}`);
      console.log(`  🎯 Status: ${status}`);
      console.log(`  💡 Active: ${active}`);
      console.log(`  📅 Created: ${user.createdAt}`);
      console.log('-------------------------------------');
    });

    // Statistics
    const stats = {
      total: allUsers.length,
      admins: allUsers.filter(u => u.role === 'admin').length,
      coordinators: allUsers.filter(u => u.role === 'coordinator').length,
      educators: allUsers.filter(u => u.role === 'educator').length,
      learners: allUsers.filter(u => u.role === 'learner').length,
      approved: allUsers.filter(u => u.isApproved).length,
      pending: allUsers.filter(u => !u.isApproved).length,
      pendingCoordinators: allUsers.filter(u => u.role === 'coordinator' && !u.isApproved).length,
      pendingEducators: allUsers.filter(u => u.role === 'educator' && !u.isApproved).length
    };

    console.log('\n📊 Summary Statistics:');
    console.log('=====================================');
    console.log(`Total Users: ${stats.total}`);
    console.log(`Admins: ${stats.admins}`);
    console.log(`Coordinators: ${stats.coordinators}`);
    console.log(`Educators: ${stats.educators}`);
    console.log(`Learners: ${stats.learners}`);
    console.log(`Approved Users: ${stats.approved}`);
    console.log(`Pending Approval: ${stats.pending}`);
    console.log(`  - Pending Coordinators: ${stats.pendingCoordinators}`);
    console.log(`  - Pending Educators: ${stats.pendingEducators}`);

    if (stats.pending > 0) {
      console.log('\n⚠️  Users needing approval:');
      const pendingUsers = allUsers.filter(u => !u.isApproved);
      pendingUsers.forEach(user => {
        console.log(`  - ${user.firstName} ${user.lastName} (${user.role}) - ${user.email}`);
      });
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkUsers(); 