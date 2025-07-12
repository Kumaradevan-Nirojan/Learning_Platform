import React, { useEffect, useState } from 'react';
import {
  Table,
  Badge,
  Spinner,
  Container,
  Button,
  Row,
  Col,
  Form,
} from 'react-bootstrap';
import axios from 'axios';
import { FaFilePdf, FaCheckCircle, FaRedo, FaHourglassHalf, FaDownload } from 'react-icons/fa';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SubmissionHistory = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [minGrade, setMinGrade] = useState('');
  const [maxGrade, setMaxGrade] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, courseRes] = await Promise.all([
          axios.get('http://localhost:5000/api/v1/submissions', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/v1/courses', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setSubmissions(subRes.data);
        setCourses(courseRes.data.courses || courseRes.data);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  useEffect(() => {
    let data = [...submissions];

    if (courseFilter) {
      data = data.filter(s => s.assignment?.course?.title === courseFilter);
    }

    if (statusFilter) {
      data = data.filter(s => s.status === statusFilter);
    }

    if (minGrade) {
      data = data.filter(s => s.grade >= parseFloat(minGrade));
    }

    if (maxGrade) {
      data = data.filter(s => s.grade <= parseFloat(maxGrade));
    }

    if (sortOrder === 'asc') {
      data.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
    } else {
      data.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    }

    setFilteredSubmissions(data);
  }, [submissions, courseFilter, statusFilter, minGrade, maxGrade, sortOrder]);

  const renderStatus = (status) => {
    switch (status) {
      case 'submitted':
        return <Badge bg="info"><FaHourglassHalf /> Submitted</Badge>;
      case 'resubmitted':
        return <Badge bg="warning"><FaRedo /> Resubmitted</Badge>;
      case 'graded':
        return <Badge bg="success"><FaCheckCircle /> Graded</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Submission History Report', 14, 15);
    doc.autoTable({
      startY: 20,
      head: [['#', 'Course', 'Assignment', 'Submitted At', 'Status', 'Grade', 'Feedback']],
      body: filteredSubmissions.map((s, index) => [
        index + 1,
        s.assignment?.course?.title || '-',
        s.assignment?.name || '-',
        new Date(s.submittedAt).toLocaleString(),
        s.status,
        s.grade ?? '-',
        s.feedback || '-',
      ]),
    });
    doc.save('submission-history.pdf');
  };

  const csvData = filteredSubmissions.map((s, index) => ({
    No: index + 1,
    Course: s.assignment?.course?.title || '-',
    Assignment: s.assignment?.name || '-',
    Submitted_At: new Date(s.submittedAt).toLocaleString(),
    Status: s.status,
    Grade: s.grade ?? '-',
    Feedback: s.feedback || '-',
  }));

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
      <h4>📥 Submission History</h4>

      {/* Filters */}
      <Row className="mb-3 g-3">
        <Col md={3}>
          <Form.Select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
            <option value="">Filter by Course</option>
            {courses.map((c) => (
              <option key={c._id} value={c.title}>{c.title}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Status</option>
            <option value="submitted">Submitted</option>
            <option value="graded">Graded</option>
            <option value="resubmitted">Resubmitted</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Control type="number" placeholder="Min Grade" value={minGrade} onChange={(e) => setMinGrade(e.target.value)} />
        </Col>
        <Col md={2}>
          <Form.Control type="number" placeholder="Max Grade" value={maxGrade} onChange={(e) => setMaxGrade(e.target.value)} />
        </Col>
        <Col md={2}>
          <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </Form.Select>
        </Col>
        <Col md={1} className="text-end">
          <CSVLink data={csvData} filename="submission-history.csv" className="btn btn-outline-primary me-2">
            <FaDownload />
          </CSVLink>
          <Button variant="outline-danger" onClick={exportPDF}><FaFilePdf /></Button>
        </Col>
      </Row>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Course</th>
            <th>Assignment</th>
            <th>Submitted At</th>
            <th>Status</th>
            <th>Grade</th>
            <th>Feedback</th>
            <th>File</th>
          </tr>
        </thead>
        <tbody>
          {filteredSubmissions.length > 0 ? (
            filteredSubmissions.map((submission, index) => (
              <tr key={submission._id}>
                <td>{index + 1}</td>
                <td>{submission.assignment?.course?.title || '-'}</td>
                <td>{submission.assignment?.name || '-'}</td>
                <td>{new Date(submission.submittedAt).toLocaleString()}</td>
                <td>{renderStatus(submission.status)}</td>
                <td>{submission.grade ?? '-'}</td>
                <td>{submission.feedback || '-'}</td>
                <td>
                  <a
                    href={`http://localhost:5000/${submission.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">No submissions found for the selected filters.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default SubmissionHistory;
