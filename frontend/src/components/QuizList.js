// frontend/src/components/QuizList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ListGroup, Spinner, Button } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const QuizList = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/quizzes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizzes(data);
      } catch (err) {
        toast.error('❌ Failed to load quizzes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchAttempts = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/quizAttempts/my/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const attemptedIds = data.map((attempt) => attempt.quiz);
        setAttemptedQuizzes(attemptedIds);
      } catch (err) {
        console.error('❌ Failed to fetch quiz attempts', err);
      }
    };

    fetchQuizzes();
    if (user?.role === 'learner') {
      fetchAttempts();
    }
  }, [token, user?.role]);

  const handlePublish = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/v1/quizzes/publish/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('✅ Quiz published');
      setQuizzes((prev) =>
        prev.map((q) => (q._id === id ? { ...q, published: true } : q))
      );
    } catch (err) {
      toast.error('❌ Failed to publish quiz');
    }
  };

  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" /> Loading quizzes...
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-center" />
      <h5 className="mb-3">Available Quizzes</h5>
      <ListGroup>
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => {
            const isAttempted = attemptedQuizzes.includes(quiz._id);
            return (
              <ListGroup.Item key={quiz._id} className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{quiz.title}</strong><br />
                  Course: {quiz.course?.title || 'N/A'}<br />
                  Duration: {quiz.durationMinutes} minutes
                  <span className={`badge ms-2 ${quiz.published ? 'bg-success' : 'bg-warning text-dark'}`}>
                    {quiz.published ? 'Published' : 'Unpublished'}
                  </span>
                </div>
                <div className="d-flex gap-2">
                  {user?.role === 'learner' && quiz.published && (
                    isAttempted ? (
                      <Button variant="outline-secondary" size="sm" disabled>
                        Attempted
                      </Button>
                    ) : (
                      <Link to={`/quizzes/attempt/${quiz._id}`}>
                        <Button variant="outline-primary" size="sm">Attempt Quiz</Button>
                      </Link>
                    )
                  )}

                  {user?.role === 'educator' && (
                    <>
                      <Link to={`/quizzes/attempt/${quiz._id}`}>
                        <Button variant="outline-info" size="sm">Trail</Button>
                      </Link>
                      {!quiz.published && (
                        <Button size="sm" variant="success" onClick={() => handlePublish(quiz._id)}>
                          Publish
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </ListGroup.Item>
            );
          })
        ) : (
          <ListGroup.Item>No quizzes found.</ListGroup.Item>
        )}
      </ListGroup>
    </>
  );
};

export default QuizList;
