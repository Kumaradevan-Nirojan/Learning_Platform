// frontend/src/pages/PlanPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Card, ListGroup, Spinner, Button } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PlanPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch study plan by ID
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/v1/studyplans/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPlan(data);
      } catch (err) {
        toast.error('Failed to load study plan');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id, token]);

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" /> Loading plan...
      </Container>
    );
  }

  if (!plan) {
    return (
      <Container className="text-center my-5">
        <p className="text-muted">Study plan not found.</p>
        <Button variant="primary" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <ToastContainer position="top-center" />
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>{plan.title}</Card.Title>
          {plan.description && <Card.Text>{plan.description}</Card.Text>}
        </Card.Body>
      </Card>

      <h5>Schedule</h5>
      {plan.schedule && plan.schedule.length > 0 ? (
        <ListGroup>
          {plan.schedule.map((item, idx) => (
            <ListGroup.Item key={idx}>
              <strong>{new Date(item.date).toLocaleDateString()}:</strong> {item.topic}
              {item.notesUrl && (
                <div>
                  <a href={item.notesUrl} target="_blank" rel="noopener noreferrer">
                    View Notes
                  </a>
                </div>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <p className="text-muted">No schedule entries.</p>
      )}
    </Container>
  );
};

export default PlanPage;
