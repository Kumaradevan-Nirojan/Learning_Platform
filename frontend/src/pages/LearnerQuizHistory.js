import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Spinner, Container, Alert } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const LearnerQuizHistory = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAttempts = async () => {
      if (!token) {
        toast.error('Please login again');
        navigate('/login');
        return;
      }

      try {
        const { data } = await axios.get(
          'http://localhost:5000/api/v1/quizAttempts/my/all',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAttempts(data);
      } catch (err) {
        console.error('Quiz history fetch error:', err);
        toast.error('❌ Failed to load results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [token, navigate]);

  return (
    <Container className="my-4">
      <ToastContainer position="top-center" />
      <h4 className="mb-3">📜 Quiz Result History</h4>

      {loading ? (
        <Spinner animation="border" variant="primary" />
      ) : attempts.length === 0 ? (
        <Alert variant="info">You haven't attempted any quizzes yet.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Quiz Title</th>
              <th>Course</th>
              <th>Score</th>
              <th>Total Questions</th>
              <th>Attempted On</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((attempt, index) => (
              <tr key={attempt._id}>
                <td>{index + 1}</td>
                <td>{attempt.quiz?.title || 'N/A'}</td>
                <td>{attempt.quiz?.course?.title || 'N/A'}</td>
                <td>{attempt.score}</td>
                <td>{attempt.totalQuestions}</td>
                <td>
                  {attempt.attemptedAt
                    ? new Date(attempt.attemptedAt).toLocaleString()
                    : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default LearnerQuizHistory;
