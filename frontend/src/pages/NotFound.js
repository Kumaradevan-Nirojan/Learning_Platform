// frontend/src/pages/NotFound.js
import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card className="text-center p-4 shadow-sm">
        <Card.Title as="h2" className="mb-3">404 - Page Not Found</Card.Title>
        <Card.Text className="mb-4">
          Oops! The page you’re looking for doesn’t exist.
        </Card.Text>
        <Button variant="primary" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </Card>
    </Container>
  );
};

export default NotFound;
