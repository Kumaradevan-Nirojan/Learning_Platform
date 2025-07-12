// frontend/src/pages/AccessDenied.jsx
import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="p-4 text-center shadow-sm">
        <Card.Title as="h2" className="mb-3 text-danger">
          Access Denied
        </Card.Title>
        <Card.Text className="mb-4">
          You do not have permission to view this page. Please contact your administrator 
          if you believe this is an error.
        </Card.Text>
        <Button variant="primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button
          variant="secondary"
          className="ms-2"
          onClick={() => navigate('/')}
        >
          Home
        </Button>
      </Card>
    </Container>
  );
};

export default AccessDenied;
