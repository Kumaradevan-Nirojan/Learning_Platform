import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import DashboardTitle from './common/DashboardTitle';
import '../styles/Layout.css';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return JSON.parse(localStorage.getItem('sidebarOpen') || 'true');
  });

  const [darkMode, setDarkMode] = useState(() => {
    return JSON.parse(localStorage.getItem('darkMode') || 'false');
  });

  const location = useLocation();
  
  let user = null;
  try {
    const rawUser = localStorage.getItem('user');
    if (rawUser && rawUser !== 'undefined') {
      user = JSON.parse(rawUser);
    }
  } catch (error) {
    console.warn('Invalid user data in localStorage:', error);
    user = null;
  }

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // This problematic useEffect block has been REMOVED to fix the blank page issue.
  // The Login page now correctly handles redirects.

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      localStorage.setItem('sidebarOpen', JSON.stringify(!prev));
      return !prev;
    });
  };

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const formatBreadcrumb = (part) => {
    switch (part.toLowerCase()) {
      case 'my-studyplans':
        return 'Study Plans';
      case 'study-plans':
        return 'Study Plans';
      case 'create':
        return ''; // skip rendering this
      default:
        return part.charAt(0).toUpperCase() + part.slice(1);
    }
  };

  const renderBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    const dashboardLabel =
      user?.role === 'coordinator'
        ? 'Coordinator Dashboard'
        : user?.role === 'educator'
        ? 'Educator Dashboard'
        : user?.role === 'learner'
        ? 'Learner Dashboard'
        : 'Home';

    return (
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/${user?.role}/dashboard` }}>
          {dashboardLabel}
        </Breadcrumb.Item>
        {parts.map((part, idx) => {
          if (formatBreadcrumb(part) === '') return null;
          const path = '/' + parts.slice(0, idx + 1).join('/');
          return (
            <Breadcrumb.Item
              key={path}
              linkAs={Link}
              linkProps={{ to: path }}
              active={idx === parts.length - 1}
            >
              {formatBreadcrumb(part)}
            </Breadcrumb.Item>
          );
        })}
      </Breadcrumb>
    );
  };

  return (
    <div className={`d-flex ${darkMode ? 'dark-mode' : ''}`}>
      <div className={`sidebar-wrapper ${isSidebarOpen ? 'expanded' : 'collapsed'}`}>
        <Sidebar />
      </div>
      <div className="flex-grow-1 d-flex flex-column vh-100 bg-light">
        <Navbar
          onToggleSidebar={toggleSidebar}
          onToggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
        />
        <div className="p-2 ps-4">
          {renderBreadcrumbs()}
          <DashboardTitle />
        </div>
        <main className="flex-grow-1 overflow-auto p-3">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;