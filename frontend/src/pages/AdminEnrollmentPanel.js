// frontend/src/pages/AdminEnrollmentPanel.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Container, Table, Spinner, Button, Badge, Form, Row, Col
} from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';
import 'react-toastify/dist/ReactToastify.css';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

const AdminEnrollmentPanel = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  const [allEnrollments, setAllEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (role !== 'coordinator' && role !== 'admin') {
      toast.error("Unauthorized");
      navigate('/');
    }
  }, [role, navigate]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [enrollmentsRes, coursesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/v1/enrollments', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/v1/courses', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setAllEnrollments(enrollmentsRes.data);
        setCourses(coursesRes.data.courses || coursesRes.data);
      } catch (err) {
        toast.error('Error loading data');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [token]);

  const filtered = allEnrollments.filter((en) => {
    const matchDate = !dateFilter || new Date(en.enrollmentDate).toISOString().slice(0, 10) === dateFilter;
    const matchStatus = !statusFilter || en.paymentStatus === statusFilter;
    const matchCourse = !courseFilter || en.course._id === courseFilter;
    return matchDate && matchStatus && matchCourse;
  });

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('All Learner Enrollment History', 14, 16);
    const rows = filtered.map((e) => [
      `${e.learner?.firstName || '-'} ${e.learner?.lastName || ''}`,
      e.course?.title || '',
      e.paymentStatus,
      e.status,
      e.progressPercentage + '%',
      new Date(e.enrollmentDate).toLocaleDateString(),
    ]);
    doc.autoTable({
      head: [['Learner', 'Course', 'Payment', 'Status', 'Progress', 'Date']],
      body: rows,
      startY: 20,
    });
    doc.save('all_enrollments.pdf');
  };

  const exportCSV = () => {
    const rows = filtered.map((e) => ({
      Learner: `${e.learner?.firstName || '-'} ${e.learner?.lastName || ''}`,
      Course: e.course?.title || '',
      PaymentStatus: e.paymentStatus,
      Status: e.status,
      Progress: e.progressPercentage + '%',
      Date: new Date(e.enrollmentDate).toLocaleDateString(),
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'all_enrollments.csv');
    document.body.appendChild(link);
    link.click();
  };

  return (
    <Container className="my-5">
      <ToastContainer />
      <h4 className="mb-4 text-center">🧑‍💼 Admin Enrollment Summary</h4>

      {/* Charts */}
      <Row className="mb-5">
        <Col md={6}>
          <h6>Enrollments by Payment Status</h6>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Success', value: filtered.filter(e => e.paymentStatus === 'success').length },
                  { name: 'Failed', value: filtered.filter(e => e.paymentStatus === 'failed').length },
                  { name: 'Pending', value: filtered.filter(e => e.paymentStatus === 'pending').length },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                <Cell fill="#28a745" />
                <Cell fill="#dc3545" />
                <Cell fill="#ffc107" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Col>
        <Col md={6}>
          <h6>Enrollments by Course</h6>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={
              courses.map(course => ({
                name: course.title,
                Enrollments: filtered.filter(e => e.course?._id === course._id).length
              }))
            }>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Enrollments" fill="#007bff" />
            </BarChart>
          </ResponsiveContainer>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-3 g-3">
        <Col md={4}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Payment Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={4}>
          <Form.Control
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </Col>
      </Row>

      <div className="d-flex justify-content-end gap-2 mb-3">
        <Button variant="outline-secondary" onClick={exportPDF}>Export PDF</Button>
        <Button variant="outline-success" onClick={exportCSV}>Export CSV</Button>
      </div>

      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Learner</th>
              <th>Course</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Progress</th>
              <th>Enrolled On</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((e) => (
                <tr key={e._id}>
                  <td>{e.learner?.firstName} {e.learner?.lastName}</td>
                  <td>{e.course?.title}</td>
                  <td><Badge bg="secondary">{e.status}</Badge></td>
                  <td>
                    <Badge
                      bg={
                        e.paymentStatus === 'success'
                          ? 'success'
                          : e.paymentStatus === 'failed'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {e.paymentStatus}
                    </Badge>
                  </td>
                  <td>{e.progressPercentage}%</td>
                  <td>{new Date(e.enrollmentDate).toLocaleDateString()}</td>
                  <td>
                    {e.paymentStatus === 'success' && (
                      <Button
                        size="sm"
                        variant="outline-info"
                        onClick={() => navigate(`/receipt/${e._id}`)}
                      >
                        View Receipt
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" className="text-center">No data</td></tr>
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default AdminEnrollmentPanel;
