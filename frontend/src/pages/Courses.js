import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Card,
  Button,
  Spinner,
  Modal,
  Form,
  Row,
  Col,
  Container
} from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import 'react-toastify/dist/ReactToastify.css';
import { getCourseImageUrl } from '../utils/profileUtils';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState({ category: '', medium: '', venue: '' });
  const [sortBy, setSortBy] = useState('');

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      setUser(JSON.parse(u));
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async (customFilter = filter) => {
    setLoading(true);
    try {
      const params = {};
      if (customFilter.category) params.category = customFilter.category;
      if (customFilter.medium) params.medium = customFilter.medium;
      if (customFilter.venue) params.venue = customFilter.venue;

      console.log('Sending filters to backend:', params); // Debug log

      const { data } = await axios.get('http://localhost:5000/api/v1/courses', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      console.log(`Received ${data.length || (data.courses && data.courses.length) || 0} courses from backend`); // Debug log
      setCourses(data.courses || data);
    } catch (err) {
      toast.error('Failed to load courses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilter = { ...filter, [name]: value };
    setFilter(updatedFilter);
    fetchCourses(updatedFilter);
  };

  const resetFilters = () => {
    const emptyFilter = { category: '', medium: '', venue: '' };
    setFilter(emptyFilter);
    fetchCourses(emptyFilter);
  };

  const handleViewDetails = (course) => {
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleEnroll = async (courseId) => {
    if (!token) {
      toast.warning('Please login first to enroll');
      return navigate('/login');
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/v1/enrollments',
        { course: courseId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const enrollmentId = response.data._id;
      toast.success('Enrollment created! Redirecting to payment...');
      
      // Redirect to payment page
      setTimeout(() => {
        navigate(`/payment/${enrollmentId}`);
      }, 1000);
      
    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Enrollment failed');
      }
      console.error(err);
    }
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Title", "Category", "Fee", "Medium", "Venue"];
    const tableRows = courses.map(course => [
      course.title,
      course.category,
      course.fee,
      course.medium,
      course.venue
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows
    });

    doc.save("courses.pdf");
  };

  return (
    <Container>
      <ToastContainer />
      <h2 className="my-4">Available Courses</h2>

      {/* Filter Controls */}
      <Form className="mb-4">
        <Row>
          <Col>
            <Form.Control
              as="select"
              name="category"
              value={filter.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="Engineering">Engineering</option>
              <option value="Science and Technology">Science and Technology</option>
              <option value="Programming and Web Development">Programming and Web Development</option>
              <option value="Commerce and Management">Commerce and Management</option>
            </Form.Control>
          </Col>
          <Col>
            <Form.Control
              as="select"
              name="medium"
              value={filter.medium}
              onChange={handleFilterChange}
            >
              <option value="">All Mediums</option>
              <option value="English">English</option>
              <option value="Tamil">Tamil</option>
              <option value="Sinhala">Sinhala</option>
            </Form.Control>
          </Col>
          <Col>
            <Form.Control
              as="select"
              name="venue"
              value={filter.venue}
              onChange={handleFilterChange}
            >
              <option value="">All Venues</option>
              <option value="Online">Online</option>
              <option value="Face to Face">Face to Face</option>
              <option value="Offline">Offline</option>
            </Form.Control>
          </Col>
          <Col>
            <Button variant="secondary" onClick={resetFilters} className="me-2">
              Reset
            </Button>
            <Button variant="success" onClick={exportPDF}>
              Export to PDF
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Course List */}
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Row>
          {courses.length === 0 ? (
            <p>No courses found</p>
          ) : (
            courses.map((course) => (
              <Col md={4} key={course._id} className="mb-3">
                <Card className="h-100 shadow-sm">
                  {/* Course Image */}
                  {course.imageUrl ? (
                    <Card.Img 
                      variant="top" 
                      src={getCourseImageUrl(course.imageUrl)}
                      alt={course.title}
                      style={{ 
                        height: '200px', 
                        objectFit: 'cover' 
                      }}
                      crossOrigin="anonymous"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        console.error('Failed to load course image:', course.imageUrl);
                      }}
                    />
                  ) : (
                    <div 
                      className="d-flex align-items-center justify-content-center bg-light"
                      style={{ height: '200px' }}
                    >
                      <div className="text-center text-muted">
                        <i className="bi bi-image" style={{ fontSize: '3rem' }}></i>
                        <div>Course Image</div>
                      </div>
                    </div>
                  )}
                  
                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="text-primary">{course.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted">{course.category}</Card.Subtitle>
                    <div className="mb-2">
                      <strong className="text-success h5">Rs. {course.fee}</strong>
                      {course.fee === 0 && <span className="badge bg-success ms-2">FREE</span>}
                    </div>
                    <Card.Text>
                      <small className="text-muted">
                        <strong>Medium:</strong> {course.medium} | <strong>Venue:</strong> {course.venue}
                      </small>
                    </Card.Text>
                    <div className="mt-auto">
                      <Button
                        variant="outline-info"
                        onClick={() => handleViewDetails(course)}
                        className="me-2 mb-2"
                        size="sm"
                      >
                        View Details
                      </Button>
                      {user?.role === 'learner' && (
                        <Button
                          variant="primary"
                          onClick={() => handleEnroll(course._id)}
                          className="mb-2"
                          size="sm"
                        >
                          {course.fee === 0 ? 'Enroll Free' : 'Enroll & Pay'}
                        </Button>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>
      )}

      {/* Course Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        {selectedCourse && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selectedCourse.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {/* Course Image in Modal */}
              {selectedCourse.imageUrl && (
                <div className="text-center mb-3">
                  <img 
                    src={getCourseImageUrl(selectedCourse.imageUrl)}
                    alt={selectedCourse.title}
                    className="img-fluid rounded"
                    style={{ maxHeight: '300px', objectFit: 'cover' }}
                    crossOrigin="anonymous"
                  />
                </div>
              )}
              
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Category:</strong> {selectedCourse.category}</p>
                  <p><strong>Fee:</strong> Rs. {selectedCourse.fee}</p>
                  <p><strong>Duration:</strong> {selectedCourse.duration} weeks</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Medium:</strong> {selectedCourse.medium}</p>
                  <p><strong>Venue:</strong> {selectedCourse.venue}</p>
                </div>
              </div>
              
              {selectedCourse.syllabus && (
                <div>
                  <strong>Syllabus:</strong>
                  <p className="mt-2">{selectedCourse.syllabus}</p>
                </div>
              )}
              
              {/* Class Schedule Section */}
              {selectedCourse.classTimes && selectedCourse.classTimes.length > 0 && (
                <div className="mt-3">
                  <strong>Class Schedule:</strong>
                  <div className="mt-2">
                    {selectedCourse.classTimes.map((schedule, index) => (
                      <div key={index} className="mb-1">
                        <span className="badge bg-primary me-2">{schedule.day}</span>
                        <span>{schedule.startTime} - {schedule.endTime}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Start and End Dates */}
              {(selectedCourse.startDate || selectedCourse.endDate) && (
                <div className="mt-3">
                  <div className="row">
                    {selectedCourse.startDate && (
                      <div className="col-md-6">
                        <p><strong>Start Date:</strong> {new Date(selectedCourse.startDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {selectedCourse.endDate && (
                      <div className="col-md-6">
                        <p><strong>End Date:</strong> {new Date(selectedCourse.endDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Educator Information */}
              {selectedCourse.educator && (
                <div className="mt-3">
                  <p><strong>Educator:</strong> {selectedCourse.educator.firstName} {selectedCourse.educator.lastName}</p>
                </div>
              )}
            </Modal.Body>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default Courses;
