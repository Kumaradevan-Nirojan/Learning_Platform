// frontend/src/components/learner/StudyPlanList.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ListGroup, Spinner, Form, Button, Card, Badge, Accordion, Alert } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { FaFilePdf, FaFileWord, FaFilePowerpoint, FaFileAlt, FaDownload, FaEye, FaLock, FaUser, FaCalendarAlt } from 'react-icons/fa';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import 'react-toastify/dist/ReactToastify.css';

const StudyPlanList = () => {
  const token = localStorage.getItem('token');
  const [studyPlans, setStudyPlans] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [paidCourseIds, setPaidCourseIds] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  // Safe toast wrapper
  const safeToast = (type, message) => {
    try {
      if (type === 'success') {
        toast.success(message);
      } else if (type === 'error') {
        toast.error(message);
      } else {
        toast(message);
      }
    } catch (error) {
      console.log(message);
    }
  };

  // 🚫 Redirect inactive users
  useEffect(() => {
    const isActive = localStorage.getItem('isActive');
    if (isActive === 'false') {
      window.location.href = '/inactive';
    }
  }, []);

  // 📚 Fetch all courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/v1/courses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourses(res.data.courses || res.data);
      } catch (err) {
        safeToast('error', 'Failed to load courses');
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, [token]);

  // 📘 Fetch study plans and learner enrollments
  useEffect(() => {
    const fetchData = async () => {
      setLoadingPlans(true);
      try {
        const [planRes, enrollRes] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/v1/studyplans${selectedCourse ? `?course=${selectedCourse}` : ''}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get('http://localhost:5000/api/v1/enrollments', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const enrollmentData = enrollRes.data;
        setEnrollments(enrollmentData);

        const paidIds = enrollmentData
          .filter((e) => e.paymentStatus === 'success')
          .map((e) => e.course._id);

        setPaidCourseIds(paidIds);

        const relevantPlans = planRes.data.filter((plan) =>
          enrollmentData.some((e) => e.course._id === plan.course._id)
        );

        console.log('Study plans loaded:', relevantPlans); // Debug log
        setStudyPlans(relevantPlans);
      } catch (err) {
        safeToast('error', 'Failed to load study plans');
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchData();
  }, [selectedCourse, token]);

  // ⏳ Access control based on payment or 7-day trial
  const canAccessMaterial = (courseId, createdAt) => {
    const enrollment = enrollments.find((e) => e.course._id === courseId);
    if (!enrollment) return false;

    const enrolledDate = new Date(enrollment.createdAt);
    const today = new Date();
    const diffDays = Math.ceil((today - enrolledDate) / (1000 * 60 * 60 * 24));

    return enrollment.paymentStatus === 'success' || diffDays <= 7;
  };

  // Get file icon based on file extension
  const getFileIcon = (filename) => {
    if (!filename) return <FaFileAlt />;
    
    const extension = filename.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FaFilePdf className="text-danger" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="text-primary" />;
      case 'ppt':
      case 'pptx':
        return <FaFilePowerpoint className="text-warning" />;
      default:
        return <FaFileAlt className="text-secondary" />;
    }
  };

  // Handle file download
  const handleDownload = async (fileUrl, filename, canAccess) => {
    if (!canAccess) {
      safeToast('error', 'Payment required to download this material');
      return;
    }

    try {
      // Extract filename from fileUrl
      const fileName = fileUrl.split('/').pop();
      
      const response = await axios.get(`http://localhost:5000/api/v1/studyplans/download/${fileName}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      safeToast('success', 'Download started');
    } catch (err) {
      console.error('Download error:', err);
      safeToast('error', 'Failed to download file');
    }
  };

  // Handle file view
  const handleView = (fileUrl, canAccess) => {
    if (!canAccess) {
      safeToast('error', 'Payment required to view this material');
      return;
    }

    // Extract filename from fileUrl
    const fileName = fileUrl.split('/').pop();
    const viewUrl = `http://localhost:5000/api/v1/studyplans/view/${fileName}`;
    window.open(viewUrl, '_blank');
  };

  // 📤 Export study plans to PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Study Plan List', 14, 14);
    const rows = studyPlans.map((plan, i) => [
      i + 1,
      plan.title,
      plan.course?.title,
      `${plan.educator?.firstName || ''} ${plan.educator?.lastName || ''}`,
    ]);
    doc.autoTable({
      head: [['#', 'Title', 'Course', 'Educator']],
      body: rows,
    });
    doc.save('study_plans.pdf');
  };

  return (
    <>
      <ToastContainer 
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover={false}
        limit={3}
        theme="light"
      />
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="mb-3">📘 Study Plans</h5>
        <Button variant="outline-primary" size="sm" onClick={exportPDF}>
          Export PDF
        </Button>
      </div>

      <Form.Group className="mb-3" controlId="courseFilter">
        <Form.Label>Filter by Course</Form.Label>
        {loadingCourses ? (
          <Spinner animation="border" size="sm" />
        ) : (
          <Form.Select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">-- All Courses --</option>
            {courses
              .filter((c) =>
                enrollments.some((e) => e.course._id === c._id)
              )
              .map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
          </Form.Select>
        )}
      </Form.Group>

      {loadingPlans ? (
        <div className="text-center my-3">
          <Spinner animation="border" /> Loading study plans...
        </div>
      ) : studyPlans.length > 0 ? (
        <div className="row">
          {studyPlans.map((plan, index) => {
            if (!plan || !plan._id) return null;
            const canAccess = canAccessMaterial(plan.course._id, plan.createdAt);
            
            return (
              <div className="col-lg-6 col-xl-4 mb-4" key={plan._id}>
                <Card 
                  className="h-100 shadow-sm border-0" 
                  style={{ 
                    transition: 'transform 0.2s ease-in-out',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
                >
                  <Card.Header className="bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h5 className="mb-1 text-white">{plan.title || 'Untitled Plan'}</h5>
                        <small className="text-white-50">
                          {plan.course?.title || 'N/A'}
                        </small>
                      </div>
                      <div className="d-flex flex-column gap-1">
                        {plan.materials && plan.materials.length > 0 && (
                          <Badge bg="light" text="dark" className="d-flex align-items-center gap-1">
                            📎 {plan.materials.length}
                          </Badge>
                        )}
                        {!canAccess && (
                          <Badge bg="warning" className="d-flex align-items-center gap-1">
                            <FaLock size={10} /> Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card.Header>
                  
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-3">
                      <small className="text-muted d-flex align-items-center gap-1">
                        <FaUser className="text-primary" />
                        Educator: {plan.educator?.firstName || 'N/A'} {plan.educator?.lastName || ''}
                      </small>
                      <small className="text-muted d-flex align-items-center gap-1 mt-1">
                        <FaCalendarAlt className="text-info" />
                        Created: {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : 'Unknown date'}
                      </small>
                    </div>

                    <div className="mb-3">
                      <h6 className="text-secondary">Description:</h6>
                      <p className="text-muted small" style={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.4em',
                        maxHeight: '4.2em'
                      }}>
                        {plan.description || 'No description provided'}
                      </p>
                    </div>

                    {/* Study Materials Section */}
                    <div className="flex-grow-1">
                      {plan.materials && plan.materials.length > 0 ? (
                        <div>
                          <h6 className="text-secondary d-flex align-items-center gap-2">
                            📚 Study Materials
                            <Badge bg="secondary" pill>{plan.materials.length}</Badge>
                          </h6>
                          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {plan.materials.map((material, materialIndex) => {
                              const isPreview = !canAccess && materialIndex === 0;
                              const shouldShow = canAccess || materialIndex === 0;
                              
                              if (!shouldShow) return null;
                              
                              return (
                                <div key={materialIndex} className={`border rounded p-2 mb-2 ${!canAccess ? 'bg-light' : 'bg-white'}`}>
                                  <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center flex-grow-1">
                                      <div className="me-2" style={{ fontSize: '1.2rem' }}>
                                        {getFileIcon(material.fileName)}
                                      </div>
                                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                        <div className="fw-bold small text-truncate" title={material.fileName}>
                                          {material.fileName}
                                          {isPreview && (
                                            <Badge bg="info" size="sm" className="ms-1">Preview</Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="d-flex gap-1">
                                      <Button
                                        size="sm"
                                        variant={canAccess ? "outline-primary" : "outline-secondary"}
                                        onClick={() => handleView(material.fileUrl, canAccess)}
                                        title={canAccess ? "View File" : "Payment required"}
                                        disabled={!canAccess && !isPreview}
                                        style={{ padding: '4px 8px' }}
                                      >
                                        <FaEye size={12} />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant={canAccess ? "outline-success" : "outline-secondary"}
                                        onClick={() => handleDownload(material.fileUrl, material.fileName, canAccess)}
                                        title={canAccess ? "Download File" : "Payment required"}
                                        disabled={!canAccess}
                                        style={{ padding: '4px 8px' }}
                                      >
                                        <FaDownload size={12} />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            {!canAccess && plan.materials.length > 1 && (
                              <div className="text-center text-muted small mt-2">
                                <FaLock className="me-1" />
                                {plan.materials.length - 1} more material(s) available with payment
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h6 className="text-secondary">📚 Study Materials</h6>
                          <div className="text-center text-muted py-3">
                            <FaFileAlt size={24} className="mb-2 opacity-50" />
                            <br />
                            <small>No materials available</small>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card.Body>

                  {!canAccess && plan.materials && plan.materials.length > 0 && (
                    <Card.Footer className="bg-warning bg-opacity-10 border-warning">
                      <small className="text-warning d-flex align-items-center gap-1">
                        <FaLock />
                        <strong>Limited Access:</strong> Complete payment for full access
                      </small>
                    </Card.Footer>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        <Alert variant="info" className="text-center">
          <h5>No Study Plans Found</h5>
          <p>You don't have access to any study plans yet. Please enroll in a course to view study materials.</p>
        </Alert>
      )}
    </>
  );
};

export default StudyPlanList;
