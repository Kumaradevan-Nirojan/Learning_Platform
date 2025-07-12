import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Container, Card, Button, Spinner, Row, Col } from 'react-bootstrap';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable'; // ✅ Import correctly
import { FaDownload } from 'react-icons/fa';

const CoursePage = () => {
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const [course, setCourse] = useState(null);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCourse = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/v1/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourse(data);
    } catch (error) {
      console.error('Error loading course details', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollmentCount = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/v1/enrollments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const count = data.filter((e) => e.course._id === id).length;
      setEnrollmentCount(count);
    } catch (error) {
      console.error('Error fetching enrollment count', error);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Course Details', 14, 16);

    autoTable(doc, {
      startY: 20,
      head: [['Field', 'Value']],
      body: [
        ['Title', course?.title || ''],
        ['Category', course?.category || ''],
        ['Syllabus', course?.syllabus || ''],
        ['Venue', course?.venue || ''],
        ['Medium', course?.medium || ''],
        ['Duration', course?.duration || ''],
        ['Start Date', new Date(course?.startDate).toLocaleDateString()],
        ['End Date', new Date(course?.endDate).toLocaleDateString()],
        ['Educator', `${course?.educator?.firstName || ''} ${course?.educator?.lastName || ''}`],
        ['Enrolled Learners', enrollmentCount.toString()],
      ],
    });

    if (course?.classTimes?.length > 0) {
      const nextY = doc.lastAutoTable.finalY + 10;
      doc.text('Class Schedule', 14, nextY);
      autoTable(doc, {
        startY: nextY + 5,
        head: [['Day', 'Start Time', 'End Time']],
        body: course.classTimes.map((item) => [
          item.day, item.startTime, item.endTime,
        ]),
      });
    }

    doc.save(`${course?.title || 'course-details'}.pdf`);
  };

  useEffect(() => {
    fetchCourse();
    fetchEnrollmentCount();
  }, [id]);

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" /> Loading course details...
      </Container>
    );
  }

  if (!course) {
    return (
      <Container className="text-center my-5">
        <p className="text-danger">Course not found</p>
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <Row className="mb-4">
        <Col>
          <h3>{course.title}</h3>
          <p className="text-muted">{course.category}</p>
        </Col>
        <Col className="text-end">
          <Button className="offset-pnavbar" variant="success" onClick={exportToPDF}>
            <FaDownload className="me-2" />
            Export to PDF
          </Button>
        </Col>
      </Row>

      <Card className="mb-3 p-3 shadow-sm">
        <p><strong>Educator:</strong> {course?.educator?.firstName} {course?.educator?.lastName}</p>
        <p><strong>Syllabus:</strong> {course.syllabus}</p>
        <p><strong>Duration:</strong> {course.duration}</p>
        <p><strong>Start Date:</strong> {new Date(course.startDate).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> {new Date(course.endDate).toLocaleDateString()}</p>
        <p><strong>Medium:</strong> {course.medium}</p>
        <p><strong>Venue:</strong> {course.venue}</p>
        <p><strong>Enrolled Learners:</strong> {enrollmentCount}</p>
      </Card>

      {course.classTimes?.length > 0 && (
        <Card className="p-3 shadow-sm">
          <h5>Class Schedule</h5>
          <ul className="list-unstyled">
            {course.classTimes.map((item, index) => (
              <li key={index} className="mb-2">
                <span className="badge bg-primary me-2">{item.day}</span>
                <strong>{item.startTime}</strong> – <strong>{item.endTime}</strong>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </Container>
  );
};

export default CoursePage;
