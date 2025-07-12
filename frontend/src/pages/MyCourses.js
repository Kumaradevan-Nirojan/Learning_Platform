import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Card, Row, Col, Spinner, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { FaCalendarAlt, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

const MyCourses = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrollments = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/v1/enrollments', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sorted = [...data].sort(
        (a, b) => new Date(b.enrollmentDate) - new Date(a.enrollmentDate)
      );
      setEnrollments(sorted);
    } catch (err) {
      toast.error('Failed to load your courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [token]);

  const handleUnenroll = async (enrollmentId, courseName) => {
    if (!window.confirm(`Are you sure you want to unenroll from "${courseName}"? This action cannot be undone.`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/v1/enrollments/${enrollmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Successfully unenrolled from "${courseName}"`);
      setEnrollments(enrollments.filter((e) => e._id !== enrollmentId));
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Failed to unenroll');
      }
      console.error(err);
    }
  };

  const handlePayNow = (enrollmentId) => {
    if (!enrollmentId) {
      toast.error("Invalid enrollment ID");
      return;
    }
    navigate(`/payment/${enrollmentId}`);
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" /> Loading your courses...
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <ToastContainer position="top-center" />
      <h4 className="mb-4 text-center">My Courses</h4>
      <Row xs={1} md={2} lg={3} className="g-4">
        {enrollments.length > 0 ? (
          enrollments.map((enrollment) => {
            const { course, _id, paymentStatus, enrollmentDate } = enrollment;
            const startDate = course?.startDate ? new Date(course.startDate).toLocaleDateString() : '';
            const endDate = course?.endDate ? new Date(course.endDate).toLocaleDateString() : '';
            
            // Calculate days since course started
            const courseStartDate = new Date(course?.startDate);
            const today = new Date();
            const daysSinceStart = Math.floor((today - courseStartDate) / (1000 * 60 * 60 * 24));
            const isUnenrollable = daysSinceStart >= 0 && daysSinceStart <= 7; // Can unenroll within 7 days after course starts
            const daysLeft = Math.max(0, 7 - daysSinceStart);

            return (
              <Col key={_id}>
                <Card className="h-100 shadow-sm">
                  <Card.Body>
                    <Card.Title className="text-primary">{course?.title || 'Untitled'}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{course?.category}</Card.Subtitle>
                    <div className="mb-2">
                      <strong className="text-success">Rs. {course?.fee?.toLocaleString() || '0'}</strong>
                      {course?.fee === 0 && <span className="badge bg-success ms-2">FREE</span>}
                    </div>
                    <Card.Text>
                      <strong>Venue:</strong> {course?.venue || 'N/A'} <br />
                      <strong>Medium:</strong> {course?.medium || 'N/A'} <br />
                      <strong>Duration:</strong> {course?.duration || 'N/A'} <br />
                      <strong>Status:</strong> {enrollment?.status || 'N/A'} <br />
                      <strong>Payment:</strong> 
                      <span className={`badge ms-2 ${
                        paymentStatus === 'success' ? 'bg-success' : 
                        paymentStatus === 'pending' ? 'bg-warning' : 'bg-danger'
                      }`}>
                        {paymentStatus}
                      </span>
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer className="text-center">
                    <small className="text-muted">
                      <strong>Course Duration:</strong> {startDate} – {endDate}
                    </small>
                    <br />
                    <small className="text-muted">
                      <strong>Enrolled:</strong> {new Date(enrollmentDate).toLocaleDateString()}
                    </small>
                    <br />
                    
                    {paymentStatus !== 'success' && (
                      <Button
                        variant="warning"
                        size="sm"
                        className="mt-2 w-100"
                        onClick={() => handlePayNow(_id)}
                      >
                        Complete Payment
                      </Button>
                    )}
                    
                    {paymentStatus === 'success' && isUnenrollable && (
                      <div className="mt-2">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="w-100"
                          onClick={() => handleUnenroll(_id, course?.title)}
                        >
                          Unenroll ({daysLeft} days left)
                        </Button>
                        <small className="text-muted d-block mt-1">
                          You can unenroll within 7 days of course start
                        </small>
                      </div>
                    )}
                    
                    {paymentStatus === 'success' && !isUnenrollable && daysSinceStart > 7 && (
                      <small className="text-muted d-block mt-2">
                        Unenrollment period has expired
                      </small>
                    )}
                    
                    {paymentStatus === 'success' && daysSinceStart < 0 && (
                      <small className="text-info d-block mt-2">
                        Unenrollment available once course starts
                      </small>
                    )}
                  </Card.Footer>
                </Card>
              </Col>
            );
          })
        ) : (
          <Col>
            <p className="text-center text-muted">
              You are not enrolled in any courses yet.
            </p>
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default MyCourses;
