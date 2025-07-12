import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Button, NavDropdown } from 'react-bootstrap';
import { FaBookOpen } from 'react-icons/fa';
// Make sure you have created this CSS file for styling
// import '../styles/PublicNavbar.css'; 

const PublicNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // On component mount, check for user data in local storage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user && user !== 'undefined') {
      try {
        setCurrentUser(JSON.parse(user));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem('user'); // Clear corrupted data
      }
    }
  }, []);

  const handleScroll = () => {
    if (window.scrollY >= 80) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setCurrentUser(null);
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!currentUser) return '/';
    switch (currentUser.role) {
      case 'coordinator':
        return '/coordinator/dashboard';
      case 'educator':
        return '/educator/dashboard';
      case 'learner':
        return '/learner/dashboard';
      default:
        return '/';
    }
  };

  // If a user is logged in OR the page is scrolled, the navbar will be solid. Otherwise, it will be transparent.
  const navClass = currentUser || scrolled ? 'navbar-scrolled bg-dark' : 'navbar-transparent';

  return (
    <Navbar
      collapseOnSelect
      expand="lg"
      className={navClass}
      fixed="top"
      variant="dark"
    >
      <Container>
        <Navbar.Brand as={NavLink} to="/" className="d-flex align-items-center">
          <FaBookOpen className="me-2" />
          <span className="fw-bold">Learning Platform</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mx-auto">
            <Nav.Link as={NavLink} to="/" end>Home</Nav.Link>
            <Nav.Link as={NavLink} to="/courses">Courses</Nav.Link>
            <Nav.Link as={NavLink} to="/about">About</Nav.Link>
            <Nav.Link as={NavLink} to="/contact">Contact</Nav.Link>
          </Nav>
          <Nav>
            {currentUser ? (
              <NavDropdown title={`Welcome, ${currentUser.firstName}`} id="public-nav-dropdown">
                <NavDropdown.Item onClick={() => navigate(getDashboardLink())}>
                  My Dashboard
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Button as={NavLink} to="/login" variant="outline-light" className="me-2">Login</Button>
                <Button as={NavLink} to="/register" variant="primary">Register</Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default PublicNavbar;