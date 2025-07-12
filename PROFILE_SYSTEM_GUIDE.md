# 👤 User Profile System Guide

## 📋 Overview
The profile system provides comprehensive user management for all user types (Admin, Coordinator, Educator, Learner) with image upload, profile editing, and sidebar integration.

---

## 🎯 **Features Implemented**

### ✅ **Universal Profile System**
- **Single profile page** works for all user types
- **Role-specific information** display
- **Responsive design** for all devices
- **Real-time updates** across components

### ✅ **Image Upload System**
- **Profile picture upload** with validation
- **File type validation** (images only)
- **Size limit enforcement** (2MB max)
- **Preview before upload**
- **Automatic resize** and optimization

### ✅ **Profile Editing**
- **Edit all details** except email (security)
- **Form validation** and error handling
- **Modal-based editing** interface
- **Real-time preview** of changes

### ✅ **Sidebar Integration**
- **Profile picture** display in sidebar
- **User name and role** visibility
- **Online status indicator**
- **Clickable profile link**
- **Auto-refresh** when profile changes

---

## 🔧 **Technical Implementation**

### **File Structure:**
```
frontend/src/
├── pages/
│   └── Profile.js              # Universal profile page
├── components/
│   └── Sidebar.js              # Updated with profile section
├── utils/
│   └── profileUtils.js         # Profile management utilities
└── styles/
    └── Dashboard.css           # Profile styling

backend/
├── routes/
│   └── userRoutes.js           # Profile & avatar upload endpoints
├── uploads/
│   └── avatars/                # Avatar storage directory
└── middleware/
    └── upload.js               # File upload middleware
```

### **API Endpoints:**
```javascript
// Profile Management
GET    /api/v1/users/profile           # Get user profile
PATCH  /api/v1/users/profile           # Update profile (no email)
POST   /api/v1/users/upload-avatar     # Upload profile image

// Authentication (Enhanced)
POST   /api/v1/users/login             # Login with full profile data
POST   /api/v1/users/register          # Register with profile setup
```

---

## 🚀 **How to Use**

### **For Users:**

1. **Access Profile:**
   - Click profile picture/name in sidebar
   - Or navigate to `/profile`

2. **Edit Profile:**
   - Click "Edit Profile" button
   - Update any field except email
   - Save changes

3. **Change Profile Picture:**
   - Click "Change Photo" button
   - Select image file (JPG, PNG, etc.)
   - Preview and upload

4. **View Profile:**
   - See personal information
   - Check role-specific details
   - View membership date

### **For Developers:**

#### **Profile Data Management:**
```javascript
import { 
  updateLocalStorageProfile, 
  triggerProfileUpdate,
  getProfileDisplayData 
} from '../utils/profileUtils';

// Update profile data
updateLocalStorageProfile(userData);

// Trigger sidebar refresh
triggerProfileUpdate();

// Get current profile data
const profile = getProfileDisplayData();
```

#### **Adding Profile Features:**
```javascript
// Listen for profile updates
useEffect(() => {
  const handleUpdate = () => {
    // Refresh component when profile changes
    setProfileData(getProfileDisplayData());
  };
  
  window.addEventListener('profileUpdated', handleUpdate);
  return () => window.removeEventListener('profileUpdated', handleUpdate);
}, []);
```

---

## 🎨 **User Interface**

### **Profile Page Layout:**
```
┌─────────────────────────────────────────┐
│ Profile Header                          │
│ ┌─────────┐  Name & Role               │
│ │ Avatar  │  Email & Phone             │
│ │ Photo   │  [Edit Profile Button]     │
│ └─────────┘                            │
├─────────────────────────────────────────┤
│ Personal Info    │  Address & Contact   │
│ - First Name     │  - Email (locked)    │
│ - Last Name      │  - Address           │
│ - Date of Birth  │  - Country           │
│ - Gender         │  - Account Type      │
│ - Phone          │                      │
└─────────────────────────────────────────┘
```

### **Sidebar Profile Section:**
```
┌─────────────────────┐
│ ┌─────┐ User Name   │  ← Expanded View
│ │ IMG │ Role Badge  │
│ └─────┘ ●online     │
├─────────────────────┤
│ ┌─────┐             │  ← Collapsed View
│ │ IMG │             │
│ └─────┘             │
└─────────────────────┘
```

---

## 🔒 **Security Features**

### **Email Protection:**
- ✅ **Email cannot be changed** from profile
- ✅ **Security notice** displayed to users
- ✅ **Admin contact** for email changes

### **File Upload Security:**
- ✅ **File type validation** (images only)
- ✅ **Size limits** (2MB maximum)
- ✅ **Secure file storage** with unique names
- ✅ **Path traversal protection**

### **Data Validation:**
- ✅ **Frontend validation** for all fields
- ✅ **Backend validation** for security
- ✅ **XSS protection** in displayed data
- ✅ **SQL injection prevention**

---

## 🎭 **Role-Specific Features**

### **👑 Admin Profile:**
```javascript
// Additional Admin Information
- Role: Administrator
- Badge: Red "Admin" badge
- Icon: Shield with lock
- Access: Full system access
```

### **👨‍💼 Coordinator Profile:**
```javascript
// Additional Coordinator Information
- Approval Status: Admin approval required
- Badge: Blue "Coordinator" badge
- Icon: Person with gear
- Access: Manage courses & educators
```

### **👨‍🏫 Educator Profile:**
```javascript
// Additional Educator Information
- Status: Active/Inactive
- Approval: Admin & Coordinator approval
- Badge: Green "Educator" badge
- Icon: Person with video
- Access: Create content & teach
```

