// frontend/src/pages/QuizPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Card, Spinner, ListGroup, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const QuizPage = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Redirect if educator is inactive
  useEffect(() => {
    const isActive = localStorage.getItem('isActive');
    if (isActive === 'false') {
      navigate('/inactive');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const endpoint =
          user?.role === 'educator'
            ? 'http://localhost:5000/api/v1/quizzes/educator'
            : 'http://localhost:5000/api/v1/quizzes';

        const { data } = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizzes(data);
      } catch (err) {
        toast.error('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [token, user]);

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" /> Loading quizzes...
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <ToastContainer position="top-center" />
      <h4>Quiz List</h4>
      {quizzes.length > 0 ? (
        <ListGroup>
          {quizzes.map((quiz) => (
            <ListGroup.Item key={quiz._id}>
              <strong>{quiz.title}</strong> – {quiz.course?.title || 'No course'}
              <Button
                size="sm"
                className="float-end"
                variant="primary"
                onClick={() => navigate(`/quiz/edit/${quiz._id}`)}
              >
                Edit
              </Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <p>No quizzes found.</p>
      )}
    </Container>
  );
};

export default QuizPage;
