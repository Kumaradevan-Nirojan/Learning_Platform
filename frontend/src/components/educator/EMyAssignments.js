import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Spinner, Row, Col, Container } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MyAssignments = () => {
  const token = localStorage.getItem('token');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/assignments', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Filter assignments created by this educator (backend already handles this if restricted)
        setAssignments(data);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        toast.error('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [token]);

  return (
    <Container className="my-4">
      <ToastContainer position="top-center" />
      <h4 className="mb-4 text-center"> Students Assignments</h4>
      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : assignments.length === 0 ? (
        <p>No assignments found.</p>
      ) : (
        <Row>
          {assignments.map((assignment) => (
            <Col md={6} lg={4} key={assignment._id} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{assignment.name}</Card.Title>
                  <Card.Text>
                    <strong>Course:</strong> {assignment.course?.title || 'N/A'}<br />
                    <strong>Due:</strong> {new Date(assignment.dueDate).toLocaleString()}<br />
                    <strong>Instructions:</strong> {assignment.instructions || 'N/A'}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default MyAssignments;
