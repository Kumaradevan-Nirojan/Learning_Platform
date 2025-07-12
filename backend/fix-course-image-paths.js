require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./models/Course');

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

const fixCourseImagePaths = async () => {
  try {
    console.log('🔧 Fixing course image paths...');
    
    // Find all courses with image paths
    const courses = await Course.find({ image: { $exists: true, $ne: '' } });
    
    console.log(`Found ${courses.length} courses with images`);
    
    for (let course of courses) {
      console.log(`\nCourse: ${course.title}`);
      console.log(`Current image path: ${course.image}`);
      
      // Fix path if it starts with '/'
      if (course.image && course.image.startsWith('/')) {
        course.image = course.image.substring(1); // Remove leading slash
        await course.save();
        console.log(`✅ Fixed to: ${course.image}`);
      } else if (course.image && !course.image.startsWith('uploads/')) {
        // If it doesn't start with 'uploads/', add the prefix
        course.image = `uploads/courseImages/${course.image}`;
        await course.save();
        console.log(`✅ Fixed to: ${course.image}`);
      } else {
        console.log(`✅ Path already correct: ${course.image}`);
      }
    }
    
    console.log('\n🎉 Course image paths fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing course image paths:', error);
    process.exit(1);
  }
};

const main = async () => {
  await connectDB();
  await fixCourseImagePaths();
};

main(); 