# 🔍 Debug Profile Image Issue

## Quick Steps to Fix Profile Image Display

### 1. **Restart Backend Server**
```bash
# Stop the current backend (Ctrl+C in the terminal)
# Then restart:
cd backend
npm start
```

### 2. **Test Image URL Directly**
Open this URL in your browser: **http://localhost:5000/test-image**

This will show you:
- What image files exist
- The correct URL format
- If the backend is serving files

### 3. **Test Direct Image Access**
If the test endpoint shows files, copy one of the image URLs and open it directly in your browser.
Example: **http://localhost:5000/uploads/avatars/683dbaf73c010063324b0876-1751470138051.png**

### 4. **Check Browser Console**
1. Open your profile page
2. Press F12 to open developer tools
3. Go to Console tab
4. Look for these debug messages:
   - "User profile data:" - shows what's in the database
   - "Avatar URL from DB:" - shows the stored avatar path
   - Any image loading errors

### 5. **Upload New Image and Check Console**
1. Try uploading a new image
2. Check console for:
   - "Avatar upload response:" - what the backend returns
   - "Failed to load image:" - if there are URL issues

### 6. **Check Network Tab**
1. Open F12 → Network tab
2. Try to load your profile page
3. Look for any failed image requests (red entries)
4. Check if the image URL is correct

## Common Issues and Solutions

### Issue 1: No Avatar URL in Database
**Symptoms:** Console shows "Avatar URL from DB: undefined"
**Solution:** Upload a new image

### Issue 2: Wrong URL Format
**Symptoms:** Image URL doesn't start with "uploads/avatars/"
**Solution:** Check backend upload code

### Issue 3: Backend Not Running
**Symptoms:** Test endpoint doesn't work
**Solution:** Restart backend server

### Issue 4: CORS Issues
**Symptoms:** Image loads in new tab but not in app
**Solution:** Restart backend (CORS headers added)

### Issue 5: File Not Found
**Symptoms:** 404 error for image URL
**Solution:** Check if file exists in uploads/avatars folder

## Expected Working State

When working correctly:
1. **Test endpoint** shows available images
2. **Console logs** show proper avatar URL
3. **Direct image URL** loads in browser
4. **Profile page** displays image
5. **Sidebar** shows profile picture

## Debug URLs

- Backend test: http://localhost:5000/test-image
- Sample image: http://localhost:5000/uploads/avatars/[filename]
- Profile API: http://localhost:5000/api/v1/users/profile

## If Still Not Working

1. Check if backend is running on port 5000
2. Verify uploads/avatars folder has images
3. Try uploading a new image
4. Check browser console for errors
5. Test image URL directly in browser 