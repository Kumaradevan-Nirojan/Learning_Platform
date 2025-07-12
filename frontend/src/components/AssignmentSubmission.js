// frontend/src/components/AssignmentSubmission.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Form, Button, Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AssignmentSubmission = ({ existingData = {}, onSuccess }) => {
  const token = localStorage.getItem('token');

  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [course, setCourse] = useState(existingData.course || '');
  const [assignment, setAssignment] = useState(existingData.assignment || '');
  const [file, setFile] = useState(null);

  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch all courses
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
        toast.error('Unable to load courses.');
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [token]);

  // Fetch assignments when a course is selected
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!course) {
        setAssignments([]);
        return;
      }
      setLoadingAssignments(true);
      try {
        // Assuming your backend supports filtering by course
        const { data } = await axios.get(
          `http://localhost:5000/api/v1/assignments?course=${course}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAssignments(data);
      } catch (err) {
        console.error('Error loading assignments:', err);
        toast.error('Unable to load assignments.');
      } finally {
        setLoadingAssignments(false);
      }
    };
    fetchAssignments();
  }, [course, token]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type !== 'application/pdf') {
      toast.warn('Only PDF files are allowed');
      return;
    }
    setFile(selected);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!course || !assignment || !file) {
      toast.warn('Please select a course, assignment, and upload a PDF.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('course', course);
      formData.append('assignment', assignment);
      formData.append('file', file);

      if (existingData._id) {
        // Update existing submission
        await axios.patch(
          `http://localhost:5000/api/v1/submissions/${existingData._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        toast.success('Submission updated successfully!');
      } else {
        // Create new submission
        await axios.post(
          'http://localhost:5000/api/v1/submissions',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        toast.success('Assignment submitted successfully!');
        // reset form
        setCourse('');
        setAssignment('');
        setFile(null);
      }

      // notify parent to refresh list/modal
      onSuccess && onSuccess();
    } catch (err) {
      console.error('Submission error:', err);
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
        {existingData._id ? 'Update Submission' : 'Submit Assignment (PDF)'}
      </h5>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Select Course</Form.Label>
          {loadingCourses ? (
            <div><Spinner animation="border" size="sm" /> Loading courses...</div>
          ) : (
            <Form.Select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              disabled={submitting}
              required
            >
              <option value="">-- Select Course --</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </Form.Select>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Select Assignment</Form.Label>
          {loadingAssignments ? (
            <div><Spinner animation="border" size="sm" /> Loading assignments...</div>
          ) : (
            <Form.Select
              value={assignment}
              onChange={(e) => setAssignment(e.target.value)}
              disabled={!course || submitting}
              required
            >
              <option value="">-- Select Assignment --</option>
              {assignments.map((a) => (
                <option key={a._id} value={a._id}>{a.name}</option>
              ))}
            </Form.Select>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Upload PDF File</Form.Label>
          <Form.Control
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={submitting}
            required
          />
        </Form.Group>

        {file && (
          <div className="mb-3">
            <strong>Selected File:</strong> {file.name}
          </div>
        )}

        <Button
          type="submit"
          variant="success"
          className="w-100"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              {' '}Submitting...
            </>
          ) : existingData._id ? 'Update Submission' : 'Submit Assignment'}
        </Button>
      </Form>
    </Card>
  );
};

export default AssignmentSubmission;
