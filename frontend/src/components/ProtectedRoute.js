// frontend/src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Wraps protected routes, ensuring user is authenticated and has allowed roles.
 * 
 * @param {React.ReactNode} children - The component(s) to render if allowed.
 * @param {string[]} [allowedRoles] - Optional array of roles allowed to view this route.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Role not authorized
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/access-denied" replace />;
  }

  // Authorized
  return <>{children}</>;
};

export default ProtectedRoute;
