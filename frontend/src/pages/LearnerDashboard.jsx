// frontend/src/pages/LearnerDashboard.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  ListGroup,
  Spinner,
  Button,
  ProgressBar,
} from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../components/ErrorBoundary';
import 'react-toastify/dist/ReactToastify.css';

const LearnerDashboard = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [myCourses, setMyCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [allQuizzesCount, setAllQuizzesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------- Fetch everything ----------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = axios.create({ 
          baseURL: 'http://localhost:5000/api/v1',
          headers: { Authorization: `Bearer ${token}` },
        });

        const [coursesRes, subsRes, attemptsRes, quizzesRes] = await Promise.all([
          api.get('/enrollments'),
          api.get('/submissions'),
          api.get('/quizAttempts/my/all'),
          api.get('/quizzes'),
        ]);

        // Validate and set data with fallbacks
        setMyCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
        setAssignments(Array.isArray(subsRes.data) ? subsRes.data : []);
        setQuizAttempts(Array.isArray(attemptsRes.data) ? attemptsRes.data : []);
        setAllQuizzesCount(Array.isArray(quizzesRes.data) ? quizzesRes.data.length : 0);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        const errorMessage = err.response?.data?.message || 'Failed to load dashboard data';
        setError(errorMessage);
        toast.error(errorMessage);
        
        // Set empty arrays as fallbacks
        setMyCourses([]);
        setAssignments([]);
        setQuizAttempts([]);
        setAllQuizzesCount(0);
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchData();
    } else {
      setLoading(false);
      toast.error('Please log in to view dashboard');
      navigate('/login');
    }
  }, [token, navigate]);

  // ---------- Derived numbers ----------
  const quizzesAttempted = Array.isArray(quizAttempts) ? quizAttempts.length : 0;
  const quizProgress = allQuizzesCount > 0
    ? Math.round((quizzesAttempted / allQuizzesCount) * 100)
    : 0;

  // ---------- Loading ----------
  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" /> Loading dashboard...
      </Container>
    );
  }

  // ---------- No token check ----------
  if (!token) {
    return (
      <Container className="text-center my-5">
        <div className="alert alert-warning">
          Please log in to view your dashboard.
        </div>
      </Container>
    );
  }

  // ---------- Error state ----------
  if (error && !loading) {
    return (
      <Container className="text-center my-5">
        <div className="alert alert-danger">
          <h5>Unable to load dashboard</h5>
          <p>{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <ErrorBoundary>
      <Container className="my-4">
        <ToastContainer position="top-center" />
        <h4 className="mb-4 text-center">Learner Dashboard</h4>

        {/* ---- 1. KPI Row ---- */}
        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card bg="primary" text="white" className="text-center">
              <Card.Body>
                <Card.Title>{myCourses.length}</Card.Title>
                <Card.Text>Total Courses</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card bg="info" text="white" className="text-center">
              <Card.Body>
                <Card.Title>{assignments.length}</Card.Title>
                <Card.Text>Total Assignments</Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card bg="success" text="white" className="text-center">
              <Card.Body>
                <Card.Title>
                  {quizzesAttempted}/{allQuizzesCount}
                </Card.Title>
                <Card.Text>Quizzes Attempted</Card.Text>
                <ProgressBar
                  now={quizProgress}
                  label={`${quizProgress}%`}
                  variant="light"
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* ---- 2. Detailed Panels ---- */}
        <Row className="g-4">
          {/* Courses */}
          <Col xs={12} md={6}>
            <Card>
              <Card.Header>My Courses</Card.Header>
              <ListGroup variant="flush">
                {myCourses.length ? (
                  myCourses
                    .filter(en => en && en._id) // Filter out invalid entries
                    .map((en) => (
                      <ListGroup.Item key={en._id}>
                        <strong>{en.course?.title || 'Unknown Course'}</strong> — Status: {en.status || 'Unknown'}
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => navigate(`/courses/${en.course?._id}`)}
                          disabled={!en.course?._id}
                        >
                          View
                        </Button>
                      </ListGroup.Item>
                    ))
                ) : (
                  <ListGroup.Item>No course enrollments found.</ListGroup.Item>
                )}
              </ListGroup>
            </Card>
          </Col>

          {/* Submissions */}
          <Col xs={12} md={6}>
            <Card>
              <Card.Header>My Submissions</Card.Header>
              <ListGroup variant="flush">
                {assignments.length ? (
                  assignments
                    .filter(sub => sub && sub._id) // Filter out invalid entries
                    .map((sub) => (
                      <ListGroup.Item key={sub._id}>
                        <strong>{sub.assignment?.name || 'Unknown Assignment'}</strong> — Status:{' '}
                        {sub.status || 'Unknown'}
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => navigate(`/submissions/${sub._id}`)}
                        >
                          Details
                        </Button>
                      </ListGroup.Item>
                    ))
                ) : (
                  <ListGroup.Item>No submissions found.</ListGroup.Item>
                )}
              </ListGroup>
            </Card>
          </Col>
        </Row>

        {/* ---- 3. Quiz Performance ---- */}
        <Row className="g-4 mt-4">
          <Col xs={12}>
            <Card>
              <Card.Header>Quiz Performance</Card.Header>
              <ListGroup variant="flush">
                {quizAttempts.length ? (
                  quizAttempts
                    .filter(att => att && att._id) // Filter out invalid entries
                    .map((att) => (
                      <ListGroup.Item key={att._id}>
                        <Row className="align-items-center">
                          <Col md={4}>
                            <strong>{att.quiz?.title || 'Unknown Quiz'}</strong>
                          </Col>
                          <Col md={4}>
                            Score:{' '}
                            <strong>
                              {att.score || 0}/{att.totalQuestions || 0}
                            </strong>
                          </Col>
                          <Col md={4}>
                            <ProgressBar
                              now={att.totalQuestions ? (att.score / att.totalQuestions) * 100 : 0}
                              variant="success"
                              label={`${att.totalQuestions ? Math.round(
                                (att.score / att.totalQuestions) * 100
                              ) : 0}%`}
                            />
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))
                ) : (
                  <ListGroup.Item>
                    You haven't attempted any quizzes yet.
                  </ListGroup.Item>
                )}
              </ListGroup>
            </Card>
          </Col>
        </Row>
      </Container>
    </ErrorBoundary>
  );
};

export default LearnerDashboard;
