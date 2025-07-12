// frontend/src/components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '../styles/Sidebar.css';
import { getProfileDisplayData, getAvatarUrl } from '../utils/profileUtils';

const Sidebar = () => {
  const token = localStorage.getItem('token');
  const [profileData, setProfileData] = useState(getProfileDisplayData());
  const [collapsed, setCollapsed] = useState(() => {
    return JSON.parse(localStorage.getItem('sidebarCollapsed') || 'false');
  });
  const [visible, setVisible] = useState(true);
  const [dynamicItems, setDynamicItems] = useState([]);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      setProfileData(getProfileDisplayData());
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Fetch dynamic nav items if needed
      } catch (err) {
        console.warn('Could not fetch dynamic nav items', err);
      }
    };
    fetchItems();
  }, [token]);

  const baseItems = [
    { to: '/courses', label: 'Courses', icon: 'bi-book' },
    { to: '/learner/quizzes', label: 'Quizzes', icon: 'bi-question-circle' },
    { to: '/submissions', label: 'Assignments', icon: 'bi-file-earmark-arrow-up' },
  ];

  const roleItems = {
    admin: [
      { to: '/profile', label: 'My Profile', icon: 'bi-person-circle' },
    ],
    coordinator: [
      { to: '/profile', label: 'My Profile', icon: 'bi-person-circle' },
      { to: '/coordinator/course', label: 'Manage Courses', icon: 'bi-journal-code' },
      { to: '/coordinator/students', label: 'Manage Students', icon: 'bi-people' },
      { to: '/coordinator/educators', label: 'Manage Educators', icon: 'bi-person-video2' },
      { to: '/coordinator/submissions', label: 'Submissions', icon: 'bi-upload' },
      { to: '/coordinator/quizzes', label: 'Quizzes', icon: 'bi-question-circle' },
      { to: '/courses', label: 'Courses', icon: 'bi-book' },
    ],
    educator: [
      { to: '/profile', label: 'My Profile', icon: 'bi-person-circle' },
      { to: '/educator/my-studyplans', label: 'Study Plans', icon: 'bi-journal-text' },
      { to: '/quizzes/create', label: 'Create Quiz', icon: 'bi-patch-question' },
      { to: '/educator/my-quizzes', label: 'My Quizzes', icon: 'bi-journal-bookmark' },
      { to: '/assignments/create', label: 'Create Assignment', icon: 'bi-file-earmark-plus' },
      { to: '/educator/create-zoom-session', label: 'Create Zoom Session', icon: 'bi-camera-video' },
      { to: '/zoom-sessions', label: 'Live Zoom Sessions', icon: 'bi-camera-video' },
      { to: '/educator/my-courses', label: 'My Courses', icon: 'bi-book-half' },
      { to: '/educator/my-assignments', label: 'Students Assignments', icon: 'bi-journal-check' },
      { to: '/educator/my-submissions', label: 'Students Submissions', icon: 'bi-upload' },
    ],
    learner: [
      { to: '/profile', label: 'My Profile', icon: 'bi-person-circle' },
      { to: 'my-courses', label: 'My Courses', icon: 'bi-collection-play' },
      { to: '/zoom-sessions', label: 'Live Zoom Sessions', icon: 'bi-camera-video' },
      { to: '/learner/studyplans', label: 'Study Plans', icon: 'bi-journal-text' },
      ...baseItems,
      { to: '/learner/quiz-history', label: 'Quiz History', icon: 'bi-journal-richtext' },
      { to: '/learner/my-submissions', label: 'My Submissions', icon: 'bi-upload' },
    ],
  };

  const navItems = roleItems[profileData.role] || baseItems;

  const dashboardRoute =
    profileData.role === 'admin'
      ? '/admin/dashboard'
      : profileData.role === 'coordinator'
      ? '/coordinator/dashboard'
      : profileData.role === 'educator'
      ? '/educator/dashboard'
      : '/learner/dashboard';

  const dashboardLabel = 'Dashboard';

  if (!visible) {
    return (
      <button
        className="btn btn-secondary position-fixed top-0 start-0 m-2 d-md-none"
        onClick={() => setVisible(true)}
      >
        <i className="bi bi-list"></i>
      </button>
    );
  }

  return (
    <div
      className={`sidebar bg-light border-end vh-100 position-relative ${collapsed ? 'collapsed-sidebar' : 'expanded-sidebar'}`}
      style={{ width: collapsed ? '60px' : '220px', transition: 'width 0.3s' }}
    >
      <div className="d-flex justify-content-between align-items-center p-2">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <i className={`bi ${collapsed ? 'bi-chevron-double-right' : 'bi-chevron-double-left'}`}></i>
        </button>
        <button
          className="btn btn-outline-danger btn-sm d-md-none"
          onClick={() => setVisible(false)}
          title="Hide Sidebar"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      {/* User Profile Section */}
      {!collapsed && (
        <div className="px-3 py-2 border-bottom">
          <NavLink to="/profile" className="text-decoration-none">
            <div className="d-flex align-items-center">
              <div className="position-relative me-2">
                {profileData.avatarUrl ? (
                  <img
                    src={getAvatarUrl(profileData.avatarUrl)}
                    alt="Profile"
                    style={{ 
                      width: '40px', 
                      height: '40px', 
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                    crossOrigin="anonymous"
                    onError={(e) => {
                      e.target.src = `http://localhost:5000/${profileData.avatarUrl}`;
                    }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white"
                    style={{ width: '40px', height: '40px' }}
                  >
                    <i className="bi bi-person-fill"></i>
                  </div>
                )}
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success" style={{ fontSize: '8px' }}>
                  <span className="visually-hidden">online</span>
                </span>
              </div>
              <div className="flex-grow-1">
                <div className="fw-semibold text-dark" style={{ fontSize: '0.9rem' }}>
                  {(profileData.firstName || 'User')} {(profileData.lastName || '')}
                </div>
                <div className="text-muted small text-capitalize">
                  {profileData.role || 'user'}
                </div>
              </div>
            </div>
          </NavLink>
        </div>
      )}

      {collapsed && (
        <div className="px-2 py-2 border-bottom text-center">
          <NavLink to="/profile" className="text-decoration-none">
            {profileData.avatarUrl ? (
              <img
                src={getAvatarUrl(profileData.avatarUrl)}
                alt="Profile"
                style={{ 
                  width: '35px', 
                  height: '35px', 
                  objectFit: 'cover',
                  borderRadius: '50%'
                }}
                crossOrigin="anonymous"
                onError={(e) => {
                  e.target.src = `http://localhost:5000/${profileData.avatarUrl}`;
                }}
              />
            ) : (
              <div
                className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white mx-auto"
                style={{ width: '35px', height: '35px' }}
              >
                <i className="bi bi-person-fill"></i>
              </div>
            )}
          </NavLink>
        </div>
      )}

      <ul className="nav flex-column px-2">
        <li className="nav-item">
          <NavLink
            to={dashboardRoute}
            className={({ isActive }) =>
              `nav-link d-flex align-items-center ${isActive ? 'active fw-bold text-primary' : 'text-dark'}`
            }
            title="Dashboard"
          >
            <i className="bi bi-speedometer2 me-2" style={{ fontSize: '1.2rem' }}></i>
            {!collapsed && dashboardLabel}
          </NavLink>
        </li>

        {navItems.map((item) => (
          <li className="nav-item" key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center ${isActive ? 'active fw-bold text-primary' : 'text-dark'}`
              }
              title={collapsed ? item.label : ''}
            >
              <i className={`bi ${item.icon} me-2`} style={{ fontSize: '1.2rem' }}></i>
              {!collapsed && item.label}
            </NavLink>
          </li>
        ))}

        {dynamicItems.map((item) => (
          <li className="nav-item" key={item.to}>
            <NavLink
              to={item.to}
              className="nav-link d-flex align-items-center text-dark"
              title={collapsed ? item.label : ''}
            >
              <i className={`bi ${item.icon} me-2`}></i>
              {!collapsed && item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
