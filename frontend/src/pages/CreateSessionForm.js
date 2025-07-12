// frontend/src/pages/CreateSessionForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateSessionForm = ({ existingData = {}, onSuccess }) => {
  const token = localStorage.getItem('token');
  const isEdit = Boolean(existingData._id);

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    topic: existingData.topic || '',
    description: existingData.description || '',
    course: existingData.course || '',
    scheduledDate: existingData.scheduledDate
      ? existingData.scheduledDate.slice(0, 16)
      : '',
    durationMinutes: existingData.durationMinutes || 60,
    link: existingData.link || '',
  });

  // Fetch courses for dropdown
  useEffect(() => {
    const fetchCourses = async () => {
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
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
        durationMinutes: Number(formData.durationMinutes),
      };
      const url = isEdit
        ? `http://localhost:5000/api/v1/doubts/${existingData._id}`
        : 'http://localhost:5000/api/v1/doubts';
      const method = isEdit ? 'patch' : 'post';

      await axios[method](url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(isEdit ? 'Session updated!' : 'Session created!');
      onSuccess && onSuccess();
      if (!isEdit) {
        setFormData({
          topic: '',
          description: '',
          course: '',
          scheduledDate: '',
          durationMinutes: 60,
          link: '',
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="my-4">
      <ToastContainer position="top-center" />
      <Card className="p-4">
        <h5 className="mb-4 text-center">
          {isEdit ? 'Edit Doubt Session' : 'Create Doubt Session'}
        </h5>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Topic</Form.Label>
            <Form.Control
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={submitting}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Course</Form.Label>
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
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </Form.Select>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Scheduled Date & Time</Form.Label>
            <Form.Control
              type="datetime-local"
              name="scheduledDate"
              value={formData.scheduledDate}
              onChange={handleChange}
              disabled={submitting}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Duration (minutes)</Form.Label>
            <Form.Control
              type="number"
              name="durationMinutes"
              min={1}
              max={180}
              value={formData.durationMinutes}
              onChange={handleChange}
              disabled={submitting}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Session Link (optional)</Form.Label>
            <Form.Control
              type="url"
              name="link"
              placeholder="https://..."
              value={formData.link}
              onChange={handleChange}
              disabled={submitting}
            />
          </Form.Group>

          <Button type="submit" variant="success" className="w-100" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner size="sm" animation="border" /> Saving...
              </>
            ) : isEdit ? 'Update Session' : 'Create Session'}
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default CreateSessionForm;
