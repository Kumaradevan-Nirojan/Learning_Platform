// frontend/src/pages/AssignmentPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, ListGroup, Button, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AssignmentPage = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Redirect if educator is inactive
useEffect(() => {
  const isActive = localStorage.getItem('isActive');
  if (isActive === 'false') {
    navigate('/inactive');
  }
}, [navigate]);


  // Fetch assignments for this user
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/assignments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssignments(data);
      } catch (err) {
        toast.error('Failed to load assignments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [token]);

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" /> Loading assignments...
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <ToastContainer position="top-center" />
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Assignments</h4>
        <Button onClick={() => navigate('/assignment/create')} variant="primary">
          Create Assignment
        </Button>
      </div>

      {assignments.length > 0 ? (
        <ListGroup>
          {assignments.map((a) => (
            <ListGroup.Item key={a._id} className="d-flex justify-content-between align-items-center">
              <div>
                <h5>{a.name}</h5>
                <small>Due: {new Date(a.dueDate).toLocaleString()}</small>
                <p className="mb-0">Course: {a.course?.title || 'N/A'}</p>
              </div>
              <div>
                <Link to={`/assignment/edit/${a._id}`} className="btn btn-sm btn-warning me-2">
                  Edit
                </Link>
                <Link to={`/submission?assignment=${a._id}`} className="btn btn-sm btn-success">
                  Submit
                </Link>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <p className="text-muted">No assignments found.</p>
      )}
    </Container>
  );
};

export default AssignmentPage;
