// Profile utility functions for managing user data across components
import React from 'react';

export const updateLocalStorageProfile = (userData) => {
  if (userData.firstName) localStorage.setItem('firstName', userData.firstName);
  if (userData.lastName) localStorage.setItem('lastName', userData.lastName);
  if (userData.email) localStorage.setItem('email', userData.email);
  if (userData.avatarUrl) localStorage.setItem('avatarUrl', userData.avatarUrl);
  if (userData.role) localStorage.setItem('role', userData.role);
  if (userData._id) localStorage.setItem('userId', userData._id);
  
  // Update the full user object
  localStorage.setItem('user', JSON.stringify(userData));
};

export const getUserFromLocalStorage = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

export const clearLocalStorageProfile = () => {
  const keysToRemove = [
    'token',
    'user',
    'role',
    'firstName',
    'lastName',
    'email',
    'userId',
    'avatarUrl',
    'isActive',
    'isApproved'
  ];
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

export const getProfileDisplayData = () => {
  return {
    firstName: localStorage.getItem('firstName') || 'User',
    lastName: localStorage.getItem('lastName') || '',
    email: localStorage.getItem('email') || '',
    role: localStorage.getItem('role') || 'user',
    avatarUrl: localStorage.getItem('avatarUrl') || null,
    userId: localStorage.getItem('userId') || null
  };
};

// Function to get avatar URL with cache busting
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) return null;
  // Extract timestamp from filename for cache busting instead of using Date.now()
  const timestamp = avatarPath.match(/-(\d+)\./)?.[1] || Date.now();
  return `http://localhost:5000/${avatarPath}?v=${timestamp}`;
};

// Function to get course image URL
export const getCourseImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // Handle both absolute paths and relative paths
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath; // Already a full URL
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  return `http://localhost:5000/${cleanPath}`;
};

// Function to trigger a custom event when profile data changes
export const triggerProfileUpdate = () => {
  window.dispatchEvent(new CustomEvent('profileUpdated'));
};

// Hook for components to listen to profile updates
export const useProfileUpdate = (callback) => {
  React.useEffect(() => {
    window.addEventListener('profileUpdated', callback);
    return () => window.removeEventListener('profileUpdated', callback);
  }, [callback]);
}; 