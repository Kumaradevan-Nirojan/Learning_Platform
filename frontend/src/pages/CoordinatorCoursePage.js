// frontend/src/pages/CoordinatorCoursePage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Button, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CoordinatorCoursePage = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch all courses
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/courses', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // If paginated response:
        setCourses(data.courses || data);
      } catch (err) {
        toast.error('Failed to load courses');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [token]);

  // Delete a course
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course? This will also delete all related assignments, quizzes, enrollments, and other course data.')) return;
    setDeletingId(id);
    try {
      await axios.delete(`http://localhost:5000/api/v1/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses((prev) => prev.filter((c) => c._id !== id));
      toast.success('Course and all related data deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete course. Please try again.';
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Container className="my-4">
      <ToastContainer position="top-center" />

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Manage Courses</h4>
        <Button onClick={() => navigate('/coordinator/course/create')} variant="primary">
          + New Course
        </Button>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" /> Loading courses...
        </div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Educator</th>
              <th>Start – End</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.length ? (
              courses.map((course) => (
                <tr key={course._id}>
                  <td>{course.title}</td>
                  <td>{course.category}</td>
                  <td>{course.educator?.firstName} {course.educator?.lastName}</td>
                  <td>
                    {new Date(course.startDate).toLocaleDateString()} –{' '}
                    {new Date(course.endDate).toLocaleDateString()}
                  </td>
                  <td>
                    <Link
                      to={`/coordinator/course/edit/${course._id}`}
                      className="btn btn-sm btn-warning me-2"
                    >
                      Edit
                    </Link>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={deletingId === course._id}
                      onClick={() => handleDelete(course._id)}
                    >
                      {deletingId === course._id ? <Spinner size="sm" animation="border" /> : 'Delete'}
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">No courses found.</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default CoordinatorCoursePage;
