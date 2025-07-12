import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ListGroup, Spinner, Alert, Card, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import 'react-toastify/dist/ReactToastify.css';

const LearnerAssignmentsList = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/assignments/learner/view', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAssignments(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignments');
      toast.error('❌ Failed to fetch assignments');
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('My Assignments', 14, 16);

    const tableData = assignments.map((a, i) => [
      i + 1,
      a.name,
      a.course?.title || 'N/A',
      `${a.educator?.firstName || ''} ${a.educator?.lastName || ''}`,
      new Date(a.dueDate).toLocaleDateString(),
    ]);

    doc.autoTable({
      head: [['#', 'Name', 'Course', 'Educator', 'Due Date']],
      body: tableData,
      startY: 20,
    });

    doc.save('My_Assignments.pdf');
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <Card className="mt-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title>📘 My Assignments</Card.Title>
          {assignments.length > 0 && (
            <Button variant="outline-primary" onClick={exportToPDF}>
              📄 Export PDF
            </Button>
          )}
        </div>

        {loading ? (
          <Spinner animation="border" />
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : assignments.length === 0 ? (
          <Alert variant="info">No assignments available</Alert>
        ) : (
          <ListGroup>
            {assignments.map((assignment) => (
              <ListGroup.Item key={assignment._id}>
                <strong>{assignment.name}</strong> <br />
                📅 <strong>Due:</strong>{' '}
                {assignment.dueDate
                  ? new Date(assignment.dueDate).toLocaleDateString()
                  : 'N/A'}
                <br />
                📚 <strong>Course:</strong> {assignment.course?.title || 'N/A'} <br />
                👨‍🏫 <strong>Educator:</strong>{' '}
                {assignment.educator?.firstName || ''}{' '}
                {assignment.educator?.lastName || ''}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
};

export default LearnerAssignmentsList;
