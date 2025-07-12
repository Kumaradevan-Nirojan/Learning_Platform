// frontend/src/components/QuizListByCourse.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ListGroup, Form, Spinner, Button } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { Link } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const QuizListByCourse = () => {
  const token = localStorage.getItem('token');
  const [courses, setCourses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  // Fetch courses
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

  // Fetch quizzes when course changes
  useEffect(() => {
    if (!selectedCourse) {
      setQuizzes([]);
      return;
    }
    const fetchQuizzes = async () => {
      setLoadingQuizzes(true);
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/quizzes', {
          headers: { Authorization: `Bearer ${token}` },
          params: { course: selectedCourse },
        });
        setQuizzes(data);
      } catch (err) {
        toast.error('Failed to load quizzes');
        console.error(err);
      } finally {
        setLoadingQuizzes(false);
      }
    };
    fetchQuizzes();
  }, [selectedCourse, token]);

  return (
    <>
      <ToastContainer position="top-center" />
      <h5 className="mb-3">Quizzes by Course</h5>

      <Form.Group className="mb-3">
        <Form.Label>Select Course</Form.Label>
        {loadingCourses ? (
          <div><Spinner animation="border" size="sm" /> Loading courses...</div>
        ) : (
          <Form.Select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">-- Select a course --</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </Form.Select>
        )}
      </Form.Group>

      {loadingQuizzes ? (
        <div className="text-center my-3">
          <Spinner animation="border" /> Loading quizzes...
        </div>
      ) : selectedCourse ? (
        quizzes.length > 0 ? (
          <ListGroup>
            {quizzes.map((q) => (
              <ListGroup.Item key={q._id} className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{q.title}</strong><br />
                  Duration: {q.durationMinutes} mins
                </div>
                <Link to={`/quizzes/attempt/${q._id}`}>
                  <Button variant="outline-primary" size="sm">Attempt Quiz</Button>
                </Link>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p className="text-muted">No quizzes found for this course.</p>
        )
      ) : (
        <p className="text-muted">Please select a course to view quizzes.</p>
      )}
    </>
  );
};

export default QuizListByCourse;
