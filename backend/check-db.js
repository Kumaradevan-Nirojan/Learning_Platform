const mongoose = require('mongoose');
require('./config/db');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');
const User = require('./models/User');

async function checkDatabase() {
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('📋 Checking database...');
    
    // Check all assignments
    const assignments = await Assignment.find({})
      .populate('course', 'title')
      .populate('educator', 'firstName lastName email');
    
    console.log('\n📝 All Assignments:');
    assignments.forEach(a => {
      console.log(`- ${a.name} | Course: ${a.course?.title} | Educator: ${a.educator?.firstName} ${a.educator?.lastName} | ID: ${a._id}`);
    });

    // Check all submissions
    const submissions = await Submission.find({})
      .populate('assignment')
      .populate('learner', 'firstName lastName');
    
    console.log('\n📤 All Submissions:');
    submissions.forEach(s => {
      console.log(`- Submission ID: ${s._id} | Assignment: ${s.assignment?._id || 'NULL'} | Learner: ${s.learner?.firstName} ${s.learner?.lastName}`);
    });

    // Check educators
    const educators = await User.find({ role: 'educator' }).select('firstName lastName email');
    console.log('\n👨‍🏫 All Educators:');
    educators.forEach(e => {
      console.log(`- ${e.firstName} ${e.lastName} (${e.email}) | ID: ${e._id}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkDatabase(); 