import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Row, Col, Form, Spinner, Alert, Modal } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { FaCreditCard, FaDownload, FaEye, FaFilter, FaSearch, FaFileInvoice } from 'react-icons/fa';
import axios from 'axios';
import { PaymentUtils } from '../utils/paymentConfig';
import 'react-toastify/dist/ReactToastify.css';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [summary, setSummary] = useState({});
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    method: '',
    dateFrom: '',
    dateTo: '',
    page: 1
  });

  const token = localStorage.getItem('token');

  const fetchPaymentHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const { data } = await axios.get(
        `http://localhost:5000/api/v1/payments/my-history?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPayments(data.payments);
      setPagination(data.pagination);
      setSummary(data.summary);
    } catch (err) {
      toast.error('Failed to load payment history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      method: '',
      dateFrom: '',
      dateTo: '',
      page: 1
    });
  };

  const viewPaymentDetails = async (payment) => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/v1/payments/${payment.transactionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedPayment(data);
      setShowDetailsModal(true);
    } catch (err) {
      toast.error('Failed to load payment details');
    }
  };

  const downloadReceipt = async (transactionId) => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/v1/payments/receipt/${transactionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Create and download receipt as JSON (in a real app, this would be a PDF)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt_${transactionId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Receipt downloaded successfully');
    } catch (err) {
      toast.error('Failed to download receipt');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      success: 'success',
      pending: 'warning',
      failed: 'danger',
      cancelled: 'secondary',
      refunded: 'info'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status.toUpperCase()}</Badge>;
  };

  const getMethodIcon = (method) => {
    const icons = {
      card: '💳',
      upi: '📱',
      netbanking: '🏦',
      wallet: '💰',
      free: '🆓'
    };
    return icons[method] || '💳';
  };

  return (
    <Container className="my-4">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3>
              <FaCreditCard className="me-2 text-primary" />
              Payment History
            </h3>
          </div>
        </Col>
      </Row>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <h5 className="text-success">{PaymentUtils.formatAmount(summary.totalSpent || 0)}</h5>
              <p className="text-muted mb-0">Total Spent</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <h5 className="text-primary">{summary.totalTransactions || 0}</h5>
              <p className="text-muted mb-0">Total Transactions</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center border-0 shadow-sm">
            <Card.Body>
              <h5 className="text-info">{PaymentUtils.formatAmount(summary.avgTransactionValue || 0)}</h5>
              <p className="text-muted mb-0">Average Transaction</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Header className="bg-light">
          <h6 className="mb-0">
            <FaFilter className="me-2" />
            Filters
          </h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All Status</option>
                  <option value="success">Success</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Payment Method</Form.Label>
                <Form.Select
                  name="method"
                  value={filters.method}
                  onChange={handleFilterChange}
                >
                  <option value="">All Methods</option>
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="wallet">Wallet</option>
                  <option value="free">Free</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>From Date</Form.Label>
                <Form.Control
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>To Date</Form.Label>
                <Form.Control
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <div className="mt-3">
            <Button variant="outline-secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Payment History Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h6 className="mb-0">Transaction History</h6>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading payment history...</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-5">
              <FaFileInvoice size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No payment history found</h5>
              <p className="text-muted">Your payment transactions will appear here</p>
            </div>
          ) : (
            <>
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Date</th>
                    <th>Course</th>
                    <th>Transaction ID</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.transactionId}>
                      <td>
                        <small>{new Date(payment.paymentDate).toLocaleDateString()}</small>
                      </td>
                      <td>
                        <div>
                          <strong>{payment.course}</strong>
                        </div>
                      </td>
                      <td>
                        <code className="text-primary">{payment.transactionId}</code>
                      </td>
                      <td>
                        <strong className="text-success">
                          {PaymentUtils.formatAmount(payment.amount)}
                        </strong>
                      </td>
                      <td>
                        <span className="me-1">{getMethodIcon(payment.paymentMethod)}</span>
                        {payment.paymentMethod.toUpperCase()}
                      </td>
                      <td>
                        {getStatusBadge(payment.status)}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => viewPaymentDetails(payment)}
                            title="View Details"
                          >
                            <FaEye />
                          </Button>
                          {payment.status === 'success' && (
                            <Button
                              size="sm"
                              variant="outline-success"
                              onClick={() => downloadReceipt(payment.transactionId)}
                              title="Download Receipt"
                            >
                              <FaDownload />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center p-3 border-top">
                  <div>
                    <small className="text-muted">
                      Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalPayments)} of {pagination.totalPayments} transactions
                    </small>
                  </div>
                  <div>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      disabled={!pagination.hasPrevPage}
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      className="me-2"
                    >
                      Previous
                    </Button>
                    <span className="mx-2">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline-secondary"
                      disabled={!pagination.hasNextPage}
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Payment Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Payment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayment && (
            <Row>
              <Col md={6}>
                <h6>Transaction Information</h6>
                <p><strong>Transaction ID:</strong> {selectedPayment.transactionId}</p>
                <p><strong>Order ID:</strong> {selectedPayment.orderId}</p>
                <p><strong>Amount:</strong> {PaymentUtils.formatAmount(selectedPayment.amount)}</p>
                <p><strong>Currency:</strong> {selectedPayment.currency}</p>
                <p><strong>Status:</strong> {getStatusBadge(selectedPayment.status)}</p>
                <p><strong>Payment Date:</strong> {new Date(selectedPayment.paymentDate).toLocaleString()}</p>
              </Col>
              <Col md={6}>
                <h6>Course Information</h6>
                <p><strong>Course:</strong> {selectedPayment.course?.title}</p>
                <p><strong>Category:</strong> {selectedPayment.course?.category}</p>
                <p><strong>Learner:</strong> {selectedPayment.learner?.firstName} {selectedPayment.learner?.lastName}</p>
                <p><strong>Email:</strong> {selectedPayment.learner?.email}</p>
                <p><strong>Enrollment Date:</strong> {selectedPayment.enrollment?.enrollmentDate ? new Date(selectedPayment.enrollment.enrollmentDate).toLocaleDateString() : 'N/A'}</p>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
          {selectedPayment?.status === 'success' && (
            <Button
              variant="success"
              onClick={() => {
                downloadReceipt(selectedPayment.transactionId);
                setShowDetailsModal(false);
              }}
            >
              <FaDownload className="me-2" />
              Download Receipt
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PaymentHistory; 