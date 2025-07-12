// frontend/src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If learner, redirect to learner dashboard page
    if (role === 'learner') {
      navigate('/learner');
      return;
    }
    // Else fetch coordinator/educator metrics
    const fetchMetrics = async () => {
      try {
        const { data } = await axios.get(
          'http://localhost:5000/api/v1/dashboard/metrics',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMetrics(data);
      } catch (err) {
        toast.error('Failed to load dashboard metrics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [role, token, navigate]);

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" /> Loading dashboard...
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <ToastContainer position="top-center" />
      <h4 className="mb-4 text-center">
        {role === 'coordinator' ? 'Coordinator Dashboard' : 'Educator Dashboard'}
      </h4>
      <Row xs={1} md={3} className="g-4">
        <Col>
          <Card className="text-center p-3">
            <Card.Title>Courses</Card.Title>
            <Card.Text>{metrics.coursesCount}</Card.Text>
          </Card>
        </Col>
        <Col>
          <Card className="text-center p-3">
            <Card.Title>Assignments</Card.Title>
            <Card.Text>{metrics.assignmentsCount}</Card.Text>
          </Card>
        </Col>
        <Col>
          <Card className="text-center p-3">
            <Card.Title>Educators</Card.Title>
            <Card.Text>{metrics.educatorsCount}</Card.Text>
          </Card>
        </Col>
        {role === 'coordinator' && (
          <>
            <Col>
              <Card className="text-center p-3">
                <Card.Title>Learners</Card.Title>
                <Card.Text>{metrics.learnersCount}</Card.Text>
              </Card>
            </Col>
            <Col>
              <Card className="text-center p-3">
                <Card.Title>Enrollments</Card.Title>
                <Card.Text>{metrics.enrollmentsCount}</Card.Text>
              </Card>
            </Col>
            <Col>
              <Card className="text-center p-3">
                <Card.Title>Submissions</Card.Title>
                <Card.Text>{metrics.submissionsCount}</Card.Text>
              </Card>
            </Col>
          </>
        )}
        {role === 'educator' && (
          <Col>
            <Card className="text-center p-3">
              <Card.Title>Submissions</Card.Title>
              <Card.Text>{metrics.submissionsCount}</Card.Text>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default Dashboard;
