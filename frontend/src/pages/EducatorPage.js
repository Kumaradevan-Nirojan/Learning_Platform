// frontend/src/pages/EducatorPage.js
import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

/**
 * Landing page for educators, providing quick access to common tasks.
 */
const EducatorPage = () => {
  return (
    <Container className="my-5">
      <h3 className="mb-4 text-center">Educator Panel</h3>
      <Row xs={1} md={2} lg={3} className="g-4">
        <Col>
          <Card className="h-100 text-center">
            <Card.Body>
              <Card.Title>Study Plan</Card.Title>
              <Card.Text>Design detailed study plans for your courses.</Card.Text>
              <Link to="/educator/my-studyplans">
                <Button variant="primary">New Study Plan</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="h-100 text-center">
            <Card.Body>
              <Card.Title>Create Quiz</Card.Title>
              <Card.Text>Build quizzes and assessments.</Card.Text>
              <Link to="/quizzes/create">
                <Button variant="primary">New Quiz</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="h-100 text-center">
            <Card.Body>
              <Card.Title>Create Assignment</Card.Title>
              <Card.Text>Assign tasks and assignments to learners.</Card.Text>
              <Link to="/assignments/create">
                <Button variant="primary">New Assignment</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="h-100 text-center">
            <Card.Body>
              <Card.Title>View My Courses</Card.Title>
              <Card.Text>Manage your course offerings.</Card.Text>
              <Link to="/courses">
                <Button variant="primary">My Courses</Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EducatorPage;
