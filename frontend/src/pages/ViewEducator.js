// frontend/src/pages/ViewEducator.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Spinner, Button, Row, Col } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ViewEducator = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [educator, setEducator] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEducator = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/v1/educators/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEducator(data);
      } catch (err) {
        toast.error('Failed to load educator details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEducator();
  }, [id, token]);

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" /> Loading educator...
      </Container>
    );
  }

  if (!educator) {
    return (
      <Container className="text-center my-5">
        <p className="text-muted">Educator not found.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <ToastContainer position="top-center" />
      <Card className="mx-auto" style={{ maxWidth: '600px' }}>
        <Card.Header className="text-center">
          <h4>{educator.user.firstName} {educator.user.lastName}</h4>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col xs={4} className="text-center">
              <img
                src={educator.avatarUrl ? `/uploads/avatars/${educator.avatarUrl}` : '/uploads/avatars/default-avatar.png'}
                alt="Avatar"
                className="rounded-circle"
                width={100}
                height={100}
              />
            </Col>
            <Col xs={8}>
              <p><strong>Email:</strong> {educator.user.email}</p>
              <p><strong>Phone:</strong> {educator.phone || 'N/A'}</p>
              <p><strong>Country:</strong> {educator.country || 'N/A'}</p>
            </Col>
          </Row>
          {educator.qualifications && (
            <div className="mb-3">
              <h6>Qualifications</h6>
              <p>{educator.qualifications}</p>
            </div>
          )}
          <div className="mb-3">
            <h6>Experience</h6>
            <p>{educator.experienceYears} {educator.experienceYears === 1 ? 'year' : 'years'}</p>
          </div>
          {educator.bio && (
            <div className="mb-3">
              <h6>About</h6>
              <p>{educator.bio}</p>
            </div>
          )}
          <Button variant="primary" onClick={() => navigate(-1)}>Back</Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ViewEducator;
