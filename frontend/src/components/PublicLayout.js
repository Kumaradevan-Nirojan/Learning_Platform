import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar'; // Using the specific public navbar
import Footer from './Footer';

/**
 * PublicLayout is a simple wrapper for pages that are visible to everyone.
 * It does NOT contain the user sidebar.
 */
const PublicLayout = () => {
  return (
    <>
      <PublicNavbar />
      <main className="public-content">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default PublicLayout;