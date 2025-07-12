// frontend/pages/InactivePage.js
import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const InactivePage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <Container className="py-5 text-center">
      <Alert variant="warning">
        <h4>Account Inactive</h4>
        <p>
          Your educator account is currently inactive. Please contact your coordinator to regain access.
        </p>
        <Button variant="primary" onClick={handleLogout}>
          Logout and Return to Login
        </Button>
      </Alert>
    </Container>
  );
};

export default InactivePage;