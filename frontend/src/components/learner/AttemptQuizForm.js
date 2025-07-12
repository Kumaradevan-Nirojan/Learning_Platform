// AttemptQuizForm.js

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Spinner, Card, Form, Alert } from 'react-bootstrap';

const AttemptQuizForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await axios.get(`/api/v1/quizzes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuiz(data);
        setAnswers(Array(data.questions.length).fill(null));
        setTimeLeft(data.durationMinutes * 60);
        setLoading(false);
      } catch (err) {
        setError('Failed to load quiz or not authorized.');
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, token]);

  // Countdown Timer
  useEffect(() => {
    if (!timeLeft || submitted) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, submitted]);

  const handleChange = (qIndex, optIndex) => {
    const updated = [...answers];
    updated[qIndex] = optIndex;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    try {
      const { data } = await axios.post(
        `/api/v1/quizzes/${id}/submit`,
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    }
  };

  if (loading) return <Spinner animation="border" variant="primary" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="container mt-4">
      <h3>{quiz.title}</h3>
      <p>Time Left: {Math.floor(timeLeft / 60)}m {timeLeft % 60}s</p>
      {quiz.questions.map((q, idx) => (
        <Card key={idx} className="mb-3">
          <Card.Body>
            <Card.Title>
              {idx + 1}. {q.questionText}
            </Card.Title>
            {q.options.map((opt, optIdx) => (
              <Form.Check
                key={optIdx}
                type="radio"
                name={`question-${idx}`}
                label={opt}
                checked={answers[idx] === optIdx}
                onChange={() => handleChange(idx, optIdx)}
              />
            ))}
          </Card.Body>
        </Card>
      ))}

      {!submitted ? (
        <Button onClick={handleSubmit} variant="success">
          Submit Quiz
        </Button>
      ) : result ? (
        <Alert variant="info" className="mt-3">
          <strong>Score:</strong> {result.score} / {result.total}
        </Alert>
      ) : null}
    </div>
  );
};

export default AttemptQuizForm;
