import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Card, 
  Table, 
  Badge, 
  Button, 
  Form, 
  Row, 
  Col, 
  Modal, 
  Spinner,
  Alert
} from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import { FaEye, FaDownload, FaFilter, FaTimes } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
import 'react-toastify/dist/ReactToastify.css';

const CoordinatorQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [educators, setEducators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    course: '',
    educator: '',
    published: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [quizzes, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch quizzes
      const quizzesRes = await axios.get('/api/v1/quizzes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuizzes(quizzesRes.data || []);

      // Fetch quiz attempts
      try {
        const attemptsRes = await axios.get('/api/v1/quizzes/with-learners', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuizAttempts(attemptsRes.data || []);
      } catch (error) {
        console.log('Quiz attempts endpoint not available:', error.response?.status);
        setQuizAttempts([]);
      }

      // Fetch courses
      const coursesRes = await axios.get('/api/v1/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(coursesRes.data || []);

      // Fetch educators
      try {
        const educatorsRes = await axios.get('/api/v1/users/educators', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEducators(educatorsRes.data || []);
      } catch (error) {
        // Extract educators from quizzes if dedicated endpoint not available
        const uniqueEducators = quizzesRes.data?.reduce((acc, quiz) => {
          if (quiz.educator && !acc.find(e => e._id === quiz.educator._id)) {
            acc.push(quiz.educator);
          }
          return acc;
        }, []) || [];
        setEducators(uniqueEducators);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load quiz data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...quizzes];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(quiz => 
        quiz.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
        quiz.course?.title?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Course filter
    if (filters.course) {
      filtered = filtered.filter(quiz => quiz.course?._id === filters.course);
    }

    // Educator filter
    if (filters.educator) {
      filtered = filtered.filter(quiz => quiz.educator?._id === filters.educator);
    }

    // Published filter
    if (filters.published !== '') {
      const isPublished = filters.published === 'true';
      filtered = filtered.filter(quiz => quiz.published === isPublished);
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(quiz => 
        new Date(quiz.createdAt) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(quiz => 
        new Date(quiz.createdAt) <= new Date(filters.dateTo + 'T23:59:59')
      );
    }

    setFilteredQuizzes(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      course: '',
      educator: '',
      published: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
  };

  const viewQuizDetails = (quiz) => {
    setSelectedQuiz(quiz);
    setShowModal(true);
  };

  const getQuizAttempts = (quizId) => {
    const quizData = quizAttempts.find(q => q.quizId === quizId);
    return quizData ? quizData.attempts : [];
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Quiz Management Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Total Quizzes: ${filteredQuizzes.length}`, 20, 40);

    let yPosition = 60;
    filteredQuizzes.forEach((quiz, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      const attempts = getQuizAttempts(quiz._id);
      doc.text(`${index + 1}. ${quiz.title}`, 20, yPosition);
      doc.text(`Course: ${quiz.course?.title || 'N/A'}`, 25, yPosition + 8);
      doc.text(`Educator: ${quiz.educator?.firstName} ${quiz.educator?.lastName}`, 25, yPosition + 16);
      doc.text(`Published: ${quiz.published ? 'Yes' : 'No'}`, 25, yPosition + 24);
      doc.text(`Attempts: ${attempts.length}`, 25, yPosition + 32);
      
      yPosition += 50;
    });

    doc.save('quiz-management-report.pdf');
    toast.success('Report exported successfully!');
  };

  const getStatusBadge = (published) => {
    return published ? (
      <Badge bg="success">Published</Badge>
    ) : (
      <Badge bg="warning">Draft</Badge>
    );
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading quiz data...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <ToastContainer position="top-right" />
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Quiz Management</h2>
          <p className="text-muted mb-0">Manage quizzes across all courses and educators</p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-primary" 
            onClick={exportToPDF}
            className="d-flex align-items-center gap-2"
          >
            <FaDownload /> Export Report
          </Button>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 d-flex align-items-center gap-2">
            <FaFilter /> Filters
          </h5>
          <Button variant="outline-secondary" size="sm" onClick={clearFilters}>
            <FaTimes /> Clear Filters
          </Button>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search quiz or course..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Course</Form.Label>
                <Form.Select 
                  value={filters.course} 
                  onChange={(e) => handleFilterChange('course', e.target.value)}
                >
                  <option value="">All Courses</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Educator</Form.Label>
                <Form.Select 
                  value={filters.educator} 
                  onChange={(e) => handleFilterChange('educator', e.target.value)}
                >
                  <option value="">All Educators</option>
                  {educators.map(educator => (
                    <option key={educator._id} value={educator._id}>
                      {educator.firstName} {educator.lastName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select 
                  value={filters.published} 
                  onChange={(e) => handleFilterChange('published', e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="true">Published</option>
                  <option value="false">Draft</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={1.5}>
              <Form.Group className="mb-3">
                <Form.Label>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={1.5}>
              <Form.Group className="mb-3">
                <Form.Label>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              Showing {filteredQuizzes.length} of {quizzes.length} quizzes
            </small>
          </div>
        </Card.Body>
      </Card>

      {/* Results */}
      {filteredQuizzes.length === 0 ? (
        <Alert variant="info" className="text-center">
          <h5>No quizzes found</h5>
          <p>Try adjusting your filters or create a new quiz.</p>
        </Alert>
      ) : (
        <Card>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Quiz Title</th>
                  <th>Course</th>
                  <th>Educator</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Questions</th>
                  <th>Attempts</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuizzes.map((quiz) => {
                  const attempts = getQuizAttempts(quiz._id);
                  return (
                    <tr key={quiz._id}>
                      <td>
                        <strong>{quiz.title}</strong>
                      </td>
                      <td>{quiz.course?.title || 'N/A'}</td>
                      <td>
                        {quiz.educator ? 
                          `${quiz.educator.firstName} ${quiz.educator.lastName}` : 
                          'N/A'
                        }
                      </td>
                      <td>{getStatusBadge(quiz.published)}</td>
                      <td>{quiz.durationMinutes} min</td>
                      <td>{quiz.questions?.length || 0}</td>
                      <td>
                        <Badge bg="info">{attempts.length}</Badge>
                      </td>
                      <td>{new Date(quiz.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => viewQuizDetails(quiz)}
                            title="View Details"
                          >
                            <FaEye />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Quiz Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Quiz Details: {selectedQuiz?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedQuiz && (
            <div>
              <Row>
                <Col md={6}>
                  <h6>Basic Information</h6>
                  <p><strong>Course:</strong> {selectedQuiz.course?.title || 'N/A'}</p>
                  <p><strong>Educator:</strong> {selectedQuiz.educator ? 
                    `${selectedQuiz.educator.firstName} ${selectedQuiz.educator.lastName}` : 'N/A'}</p>
                  <p><strong>Duration:</strong> {selectedQuiz.durationMinutes} minutes</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedQuiz.published)}</p>
                  <p><strong>Questions:</strong> {selectedQuiz.questions?.length || 0}</p>
                </Col>
                <Col md={6}>
                  <h6>Quiz Attempts</h6>
                  {(() => {
                    const attempts = getQuizAttempts(selectedQuiz._id);
                    return attempts.length > 0 ? (
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {attempts.map((attempt, index) => (
                          <div key={index} className="border-bottom py-2">
                            <strong>{attempt.learnerName}</strong><br />
                            <small>Score: {attempt.score}/{attempt.total}</small>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted">No attempts yet</p>
                    );
                  })()}
                </Col>
              </Row>
              
              {selectedQuiz.questions && selectedQuiz.questions.length > 0 && (
                <div className="mt-4">
                  <h6>Questions Preview</h6>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {selectedQuiz.questions.map((question, index) => (
                      <Card key={index} className="mb-2">
                        <Card.Body className="py-2">
                          <strong>Q{index + 1}:</strong> {question.questionText}
                          <ul className="mt-1 mb-0">
                            {question.options?.map((option, optIndex) => (
                              <li key={optIndex}>
                                {option} {optIndex === question.correctAnswerIndex && 
                                  <Badge bg="success" className="ms-1">Correct</Badge>}
                              </li>
                            ))}
                          </ul>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CoordinatorQuizzes; 