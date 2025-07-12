// frontend/src/pages/EducatorDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Button } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import useRedirectIfInactive from '../hooks/useRedirectIfInactive'; // ✅ ADDED: Import the hook

const EducatorDashboard = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useRedirectIfInactive(); // ✅ ADDED: Use the hook to protect the page

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/dashboard/metrics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMetrics(data);
      } catch (error) {
        toast.error('Failed to load dashboard metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [token]);

  return (
    <Container fluid>
      <ToastContainer />
      <h3 className="mb-4">Educator Dashboard</h3>
      {loading ? (
        <Spinner animation="border" />
      ) : metrics ? (
        <>
          <Row>
            <Col md={4}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Courses Assigned</Card.Title>
                  <Card.Text className="h2">{metrics.coursesCount || 0}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Total Students</Card.Title>
                  <Card.Text className="h2">{metrics.enrollmentsCount || 0}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Pending Submissions</Card.Title>
                  <Card.Text className="h2">{metrics.submissionsCount || 0}</Card.Text>
                  <Button variant="primary" onClick={() => navigate('/educator/evaluation')}>
                    Evaluate Now
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <p>Could not load dashboard data.</p>
      )}
    </Container>
  );
};

export default EducatorDashboard;