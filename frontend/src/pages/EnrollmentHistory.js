import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Form, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { toast } from 'react-toastify';

const EnrollmentHistory = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      const res = await axios.get('/api/enrollments/my', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEnrollments(res.data);
    } catch (err) {
      toast.error('Failed to fetch enrollment history');
    }
  };

  const handleRetryPayment = (courseId) => {
    navigate(`/payment/${courseId}`);
  };

  const exportCSV = () => {
    const csv = [
      ['Course Title', 'Date', 'Status'],
      ...enrollments.map((en) => [
        en.course.title,
        new Date(en.createdAt).toLocaleDateString(),
        en.paymentStatus,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'enrollment_history.csv');
  };

  const filteredEnrollments = enrollments.filter((en) => {
    const matchDate = filterDate
      ? new Date(en.createdAt).toLocaleDateString() === filterDate
      : true;
    const matchStatus = filterStatus ? en.paymentStatus === filterStatus : true;
    return matchDate && matchStatus;
  });

  return (
    <Container className="mt-4">
      <h3>Enrollment History</h3>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Label>Filter by Date</Form.Label>
          <Form.Control
            type="date"
            onChange={(e) => setFilterDate(new Date(e.target.value).toLocaleDateString())}
          />
        </Col>
        <Col md={3}>
          <Form.Label>Filter by Status</Form.Label>
          <Form.Select onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </Form.Select>
        </Col>
        <Col md={6} className="d-flex align-items-end justify-content-end">
          <Button variant="outline-secondary" onClick={exportCSV}>
            Export CSV
          </Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Course</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredEnrollments.map((en) => (
            <tr key={en._id}>
              <td>{en.course.title}</td>
              <td>{new Date(en.createdAt).toLocaleDateString()}</td>
              <td>{en.paymentStatus}</td>
              <td>
                {(en.paymentStatus === 'pending' || en.paymentStatus === 'failed') && (
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => handleRetryPayment(en.course._id)}
                  >
                    Retry Payment
                  </Button>
                )}

                {en.paymentStatus === 'success' && (
                  <Button
                    size="sm"
                    variant="outline-success"
                    onClick={() => navigate(`/receipt/${en._id}`)}
                  >
                    View Receipt
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default EnrollmentHistory;
