import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Spinner, Row, Col, Container } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EMyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          'http://localhost:5000/api/v1/courses/educator',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setCourses(data.courses || []);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load your courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [token]);

  return (
    <Container className="my-4">
      <ToastContainer position="top-center" />
      <h4 className="mb-4">My Assigned Courses</h4>
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Row>
          {courses.length === 0 ? (
            <p>No courses assigned to you.</p>
          ) : (
            courses.map(course => (
              <Col md={6} lg={4} key={course._id} className="mb-4">
                <Card>
                  <Card.Body>
                    <Card.Title>{course.title}</Card.Title>
                    <Card.Text>
                      <strong>Category:</strong> {course.category}<br />
                      <strong>Duration:</strong> {course.duration} weeks<br />
                      <strong>Start:</strong> {course.startDate?.substring(0, 10)}<br />
                      <strong>End:</strong> {course.endDate?.substring(0, 10)}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}
    </Container>
  );
};

export default EMyCourses;
