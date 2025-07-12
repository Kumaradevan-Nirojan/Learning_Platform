import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Spinner, Badge, Button, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

const SubmissionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      try {
        // Get all submissions and find the one with matching ID
        const { data } = await axios.get('/api/v1/submissions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const foundSubmission = data.find(sub => sub._id === id);
        if (foundSubmission) {
          setSubmission(foundSubmission);
        } else {
          toast.error('Submission not found');
          navigate('/learner/dashboard');
        }
      } catch (err) {
        console.error('Error fetching submission details:', err);
        toast.error('Failed to load submission details');
        navigate('/learner/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionDetails();
  }, [id, token, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'graded': return 'success';
      case 'submitted': return 'primary';
      case 'resubmitted': return 'info';
      case 'late': return 'warning';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" />
        <p>Loading submission details...</p>
      </Container>
    );
  }

  if (!submission) {
    return (
      <Container className="text-center my-5">
        <h4>Submission not found</h4>
        <Button variant="primary" onClick={() => navigate('/learner/dashboard')}>
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>📄 Submission Details</h4>
        <Button variant="outline-secondary" onClick={() => navigate('/learner/dashboard')}>
          ← Back to Dashboard
        </Button>
      </div>

      <Card>
        <Card.Header>
          <h5 className="mb-0">{submission.assignment?.name || 'Unknown Assignment'}</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <h6>Assignment Information</h6>
              <p><strong>Assignment:</strong> {submission.assignment?.name || 'N/A'}</p>
              <p><strong>Course:</strong> {submission.assignment?.course?.title || 'N/A'}</p>
              <p><strong>Due Date:</strong> {submission.assignment?.dueDate ? new Date(submission.assignment.dueDate).toLocaleString() : 'N/A'}</p>
            </Col>
            <Col md={6}>
              <h6>Submission Details</h6>
              <p><strong>Status:</strong> <Badge bg={getStatusColor(submission.status)}>{submission.status}</Badge></p>
              <p><strong>Submitted At:</strong> {new Date(submission.submittedAt).toLocaleString()}</p>
              <p><strong>File Name:</strong> {submission.fileName || 'N/A'}</p>
            </Col>
          </Row>

          {submission.grade !== undefined && submission.grade !== null && (
            <Row className="mt-3">
              <Col md={12}>
                <h6>Grading Information</h6>
                <p><strong>Grade:</strong> <span className="text-success fs-5">{submission.grade}/100</span></p>
                {submission.feedback && (
                  <div>
                    <strong>Feedback:</strong>
                    <div className="border rounded p-3 mt-2 bg-light">
                      {submission.feedback}
                    </div>
                  </div>
                )}
              </Col>
            </Row>
          )}

          <Row className="mt-4">
            <Col md={12}>
              <h6>Submitted File</h6>
              {submission.fileUrl ? (
                <div>
                  <a
                    href={`http://localhost:5000/${submission.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary"
                  >
                    📎 View Submitted File
                  </a>
                  <small className="text-muted ms-3">
                    File: {submission.fileName}
                  </small>
                </div>
              ) : (
                <p className="text-muted">No file available</p>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SubmissionDetails; 