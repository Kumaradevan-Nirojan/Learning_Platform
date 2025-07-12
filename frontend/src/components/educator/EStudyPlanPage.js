// frontend/src/components/educator/EStudyPlanPage.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Row, Col, Card, Spinner, Button, Badge, Accordion } from 'react-bootstrap';
import axios from 'axios';
import StudyPlanForm from '../StudyPlanForm';
import ErrorBoundary from '../ErrorBoundary';
import { toast, ToastContainer } from 'react-toastify';
import { FaFilePdf, FaFileWord, FaFilePowerpoint, FaFileAlt, FaDownload, FaEye } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

const EStudyPlanPage = () => {
  const token = localStorage.getItem('token');
  
  // Memoize user object to prevent infinite re-renders
  const user = useMemo(() => {
    try {
      const rawUser = localStorage.getItem('user');
      if (rawUser && rawUser !== 'undefined') {
        return JSON.parse(rawUser);
      }
    } catch (error) {
      console.warn('Invalid user data in localStorage:', error);
    }
    return null;
  }, []);
  
  const [studyPlans, setStudyPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleting, setDeleting] = useState(null);

  // Safe toast wrapper
  const safeToast = useCallback((type, message) => {
    try {
      // Ensure message is a string
      const msg = typeof message === 'string' ? message : 'An error occurred';
      
      if (type === 'success') {
        toast.success(msg, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
        });
      } else if (type === 'error') {
        toast.error(msg, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
        });
      } else {
        toast(msg, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
        });
      }
    } catch (error) {
      console.error('Toast error:', error);
      console.log(message); // Fallback to console
    }
  }, []);

  const fetchStudyPlans = useCallback(async () => {
    if (!token || !user?._id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/v1/studyplans', {
        headers: { Authorization: `Bearer ${token}` },
        validateStatus: status => status === 200 || status === 304
      });
      const data = response.data || [];
      const myPlans = data.filter(
        plan => plan && plan.educator && plan.educator._id && 
        plan.educator._id.toString() === user._id.toString()
      );
      setStudyPlans(myPlans);
    } catch (err) {
      console.error('Error fetching study plans:', err);
      safeToast('error', 'Failed to fetch study plans');
    } finally {
      setLoading(false);
    }
  }, [token, user?._id, safeToast]); // Only depend on token, user ID, and safeToast

  useEffect(() => {
    fetchStudyPlans();
  }, [refresh, fetchStudyPlans]);

  // Early return after all hooks are defined
  if (!token || !user || !user._id) {
    return (
      <Container className="my-4">
        <div className="alert alert-warning text-center">
          <h5>Access Denied</h5>
          <p>Please log in as an educator to access study plans.</p>
        </div>
      </Container>
    );
  }

  const handleEdit = (plan) => {
    setEditData(plan);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!id) {
      safeToast('error', 'Invalid study plan ID');
      return;
    }
    
    if (deleting === id) return; // Prevent double clicks
    
    if (!window.confirm('Are you sure you want to delete this study plan?')) return;
    
    setDeleting(id);
    try {
      await axios.delete(`http://localhost:5000/api/v1/studyplans/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000, // 10 second timeout
      });
      safeToast('success', 'Study plan deleted');
      setRefresh(prev => !prev);
    } catch (err) {
      console.error('Delete error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete study plan';
      safeToast('error', errorMessage);
    } finally {
      setDeleting(null);
    }
  };

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

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = async (fileUrl, filename) => {
    try {
      // Extract filename from fileUrl (e.g., '/uploads/study-materials/filename.pdf' -> 'filename.pdf')
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

  const handleView = (fileUrl) => {
    // Extract filename from fileUrl
    const fileName = fileUrl.split('/').pop();
    const viewUrl = `http://localhost:5000/api/v1/studyplans/view/${fileName}`;
    window.open(viewUrl, '_blank');
  };

  return (
    <ErrorBoundary>
      <Container className="my-4">
        <ToastContainer 
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss={false}
          draggable={false}
          pauseOnHover={false}
          limit={1}
          theme="light"
          enableMultiContainer={false}
          containerId="study-plan-toast"
        />
        <h4 className="text-center mb-4">Educator: Study Plan Management</h4>

        <Row>
          {/* Left: Create/Edit Form */}
          <Col md={6}>
            <Card className="p-3 shadow-sm">
              <h5>{editData ? 'Edit Study Plan' : 'Create New Study Plan'}</h5>
              <StudyPlanForm
                existingData={editData}
                onSuccess={() => {
                  setRefresh(prev => !prev);
                  setEditData(null);
                }}
              />
            </Card>
          </Col>

          {/* Right: List of Study Plans */}
          <Col md={6}>
            <Card className="p-3 shadow-sm">
              <h5>Your Study Plans</h5>
              {loading ? (
                <div className="text-center py-3">
                  <Spinner animation="border" />
                </div>
              ) : studyPlans.length > 0 ? (
                <Accordion defaultActiveKey="0">
                  {studyPlans.map((plan, index) => {
                    if (!plan || !plan._id) return null;
                    return (
                      <Accordion.Item eventKey={index.toString()} key={plan._id}>
                        <Accordion.Header>
                          <div className="w-100 d-flex justify-content-between align-items-center me-3">
                            <div>
                              <strong>{plan.title || 'Untitled Plan'}</strong>
                              <br />
                              <small className="text-muted">Course: {plan.course?.title || 'N/A'}</small>
                            </div>
                            <div>
                              {plan.materials && plan.materials.length > 0 && (
                                <Badge bg="success" className="me-2">
                                  📎 {plan.materials.length} Material(s) Attached
                                </Badge>
                              )}
                              <Badge bg="info">
                                {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : 'Unknown date'}
                              </Badge>
                            </div>
                          </div>
                        </Accordion.Header>
                      <Accordion.Body>
                        <div className="mb-3">
                          <h6>Description:</h6>
                          <p className="text-muted mb-3">{plan.description}</p>
                        </div>

                        {/* Study Materials Section */}
                        {plan.materials && plan.materials.length > 0 ? (
                          <div className="mb-3">
                            <h6>📚 Study Materials:</h6>
                            {plan.materials.map((material, index) => (
                              <Card key={index} className="p-3 bg-light border mb-2">
                                <div className="d-flex align-items-center justify-content-between">
                                  <div className="d-flex align-items-center">
                                    <div className="me-3" style={{ fontSize: '1.5rem' }}>
                                      {getFileIcon(material.fileName)}
                                    </div>
                                    <div>
                                      <h6 className="mb-1">
                                        {material.fileName}
                                      </h6>
                                      <small className="text-muted">
                                        Uploaded {new Date(plan.createdAt).toLocaleDateString()}
                                      </small>
                                    </div>
                                  </div>
                                  <div className="d-flex gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline-primary"
                                      onClick={() => handleView(material.fileUrl)}
                                      title="View File"
                                    >
                                      <FaEye />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline-success"
                                      onClick={() => handleDownload(material.fileUrl, material.fileName)}
                                      title="Download File"
                                    >
                                      <FaDownload />
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="mb-3">
                            <h6>📚 Study Materials:</h6>
                            <div className="alert alert-info">
                              <small>No study materials uploaded for this plan.</small>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => handleEdit(plan)}
                          >
                            Edit Plan
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => handleDelete(plan._id)}
                            disabled={deleting === plan._id}
                          >
                            {deleting === plan._id ? (
                              <>
                                <Spinner size="sm" animation="border" className="me-1" />
                                Deleting...
                              </>
                            ) : (
                              'Delete Plan'
                            )}
                          </Button>
                        </div>
                                          </Accordion.Body>
                      </Accordion.Item>
                    );
                  })}
                  </Accordion>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted mb-3">No study plans created yet.</p>
                  <small className="text-muted">
                    Create your first study plan using the form on the left.
                  </small>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Container>
    </ErrorBoundary>
  );
};

export default EStudyPlanPage;
