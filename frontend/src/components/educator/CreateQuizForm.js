import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  Modal,
  Row,
  Col,
  Container,
  Spinner,
} from 'react-bootstrap';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CreateQuizForm = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [course, setCourse] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  const token = localStorage.getItem('token');
  const isEdit = Boolean(quizId);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/v1/courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(res.data);
      } catch (error) {
        toast.error('Failed to load courses');
      }
    };
    fetchCourses();
  }, [token]);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!isEdit) return;
      try {
        const res = await axios.get(`${API_BASE}/api/v1/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const quiz = res.data;
        setTitle(quiz.title);
        setCourse(quiz.course?._id || quiz.course);
        setDurationMinutes(quiz.durationMinutes);
        setScheduledDateTime(quiz.scheduledDateTime?.slice(0, 16));
        setQuestions(quiz.questions || []);
        setPublished(quiz.published || false);
      } catch (err) {
        toast.error('Failed to load quiz');
      }
    };
    fetchQuiz();
  }, [isEdit, quizId, token]);

  const handleOptionChange = (value, index) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const addQuestion = () => {
    if (!questionText || options.some(opt => !opt)) {
      toast.error('Please fill all question and options');
      return;
    }
    const newQuestion = {
      questionText,
      options,
      correctAnswerIndex,
    };
    setQuestions(prev => [...prev, newQuestion]);
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswerIndex(0);
    setShowQuestionModal(false);
  };

  const deleteQuestion = (indexToRemove) => {
    const updated = questions.filter((_, i) => i !== indexToRemove);
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !course || !scheduledDateTime || questions.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    const payload = {
      title,
      course,
      durationMinutes,
      scheduledDateTime,
      questions,
      published,
    };

    try {
      setLoading(true);
      if (isEdit) {
        await axios.patch(`${API_BASE}/api/v1/quizzes/${quizId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Quiz updated successfully');
      } else {
        await axios.post(`${API_BASE}/api/v1/quizzes`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Quiz created successfully');
        setTitle('');
        setCourse('');
        setDurationMinutes(30);
        setScheduledDateTime('');
        setQuestions([]);
        setPublished(false);
      }
      navigate('/educator/my-quizzes');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit quiz');
    } finally {
      setLoading(false);
    }
  };

  const selectedCourse = courses.find(c => c._id === course);

  return (
    <Container className="mt-3">
      <ToastContainer />
      <h4 className="mb-4 text-center">
        {isEdit ? 'Edit Quiz' : 'Create New Quiz'}
      </h4>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Quiz Title</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Assign to Course</Form.Label>
          <Form.Select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
          >
            <option value="">Select a course</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Duration (minutes)</Form.Label>
          <Form.Control
            type="number"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Scheduled Date & Time</Form.Label>
          <Form.Control
            type="datetime-local"
            value={scheduledDateTime}
            onChange={(e) => setScheduledDateTime(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="Publish this quiz"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Questions</Form.Label>
          <Button variant="secondary" onClick={() => setShowQuestionModal(true)} className="ms-2">
            ➕ Add Question
          </Button>
          <ul className="mt-3">
            {questions.map((q, idx) => (
              <li key={idx} className="d-flex justify-content-between align-items-center">
                {q.questionText}
                <Button variant="danger" size="sm" onClick={() => deleteQuestion(idx)}>
                  ❌ Remove
                </Button>
              </li>
            ))}
          </ul>
        </Form.Group>

        <div className="d-flex justify-content-between">
          <Button variant="info" type="button" onClick={() => setPreviewVisible(true)}>
            🔍 Preview Quiz
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <Spinner animation="border" size="sm" />
            ) : isEdit ? (
              'Update Quiz'
            ) : (
              'Create Quiz'
            )}
          </Button>
        </div>
      </Form>

      {/* Add Question Modal */}
      <Modal show={showQuestionModal} onHide={() => setShowQuestionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Question</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Question Text</Form.Label>
            <Form.Control
              type="text"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </Form.Group>

          <Row className="mt-3">
            {options.map((opt, index) => (
              <Col xs={6} key={index} className="mb-2">
                <Form.Label>Option {index + 1}</Form.Label>
                <Form.Control
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(e.target.value, index)}
                />
              </Col>
            ))}
          </Row>

          <Form.Group className="mt-3">
            <Form.Label>Correct Answer</Form.Label>
            <Form.Select
              value={correctAnswerIndex}
              onChange={(e) => setCorrectAnswerIndex(parseInt(e.target.value))}
            >
              {options.map((_, index) => (
                <option key={index} value={index}>
                  Option {index + 1}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowQuestionModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={addQuestion}>
            Add Question
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Preview Quiz Modal */}
      <Modal show={previewVisible} onHide={() => setPreviewVisible(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>📋 Preview Quiz</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Title: {title}</h5>
          <p><strong>Course:</strong> {selectedCourse?.title}</p>
          <p><strong>Duration:</strong> {durationMinutes} minutes</p>
          <p><strong>Scheduled Time:</strong> {scheduledDateTime}</p>
          <hr />
          <h6>Questions:</h6>
          {questions.map((q, idx) => (
            <div key={idx} className="mb-3">
              <strong>Q{idx + 1}:</strong> {q.questionText}
              <ul>
                {q.options.map((opt, i) => (
                  <li key={i}>
                    {opt} {q.correctAnswerIndex === i && <strong>(Correct)</strong>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CreateQuizForm;
