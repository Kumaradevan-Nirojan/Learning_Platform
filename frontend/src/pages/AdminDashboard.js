import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching admin data...');
      console.log('Token:', token);
      
      const [statsRes, pendingRes, allUsersRes] = await Promise.all([
        axios.get('/api/v1/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/v1/admin/pending-approvals', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/v1/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      console.log('📊 Stats response:', statsRes.data);
      console.log('⏳ Pending approvals:', pendingRes.data);
      console.log('👥 All users:', allUsersRes.data);
      
      setStats(statsRes.data);
      setPendingApprovals(pendingRes.data);
      setAllUsers(allUsersRes.data);
    } catch (error) {
      console.error('❌ Error fetching admin data:', error);
      console.error('Error details:', error.response?.data);
      toast.error(`Failed to load admin dashboard data: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId, action) => {
    try {
      setActionLoading(userId);
      
      let endpoint;
      switch (action) {
        case 'approve':
          endpoint = 'approve';
          break;
        case 'disapprove':
          endpoint = 'disapprove';
          break;
        case 'remove-approval':
          endpoint = 'remove-approval';
          break;
        default:
          throw new Error('Invalid action');
      }
      
      const response = await axios.put(`/api/v1/admin/${endpoint}/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success(response.data.message);
      
      // Refresh the data
      await fetchAdminData();
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast.error(error.response?.data?.message || `Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading admin dashboard...</p>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-primary mb-3">
            <i className="bi bi-shield-lock-fill me-2"></i>
            Admin Dashboard
          </h2>
        </Col>
      </Row>

      {/* Statistics Cards */}
      {stats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="h-100 border-primary">
              <Card.Body className="text-center">
                <i className="bi bi-people-fill text-primary fs-1"></i>
                <h4 className="text-primary mt-2">{stats.totalUsers.total}</h4>
                <p className="text-muted mb-0">Total Users</p>
                <small className="text-muted">
                  {stats.totalUsers.coordinators} Coordinators, {stats.totalUsers.educators} Educators, {stats.totalUsers.learners} Learners
                </small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100 border-success">
              <Card.Body className="text-center">
                <i className="bi bi-check-circle-fill text-success fs-1"></i>
                <h4 className="text-success mt-2">
                  {stats.approvals.approvedCoordinators + stats.approvals.approvedEducators}
                </h4>
                <p className="text-muted mb-0">Approved Users</p>
                <small className="text-muted">
                  {stats.approvals.approvedCoordinators} Coordinators, {stats.approvals.approvedEducators} Educators
                </small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100 border-warning">
              <Card.Body className="text-center">
                <i className="bi bi-clock-fill text-warning fs-1"></i>
                <h4 className="text-warning mt-2">{stats.approvals.totalPending}</h4>
                <p className="text-muted mb-0">Pending Approvals</p>
                <small className="text-muted">
                  {stats.approvals.pendingCoordinators} Coordinators, {stats.approvals.pendingEducators} Educators
                </small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="h-100 border-info">
              <Card.Body className="text-center">
                <i className="bi bi-person-badge-fill text-info fs-1"></i>
                <h4 className="text-info mt-2">{stats.totalUsers.learners}</h4>
                <p className="text-muted mb-0">Active Learners</p>
                <small className="text-muted">No approval required</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Pending Approvals */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-warning text-dark">
              <h5 className="mb-0">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Pending Approvals ({pendingApprovals.length})
              </h5>
            </Card.Header>
            <Card.Body>
              {pendingApprovals.length === 0 ? (
                <Alert variant="success" className="text-center">
                  <i className="bi bi-check-circle-fill me-2"></i>
                  No pending approvals! All coordinators and educators are approved.
                </Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Registration Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingApprovals.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <strong>{user.firstName} {user.lastName}</strong>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <Badge 
                            bg={user.role === 'coordinator' ? 'primary' : 'info'} 
                            className="text-capitalize"
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleApproval(user._id, 'approve')}
                              disabled={actionLoading === user._id}
                            >
                              {actionLoading === user._id ? (
                                <Spinner as="span" animation="border" size="sm" />
                              ) : (
                                <i className="bi bi-check-lg"></i>
                              )}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleApproval(user._id, 'disapprove')}
                              disabled={actionLoading === user._id}
                            >
                              {actionLoading === user._id ? (
                                <Spinner as="span" animation="border" size="sm" />
                              ) : (
                                <i className="bi bi-x-lg"></i>
                              )}
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Approved Users */}
      <Row>
        <Col>
          <Card>
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">
                <i className="bi bi-check-circle-fill me-2"></i>
                Approved Users ({allUsers.filter(user => user.isApproved).length})
              </h5>
            </Card.Header>
            <Card.Body>
              {allUsers.filter(user => user.isApproved).length === 0 ? (
                <Alert variant="info" className="text-center">
                  <i className="bi bi-info-circle-fill me-2"></i>
                  No approved users yet. All coordinators and educators are pending approval.
                </Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Approved Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.filter(user => user.isApproved).map((user) => (
                      <tr key={user._id}>
                        <td>
                          <strong>{user.firstName} {user.lastName}</strong>
                          <Badge bg="success" className="ms-2 small">Approved</Badge>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <Badge 
                            bg={user.role === 'coordinator' ? 'primary' : 'info'} 
                            className="text-capitalize"
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td>{formatDate(user.updatedAt || user.createdAt)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              size="sm"
                              variant="warning"
                              onClick={() => handleApproval(user._id, 'remove-approval')}
                              disabled={actionLoading === user._id}
                              title="Remove approval and set to pending"
                            >
                              {actionLoading === user._id ? (
                                <Spinner as="span" animation="border" size="sm" />
                              ) : (
                                <i className="bi bi-arrow-counterclockwise"></i>
                              )}
                              Remove Approval
                            </Button>
                            <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => handleApproval(user._id, 'disapprove')}
                              disabled={actionLoading === user._id}
                              title="Disapprove user"
                            >
                              {actionLoading === user._id ? (
                                <Spinner as="span" animation="border" size="sm" />
                              ) : (
                                <i className="bi bi-x-lg"></i>
                              )}
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard; 