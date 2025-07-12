const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const bcrypt = require('bcryptjs');

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

async function createTestUsers() {
  try {
    await connectDB();
    console.log('🔍 Creating test users...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@learningplatform.com' });
    if (!adminExists) {
      await User.create({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@learningplatform.com',
        password: hashedPassword,
        dob: new Date('1990-01-01'),
        sex: 'Male',
        role: 'admin',
        isApproved: true,
        isActive: true
      });
      console.log('✅ Created admin user: admin@learningplatform.com / password123');
    }

    // Create test coordinators (some approved, some pending)
    const coordinators = [
      {
        firstName: 'John',
        lastName: 'Coordinator',
        email: 'coordinator1@test.com',
        isApproved: true
      },
      {
        firstName: 'Sarah',
        lastName: 'Manager',
        email: 'coordinator2@test.com',
        isApproved: false // Pending approval
      }
    ];

    for (const coord of coordinators) {
      const exists = await User.findOne({ email: coord.email });
      if (!exists) {
        await User.create({
          firstName: coord.firstName,
          lastName: coord.lastName,
          email: coord.email,
          password: hashedPassword,
          dob: new Date('1985-05-15'),
          sex: 'Male',
          role: 'coordinator',
          isApproved: coord.isApproved,
          isActive: true
        });
        console.log(`✅ Created coordinator: ${coord.email} (Approved: ${coord.isApproved})`);
      }
    }

    // Create test educators (some approved, some pending)
    const educators = [
      {
        firstName: 'Mike',
        lastName: 'Teacher',
        email: 'educator1@test.com',
        isApproved: true
      },
      {
        firstName: 'Lisa',
        lastName: 'Professor',
        email: 'educator2@test.com',
        isApproved: false // Pending approval
      },
      {
        firstName: 'David',
        lastName: 'Instructor',
        email: 'educator3@test.com',
        isApproved: false // Pending approval
      }
    ];

    for (const educator of educators) {
      const exists = await User.findOne({ email: educator.email });
      if (!exists) {
        await User.create({
          firstName: educator.firstName,
          lastName: educator.lastName,
          email: educator.email,
          password: hashedPassword,
          dob: new Date('1980-03-20'),
          sex: 'Female',
          role: 'educator',
          isApproved: educator.isApproved,
          isActive: true
        });
        console.log(`✅ Created educator: ${educator.email} (Approved: ${educator.isApproved})`);
      }
    }

    // Create test learners
    const learners = [
      {
        firstName: 'Alice',
        lastName: 'Student',
        email: 'learner1@test.com'
      },
      {
        firstName: 'Bob',
        lastName: 'Scholar',
        email: 'learner2@test.com'
      }
    ];

    for (const learner of learners) {
      const exists = await User.findOne({ email: learner.email });
      if (!exists) {
        await User.create({
          firstName: learner.firstName,
          lastName: learner.lastName,
          email: learner.email,
          password: hashedPassword,
          dob: new Date('1995-08-10'),
          sex: 'Female',
          role: 'learner',
          isApproved: true, // Learners are auto-approved
          isActive: true
        });
        console.log(`✅ Created learner: ${learner.email}`);
      }
    }

    // Display final statistics
    const stats = {
      totalUsers: await User.countDocuments(),
      admins: await User.countDocuments({ role: 'admin' }),
      coordinators: await User.countDocuments({ role: 'coordinator' }),
      educators: await User.countDocuments({ role: 'educator' }),
      learners: await User.countDocuments({ role: 'learner' }),
      approvedCoordinators: await User.countDocuments({ role: 'coordinator', isApproved: true }),
      approvedEducators: await User.countDocuments({ role: 'educator', isApproved: true }),
      pendingCoordinators: await User.countDocuments({ role: 'coordinator', isApproved: false }),
      pendingEducators: await User.countDocuments({ role: 'educator', isApproved: false })
    };

    console.log('\n📊 Final Statistics:');
    console.log(`   Total Users: ${stats.totalUsers}`);
    console.log(`   Admins: ${stats.admins}`);
    console.log(`   Coordinators: ${stats.coordinators} (${stats.approvedCoordinators} approved, ${stats.pendingCoordinators} pending)`);
    console.log(`   Educators: ${stats.educators} (${stats.approvedEducators} approved, ${stats.pendingEducators} pending)`);
    console.log(`   Learners: ${stats.learners}`);

    console.log('\n🔐 Login Credentials:');
    console.log('   Admin: admin@learningplatform.com / password123');
    console.log('   Test accounts: [username]@test.com / password123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createTestUsers(); 