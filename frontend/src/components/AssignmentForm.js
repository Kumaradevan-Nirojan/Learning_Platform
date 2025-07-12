import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Spinner, Form, Button, Card } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AssignmentForm = ({ existingData, onSuccess }) => {
  const token = localStorage.getItem('token');

  const [name, setName] = useState(existingData?.name || '');
  const [instructions, setInstructions] = useState(existingData?.instructions || '');
  const [dueDate, setDueDate] = useState(
    existingData?.dueDate
      ? new Date(existingData.dueDate).toISOString().slice(0, 16)
      : ''
  );
  const [course, setCourse] = useState(
    existingData?.course?._id || existingData?.course || ''
  );

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoadingCourses(true);
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(data.courses || data);
      } catch (err) {
        console.error('Error loading courses:', err);
        toast.error('Unable to load courses. Please try again.');
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !course || !dueDate) {
      toast.warn('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        instructions,
        course, // Must be course._id
        dueDate: new Date(dueDate).toISOString()
      };

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (existingData?._id) {
        await axios.patch(
          `http://localhost:5000/api/v1/assignments/${existingData._id}`,
          payload,
          config
        );
        toast.success('Assignment updated successfully!');
      } else {
        await axios.post(
          'http://localhost:5000/api/v1/assignments',
          payload,
          config
        );
        toast.success('Assignment created successfully!');
        setName('');
        setInstructions('');
        setCourse('');
        setDueDate('');
      }

      onSuccess && onSuccess();
    } catch (err) {
      console.error('Submit error:', err);
      const msg = err.response?.data?.message || err.message || 'Submission failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-4">
      <ToastContainer position="top-center" />
      <h5 className="mb-4 text-center">
        {existingData?._id ? 'Edit Assignment' : 'Create New Assignment'}
      </h5>

      {loadingCourses ? (
        <div className="text-center my-3">
          <Spinner animation="border" /> Loading courses...
        </div>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>
              Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter assignment name"
              disabled={submitting}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              Course <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
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

          <Form.Group className="mb-3">
            <Form.Label>Instructions</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              disabled={submitting}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>
              Due Date & Time <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={submitting}
              required
            />
          </Form.Group>

          <Button
            type="submit"
            variant="primary"
            className="w-100"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                {' '}Submitting...
              </>
            ) : existingData?._id ? 'Update Assignment' : 'Create Assignment'}
          </Button>
        </Form>
      )}
    </Card>
  );
};

export default AssignmentForm;
