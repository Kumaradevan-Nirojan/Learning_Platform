import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
  Modal,
} from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import 'react-toastify/dist/ReactToastify.css';

const CoordinatorSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState('');
  const [educatorFilter, setEducatorFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data } = await axios.get('/api/v1/submissions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(data);
      setFilteredSubmissions(data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  // Filter submissions based on selected criteria
  useEffect(() => {
    let filtered = [...submissions];

    // Filter by course
    if (courseFilter) {
      filtered = filtered.filter(s => s.assignment?.course?.title === courseFilter);
    }

    // Filter by educator
    if (educatorFilter) {
      filtered = filtered.filter(s => 
        `${s.assignment?.educator?.firstName} ${s.assignment?.educator?.lastName}` === educatorFilter
      );
    }

    // Filter by payment status
    if (paymentFilter) {
      filtered = filtered.filter(s => s.paymentStatus === paymentFilter);
    }

    // Filter by submission status
    if (statusFilter) {
      filtered = filtered.filter(s => s.status === statusFilter);
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
  }, [submissions, courseFilter, educatorFilter, paymentFilter, statusFilter, dateFromFilter, dateToFilter]);

  // Get unique values for filter dropdowns
  const uniqueCourses = [...new Set(submissions.map(s => s.assignment?.course?.title).filter(Boolean))];
  const uniqueEducators = [...new Set(submissions.map(s => 
    `${s.assignment?.educator?.firstName} ${s.assignment?.educator?.lastName}`
  ).filter(name => name.trim() !== ''))];

  const clearAllFilters = () => {
    setCourseFilter('');
    setEducatorFilter('');
    setPaymentFilter('');
    setStatusFilter('');
    setDateFromFilter('');
    setDateToFilter('');
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'success': return <Badge bg="success">✅ Paid</Badge>;
      case 'pending': return <Badge bg="warning">⏳ Pending</Badge>;
      case 'failed': return <Badge bg="danger">❌ Failed</Badge>;
      default: return <Badge bg="secondary">❓ Unknown</Badge>;
    }
  };

  const getSubmissionStatusBadge = (status) => {
    switch (status) {
      case 'graded': return <Badge bg="success">✅ Graded</Badge>;
      case 'submitted': return <Badge bg="primary">📝 Submitted</Badge>;
      case 'reviewed': return <Badge bg="info">👁️ Reviewed</Badge>;
      case 'resubmitted': return <Badge bg="warning">🔄 Resubmitted</Badge>;
      default: return <Badge bg="secondary">❓ Unknown</Badge>;
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF('landscape');
    doc.text('Coordinator Submissions Report', 14, 15);
    
    const tableData = filteredSubmissions.map(s => [
      s.assignment?.name || '-',
      s.assignment?.course?.title || '-',
      `${s.learner?.firstName} ${s.learner?.lastName}` || '-',
      `${s.assignment?.educator?.firstName} ${s.assignment?.educator?.lastName}` || '-',
      s.grade || '-',
      new Date(s.submittedAt).toLocaleDateString(),
      s.updatedAt ? new Date(s.updatedAt).toLocaleDateString() : '-',
      s.feedback || '-',
      s.paymentStatus || '-'
    ]);

    doc.autoTable({
      startY: 20,
      head: [['Assignment', 'Course', 'Student', 'Educator', 'Grade', 'Submitted', 'Marked', 'Feedback', 'Payment']],
      body: tableData,
      styles: { fontSize: 8 },
      columnStyles: {
        7: { cellWidth: 40 } // Feedback column wider
      }
    });
    
    doc.save('coordinator-submissions.pdf');
  };

  const viewDetails = (submission) => {
    setSelectedSubmission(submission);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading all submissions...</p>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <ToastContainer />
      <h4 className="mb-4 text-center">
        🎓 Coordinator - All Submissions Management
        {(courseFilter || educatorFilter || paymentFilter || statusFilter || dateFromFilter || dateToFilter) && (
          <Badge bg="success" className="ms-2 fs-6">
            Filtered
          </Badge>
        )}
      </h4>

      {/* Filter Section */}
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">🔍 Filter & Export Options</h6>
            <Button variant="danger" size="sm" onClick={exportPDF}>
              📄 Export PDF Report
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={2}>
              <Form.Group>
                <Form.Label>📚 Course</Form.Label>
                <Form.Select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                >
                  <option value="">All Courses</option>
                  {uniqueCourses.map((course, index) => (
                    <option key={index} value={course}>{course}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>👨‍🏫 Educator</Form.Label>
                <Form.Select
                  value={educatorFilter}
                  onChange={(e) => setEducatorFilter(e.target.value)}
                >
                  <option value="">All Educators</option>
                  {uniqueEducators.map((educator, index) => (
                    <option key={index} value={educator}>{educator}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>💳 Payment</Form.Label>
                <Form.Select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <option value="">All Payments</option>
                  <option value="success">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>📝 Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="graded">Graded</option>
                  <option value="resubmitted">Resubmitted</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>📅 From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>📅 To Date</Form.Label>
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
                onClick={clearAllFilters}
              >
                🗑️ Clear All Filters
              </Button>
              <Badge bg="info" className="ms-3">
                Showing {filteredSubmissions.length} of {submissions.length} submissions
              </Badge>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Submissions Table */}
      <Card>
        <Card.Body className="p-0">
          <Table striped bordered hover responsive>
            <thead className="table-dark">
              <tr>
                <th>Assignment</th>
                <th>Course</th>
                <th>Student</th>
                <th>Educator</th>
                <th>Grade</th>
                <th>Submitted Date</th>
                <th>Marked Date</th>
                <th>Payment Status</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.length > 0 ? (
                filteredSubmissions.map((submission) => (
                  <tr key={submission._id}>
                    <td>{submission.assignment?.name || '-'}</td>
                    <td>{submission.assignment?.course?.title || '-'}</td>
                    <td>{`${submission.learner?.firstName} ${submission.learner?.lastName}`}</td>
                    <td>{`${submission.assignment?.educator?.firstName} ${submission.assignment?.educator?.lastName}` || '-'}</td>
                    <td>
                      {submission.grade ? (
                        <Badge bg="success">{submission.grade}/100</Badge>
                      ) : (
                        <Badge bg="secondary">Not Graded</Badge>
                      )}
                    </td>
                    <td>{new Date(submission.submittedAt).toLocaleDateString()}</td>
                    <td>
                      {submission.grade ? 
                        new Date(submission.updatedAt).toLocaleDateString() : 
                        '-'
                      }
                    </td>
                    <td>{getPaymentStatusBadge(submission.paymentStatus)}</td>
                    <td>{getSubmissionStatusBadge(submission.status)}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => viewDetails(submission)}
                      >
                        👁️ View Details
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center text-muted py-4">
                    {submissions.length === 0 
                      ? "📭 No submissions found" 
                      : "🔍 No submissions match the current filters"
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>📋 Submission Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSubmission && (
            <Row>
              <Col md={6}>
                <h6>📝 Assignment Information</h6>
                <p><strong>Assignment:</strong> {selectedSubmission.assignment?.name}</p>
                <p><strong>Course:</strong> {selectedSubmission.assignment?.course?.title}</p>
                <p><strong>Due Date:</strong> {selectedSubmission.assignment?.dueDate ? 
                  new Date(selectedSubmission.assignment.dueDate).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Educator:</strong> {`${selectedSubmission.assignment?.educator?.firstName} ${selectedSubmission.assignment?.educator?.lastName}`}</p>
                
                <h6 className="mt-3">👨‍🎓 Student Information</h6>
                <p><strong>Name:</strong> {`${selectedSubmission.learner?.firstName} ${selectedSubmission.learner?.lastName}`}</p>
                <p><strong>Email:</strong> {selectedSubmission.learner?.email}</p>
                <p><strong>Payment Status:</strong> {getPaymentStatusBadge(selectedSubmission.paymentStatus)}</p>
              </Col>
              <Col md={6}>
                <h6>📊 Grading Information</h6>
                <p><strong>Submitted:</strong> {new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                <p><strong>Status:</strong> {getSubmissionStatusBadge(selectedSubmission.status)}</p>
                <p><strong>Grade:</strong> {selectedSubmission.grade ? 
                  <Badge bg="success">{selectedSubmission.grade}/100</Badge> : 
                  <Badge bg="secondary">Not Graded</Badge>
                }</p>
                <p><strong>Marked Date:</strong> {selectedSubmission.grade ? 
                  new Date(selectedSubmission.updatedAt).toLocaleString() : 'Not yet graded'}</p>
                
                <h6 className="mt-3">💬 Feedback</h6>
                <div className="border rounded p-3 bg-light">
                  {selectedSubmission.feedback || 'No feedback provided yet'}
                </div>
                
                <h6 className="mt-3">📎 Submitted File</h6>
                <a
                  href={`http://localhost:5000/${selectedSubmission.fileUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary"
                >
                  📥 Download Submission
                </a>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CoordinatorSubmissions;
