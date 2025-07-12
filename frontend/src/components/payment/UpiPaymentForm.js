import React, { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { FaMobileAlt, FaQrcode, FaShieldAlt } from 'react-icons/fa';
import './PaymentStyles.css';

const UpiPaymentForm = ({ onUpiDataChange, amount, isProcessing }) => {
  const [selectedApp, setSelectedApp] = useState('');
  const [upiId, setUpiId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('app'); // 'app' or 'manual'

  const upiApps = [
    { id: 'googlepay', name: 'Google Pay', icon: '📱', color: '#4285F4' },
    { id: 'phonepe', name: 'PhonePe', icon: '📱', color: '#5C2D91' },
    { id: 'paytm', name: 'Paytm', icon: '📱', color: '#00BAF2' },
    { id: 'bhim', name: 'BHIM', icon: '📱', color: '#FF6B35' }
  ];

  const handleAppSelection = (appId) => {
    setSelectedApp(appId);
    onUpiDataChange({
      method: 'upi_app',
      app: appId,
      upiId: '',
      isValid: true
    });
  };

  const handleUpiIdChange = (e) => {
    const value = e.target.value;
    setUpiId(value);
    
    // Basic UPI ID validation
    const isValid = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z]{2,64}$/.test(value);
    
    onUpiDataChange({
      method: 'upi_manual',
      app: '',
      upiId: value,
      isValid: isValid || value === ''
    });
  };

  const generateUpiLink = () => {
    const merchantId = 'LEARN001';
    const transactionNote = `Course Payment - ${amount}`;
    const finalUpiId = paymentMethod === 'app' ? 'merchant@paytm' : upiId;
    
    return `upi://pay?pa=${finalUpiId}&pn=Learning Dashboard&mc=8299&tid=${Date.now()}&tr=${Date.now()}&tn=${encodeURIComponent(transactionNote)}&am=${amount}&cu=INR`;
  };

  return (
    <div className="upi-payment-form fade-in">
      <div className="d-flex align-items-center mb-3">
        <FaMobileAlt className="text-primary me-2" />
        <h5 className="mb-0">UPI Payment</h5>
        <div className="ms-auto d-flex align-items-center text-muted">
          <FaShieldAlt className="me-1" />
          <small>Instant & Secure</small>
        </div>
      </div>

      <Alert variant="info" className="d-flex align-items-center">
        <FaQrcode className="me-2" />
        <small>Pay instantly using any UPI app on your phone</small>
      </Alert>

      {/* Payment Method Selection */}
      <div className="mb-4">
        <h6 className="mb-3">Choose Payment Method</h6>
        <Row>
          <Col md={6}>
            <div 
              className={`payment-option ${paymentMethod === 'app' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('app')}
              style={{
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                padding: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderColor: paymentMethod === 'app' ? '#007bff' : '#e9ecef'
              }}
            >
              <Form.Check
                type="radio"
                name="upiMethod"
                checked={paymentMethod === 'app'}
                onChange={() => setPaymentMethod('app')}
                label="UPI Apps"
                className="mb-2"
              />
              <small className="text-muted">Google Pay, PhonePe, Paytm, etc.</small>
            </div>
          </Col>
          <Col md={6}>
            <div 
              className={`payment-option ${paymentMethod === 'manual' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('manual')}
              style={{
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                padding: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderColor: paymentMethod === 'manual' ? '#007bff' : '#e9ecef'
              }}
            >
              <Form.Check
                type="radio"
                name="upiMethod"
                checked={paymentMethod === 'manual'}
                onChange={() => setPaymentMethod('manual')}
                label="Enter UPI ID"
                className="mb-2"
              />
              <small className="text-muted">yourname@bankname</small>
            </div>
          </Col>
        </Row>
      </div>

      {/* UPI Apps Selection */}
      {paymentMethod === 'app' && (
        <div className="mb-4">
          <h6 className="mb-3">Select UPI App</h6>
          <div className="upi-apps">
            {upiApps.map((app) => (
              <div
                key={app.id}
                className={`upi-app ${selectedApp === app.id ? 'selected' : ''}`}
                onClick={() => handleAppSelection(app.id)}
              >
                <div className="upi-app-icon">{app.icon}</div>
                <div className="upi-app-name">{app.name}</div>
              </div>
            ))}
          </div>
          
          {selectedApp && (
            <Alert variant="success" className="mt-3">
              <small>
                <strong>Selected:</strong> {upiApps.find(app => app.id === selectedApp)?.name}
                <br />
                You will be redirected to the app to complete payment
              </small>
            </Alert>
          )}
        </div>
      )}

      {/* Manual UPI ID Entry */}
      {paymentMethod === 'manual' && (
        <div className="mb-4">
          <Form.Group>
            <Form.Label>Enter UPI ID</Form.Label>
            <Form.Control
              type="text"
              placeholder="yourname@paytm"
              value={upiId}
              onChange={handleUpiIdChange}
              disabled={isProcessing}
              style={{
                borderRadius: '8px',
                border: '2px solid #e9ecef',
                padding: '12px 15px',
                fontSize: '16px'
              }}
            />
            <Form.Text className="text-muted">
              <small>Enter your UPI ID (e.g., 9876543210@paytm)</small>
            </Form.Text>
            {upiId && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z]{2,64}$/.test(upiId) && (
              <div className="text-danger mt-1">
                <small>Please enter a valid UPI ID</small>
              </div>
            )}
          </Form.Group>
        </div>
      )}

      {/* Payment Amount Display */}
      <div className="payment-summary bg-light p-3 rounded mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <span><strong>Amount to Pay:</strong></span>
          <span className="h5 text-success mb-0">₹{amount?.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Security Information */}
      <div className="security-badges">
        <div className="security-badge">
          <FaShieldAlt className="security-badge-icon" />
          <span>UPI Certified</span>
        </div>
        <div className="security-badge">
          <FaShieldAlt className="security-badge-icon" />
          <span>Bank Grade Security</span>
        </div>
        <div className="security-badge">
          <FaShieldAlt className="security-badge-icon" />
          <span>Instant Transfer</span>
        </div>
      </div>

      {/* Payment Instructions */}
      <Alert variant="warning" className="mt-3">
        <small>
          <strong>Note:</strong> After clicking "Pay Now", you will be redirected to your selected UPI app or prompted to enter your UPI PIN. 
          Do not close this page until payment is completed.
        </small>
      </Alert>
    </div>
  );
};

export default UpiPaymentForm; 