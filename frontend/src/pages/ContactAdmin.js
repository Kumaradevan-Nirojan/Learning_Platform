import React from 'react';
import { Container, Row, Col, Card, Alert, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { ADMIN_CONTACT } from '../utils/adminConfig';
import '../styles/Auth.css';

const ContactAdmin = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('pendingRole') || localStorage.getItem('role') || 'user';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5 text-center">
              <div className="mb-4">
                <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: '4rem' }}></i>
              </div>
              
              <h2 className="text-warning mb-3">Account Pending Approval</h2>
              
              <Alert variant="warning" className="text-start">
                <h5 className="alert-heading">
                  <i className="bi bi-info-circle me-2"></i>
                  Your {role} account is awaiting admin approval
                </h5>
                <p className="mb-0">
                  Your registration was successful, but your account requires administrator approval before you can access the platform.
                </p>
              </Alert>

              <div className="my-4">
                <h5 className="text-muted mb-3">What happens next?</h5>
                <div className="text-start">
                  <div className="d-flex align-items-start mb-2">
                    <i className="bi bi-1-circle-fill text-primary me-2 mt-1"></i>
                    <span>Your registration details have been submitted to our administrators</span>
                  </div>
                  <div className="d-flex align-items-start mb-2">
                    <i className="bi bi-2-circle-fill text-primary me-2 mt-1"></i>
                    <span>Our team will review your application within {ADMIN_CONTACT.responseTime}</span>
                  </div>
                  <div className="d-flex align-items-start mb-2">
                    <i className="bi bi-3-circle-fill text-primary me-2 mt-1"></i>
                    <span>You'll receive an email notification once your account is approved</span>
                  </div>
                  <div className="d-flex align-items-start">
                    <i className="bi bi-4-circle-fill text-primary me-2 mt-1"></i>
                    <span>After approval, you can log in and access all platform features</span>
                  </div>
                </div>
              </div>

              <Alert variant="info" className="text-start">
                <h6 className="alert-heading">
                  <i className="bi bi-envelope me-2"></i>
                  Need to contact the administrator?
                </h6>
                <p className="mb-2">
                  If you have any questions or need urgent access, please contact our admin team:
                </p>
                <div className="mb-2">
                  <strong>👨‍💼 Administrator:</strong> {ADMIN_CONTACT.name}<br />
                  <strong>📧 Email:</strong> {ADMIN_CONTACT.email}<br />
                  <strong>📞 Phone:</strong> {ADMIN_CONTACT.phone}<br />
                  <strong>🏠 Address:</strong> {ADMIN_CONTACT.address}<br />
                  <strong>🌍 Country:</strong> {ADMIN_CONTACT.country}<br />
                  <strong>🕐 Business Hours:</strong> {ADMIN_CONTACT.businessHours}<br />
                  <strong>📝 Important:</strong> Include your name and registered email address
                </div>
                <small className="text-muted">
                  <i className="bi bi-clock me-1"></i>
                  {ADMIN_CONTACT.emergencyNote}
                </small>
              </Alert>

              <div className="d-grid gap-2 mt-4">
                <Button variant="primary" onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Return to Login
                </Button>
                <Link to="/" className="btn btn-outline-secondary">
                  <i className="bi bi-house me-2"></i>
                  Go to Homepage
                </Link>
              </div>

              <div className="mt-4 pt-3 border-top">
                <small className="text-muted">
                  <i className="bi bi-shield-check me-1"></i>
                  This approval process ensures the security and quality of our learning platform
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ContactAdmin; 