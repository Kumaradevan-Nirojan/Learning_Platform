import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { FaUserGraduate, FaChalkboardTeacher, FaBook, FaTasks, FaFileAlt, FaUserPlus } from 'react-icons/fa';

const DashboardMetrics = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/dashboard/metrics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMetrics(data);
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [token]);

  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" />
        <p>Loading metrics...</p>
      </div>
    );
  }

  if (!metrics) return <p className="text-danger">Unable to load dashboard metrics</p>;

  return (
    <Row xs={1} md={2} lg={3} className="g-4">
      <Col>
        <Card className="shadow-sm text-center">
          <Card.Body>
            <FaBook size={40} className="mb-2 text-primary" />
            <Card.Title>Courses</Card.Title>
            <Card.Text>{metrics.coursesCount}</Card.Text>
          </Card.Body>
        </Card>
      </Col>

      <Col>
        <Card className="shadow-sm text-center">
          <Card.Body>
            <FaTasks size={40} className="mb-2 text-warning" />
            <Card.Title>Assignments</Card.Title>
            <Card.Text>{metrics.assignmentsCount}</Card.Text>
          </Card.Body>
        </Card>
      </Col>

      <Col>
        <Card className="shadow-sm text-center">
          <Card.Body>
            <FaUserGraduate size={40} className="mb-2 text-success" />
            <Card.Title>Learners</Card.Title>
            <Card.Text>{metrics.learnersCount}</Card.Text>
          </Card.Body>
        </Card>
      </Col>

      <Col>
        <Card className="shadow-sm text-center">
          <Card.Body>
            <FaChalkboardTeacher size={40} className="mb-2 text-info" />
            <Card.Title>Educators</Card.Title>
            <Card.Text>{metrics.educatorsCount}</Card.Text>
          </Card.Body>
        </Card>
      </Col>

      <Col>
        <Card className="shadow-sm text-center">
          <Card.Body>
            <FaUserPlus size={40} className="mb-2 text-secondary" />
            <Card.Title>Enrollments</Card.Title>
            <Card.Text>{metrics.enrollmentsCount}</Card.Text>
          </Card.Body>
        </Card>
      </Col>

      <Col>
        <Card className="shadow-sm text-center">
          <Card.Body>
            <FaFileAlt size={40} className="mb-2 text-danger" />
            <Card.Title>Submissions</Card.Title>
            <Card.Text>{metrics.submissionsCount}</Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default DashboardMetrics;
