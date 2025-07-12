// ✅ MyQuizzes.js (Educator dashboard page)
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Button, Spinner, Container, Row, Col } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMyQuizzes = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/quizzes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizzes(data);
      } catch (err) {
        toast.error('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };
    fetchMyQuizzes();
  }, [token]);

  const handlePublish = async (quizId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/v1/quizzes/publish/${quizId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Quiz published successfully');
      setQuizzes((prev) =>
        prev.map((q) => (q._id === quizId ? { ...q, published: true } : q))
      );
    } catch (err) {
      toast.error('Failed to publish quiz');
    }
  };

  return (
    <Container className="my-4">
      <ToastContainer />
      <h3>📘 My Quizzes</h3>
      {loading ? (
        <Spinner animation="border" />
      ) : quizzes.length === 0 ? (
        <p>No quizzes created yet.</p>
      ) : (
        <Row>
          {quizzes.map((quiz) => (
            <Col md={6} lg={4} key={quiz._id} className="mb-3">
              <Card>
                <Card.Body>
                  <Card.Title>{quiz.title}</Card.Title>
                  <Card.Text>
                    <strong>Course:</strong> {quiz.course?.title || 'N/A'} <br />
                    <strong>Duration:</strong> {quiz.durationMinutes} mins <br />
                    <strong>Published:</strong>{' '}
                    {quiz.published ? '✅ Yes' : '❌ No'}
                  </Card.Text>
                  {!quiz.published && (
                    <Button
                      variant="success"
                      onClick={() => handlePublish(quiz._id)}
                    >
                      Publish
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MyQuizzes;
