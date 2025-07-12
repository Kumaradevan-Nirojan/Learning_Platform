const mongoose = require('mongoose');
require('dotenv').config();

async function checkCourses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const Course = require('./models/Course');
    const User = require('./models/User');
    
    console.log('\n=== EDUCATORS ===');
    const educators = await User.find({ role: 'educator' });
    console.log('Total educators:', educators.length);
    
    educators.forEach(edu => {
      console.log(`👤 ${edu.firstName} ${edu.lastName} (${edu.email})`);
      console.log(`   ID: ${edu._id}`);
      console.log(`   Active: ${edu.isActive}, Approved: ${edu.isApproved}`);
    });
    
    console.log('\n=== COURSES ===');
    const courses = await Course.find({}).populate('educator', 'firstName lastName email role');
    console.log('Total courses:', courses.length);
    
    courses.forEach(course => {
      console.log(`📚 ${course.title}`);
      console.log(`   Course ID: ${course._id}`);
      console.log(`   Educator ID: ${course.educator?._id || 'No educator'}`);
      if (course.educator) {
        console.log(`   Educator: ${course.educator.firstName} ${course.educator.lastName}`);
      }
    });
    
    // Check specific educator
    const targetEducator = educators.find(e => e.firstName === 'abcd' && e.lastName === 'efgh');
    if (targetEducator) {
      console.log(`\n=== COURSES FOR ${targetEducator.firstName} ${targetEducator.lastName} ===`);
      const educatorCourses = await Course.find({ educator: targetEducator._id });
      console.log(`Found ${educatorCourses.length} courses for this educator:`);
      educatorCourses.forEach(course => {
        console.log(`- ${course.title}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('✅ Database connection closed');
  }
}

checkCourses(); 