import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { FaCheckCircle } from 'react-icons/fa';

const ResultHistory = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const { data } = await axios.get('/api/v1/attempts/mine');
        setAttempts(data);
      } catch (err) {
        setError('Failed to load results. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  return (
    <Container className="mt-4">
      <h3 className="mb-4 text-center">📜 Quiz Result History</h3>
      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : attempts.length === 0 ? (
        <Alert variant="info">You haven't attempted any quizzes yet.</Alert>
      ) : (
        <Row xs={1} md={2} lg={3}>
          {attempts.map((attempt, index) => (
            <Col key={index} className="mb-4">
              <Card border="success">
                <Card.Body>
                  <Card.Title>{attempt.quiz.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    Score: {attempt.score} / {attempt.quiz.questions.length}
                  </Card.Subtitle>
                  <Card.Text>
                    Attempted on: {new Date(attempt.attemptedAt).toLocaleString()}
                  </Card.Text>
                  <FaCheckCircle className="text-success me-2" />
                  Completed
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default ResultHistory;
