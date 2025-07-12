// CreateZoomSession.js
import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateZoomSession = () => {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState(30);
  const [link, setLink] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/courses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(data.courses || data);
      } catch (err) {
        toast.error('Failed to load courses');
      }
    };

    fetchCourses();
  }, [token]);

  const handleSubmit = async (e) => {
    console.log('Create Session button clicked');
    e.preventDefault();
    setLoading(true);
    if (!topic || !course || !date || !duration) {
      toast.error('Please fill all required fields.');
      setLoading(false);
      return;
    }
    if (link && !/^https?:\/\/.+/.test(link)) {
      toast.error('Please enter a valid Zoom URL (must start with http:// or https://)');
      setLoading(false);
      return;
    }
    try {
      console.log('Enrollment request body:', {
        topic,
        description,
        course,
        scheduledDate: date,
        durationMinutes: duration,
        link,
      });
      await axios.post('http://localhost:5000/api/v1/doubts', {
        topic,
        description,
        course,
        scheduledDate: date,
        durationMinutes: duration,
        link,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Zoom session created!');
      setTopic('');
      setDescription('');
      setCourse('');
      setDate('');
      setDuration(30);
      setLink('');
    } catch (err) {
      console.log('Enrollment error:', err);
      console.log('Zoom session creation error:', err.response?.data);
      toast.error(err.response?.data?.message || 'Creation failed');
    }
    setLoading(false);
  };

  return (
    <Container className="my-4">
      <h4>Create Zoom Session</h4>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="topic" className="mb-3">
          <Form.Label>Topic</Form.Label>
          <Form.Control
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="description" className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="course" className="mb-3">
          <Form.Label>Course</Form.Label>
          <Form.Select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            required
          >
            <option value=''>-- Select Course --</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group controlId="scheduledDate" className="mb-3">
          <Form.Label>Scheduled Date & Time</Form.Label>
          <Form.Control
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group controlId="duration" className="mb-3">
          <Form.Label>Duration (minutes)</Form.Label>
          <Form.Control
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            min="1"
            max="180"
            required
          />
        </Form.Group>

        <Form.Group controlId="link" className="mb-3">
          <Form.Label>Zoom Link</Form.Label>
          <Form.Control
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </Form.Group>

        <Button type="submit" disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : 'Create Session'}
        </Button>
      </Form>
    </Container>
  );
};

export default CreateZoomSession;
