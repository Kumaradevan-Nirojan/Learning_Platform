// frontend/src/pages/EvaluationPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EvaluationPage = () => {
  const token = localStorage.getItem('token');
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all evaluations
  useEffect(() => {
    const fetchEvaluations = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/evaluations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvaluations(data.data || data);
      } catch (err) {
        toast.error('Failed to load evaluations');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvaluations();
  }, [token]);

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" /> Loading evaluations...
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <ToastContainer position="top-center" />
      <h4 className="mb-4">Learner Evaluations</h4>
      {evaluations.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Learner</th>
              <th>Course</th>
              <th>Educator</th>
              <th>Feedback</th>
              <th>Grade</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {evaluations.map((ev) => (
              <tr key={ev._id}>
                <td>{ev.learner.firstName} {ev.learner.lastName}</td>
                <td>{ev.course.title}</td>
                <td>{ev.educator.firstName} {ev.educator.lastName}</td>
                <td>{ev.feedback}</td>
                <td>{ev.grade}</td>
                <td>{new Date(ev.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="text-muted">No evaluations found.</p>
      )}
    </Container>
  );
};

export default EvaluationPage;