### **🎓 Learner Profile:**
```javascript
// Additional Learner Information
- Badge: Blue "Learner" badge
- Icon: Person with graduation cap
- Access: Learn & participate
```

---

## 🛠 **Configuration**

### **Image Upload Settings:**
```javascript
// In backend/routes/userRoutes.js
const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only images allowed'));
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
});
```

### **Profile Fields:**
```javascript
// Editable Fields
const editableFields = [
  'firstName',    // Required
  'lastName',     // Required
  'phone',        // Optional
  'address',      // Optional
  'country',      // Optional
  'dob',          // Optional
  'sex',          // Optional
];

// Protected Fields
const protectedFields = [
  'email',        // Cannot be changed
  'role',         // Admin only
  'isActive',     // Coordinator only
  'isApproved',   // Admin only
];
```

---

## 📱 **Responsive Design**

### **Desktop View:**
- ✅ **Large profile cards** with detailed information
- ✅ **Side-by-side layout** for personal and contact info
- ✅ **Full sidebar** with profile section
- ✅ **Modal dialogs** for editing

### **Mobile View:**
- ✅ **Stacked card layout** for better readability
- ✅ **Collapsible sidebar** with profile icon
- ✅ **Touch-friendly buttons** and interfaces
- ✅ **Responsive image sizing**

### **Tablet View:**
- ✅ **Adaptive layout** based on screen size
- ✅ **Optimized spacing** for touch interaction
- ✅ **Balanced information density**

---

## 🔄 **Real-time Updates**

### **Profile Update System:**
```javascript
// When profile data changes
updateLocalStorageProfile(newData);  // Update storage
triggerProfileUpdate();              // Notify components

// Components listen for updates
window.addEventListener('profileUpdated', () => {
  // Refresh UI with new data
  setProfileData(getProfileDisplayData());
});
```

### **Sidebar Synchronization:**
- ✅ **Instant updates** when profile changes
- ✅ **Avatar refresh** on image upload
- ✅ **Name update** on profile edit
- ✅ **Role badge sync** with user status

---

## 🧪 **Testing the System**

### **Profile Upload Test:**
1. Login as any user type
2. Navigate to profile page
3. Click "Change Photo"
4. Select an image file
5. Verify preview appears
6. Click upload and confirm success
7. Check sidebar updates instantly

### **Profile Edit Test:**
1. Click "Edit Profile" button
2. Modify various fields
3. Try to change email (should be blocked)
4. Save changes
5. Verify data updates everywhere
6. Check sidebar reflects changes

### **Cross-Browser Test:**
- ✅ Chrome/Edge: Full compatibility
- ✅ Firefox: Full compatibility
- ✅ Safari: Full compatibility
- ✅ Mobile browsers: Responsive design

---

## 🎯 **Best Practices**

### **For Users:**
1. **Use clear profile photos** for better recognition
2. **Keep information updated** for communication
3. **Use professional images** in work environments
4. **Complete all optional fields** for better networking

### **For Developers:**
1. **Always validate uploads** on both frontend and backend
2. **Use the utility functions** for profile management
3. **Listen for profile updates** in relevant components
4. **Handle errors gracefully** with user-friendly messages

### **For Administrators:**
1. **Monitor upload sizes** to prevent storage issues
2. **Regular cleanup** of unused avatar files
3. **Backup profile data** regularly
4. **Monitor for inappropriate content**

---

## 🚨 **Troubleshooting**

### **Common Issues:**

#### **Profile Picture Not Uploading:**
```javascript
// Check file size
if (file.size > 2 * 1024 * 1024) {
  console.error('File too large');
}

// Check file type
if (!file.type.startsWith('image/')) {
  console.error('Invalid file type');
}

// Check backend endpoint
console.log('Upload URL:', '/api/v1/users/upload-avatar');
```

#### **Sidebar Not Updating:**
```javascript
// Trigger manual update
triggerProfileUpdate();

// Check event listener
window.addEventListener('profileUpdated', handleUpdate);

// Verify localStorage
console.log(getProfileDisplayData());
```

#### **Profile Data Missing:**
```javascript
// Check authentication
const token = localStorage.getItem('token');
if (!token) {
  console.error('User not authenticated');
}

// Verify API response
const response = await axios.get('/api/v1/users/profile');
console.log('Profile data:', response.data);
```

---

## 🎉 **Success Indicators**

### **✅ System Working Correctly When:**
1. **Profile page loads** with user data
2. **Image upload** works without errors
3. **Sidebar updates** immediately after changes
4. **Edit modal** saves data successfully
5. **All user types** can access their profiles
6. **Responsive design** works on all devices
7. **Real-time sync** between components

---

## 📞 **Support & Maintenance**

### **Regular Maintenance:**
- **Clean up unused avatar files** monthly
- **Monitor storage usage** weekly
- **Update image processing** as needed
- **Review security settings** quarterly

### **User Support:**
- **Profile editing guide** for new users
- **Image upload troubleshooting** documentation
- **Contact admin** for email changes
- **Role-specific feature** explanations

---

**🎊 Congratulations! Your comprehensive profile system is now fully functional for all user types!**

### **Key Achievements:**
- ✅ Universal profile system for all roles
- ✅ Image upload with validation
- ✅ Real-time sidebar integration
- ✅ Secure profile editing
- ✅ Responsive design
- ✅ Role-specific features

**👥 Users can now easily manage their profiles, upload images, and see real-time updates across the entire platform!** 