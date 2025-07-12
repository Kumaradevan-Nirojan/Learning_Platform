// frontend/src/components/QuizForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Form, Button, Spinner, Modal, Row, Col } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const QuizForm = ({ existingData = {}, onSuccess }) => {
  const token = localStorage.getItem('token');
  const isEdit = Boolean(existingData._id);

  const [formData, setFormData] = useState({
    title: existingData.title || '',
    questions: existingData.questions || [],
    course: existingData.course || '',
    durationMinutes: existingData.durationMinutes || 30,
  });
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
  });

  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/courses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(data.courses || data);
      } catch (err) {
        toast.error('Failed to load courses');
        console.error(err);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.course || formData.questions.length === 0) {
      toast.warn('Fill all required fields and add at least one question.');
      return;
    }

    setSubmitting(true);
    try {
      const url = isEdit
        ? `http://localhost:5000/api/v1/quizzes/${existingData._id}`
        : 'http://localhost:5000/api/v1/quizzes';
      const method = isEdit ? 'patch' : 'post';

      await axios[method](url, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(isEdit ? 'Quiz updated!' : 'Quiz created!');
      onSuccess && onSuccess();
      if (!isEdit) {
        setFormData({ title: '', questions: [], course: '', durationMinutes: 30 });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...newQuestion.options];
    newOptions[index] = value;
    setNewQuestion((q) => ({ ...q, options: newOptions }));
  };

  const addQuestion = () => {
    const { questionText, options, correctAnswerIndex } = newQuestion;
    if (!questionText || options.some((opt) => !opt)) {
      toast.warn('Fill question text and all options.');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, { ...newQuestion }],
    }));

    setNewQuestion({ questionText: '', options: ['', '', '', ''], correctAnswerIndex: 0 });
    setShowModal(false);
  };

  const deleteQuestion = (index) => {
    const updated = [...formData.questions];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, questions: updated }));
  };

  return (
    <Card className="p-4">
      <ToastContainer position="top-center" />
      <h5 className="mb-4 text-center">{isEdit ? 'Edit Quiz' : 'Create New Quiz'}</h5>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Quiz Title</Form.Label>
          <Form.Control
            name="title"
            value={formData.title}
            onChange={handleChange}
            disabled={submitting}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Assign to Course</Form.Label>
          {loadingCourses ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <Form.Select
              name="course"
              value={formData.course}
              onChange={handleChange}
              disabled={submitting}
              required
            >
              <option value="">Select a course</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </Form.Select>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Duration (minutes)</Form.Label>
          <Form.Control
            type="number"
            name="durationMinutes"
            value={formData.durationMinutes}
            onChange={handleChange}
            disabled={submitting}
            min={1}
            max={180}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Questions</Form.Label>
          {formData.questions.map((q, index) => (
            <Card className="mb-2 p-2" key={index}>
              <strong>Q{index + 1}:</strong> {q.questionText}
              <br />
              Options:
              <ul>
                {q.options.map((opt, i) => (
                  <li key={i}>
                    {opt} {i === q.correctAnswerIndex && <strong>(Correct)</strong>}
                  </li>
                ))}
              </ul>
              <Button size="sm" variant="danger" onClick={() => deleteQuestion(index)}>
                Delete
              </Button>
            </Card>
          ))}
          <Button
            variant="outline-secondary"
            size="sm"
            className="mt-2"
            disabled={submitting}
            onClick={() => setShowModal(true)}
          >
            Manage Questions
          </Button>
        </Form.Group>

        <Button type="submit" variant="primary" className="w-100" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner size="sm" animation="border" /> Saving...
            </>
          ) : isEdit ? (
            'Update Quiz'
          ) : (
            'Create Quiz'
          )}
        </Button>
      </Form>

      {/* Modal for adding a question */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Question</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Question Text</Form.Label>
            <Form.Control
              type="text"
              value={newQuestion.questionText}
              onChange={(e) =>
                setNewQuestion((q) => ({ ...q, questionText: e.target.value }))
              }
            />
          </Form.Group>

          {newQuestion.options.map((opt, i) => (
            <Form.Group className="mb-2" key={i}>
              <Row>
                <Col xs={10}>
                  <Form.Control
                    type="text"
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                  />
                </Col>
                <Col xs={2}>
                  <Form.Check
                    type="radio"
                    name="correctAnswer"
                    checked={newQuestion.correctAnswerIndex === i}
                    onChange={() =>
                      setNewQuestion((q) => ({ ...q, correctAnswerIndex: i }))
                    }
                    label=""
                    title="Mark as correct"
                  />
                </Col>
              </Row>
            </Form.Group>
          ))}

          <Button variant="success" onClick={addQuestion} className="mt-2">
            Add Question
          </Button>
        </Modal.Body>
      </Modal>
    </Card>
  );
};

export default QuizForm;
