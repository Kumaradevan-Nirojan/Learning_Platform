// frontend/src/pages/CoordinatorPage.js
import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * A simple landing page for coordinators, providing quick navigation.
 */
const CoordinatorPage = () => {
  return (
    <Container className="my-5">
      <h3 className="mb-4 text-center">Coordinator Panel</h3>
      <Row xs={1} md={2} lg={3} className="g-4">
        <Col>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title>Manage Courses</Card.Title>
              <Card.Text>Create, edit, or delete courses.</Card.Text>
              <Link to="/coordinator/course">
                <Button variant="primary">Go to Courses</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title>Manage Students</Card.Title>
              <Card.Text>View and update student details.</Card.Text>
              <Link to="/coordinator/students">
                <Button variant="primary">Go to Students</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title>Manage Educators</Card.Title>
              <Card.Text>Register, edit, or remove educators.</Card.Text>
              <Link to="/coordinator/educators">
                <Button variant="primary">Go to Educators</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="text-center h-100">
            <Card.Body>
              <Card.Title>Dashboard Metrics</Card.Title>
              <Card.Text>View platform usage statistics.</Card.Text>
              <Link to="/coordinator/dashboard">
                <Button variant="primary">View Dashboard</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CoordinatorPage;
