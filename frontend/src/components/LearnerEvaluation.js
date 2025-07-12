// frontend/src/components/LearnerEvaluation.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Form, Button, Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LearnerEvaluation = ({ existingData = {}, onSuccess }) => {
  const token = localStorage.getItem('token');

  const [learners, setLearners] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    learner: existingData.learner || '',
    course: existingData.course || '',
    feedback: existingData.feedback || '',
    grade: existingData.grade || '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch learners and courses in parallel
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lRes, cRes] = await Promise.all([
          axios.get('http://localhost:5000/api/v1/users?role=learner', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/v1/courses', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setLearners(lRes.data);
        setCourses(cRes.data.courses || cRes.data);
      } catch (err) {
        toast.error('Failed to load learners or courses.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = existingData._id
        ? `http://localhost:5000/api/v1/evaluations/${existingData._id}`
        : 'http://localhost:5000/api/v1/evaluations';
      const method = existingData._id ? 'patch' : 'post';
      await axios[method](
        url,
        { ...formData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(existingData._id ? 'Evaluation updated!' : 'Evaluation submitted!');
      onSuccess && onSuccess();
      setFormData({ learner: '', course: '', feedback: '', grade: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" /> Loading...
      </div>
    );
  }

  return (
    <Card className="p-4">
      <ToastContainer position="top-center" />
      <h5 className="mb-4 text-center">
        {existingData._id ? 'Edit Evaluation' : 'Evaluate Learner'}
      </h5>
      <Form onSubmit={handleSubmit}>
        {/* Learner Select */}
        <Form.Group className="mb-3">
          <Form.Label>Select Learner</Form.Label>
          <Form.Select
            name="learner"
            value={formData.learner}
            onChange={handleChange}
            disabled={submitting}
            required
          >
            <option value="">-- Select Learner --</option>
            {learners.map((l) => (
              <option key={l._id} value={l._id}>
                {l.firstName} {l.lastName} ({l.email})
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Course Select */}
        <Form.Group className="mb-3">
          <Form.Label>Select Course</Form.Label>
          <Form.Select
            name="course"
            value={formData.course}
            onChange={handleChange}
            disabled={submitting}
            required
          >
            <option value="">-- Select Course --</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Feedback */}
        <Form.Group className="mb-3">
          <Form.Label>Feedback</Form.Label>
          <Form.Control
            as="textarea"
            name="feedback"
            rows={4}
            value={formData.feedback}
            onChange={handleChange}
            disabled={submitting}
            required
          />
        </Form.Group>

        {/* Grade (optional) */}
        <Form.Group className="mb-3">
          <Form.Label>Grade</Form.Label>
          <Form.Control
            type="text"
            name="grade"
            placeholder="e.g., A, B, Pass"
            value={formData.grade}
            onChange={handleChange}
            disabled={submitting}
          />
        </Form.Group>

        {/* Submit Button */}
        <Button type="submit" variant="primary" className="w-100" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner size="sm" animation="border" role="status" /> Submitting...
            </>
          ) : existingData._id ? 'Update Evaluation' : 'Submit Evaluation'}
        </Button>
      </Form>
    </Card>
  );
};

export default LearnerEvaluation;
