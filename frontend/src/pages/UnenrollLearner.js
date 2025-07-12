// frontend/src/pages/UnenrollLearner.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Button, Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UnenrollLearner = () => {
  const token = localStorage.getItem('token');
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/enrollments', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEnrollments(data);
      } catch (err) {
        toast.error('Failed to load your enrollments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollments();
  }, [token]);

  const handleUnenroll = async (id) => {
    if (!window.confirm('Are you sure you want to unenroll from this course?')) return;
    setRemovingId(id);
    try {
      await axios.delete(`http://localhost:5000/api/v1/enrollments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnrollments((prev) => prev.filter((e) => e._id !== id));
      toast.success('Successfully unenrolled');
    } catch (err) {
      toast.error('Failed to unenroll');
      console.error(err);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <Container className="my-4">
      <ToastContainer position="top-center" />
      <h4 className="mb-4">My Enrollments</h4>
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" /> Loading...
        </div>
      ) : enrollments.length > 0 ? (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Course</th>
              <th>Status</th>
              <th>Enrolled On</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((en) => (
              <tr key={en._id}>
                <td>{en.course.title}</td>
                <td>{en.status}</td>
                <td>{new Date(en.enrollmentDate).toLocaleDateString()}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    disabled={removingId === en._id}
                    onClick={() => handleUnenroll(en._id)}
                  >
                    {removingId === en._id ? <Spinner size="sm" animation="border" /> : 'Unenroll'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="text-center text-muted">You have no active enrollments.</p>
      )}
    </Container>
  );
};

export default UnenrollLearner;
