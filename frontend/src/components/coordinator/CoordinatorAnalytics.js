import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Container, Row, Col, Spinner, Card, Button, Form } from 'react-bootstrap';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { toast } from 'react-toastify';
import { CSVLink } from 'react-csv';
import { useReactToPrint } from 'react-to-print';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA00FF'];

const CoordinatorAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [categoryData, setCategoryData] = useState([]);
  const [learnerData, setLearnerData] = useState([]);
  const [filteredLearnerData, setFilteredLearnerData] = useState([]);
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [filteredEnrollmentData, setFilteredEnrollmentData] = useState([]);
  const [sortField, setSortField] = useState('title');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const printRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Coordinator_Analytics_Report',
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/v1/dashboard/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCategoryData(res.data.categoryDistribution || []);
        setLearnerData(res.data.learnersPerCourse || []);
        setEnrollmentData(res.data.enrollmentsOverTime || []);
        setFilteredEnrollmentData(res.data.enrollmentsOverTime || []);
      } catch (err) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'coordinator') {
      fetchAnalytics();
    } else {
      toast.error('Unauthorized access');
    }
  }, [token, user]);

  useEffect(() => {
    const sortedData = [...learnerData].sort((a, b) => {
      if (sortField === 'learners') {
        return b.learners - a.learners;
      } else {
        return a.title.localeCompare(b.title);
      }
    });
    setFilteredLearnerData(sortedData);
  }, [learnerData, sortField]);

  useEffect(() => {
    if (startDate && endDate) {
      const filtered = enrollmentData.filter(e => {
        const d = new Date(e.fullDate);
        return d >= startDate && d <= endDate;
      });
      setFilteredEnrollmentData(filtered);
    } else {
      setFilteredEnrollmentData(enrollmentData);
    }
  }, [startDate, endDate, enrollmentData]);

  if (!user || user.role !== 'coordinator') {
    return <Container className="text-center my-5"><p>Unauthorized</p></Container>;
  }

  if (loading) {
    return <Container className="text-center my-5"><Spinner animation="border" /></Container>;
  }

  return (
    <Container className="my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="mb-0">Coordinator Analytics</h4>
        <Button variant="outline-secondary" size="sm" onClick={handlePrint}>Print Report</Button>
      </div>

      <div ref={printRef}>
        <Row className="mb-4">
          <Col md={6} className="mb-3 mb-md-0">
            <Card className="p-3 shadow-sm">
              <h6 className="text-center">Course Categories</h6>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="category" outerRadius={100} label>
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="p-3 shadow-sm">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="text-center">Learners per Course</h6>
                <Form.Select size="sm" style={{ width: 'auto' }} value={sortField} onChange={e => setSortField(e.target.value)}>
                  <option value="title">Sort by Title</option>
                  <option value="learners">Sort by Learners</option>
                </Form.Select>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={filteredLearnerData} margin={{ top: 5, right: 20, bottom: 30, left: 0 }}>
                  <XAxis dataKey="title" interval={0} angle={-30} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="learners" fill="#007BFF" />
                </BarChart>
              </ResponsiveContainer>
              <div className="text-center mt-3">
                <CSVLink
                  data={filteredLearnerData}
                  filename="learners-per-course.csv"
                  className="btn btn-sm btn-outline-primary"
                >
                  Export CSV
                </CSVLink>
              </div>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col>
            <Card className="p-3 shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Enrollments Over Time</h6>
                <div className="d-flex gap-2 align-items-center">
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    placeholderText="Start Date"
                    className="form-control form-control-sm"
                  />
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    placeholderText="End Date"
                    className="form-control form-control-sm"
                  />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={filteredEnrollmentData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="enrollments" stroke="#28A745" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default CoordinatorAnalytics;
