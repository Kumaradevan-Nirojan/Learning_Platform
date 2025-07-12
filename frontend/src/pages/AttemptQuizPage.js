// frontend/src/pages/AttemptQuizPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Card, Button, Spinner, Alert, Form,
} from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AttemptQuizPage = () => {
  const { id } = useParams(); // quiz ID
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/v1/quizzes/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!data.published) {
          setError('⛔ This quiz is not published.');
        } else {
          setQuiz(data);
        }
      } catch (err) {
        const msg = err?.response?.data?.message || 'Unable to load quiz.';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, token]);

  const handleOptionChange = (questionIndex, selectedOptionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: selectedOptionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;

    // Convert answers to array of indices that backend expects
    const answerArray = quiz.questions.map((q, i) => answers[i] !== undefined ? answers[i] : -1);

    const payload = {
      quizId: quiz._id,  // Backend expects 'quizId', not 'quiz'
      answers: answerArray, // Backend expects array of indices
    };

    try {
      setSubmitting(true);
      const response = await axios.post('http://localhost:5000/api/v1/quizAttempts', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Backend returns the score in response
      const { score, totalQuestions } = response.data;
      toast.success(`✅ Quiz submitted! Your score: ${score}/${totalQuestions}`);
      setTimeout(() => navigate('/learner/quiz-history'), 2000);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" /> <div>Loading quiz...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">❌ {error}</Alert>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          🔙 Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <ToastContainer />
      <h4>{quiz.title}</h4>
      <p>
        <strong>Course:</strong> {quiz.course?.title} <br />
        <strong>Duration:</strong> {quiz.durationMinutes} minutes
      </p>

      {quiz.questions.map((q, index) => (
        <Card key={index} className="mb-3">
          <Card.Body>
            <Card.Title>
              Q{index + 1}: {q.questionText}
            </Card.Title>
            <Form>
              {q.options.map((option, i) => (
                <Form.Check
                  key={i}
                  type="radio"
                  label={option}
                  name={`question-${index}`}
                  id={`q${index}-opt${i}`}
                  value={i}
                  checked={answers[index] === i}
                  onChange={() => handleOptionChange(index, i)}
                />
              ))}
            </Form>
          </Card.Body>
        </Card>
      ))}

      <Button
        variant="success"
        onClick={handleSubmit}
        disabled={submitting || Object.keys(answers).length !== quiz.questions.length}
      >
        {submitting ? 'Submitting...' : '✅ Submit Quiz'}
      </Button>
    </Container>
  );
};

export default AttemptQuizPage;
