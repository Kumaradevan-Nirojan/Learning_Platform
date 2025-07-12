import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  Button,
  Spinner,
  Form,
  Row,
  Col,
  Modal,
} from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const LearnerQuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMsg, setModalMsg] = useState('');

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  useEffect(() => {
    const isActive = localStorage.getItem('isActive');
    if (isActive === 'false') {
      window.location.href = '/inactive';
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [quizRes, enrollRes, attemptsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/v1/quizzes/available', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/v1/enrollments', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/v1/quizAttempts/my/all', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const today = new Date();
        const enrolled = enrollRes.data || [];

        const eligibleEnrollments = enrolled.filter((e) => {
          const enrolledDate = new Date(e.createdAt);
          const daysSinceEnroll = (today - enrolledDate) / (1000 * 60 * 60 * 24);
          return (e.paymentStatus === 'success' && (e.status === 'active' || e.status === 'completed')) || daysSinceEnroll <= 7;
        });

        const eligibleCourseIds = eligibleEnrollments
          .map((e) => e.course?._id)
          .filter(Boolean);

        const availableQuizzes = (quizRes.data || []).filter((quiz) => {
          const scheduledDate = quiz.scheduledDateTime ? new Date(quiz.scheduledDateTime) : null;
          // If no scheduled date, make it available immediately
          const timeCheck = !scheduledDate || new Date() >= scheduledDate;
          const courseCheck = eligibleCourseIds.includes(quiz.course?._id);
          return (
            quiz.published &&
            courseCheck &&
            timeCheck
          );
        });

        const attemptedQuizIds = (attemptsRes.data || [])
          .map((attempt) =>
            typeof attempt.quiz === 'object' ? attempt.quiz._id : attempt.quiz
          )
          .filter(Boolean);

        const quizzesWithAttemptFlag = availableQuizzes.map((q) => ({
          ...q,
          attempted: attemptedQuizIds.includes(q._id),
        }));

        setEnrollments(eligibleEnrollments);
        setQuizzes(quizzesWithAttemptFlag);
      } catch (err) {
        console.error('❌ Error loading quiz data:', err?.response?.data || err);
        toast.error('❌ Failed to load quizzes or enrollments.');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const filteredQuizzes = selectedCourse
    ? quizzes.filter((q) => q.course?._id === selectedCourse)
    : quizzes;

  const handleStartQuiz = (quiz) => {
    const now = new Date();
    const scheduled = new Date(quiz.scheduledDateTime);
    if (now < scheduled) {
      setModalMsg(`⏳ This quiz will be available on ${scheduled.toLocaleString()}.`);
      setShowModal(true);
    } else {
      navigate(`/learner/quiz/attempt/${quiz._id}`);
    }
  };

  return (
    <div className="p-3">
      <ToastContainer />
      <h5 className="mb-3">❓ Available Quizzes</h5>



      <Form.Group className="mb-3">
        <Form.Label>📘 Filter by Course</Form.Label>
        <Form.Select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">-- All Courses --</option>
          {[...new Map(quizzes.map((q) => [q.course?._id, q.course])).values()]
            .filter((c) => c)
            .map((course) => (
              <option key={course._id} value={course._id}>
                {course.title}
              </option>
            ))}
        </Form.Select>
      </Form.Group>

      {loading ? (
        <Spinner animation="border" />
      ) : filteredQuizzes.length === 0 ? (
        <p className="text-muted">🛑 No quizzes available for your courses.</p>
      ) : (
        <Row>
          {filteredQuizzes.map((quiz) => (
            <Col md={6} lg={4} key={quiz._id} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{quiz.title}</Card.Title>
                  <Card.Text>
                    <strong>📘 Course:</strong> {quiz.course?.title || 'N/A'} <br />
                    <strong>⏱ Duration:</strong> {quiz.durationMinutes} mins <br />
                    <strong>📅 Scheduled:</strong>{' '}
                    {quiz.scheduledDateTime
                      ? new Date(quiz.scheduledDateTime).toLocaleString()
                      : 'N/A'}
                  </Card.Text>

                  {user?.role === 'learner' && !quiz.attempted && (
                    <Button variant="primary" onClick={() => handleStartQuiz(quiz)}>
                      ▶️ Start Quiz
                    </Button>
                  )}

                  {user?.role === 'learner' && quiz.attempted && (
                    <p className="text-success">✅ You have already attempted this quiz.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>⏳ Quiz Not Yet Available</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalMsg}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LearnerQuizList;
