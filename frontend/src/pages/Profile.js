import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Image, Modal } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/Dashboard.css';
import { updateLocalStorageProfile, triggerProfileUpdate, getAvatarUrl } from '../utils/profileUtils';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/v1/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Profile loaded:', response.data.firstName, response.data.lastName);
      
      setUser(response.data);
      setFormData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        phone: response.data.phone || '',
        address: response.data.address || '',
        country: response.data.country || '',
        dob: response.data.dob ? new Date(response.data.dob).toISOString().split('T')[0] : '',
        sex: response.data.sex || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }

      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const response = await axios.post('http://localhost:5000/api/v1/users/upload-avatar', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Avatar uploaded successfully');
      
      const updatedUser = { ...user, avatarUrl: response.data.avatarUrl };
      localStorage.setItem('avatarUrl', response.data.avatarUrl);
      updateLocalStorageProfile(updatedUser);
      setUser(updatedUser);
      setSelectedFile(null);
      setImagePreview(null);
      
      // Trigger profile update event for sidebar refresh
      triggerProfileUpdate();
      
      toast.success('Profile image updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setUpdating(true);
      
      const response = await axios.patch('http://localhost:5000/api/v1/users/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update localStorage and trigger sidebar refresh
      updateLocalStorageProfile(response.data);
      setUser(response.data);
      setShowEditModal(false);
      
      // Trigger profile update event for sidebar refresh
      triggerProfileUpdate();
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const getRoleIcon = (userRole) => {
    switch (userRole) {
      case 'admin':
        return 'bi-shield-lock-fill text-danger';
      case 'coordinator':
        return 'bi-person-gear text-primary';
      case 'educator':
        return 'bi-person-video2 text-success';
      case 'learner':
        return 'bi-person-graduation text-info';
      default:
        return 'bi-person-circle text-secondary';
    }
  };

  const getRoleBadgeColor = (userRole) => {
    switch (userRole) {
      case 'admin':
        return 'danger';
      case 'coordinator':
        return 'primary';
      case 'educator':
        return 'success';
      case 'learner':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading profile...</p>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Failed to load profile data</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col xl={8} lg={10}>
          {/* Profile Header */}
          <Card className="mb-4 shadow-sm">
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col md={8}>
                  <div className="d-flex align-items-center">
                    <div className="position-relative me-4">
                      {user.avatarUrl ? (
                        <img
                          src={getAvatarUrl(user.avatarUrl)}
                          alt="Profile"
                          style={{ 
                            width: '100px', 
                            height: '100px', 
                            objectFit: 'cover',
                            borderRadius: '50%',
                            border: '3px solid #fff',
                            boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                          }}
                          crossOrigin="anonymous"
                          onError={(e) => {
                            console.log('Retrying image load without cache busting...');
                            e.target.src = `http://localhost:5000/${user.avatarUrl}`;
                          }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white border border-3 border-light shadow"
                          style={{ width: '100px', height: '100px', fontSize: '2rem' }}
                        >
                          <i className="bi bi-person-fill"></i>
                        </div>
                      )}
                      
                      <div className="mt-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          style={{ display: 'none' }}
                          id="avatar-upload"
                        />
                        <label htmlFor="avatar-upload" className="btn btn-sm btn-outline-primary">
                          <i className="bi bi-camera me-1"></i>
                          Change Photo
                        </label>
                        
                        {selectedFile && (
                          <div className="mt-2">
                            <Button
                              size="sm"
                              variant="success"
                              onClick={handleImageUpload}
                              disabled={uploadingImage}
                              className="me-2"
                            >
                              {uploadingImage ? (
                                <>
                                  <Spinner as="span" animation="border" size="sm" className="me-1" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <i className="bi bi-upload me-1"></i>
                                  Upload
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => {
                                setSelectedFile(null);
                                setImagePreview(null);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="mb-1">{user.firstName} {user.lastName}</h2>
                      <div className="d-flex align-items-center mb-2">
                        <i className={`bi ${getRoleIcon(user.role)} me-2`}></i>
                        <span className={`badge bg-${getRoleBadgeColor(user.role)} text-capitalize`}>
                          {user.role}
                        </span>
                      </div>
                      <p className="text-muted mb-0">
                        <i className="bi bi-envelope me-2"></i>
                        {user.email}
                      </p>
                      {user.phone && (
                        <p className="text-muted mb-0">
                          <i className="bi bi-telephone me-2"></i>
                          {user.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </Col>
                
                <Col md={4} className="text-md-end">
                  <Button
                    variant="primary"
                    onClick={() => setShowEditModal(true)}
                    className="mb-2"
                  >
                    <i className="bi bi-pencil-square me-2"></i>
                    Edit Profile
                  </Button>
                  <div className="text-muted small">
                    Member since {formatDate(user.createdAt)}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Profile Details */}
          <Row>
            <Col md={6}>
              <Card className="mb-4 h-100">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-person-lines-fill me-2"></i>
                    Personal Information
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-semibold">First Name:</div>
                    <div className="col-sm-8">{user.firstName || 'Not provided'}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-semibold">Last Name:</div>
                    <div className="col-sm-8">{user.lastName || 'Not provided'}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-semibold">Date of Birth:</div>
                    <div className="col-sm-8">{formatDate(user.dob)}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-semibold">Gender:</div>
                    <div className="col-sm-8">{user.sex || 'Not provided'}</div>
                  </div>
                  <div className="row mb-0">
                    <div className="col-sm-4 fw-semibold">Phone:</div>
                    <div className="col-sm-8">{user.phone || 'Not provided'}</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="mb-4 h-100">
                <Card.Header className="bg-light">
                  <h5 className="mb-0">
                    <i className="bi bi-geo-alt-fill me-2"></i>
                    Address & Contact
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-semibold">Email:</div>
                    <div className="col-sm-8">
                      {user.email}
                      <i className="bi bi-lock-fill text-muted ms-2" title="Email cannot be changed"></i>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-semibold">Address:</div>
                    <div className="col-sm-8">{user.address || 'Not provided'}</div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-sm-4 fw-semibold">Country:</div>
                    <div className="col-sm-8">{user.country || 'Not provided'}</div>
                  </div>
                  <div className="row mb-0">
                    <div className="col-sm-4 fw-semibold">Account Type:</div>
                    <div className="col-sm-8">
                      <span className={`badge bg-${getRoleBadgeColor(user.role)} text-capitalize`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Role-specific Information */}
          {user.role === 'educator' && (
            <Card className="mb-4">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">
                  <i className="bi bi-person-video2 me-2"></i>
                  Educator Information
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="row">
                  <div className="col-md-6">
                    <div className="row mb-2">
                      <div className="col-sm-6 fw-semibold">Status:</div>
                      <div className="col-sm-6">
                        <span className={`badge ${user.isActive ? 'bg-success' : 'bg-warning'}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="row mb-2">
                      <div className="col-sm-6 fw-semibold">Approval:</div>
                      <div className="col-sm-6">
                        <span className={`badge ${user.isApproved ? 'bg-success' : 'bg-warning'}`}>
                          {user.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {user.role === 'coordinator' && (
            <Card className="mb-4">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-person-gear me-2"></i>
                  Coordinator Information
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="row">
                  <div className="col-md-6">
                    <div className="row mb-2">
                      <div className="col-sm-6 fw-semibold">Approval Status:</div>
                      <div className="col-sm-6">
                        <span className={`badge ${user.isApproved ? 'bg-success' : 'bg-warning'}`}>
                          {user.isApproved ? 'Approved' : 'Pending Admin Approval'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-pencil-square me-2"></i>
            Edit Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>First Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Last Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Gender</Form.Label>
                  <Form.Select
                    name="sex"
                    value={formData.sex}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1234567890"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your full address"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Country</Form.Label>
              <Form.Control
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="Country"
              />
            </Form.Group>

            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              <strong>Note:</strong> Email address cannot be changed for security reasons.
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleProfileUpdate}
            disabled={updating}
          >
            {updating ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>
                Update Profile
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Image Preview Modal */}
      {imagePreview && (
        <Modal show={!!imagePreview} onHide={() => setImagePreview(null)}>
          <Modal.Header closeButton>
            <Modal.Title>Preview Profile Image</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            <Image src={imagePreview} alt="Preview" fluid rounded />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setImagePreview(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleImageUpload} disabled={uploadingImage}>
              {uploadingImage ? 'Uploading...' : 'Upload Image'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default Profile; 