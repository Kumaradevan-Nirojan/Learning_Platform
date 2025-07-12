import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Spinner, Form, Button, Badge } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import 'react-toastify/dist/ReactToastify.css';

const EMySubmissions = () => {
  const token = localStorage.getItem('token');
  const [submissions, setSubmissions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔍 DEBUG: Fetching educator submissions and courses...');
        const [subRes, courseRes] = await Promise.all([
          axios.get('/api/v1/submissions/my', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('/api/v1/courses/my', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        console.log('🔍 DEBUG: Submissions response:', subRes.data);
        console.log('🔍 DEBUG: Courses response:', courseRes.data);
        setSubmissions(subRes.data);
        setFiltered(subRes.data);
        
        // Ensure courses is always an array
        const coursesData = courseRes.data.courses || courseRes.data || [];
        console.log('🔍 DEBUG: Final courses data:', coursesData);
        setCourses(Array.isArray(coursesData) ? coursesData : []);
      } catch (error) {
        console.error('❌ DEBUG: Error fetching data:', error);
        toast.error('Failed to load submissions or courses');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    const result = submissions.filter(s => {
      const matchesCourse = selectedCourse
        ? s.assignment?.course?._id === selectedCourse
        : true;
      const matchesAssignment = selectedAssignment
        ? s.assignment?._id === selectedAssignment
        : true;
      
      // Single date filter (exact match)
      const matchesDate = dateFilter
        ? s.submittedAt?.slice(0, 10) === dateFilter
        : true;
      
      // Date range filters
      let matchesDateRange = true;
      if (dateFromFilter) {
        const submittedDate = new Date(s.submittedAt).toDateString();
        const fromDate = new Date(dateFromFilter).toDateString();
        matchesDateRange = matchesDateRange && new Date(submittedDate) >= new Date(fromDate);
      }
      if (dateToFilter) {
        const submittedDate = new Date(s.submittedAt).toDateString();
        const toDate = new Date(dateToFilter).toDateString();
        matchesDateRange = matchesDateRange && new Date(submittedDate) <= new Date(toDate);
      }

      return matchesCourse && matchesAssignment && matchesDate && matchesDateRange;
    });
    setFiltered(result);
  }, [selectedCourse, selectedAssignment, dateFilter, dateFromFilter, dateToFilter, submissions]);

  useEffect(() => {
    if (selectedCourse) {
      const courseAssignments = submissions
        .filter(s => s.assignment?.course?._id === selectedCourse)
        .map(s => s.assignment)
        .filter((a, index, self) => a && self.findIndex(o => o._id === a._id) === index);
      setAssignments(courseAssignments);
    } else {
      setAssignments([]);
    }
    setSelectedAssignment('');
  }, [selectedCourse, submissions]);

  const handleInputChange = (id, field, value) => {
    setGrades(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleGradeSubmit = async (id) => {
    try {
      const payload = grades[id];
      await axios.patch(`/api/v1/submissions/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Grading saved successfully');
      
      // Refresh the submissions after grading
      const subRes = await axios.get('/api/v1/submissions/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmissions(subRes.data);
      setFiltered(subRes.data);
    } catch (error) {
      console.error('❌ DEBUG: Error saving grade:', error);
      toast.error('Failed to save grade');
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const table = filtered.map(s => [
      s.assignment?.name,
      s.assignment?.course?.title,
      `${s.learner?.firstName} ${s.learner?.lastName}`,
      s.grade || '-',
      new Date(s.submittedAt).toLocaleString(),
    ]);
    autoTable(doc, {
      head: [['Assignment', 'Course', 'Learner', 'Grade', 'Submitted At']],
      body: table,
    });
    doc.save('submissions.pdf');
  };

  const exportCSV = () => {
    const rows = filtered.map(s => ({
      Assignment: s.assignment?.name,
      Course: s.assignment?.course?.title,
      Learner: `${s.learner?.firstName} ${s.learner?.lastName}`,
      Grade: s.grade || '-',
      SubmittedAt: new Date(s.submittedAt).toLocaleString(),
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'submissions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadZIP = async () => {
    try {
      const res = await axios.get('/api/v1/submissions/my/zip', {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'submissions.zip');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('❌ DEBUG: Error downloading ZIP:', error);
      toast.error('Failed to download ZIP');
    }
  };

  const clearAllFilters = () => {
    setSelectedCourse('');
    setSelectedAssignment('');
    setDateFilter('');
    setDateFromFilter('');
    setDateToFilter('');
  };

  return (
    <Container className="my-4">
      <ToastContainer />
      <h4 className="mb-4 text-center">
        📊 Educator Submissions Management
        {(selectedCourse || selectedAssignment || dateFilter || dateFromFilter || dateToFilter) && (
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
            <div>
              <Button variant="success" size="sm" className="me-2" onClick={exportCSV}>
                📊 Export CSV
              </Button>
              <Button variant="danger" size="sm" className="me-2" onClick={exportPDF}>
                📄 Export PDF
              </Button>
              <Button variant="primary" size="sm" onClick={downloadZIP}>
                📦 Download ZIP
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>📚 Course</Form.Label>
                <Form.Select 
                  value={selectedCourse} 
                  onChange={e => setSelectedCourse(e.target.value)}
                >
                  <option value="">All Courses</option>
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>
                      {course.title}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>📝 Assignment</Form.Label>
                <Form.Select 
                  value={selectedAssignment} 
                  onChange={e => setSelectedAssignment(e.target.value)} 
                  disabled={!assignments.length}
                >
                  <option value="">All Assignments</option>
                  {assignments.map(a => (
                    <option key={a._id} value={a._id}>
                      {a.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>📅 Exact Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={dateFilter} 
                  onChange={e => setDateFilter(e.target.value)}
                  placeholder="Exact submission date"
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>📅 From Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={dateFromFilter} 
                  onChange={e => setDateFromFilter(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>📅 To Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={dateToFilter} 
                  onChange={e => setDateToFilter(e.target.value)}
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
                Showing {filtered.length} of {submissions.length} submissions
              </Badge>
              {(selectedCourse || selectedAssignment || dateFilter || dateFromFilter || dateToFilter) && (
                <Badge bg="warning" text="dark" className="ms-2">
                  Filters Active
                </Badge>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading submissions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <h5 className="text-muted">
              {submissions.length === 0 
                ? "📭 No submissions found" 
                : "🔍 No submissions match the current filters"
              }
            </h5>
            <p className="text-muted">
              {submissions.length === 0 
                ? "Students haven't submitted any assignments yet." 
                : "Try adjusting your filter criteria or clear all filters to see more results."
              }
            </p>
            {submissions.length > 0 && (
              <Button variant="outline-primary" onClick={clearAllFilters}>
                🗑️ Clear All Filters
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {filtered.map(s => (
            <Col md={6} lg={4} key={s._id} className="mb-4">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title className="d-flex justify-content-between">
                    <span>{s.assignment?.name}</span>
                    <span className={`badge ${s.grade ? 'bg-success' : 'bg-warning'}`}>
                      {s.grade ? `Grade: ${s.grade}` : 'Not Graded'}
                    </span>
                  </Card.Title>
                  <Card.Text>
                    <strong>📚 Course:</strong> {s.assignment?.course?.title}<br />
                    <strong>👨‍🎓 Learner:</strong> {s.learner?.firstName} {s.learner?.lastName}<br />
                    <strong>📅 Submitted:</strong> {new Date(s.submittedAt).toLocaleString()}<br />
                    <strong>📊 Status:</strong> <span className={`badge ${
                      s.status === 'graded' ? 'bg-success' : 
                      s.status === 'reviewed' ? 'bg-info' : 
                      s.status === 'resubmitted' ? 'bg-warning' : 'bg-secondary'
                    }`}>{s.status || 'submitted'}</span><br />
                    {s.feedback && (
                      <>
                        <strong>💬 Current Feedback:</strong><br />
                        <small className="text-muted">{s.feedback}</small><br />
                      </>
                    )}
                    <strong>📎 File:</strong> <a href={`/${s.fileUrl}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary ms-1">
                      📥 Download Submission
                    </a>
                  </Card.Text>

                  <hr />
                  <h6>✏️ Grade this Submission:</h6>

                  <Form.Group className="mb-2">
                    <Form.Label>Grade</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter grade (0-100)"
                      value={grades[s._id]?.grade || ''}
                      onChange={e => handleInputChange(s._id, 'grade', e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-2">
                    <Form.Label>Feedback</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter feedback for the student..."
                      value={grades[s._id]?.feedback || ''}
                      onChange={e => handleInputChange(s._id, 'feedback', e.target.value)}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={grades[s._id]?.status || s.status || ''}
                      onChange={e => handleInputChange(s._id, 'status', e.target.value)}
                    >
                      <option value="">Select Status</option>
                      <option value="submitted">Submitted</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="graded">Graded</option>
                      <option value="resubmitted">Resubmitted</option>
                    </Form.Select>
                  </Form.Group>

                  <Button onClick={() => handleGradeSubmit(s._id)} variant="primary" size="sm" className="w-100">
                    💾 Save Grade & Feedback
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default EMySubmissions;
