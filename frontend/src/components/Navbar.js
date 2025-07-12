// frontend/src/components/Navbar.js
import React from 'react';
import { Button, NavLink as BsNavLink } from 'react-bootstrap';
import { useNavigate, NavLink } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import { FaSun, FaMoon, FaBars } from 'react-icons/fa';
import { toast } from 'react-toastify';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const { darkMode, toggleTheme } = useTheme();
  const { toggleSidebar } = useSidebar();

  let user = null;
  const rawUser = localStorage.getItem('user');
  if (rawUser && rawUser !== 'undefined') {
    try {
      user = JSON.parse(rawUser);
    } catch {
      console.warn('Invalid user data in localStorage.');
      user = null; // Reset if data is corrupt
    }
  }
  
  const handleLogout = () => {
    // Navigate first to provide a faster perceived response
    navigate('/login');
    localStorage.clear();
    toast.info('You have been logged out successfully.');
  };

  return (
    <div
      className={`navbar d-flex justify-content-between align-items-center px-3 py-2 border-bottom ${
        darkMode ? 'bg-dark text-white' : 'bg-light text-dark'
      }`}
    >
      {/* Left Section: Sidebar Toggle & Brand Name */}
      <div className="d-flex align-items-center gap-3">
        {/* Only show sidebar toggle if user is logged in */}
        {token && (
            <Button variant="outline-secondary" onClick={toggleSidebar}>
                <FaBars />
            </Button>
        )}
        <NavLink
          to="/"
          className={`navbar-brand fw-bold ${darkMode ? 'text-white' : 'text-dark'}`}>
          Learning Platform
        </NavLink>
      </div>

      {/* Right Section: Theme Toggle & User Actions */}
      <div className="d-flex align-items-center gap-3">
        <Button variant={darkMode ? 'outline-light' : 'outline-dark'} onClick={toggleTheme}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </Button>

        {token && user ? (
          <>
            <span className="d-none d-md-inline">
              Welcome, {user.firstName || user.email || 'User'}
            </span>
            <Button variant="outline-danger" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="btn btn-outline-primary">
              Login
            </NavLink>
            <NavLink to="/register" className="btn btn-primary">
              Register
            </NavLink>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;