import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Spinner, Form, Button, Collapse, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const StudentPage = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedStudentIds, setExpandedStudentIds] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  let token = '';
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      token = userObj?.token || '';
    }
  } catch (e) {
    console.error('Error parsing user token from localStorage:', e);
  }

  useEffect(() => {
    const fetchStudents = async () => {
      if (!token) {
        toast.error('Unauthorized: Token not found. Please log in again.');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/v1/enrollments/by-learner', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStudents(response.data);
      } catch (error) {
        console.error('Error fetching students:', error);
        const msg = error.response?.data?.message || 'Failed to load learners';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [token]);

  // ✅ Fix: Call correct route to delete enrollment
  const handleUnenroll = async (courseId, learnerId, courseTitle) => {
    const confirm = window.confirm(`Are you sure you want to unenroll from "${courseTitle}"?`);
    if (!confirm) return;

    try {
      const enrollmentToDelete = students
        .flatMap(s => s.enrolledCourses.map(c => ({ ...c, learnerId: s._id })))
        .find(ec => ec._id === courseId && ec.learnerId === learnerId);

      if (!enrollmentToDelete?.enrollmentId) {
        toast.error('Enrollment ID not found for this course.');
        return;
      }

      await axios.delete(`http://localhost:5000/api/v1/enrollments/${enrollmentToDelete.enrollmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Unenrolled successfully.');

      const updatedStudents = students.map(student => {
        if (student._id === learnerId) {
          return {
            ...student,
            enrolledCourses: student.enrolledCourses.filter(c => c._id !== courseId),
          };
        }
        return student;
      });
      setStudents(updatedStudents);
    } catch (error) {
      console.error('Unenroll failed:', error);
      toast.error(error.response?.data?.message || 'Unenroll failed.');
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Learner Course Enrollment Report', 14, 15);

    filteredStudents.forEach((student, index) => {
      const startY = 25 + index * 10;
      doc.setFontSize(12);
      doc.text(`${student.firstName} ${student.lastName} (${student.email})`, 14, startY);
      const courseData = (student.enrolledCourses || []).map(c => [c.title]);

      doc.autoTable({
        startY: startY + 2,
        head: [['Enrolled Courses']],
        body: courseData.length > 0 ? courseData : [['None']],
        margin: { left: 14 },
        theme: 'striped',
        styles: { fontSize: 10 },
      });
    });

    doc.save('learner_course_enrollments.pdf');
  };

  const handleExportCSV = () => {
    let csv = 'Name,Email,Phone,Country,Course Title\n';
    filteredStudents.forEach(student => {
      const base = [
        `${student.firstName} ${student.lastName}`,
        student.email,
        student.phone || '-',
        student.country || '-',
      ];
      if (student.enrolledCourses?.length > 0) {
        student.enrolledCourses.forEach(course => {
          csv += [...base, course.title].join(',') + '\n';
        });
      } else {
        csv += [...base, 'None'].join(',') + '\n';
      }
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'learner_course_enrollments.csv';
    link.click();
  };

  const toggleExpandAll = () => {
    if (expandedStudentIds.length === filteredStudents.length) {
      setExpandedStudentIds([]);
    } else {
      setExpandedStudentIds(filteredStudents.map(s => s._id));
    }
  };

  const courseOptions = Array.from(
    new Set(students.flatMap(s => s.enrolledCourses?.map(c => c.title) || []))
  );

  const filteredStudents = students.filter(student => {
    const matchSearch =
      student.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      student.email?.toLowerCase().includes(search.toLowerCase());

    const matchCourse =
      !selectedCourse ||
      student.enrolledCourses?.some(course => course.title === selectedCourse);

    const matchDate =
      (!startDate && !endDate) ||
      student.enrolledCourses?.some(course => {
        const enrolledAt = new Date(course.enrolledAt || course.createdAt || student.createdAt);
        return (!startDate || enrolledAt >= startDate) && (!endDate || enrolledAt <= endDate);
      });

    return matchSearch && matchCourse && matchDate;
  });

  return (
    <div>
      <h4 className="mb-3">Learners</h4>

      <Row className="mb-3 g-2">
        <Col md={3}>
          <Form.Control
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
            <option value="">All Courses</option>
            {courseOptions.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={2}>
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            placeholderText="Start Date"
            className="form-control"
          />
        </Col>
        <Col md={2}>
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            placeholderText="End Date"
            className="form-control"
          />
        </Col>
        <Col md={2} className="d-flex gap-2">
          <Button variant="outline-primary" onClick={toggleExpandAll}>
            {expandedStudentIds.length === filteredStudents.length ? 'Collapse All' : 'Expand All'}
          </Button>
          <Button variant="success" onClick={handleExportPDF}>PDF</Button>
          <Button variant="info" onClick={handleExportCSV}>CSV</Button>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Country</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map(student => (
                <React.Fragment key={student._id}>
                  <tr>
                    <td>{student.firstName} {student.lastName}</td>
                    <td>{student.email}</td>
                    <td>{student.phone || '-'}</td>
                    <td>{student.country || '-'}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="info"
                        onClick={() => {
                          if (expandedStudentIds.includes(student._id)) {
                            setExpandedStudentIds(prev => prev.filter(id => id !== student._id));
                          } else {
                            setExpandedStudentIds(prev => [...prev, student._id]);
                          }
                        }}
                      >
                        {expandedStudentIds.includes(student._id) ? 'Hide Courses' : 'View Courses'}
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="5" style={{ padding: 0, borderTop: 'none' }}>
                      <Collapse in={expandedStudentIds.includes(student._id)}>
                        <div className="p-3">
                          {student.enrolledCourses?.length > 0 ? (
                            <Table size="sm" bordered>
                              <thead>
                                <tr>
                                  <th>Course Title</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {student.enrolledCourses.map(course => (
                                  <tr key={course._id}>
                                    <td>{course.title}</td>
                                    <td>
                                      <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() =>
                                          handleUnenroll(course._id, student._id, course.title)
                                        }
                                      >
                                        Unenroll
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          ) : (
                            <div>No enrolled courses.</div>
                          )}
                        </div>
                      </Collapse>
                    </td>
                  </tr>
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">No learners found.</td>
              </tr>
            )}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default StudentPage;
