// src/pages/PaymentPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Card, Button, Spinner, Row, Col, Badge, Alert, Modal } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import { FaCheckCircle, FaCreditCard, FaCalendarAlt, FaUser, FaBook, FaTimes, FaLock, FaShieldAlt } from 'react-icons/fa';
import PaymentMethodSelector from '../components/payment/PaymentMethodSelector';
import CardPaymentForm from '../components/payment/CardPaymentForm';
import UpiPaymentForm from '../components/payment/UpiPaymentForm';
import { PaymentGateway, PaymentUtils, PAYMENT_CONFIG } from '../utils/paymentConfig';
import 'react-toastify/dist/ReactToastify.css';

const PaymentPage = () => {
  const { enrollmentId } = useParams();
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [cardData, setCardData] = useState({});
  const [upiData, setUpiData] = useState({});
  const [paymentSession, setPaymentSession] = useState(null);
  const [currentStep, setCurrentStep] = useState('method'); // 'method', 'details', 'processing', 'success', 'failure'
  const [transactionData, setTransactionData] = useState(null);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [processingSteps, setProcessingSteps] = useState([
    { id: 'validate', label: 'Validating Payment Details', status: 'pending' },
    { id: 'process', label: 'Processing Payment', status: 'pending' },
    { id: 'verify', label: 'Verifying Transaction', status: 'pending' },
    { id: 'complete', label: 'Payment Complete', status: 'pending' }
  ]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/v1/enrollments/${enrollmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEnrollment(data);
        
        // Initialize payment session for paid courses
        if (data.course?.fee > 0) {
          await initializePayment();
        }
      } catch (err) {
        toast.error('Failed to load enrollment info');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollment();
  }, [enrollmentId, token]);

  // Handle successful payment completion
  const handlePaymentSuccess = () => {
    setEnrollment(prev => ({
      ...prev,
      paymentStatus: 'success'
    }));
    
    toast.success('Payment completed successfully!');
    
    setTimeout(() => {
      navigate('/my-courses');
    }, 3000);
  };

  // Handle payment retry
  const handleRetryPayment = () => {
    setCurrentStep('method');
    setShowProcessingModal(false);
    setProcessingSteps(steps => 
      steps.map(step => ({ ...step, status: 'pending' }))
    );
  };

  // Initialize payment session
  const initializePayment = async () => {
    try {
      const session = await PaymentGateway.initializePayment(
        enrollment.course?.fee || 0,
        PAYMENT_CONFIG.CURRENCY
      );
      setPaymentSession(session);
    } catch (err) {
      toast.error('Failed to initialize payment session');
      console.error(err);
    }
  };

  // Update processing step status
  const updateProcessingStep = (stepId, status) => {
    setProcessingSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, status } : step
      )
    );
  };

  // Process payment through gateway
  const processPaymentGateway = async (paymentDetails) => {
    try {
      // Step 1: Validate
      updateProcessingStep('validate', 'active');
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateProcessingStep('validate', 'completed');

      // Step 2: Process
      updateProcessingStep('process', 'active');
      const result = await PaymentGateway.processCardPayment({
        ...paymentDetails,
        amount: enrollment.course?.fee || 0,
        currency: PAYMENT_CONFIG.CURRENCY,
        orderId: PaymentUtils.generateOrderId()
      });
      updateProcessingStep('process', 'completed');

      // Step 3: Verify
      updateProcessingStep('verify', 'active');
      await PaymentGateway.verifyPayment(result.transactionId);
      updateProcessingStep('verify', 'completed');

      // Step 4: Complete
      updateProcessingStep('complete', 'active');
      
      // Update backend
      await axios.post(
        `http://localhost:5000/api/v1/enrollments/${enrollmentId}/payment`,
        { 
          transactionId: result.transactionId,
          paymentMethod: selectedPaymentMethod,
          gatewayResponse: result.gatewayResponse
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      updateProcessingStep('complete', 'completed');
      setTransactionData(result);
      setCurrentStep('success');
      
      return result;
      
    } catch (err) {
      setCurrentStep('failure');
      throw err;
    }
  };

  // Handle payment submission
  const handlePayment = async () => {
    if (enrollment.course?.fee === 0) {
      // Handle free course enrollment
      try {
        await axios.post(
          `http://localhost:5000/api/v1/enrollments/${enrollmentId}/payment`,
          { 
            transactionId: 'FREE_' + Date.now(),
            paymentMethod: 'free',
            gatewayResponse: { status: 'free_course' }
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        toast.success('Successfully enrolled in free course!');
        setTimeout(() => navigate('/my-courses'), 1500);
        return;
      } catch (err) {
        toast.error('Failed to complete enrollment');
        return;
      }
    }

    // Validate payment method and details
    if (selectedPaymentMethod === 'card' && !cardData.isValid) {
      toast.error('Please enter valid card details');
      return;
    }
    
    if (selectedPaymentMethod === 'upi' && !upiData.isValid) {
      toast.error('Please select UPI payment method or enter valid UPI ID');
      return;
    }

    setShowProcessingModal(true);
    setPaymentProcessing(true);
    setCurrentStep('processing');

    try {
      let paymentDetails = {};
      
      if (selectedPaymentMethod === 'card') {
        paymentDetails = {
          method: 'card',
          cardNumber: cardData.cardNumber,
          expiryDate: cardData.expiryDate,
          cvv: cardData.cvv,
          cardholderName: cardData.cardholderName
        };
      } else if (selectedPaymentMethod === 'upi') {
        paymentDetails = {
          method: 'upi',
          upiApp: upiData.app,
          upiId: upiData.upiId
        };
      }

      await processPaymentGateway(paymentDetails);
      
    } catch (err) {
      console.error('Payment failed:', err);
      toast.error(err.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this enrollment? This action cannot be undone.')) {
      navigate('/courses');
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading payment details...</p>
      </Container>
    );
  }

  if (!enrollment) {
    return (
      <Container className="text-center my-5">
        <Alert variant="danger">
          <h5>Enrollment not found</h5>
          <p>The enrollment you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button variant="outline-primary" onClick={() => navigate('/courses')}>
            Browse Courses
          </Button>
        </Alert>
      </Container>
    );
  }

  const course = enrollment.course;
  const isAlreadyPaid = enrollment.paymentStatus === 'success';
  const isFree = course?.fee === 0;

  // Render payment success page
  const renderPaymentSuccess = () => (
    <div className="payment-result payment-success text-center">
      <div className="result-icon">
        <FaCheckCircle />
      </div>
      <h3 className="text-success mb-3">Payment Successful!</h3>
      <div className="payment-summary">
        <h5>Transaction Details</h5>
        <p><strong>Transaction ID:</strong> {transactionData?.transactionId}</p>
        <p><strong>Amount Paid:</strong> {PaymentUtils.formatAmount(enrollment.course?.fee)}</p>
        <p><strong>Payment Method:</strong> {selectedPaymentMethod.toUpperCase()}</p>
        <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
      </div>
      <div className="mt-4">
        <Button variant="success" size="lg" onClick={handlePaymentSuccess}>
          <FaCheckCircle className="me-2" />
          Continue to My Courses
        </Button>
      </div>
    </div>
  );

  // Render payment failure page
  const renderPaymentFailure = () => (
    <div className="payment-result payment-failure text-center">
      <div className="result-icon">
        <FaTimes />
      </div>
      <h3 className="text-danger mb-3">Payment Failed</h3>
      <p className="text-muted mb-4">
        We couldn't process your payment. Please check your payment details and try again.
      </p>
      <div className="mt-4">
        <Button variant="primary" size="lg" onClick={handleRetryPayment} className="me-3">
          <FaCreditCard className="me-2" />
          Try Again
        </Button>
        <Button variant="outline-secondary" size="lg" onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <Container className="my-4">
      <ToastContainer position="top-center" autoClose={3000} />
      
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-primary text-white text-center py-4">
              <h3 className="mb-0">
                <FaCreditCard className="me-2" />
                {course?.fee === 0 ? 'Confirm Enrollment' : 'Secure Payment'}
              </h3>
              <small className="mt-2 d-block opacity-75">
                <FaShieldAlt className="me-1" />
                SSL Encrypted • Bank Level Security
              </small>
            </Card.Header>
            
            <Card.Body className="p-0">
              {/* Already Paid Alert */}
              {isAlreadyPaid && (
                <Alert variant="success" className="m-4 mb-0">
                  <FaCheckCircle className="me-2" />
                  <strong>Payment Completed!</strong> You are successfully enrolled in this course.
                  <div className="mt-2">
                    <Button variant="success" onClick={() => navigate('/my-courses')}>
                      Go to My Courses
                    </Button>
                  </div>
                </Alert>
              )}

              {!isAlreadyPaid && (
                <Row className="g-0">
                  {/* Left Panel - Course & Payment Info */}
                  <Col lg={5} className="bg-light p-4">
                    <div className="course-summary">
                      <h5 className="text-primary mb-3">
                        <FaBook className="me-2" />
                        Course Details
                      </h5>
                      
                      <div className="course-card p-3 bg-white rounded shadow-sm mb-4">
                        <h4 className="course-title mb-2">{course?.title}</h4>
                        <Badge bg="secondary" className="mb-3">{course?.category}</Badge>
                        
                        <div className="course-meta">
                          <p className="mb-1"><strong>Medium:</strong> {course?.medium}</p>
                          <p className="mb-1"><strong>Venue:</strong> {course?.venue}</p>
                          <p className="mb-1"><strong>Duration:</strong> {course?.duration}</p>
                        </div>
                        
                        {course?.startDate && (
                          <div className="course-dates mt-3 pt-3 border-top">
                            <p className="mb-1">
                              <FaCalendarAlt className="me-2 text-info" />
                              <strong>Start:</strong> {new Date(course.startDate).toLocaleDateString()}
                            </p>
                            {course?.endDate && (
                              <p className="mb-0">
                                <FaCalendarAlt className="me-2 text-info" />
                                <strong>End:</strong> {new Date(course.endDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {/* Class Schedule */}
                        {course?.classTimes && course.classTimes.length > 0 && (
                          <div className="course-schedule mt-3 pt-3 border-top">
                            <h6 className="mb-2">
                              <FaCalendarAlt className="me-2 text-primary" />
                              Class Schedule
                            </h6>
                            <div className="schedule-list">
                              {course.classTimes.map((schedule, index) => (
                                <div key={index} className="schedule-item d-flex justify-content-between align-items-center mb-1">
                                  <span className="badge bg-light text-dark me-2">{schedule.day}</span>
                                  <small className="text-muted">{schedule.startTime} - {schedule.endTime}</small>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Payment Summary */}
                      <div className="payment-summary-card p-3 bg-white rounded shadow-sm">
                        <h6 className="mb-3">Payment Summary</h6>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Course Fee:</span>
                          <span>{PaymentUtils.formatAmount(course?.fee || 0)}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Processing Fee:</span>
                          <span className="text-success">FREE</span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between">
                          <strong>Total Amount:</strong>
                          <strong className="text-success h5">
                            {PaymentUtils.formatAmount(course?.fee || 0)}
                            {course?.fee === 0 && <Badge bg="success" className="ms-2">FREE</Badge>}
                          </strong>
                        </div>
                      </div>

                      {/* Learner Info */}
                      <div className="learner-info mt-4 p-3 bg-white rounded shadow-sm">
                        <h6 className="mb-3">
                          <FaUser className="me-2" />
                          Learner Information
                        </h6>
                        <p className="mb-1"><strong>Name:</strong> {enrollment?.learner?.firstName} {enrollment?.learner?.lastName}</p>
                        <p className="mb-1"><strong>Email:</strong> {enrollment?.learner?.email}</p>
                        <p className="mb-0"><strong>Enrolled:</strong> {new Date(enrollment?.enrollmentDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Col>

                  {/* Right Panel - Payment Methods */}
                  <Col lg={7} className="p-4">
                    {currentStep === 'success' ? renderPaymentSuccess() :
                     currentStep === 'failure' ? renderPaymentFailure() : (
                      <div className="payment-section">
                        {/* Payment Method Selection */}
                        <PaymentMethodSelector
                          selectedMethod={selectedPaymentMethod}
                          onMethodChange={setSelectedPaymentMethod}
                          amount={course?.fee || 0}
                        />

                        <hr className="my-4" />

                        {/* Payment Form Based on Selected Method */}
                        {selectedPaymentMethod === 'card' && (
                          <CardPaymentForm
                            onCardDataChange={setCardData}
                            isProcessing={paymentProcessing}
                          />
                        )}

                        {selectedPaymentMethod === 'upi' && (
                          <UpiPaymentForm
                            onUpiDataChange={setUpiData}
                            amount={course?.fee || 0}
                            isProcessing={paymentProcessing}
                          />
                        )}

                        {selectedPaymentMethod === 'netbanking' && (
                          <Alert variant="info" className="text-center">
                            <h6>Net Banking</h6>
                            <p>You will be redirected to your bank's secure website to complete the payment.</p>
                          </Alert>
                        )}

                        {selectedPaymentMethod === 'wallet' && (
                          <Alert variant="info" className="text-center">
                            <h6>Digital Wallet</h6>
                            <p>Choose your preferred wallet to complete the payment.</p>
                          </Alert>
                        )}

                        {/* Payment Actions */}
                        <div className="payment-actions mt-4 pt-4 border-top">
                          <Row>
                            <Col md={6}>
                              <Button
                                variant="outline-secondary"
                                size="lg"
                                onClick={handleCancel}
                                disabled={paymentProcessing}
                                className="w-100 mb-2"
                              >
                                Cancel
                              </Button>
                            </Col>
                            <Col md={6}>
                              <Button
                                variant="primary"
                                size="lg"
                                onClick={handlePayment}
                                disabled={paymentProcessing || (selectedPaymentMethod === 'card' && !cardData.isValid) || (selectedPaymentMethod === 'upi' && !upiData.isValid)}
                                className="w-100 mb-2"
                              >
                                {paymentProcessing ? (
                                  <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    <FaLock className="me-2" />
                                    {course?.fee === 0 ? 'Confirm Enrollment' : `Pay ${PaymentUtils.formatAmount(course?.fee)}`}
                                  </>
                                )}
                              </Button>
                            </Col>
                          </Row>
                        </div>

                        {/* Security Notice */}
                        {course?.fee > 0 && (
                          <Alert variant="info" className="mt-3">
                            <small>
                              <FaShieldAlt className="me-2" />
                              <strong>Secure Payment:</strong> Your payment information is encrypted and secure. 
                              You can unenroll within 7 days of course start if needed.
                            </small>
                          </Alert>
                        )}
                      </div>
                    )}
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Payment Processing Modal */}
      <Modal 
        show={showProcessingModal} 
        onHide={() => {}} 
        backdrop="static" 
        keyboard={false}
        centered
        size="lg"
      >
        <Modal.Header className="bg-primary text-white">
          <Modal.Title>
            <FaLock className="me-2" />
            Processing Payment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          <div className="payment-processing">
            <div className="processing-spinner"></div>
            <h5 className="mb-3">Please wait while we process your payment</h5>
            <p className="text-muted mb-4">Do not close this window or navigate away from this page</p>
            
            <ul className="processing-steps">
              {processingSteps.map((step, index) => (
                <li key={step.id} className={`processing-step ${step.status}`}>
                  <div className="step-icon">
                    {step.status === 'completed' ? '✓' : 
                     step.status === 'active' ? '⏳' : index + 1}
                  </div>
                  <span>{step.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PaymentPage;
