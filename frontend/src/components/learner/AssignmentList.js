import React, { useEffect, useState } from 'react';
import {
  Container,
  Card,
  Button,
  Form,
  Spinner,
  Badge,
  Row,
  Col,
} from 'react-bootstrap';
import axios from 'axios';
import { FaCloudUploadAlt } from 'react-icons/fa';
import {toast} from 'react-toastify';

const AssignmentList = () => {
  const token = localStorage.getItem('token');
  const [assignments, setAssignments] = useState([]);
  const [uploadingId, setUploadingId] = useState('');
  const [fileMap, setFileMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittedIds, setSubmittedIds] = useState(new Set());

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const { data } = await axios.get('/api/v1/assignments/learner/view', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAssignments(data);
      } catch (err) {
        console.error('Failed to fetch assignments:', err);
        toast.error('❌ Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    const fetchSubmissions = async () => {
      try {
        const { data } = await axios.get('/api/v1/submissions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ids = new Set(data.map((s) => s.assignment));
        setSubmittedIds(ids);
      } catch (err) {
        console.error('Failed to fetch submissions:', err);
      }
    };

    fetchAssignments();
    fetchSubmissions();
  }, [token]);

  const handleFileChange = (assignmentId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
    toast.error('❌ Only PDF files are allowed!');
    return;
     }
   if (file.size > 5 * 1024 * 1024) {
    toast.error('❌ File size must be less than 5MB');
    return;
    }

    setFileMap((prev) => ({ ...prev, [assignmentId]: file }));
  };

  const handleUpload = async (assignment) => {
    const file = fileMap[assignment._id];
    if (!file) return toast.warn('⚠️ No file selected');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('assignment', assignment._id);

    setUploadingId(assignment._id);
    try {
      await axios.post('/api/v1/submissions', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('✅ Submission uploaded!');
      setSubmittedIds((prev) => new Set(prev).add(assignment._id));
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('❌ Upload failed!');
    } finally {
      setUploadingId('');
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-4">
        <Spinner animation="border" />
        <p>Loading assignments...</p>
      </Container>
    );
  }

  if (assignments.length === 0) {
    return <p className="text-center">No assignments available.</p>;
  }

  return (
    <Container className="my-4">
      <h4 className="mb-4">My Assignments</h4>
      <Row xs={1} md={2} lg={2} className="g-4">
        {assignments.map((assignment) => (
          <Col key={assignment._id}>
            <Card className="p-3 shadow-sm">
              <Card.Title>{assignment.name}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                Course: {assignment.course?.title || '-'}
              </Card.Subtitle>
              <Card.Text>
                Due Date:{' '}
                {assignment.dueDate
                  ? new Date(assignment.dueDate).toLocaleDateString()
                  : '-'}
              </Card.Text>

              {submittedIds.has(assignment._id) ? (
                <Badge bg="success">Already Submitted</Badge>
              ) : (
                <>
                  <Form.Group controlId={`file-${assignment._id}`} className="mb-2">
                    <Form.Label>Upload PDF</Form.Label>
                    <Form.Control
                      type="file"
                      accept=".pdf"
                      onChange={(e) => handleFileChange(assignment._id, e)}
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    onClick={() => handleUpload(assignment)}
                    disabled={uploadingId === assignment._id}
                  >
                    {uploadingId === assignment._id ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      <>
                        <FaCloudUploadAlt /> Submit
                      </>
                    )}
                  </Button>
                </>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default AssignmentList;
