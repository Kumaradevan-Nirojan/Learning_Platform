import React, { useEffect, useState } from 'react';
import {
  Container,
  Table,
  Form,
  Button,
  Spinner,
  Badge,
  Row,
  Col,
  Card,
} from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const EducatorEvaluation = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState('');
  const [assignmentFilter, setAssignmentFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const token = localStorage.getItem('token');

  const fetchSubmissions = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/v1/submissions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(data);
      setFilteredSubmissions(data);
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Filter submissions based on selected criteria
  useEffect(() => {
    let filtered = [...submissions];

    // Filter by course
    if (courseFilter) {
      filtered = filtered.filter(s => s.assignment?.course?.title === courseFilter);
    }

    // Filter by assignment
    if (assignmentFilter) {
      filtered = filtered.filter(s => s.assignment?.name === assignmentFilter);
    }

    // Filter by date range
    if (dateFromFilter) {
      filtered = filtered.filter(s => {
        const submittedDate = new Date(s.submittedAt).toDateString();
        const fromDate = new Date(dateFromFilter).toDateString();
        return new Date(submittedDate) >= new Date(fromDate);
      });
    }

    if (dateToFilter) {
      filtered = filtered.filter(s => {
        const submittedDate = new Date(s.submittedAt).toDateString();
        const toDate = new Date(dateToFilter).toDateString();
        return new Date(submittedDate) <= new Date(toDate);
      });
    }

    setFilteredSubmissions(filtered);
  }, [submissions, courseFilter, assignmentFilter, dateFromFilter, dateToFilter]);

  // Get unique courses for filter dropdown
  const uniqueCourses = [...new Set(submissions.map(s => s.assignment?.course?.title).filter(Boolean))];
  
  // Get unique assignments for filter dropdown (filtered by selected course)
  const uniqueAssignments = [...new Set(
    submissions
      .filter(s => !courseFilter || s.assignment?.course?.title === courseFilter)
      .map(s => s.assignment?.name)
      .filter(Boolean)
  )];

  const handleGradeSubmit = async (id, grade, feedback, status) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/v1/submissions/${id}`,
        { grade, feedback, status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('✅ Evaluation submitted!');
      fetchSubmissions(); // refresh table
    } catch (err) {
      console.error('Failed to update evaluation:', err);
      toast.error('❌ Failed to save evaluation!');
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-4">
        <Spinner animation="border" />
        <p>Loading submissions...</p>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <h4 className="mb-4">📊 Evaluate Submissions</h4>
      
      {/* Filter Section */}
      <Card className="mb-4">
        <Card.Header>
          <h6 className="mb-0">🔍 Filter Submissions</h6>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Course</Form.Label>
                <Form.Select
                  value={courseFilter}
                  onChange={(e) => {
                    setCourseFilter(e.target.value);
                    setAssignmentFilter(''); // Reset assignment filter when course changes
                  }}
                >
                  <option value="">All Courses</option>
                  {uniqueCourses.map((course, index) => (
                    <option key={index} value={course}>{course}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Assignment</Form.Label>
                <Form.Select
                  value={assignmentFilter}
                  onChange={(e) => setAssignmentFilter(e.target.value)}
                  disabled={!courseFilter && uniqueAssignments.length > 10} // Disable if too many assignments and no course selected
                >
                  <option value="">All Assignments</option>
                  {uniqueAssignments.map((assignment, index) => (
                    <option key={index} value={assignment}>{assignment}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="mt-3">
            <Col>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => {
                  setCourseFilter('');
                  setAssignmentFilter('');
                  setDateFromFilter('');
                  setDateToFilter('');
                }}
              >
                🗑️ Clear Filters
              </Button>
              <Badge bg="info" className="ms-3">
                Showing {filteredSubmissions.length} of {submissions.length} submissions
              </Badge>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Course</th>
            <th>Assignment</th>
            <th>Learner</th>
            <th>Submitted</th>
            <th>PDF</th>
            <th>Grade</th>
            <th>Feedback</th>
            <th>Status</th>
            <th>Save</th>
          </tr>
        </thead>
        <tbody>
          {filteredSubmissions.length > 0 ? (
            filteredSubmissions.map((submission) => (
            <tr key={submission._id}>
              <td>{submission.assignment?.course?.title || '-'}</td>
              <td>{submission.assignment?.name || '-'}</td>
              <td>{submission.learner?.firstName} {submission.learner?.lastName}</td>
              <td>{new Date(submission.submittedAt).toLocaleString()}</td>
              <td>
                <a
                  href={`http://localhost:5000/${submission.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              </td>
              <td>
                <Form.Control
                  type="number"
                  defaultValue={submission.grade || ''}
                  onChange={(e) => (submission._grade = e.target.value)}
                />
              </td>
              <td>
                <Form.Control
                  as="textarea"
                  defaultValue={submission.feedback || ''}
                  rows={2}
                  onChange={(e) => (submission._feedback = e.target.value)}
                />
              </td>
              <td>
                <Form.Select
                  defaultValue={submission.status || 'graded'}
                  onChange={(e) => (submission._status = e.target.value)}
                >
                  <option value="graded">Graded</option>
                  <option value="resubmitted">Resubmitted</option>
                </Form.Select>
              </td>
              <td>
                <Button
                  size="sm"
                  onClick={() =>
                    handleGradeSubmit(
                      submission._id,
                      submission._grade || submission.grade,
                      submission._feedback || submission.feedback,
                      submission._status || submission.status
                    )
                  }
                >
                  Save
                </Button>
              </td>
            </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center text-muted py-4">
                {submissions.length === 0 
                  ? "No submissions found" 
                  : "No submissions match the selected filters"
                }
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default EducatorEvaluation;
