// frontend/src/components/StudyPlanForm.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Card, Form, Button, Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudyPlanForm = ({ existingData = {}, onSuccess }) => {
  const token = localStorage.getItem('token');
  const isEdit = Boolean(existingData && existingData._id);

  // Memoize current user to prevent infinite re-renders
  const currentUser = useMemo(() => {
    try {
      const rawUser = localStorage.getItem('user');
      if (rawUser && rawUser !== 'undefined') {
        return JSON.parse(rawUser);
      }
    } catch (error) {
      console.warn('⚠️ Error parsing user data:', error);
    }
    return null;
  }, []);

  const [formData, setFormData] = useState({
    title: existingData?.title || '',
    description: existingData?.description || '',
    course: existingData?.course || '',
  });
  const [file, setFile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Safe toast wrapper
  const safeToast = useCallback((type, message) => {
    try {
      // Ensure message is a string
      const msg = typeof message === 'string' ? message : 'An error occurred';
      
      if (type === 'success') {
        toast.success(msg, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
        });
      } else if (type === 'error') {
        toast.error(msg, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
        });
      } else {
        toast(msg, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
        });
      }
    } catch (error) {
      console.error('Toast error:', error);
      console.log(message); // Fallback to console
    }
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      console.log('🔍 Fetching courses for educator...');
      console.log('Token available:', !!token);
      console.log('Current user role:', currentUser?.role);
      
      try {
        const response = await axios.get('http://localhost:5000/api/v1/courses/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        console.log('📦 API Response:', response);
        console.log('📊 Response data:', response.data);
        console.log('📚 Courses array:', response.data.courses);
        
        const coursesData = response.data.courses || response.data || [];
        console.log('✅ Final courses data:', coursesData);
        console.log('📈 Number of courses:', coursesData.length);
        
        setCourses(coursesData);
        
        if (coursesData.length === 0) {
          console.warn('⚠️ No courses found for this educator');
          safeToast('info', 'No courses assigned to you yet. Please contact your coordinator.');
        } else {
          console.log('✅ Successfully loaded', coursesData.length, 'courses');
        }
      } catch (err) {
        console.error('❌ Error fetching courses:', err);
        console.error('Response status:', err.response?.status);
        console.error('Response data:', err.response?.data);
        
        const errorMessage = err.response?.data?.message || 'Failed to load courses';
        safeToast('error', errorMessage);
        setCourses([]); // Set empty array as fallback
      } finally {
        setLoadingCourses(false);
      }
    };
    
    if (token && currentUser?.role === 'educator') {
      fetchCourses();
    } else {
      console.warn('⚠️ No token available or user is not an educator');
      console.log('Token:', !!token, 'Role:', currentUser?.role);
      setLoadingCourses(false);
      if (!token) {
        safeToast('error', 'Please log in to view courses');
      } else if (currentUser?.role !== 'educator') {
        safeToast('error', 'Only educators can create study plans');
      }
    }
  }, [token, currentUser?.role]); // Only depend on token and role, not the entire user object

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('course', formData.course);
      if (file) form.append('material', file);

      const url = isEdit
        ? `http://localhost:5000/api/v1/studyplans/${existingData._id}`
        : 'http://localhost:5000/api/v1/studyplans';
      const method = isEdit ? 'patch' : 'post';

      await axios[method](url, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      safeToast('success', isEdit ? 'Study plan updated!' : 'Study plan created!');
      onSuccess && onSuccess();
      if (!isEdit) {
        setFormData({ title: '', description: '', course: '' });
        setFile(null);
      }
    } catch (err) {
      safeToast('error', err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-4">
      <h5 className="mb-4 text-center">{isEdit ? 'Edit Study Plan' : 'Create Study Plan'}</h5>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={submitting}
            placeholder="Enter study plan title"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            required
            disabled={submitting}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Assign to Course</Form.Label>
          {loadingCourses ? (
            <div className="d-flex align-items-center">
              <Spinner animation="border" size="sm" className="me-2" />
              <span>Loading courses...</span>
            </div>
          ) : (
            <>
              <Form.Select
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
                disabled={submitting}
              >
                <option value="">-- Select Course --</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </Form.Select>
              
              {/* Debug info - remove this in production */}
              {process.env.NODE_ENV === 'development' && (
                <small className="text-muted mt-1 d-block">
                  Debug: {courses.length} courses loaded
                  {courses.length === 0 && " - Check browser console for details"}
                </small>
              )}
            </>
          )}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Upload Study Material (PDF, Word, PPT)</Form.Label>
          <Form.Control
            type="file"
            name="material"
            accept=".pdf,.doc,.docx,.ppt,.pptx"
            onChange={handleFileChange}
            disabled={submitting}
          />
        </Form.Group>

        <Button type="submit" variant="success" className="w-100" disabled={submitting}>
          {submitting ? <>Saving...</> : isEdit ? 'Update Plan' : 'Create Plan'}
        </Button>
      </Form>
    </Card>
  );
};

export default StudyPlanForm;
