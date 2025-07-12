import React, { useState } from 'react';
import { Card, Row, Col, Form } from 'react-bootstrap';
import { PAYMENT_CONFIG } from '../../utils/paymentConfig';
import './PaymentStyles.css';

const PaymentMethodSelector = ({ selectedMethod, onMethodChange, amount }) => {
  const [hoveredMethod, setHoveredMethod] = useState(null);

  return (
    <div className="payment-methods">
      <h5 className="mb-3">Select Payment Method</h5>
      <Row>
        {PAYMENT_CONFIG.PAYMENT_METHODS.map((method) => (
          <Col md={6} key={method.id} className="mb-3">
            <Card 
              className={`payment-method-card ${selectedMethod === method.id ? 'selected' : ''}`}
              style={{ 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: hoveredMethod === method.id ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: selectedMethod === method.id 
                  ? '0 4px 20px rgba(0,123,255,0.3)' 
                  : hoveredMethod === method.id 
                    ? '0 4px 15px rgba(0,0,0,0.1)' 
                    : '0 2px 10px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={() => setHoveredMethod(method.id)}
              onMouseLeave={() => setHoveredMethod(null)}
              onClick={() => onMethodChange(method.id)}
            >
              <Card.Body className="text-center py-4">
                <Form.Check
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={() => onMethodChange(method.id)}
                  className="payment-radio mb-3"
                />
                <div className="payment-icon mb-2" style={{ fontSize: '2rem' }}>
                  {method.icon}
                </div>
                <h6 className="payment-method-name">{method.name}</h6>
                {method.id === 'card' && (
                  <small className="text-muted">
                    Visa, MasterCard, RuPay
                  </small>
                )}
                {method.id === 'upi' && (
                  <small className="text-muted">
                    Google Pay, PhonePe, Paytm
                  </small>
                )}
                {method.id === 'netbanking' && (
                  <small className="text-muted">
                    All major banks
                  </small>
                )}
                {method.id === 'wallet' && (
                  <small className="text-muted">
                    Paytm, Mobikwik, FreeCharge
                  </small>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      {selectedMethod && (
        <div className="selected-method-info mt-3 p-3 bg-light rounded">
          <div className="d-flex justify-content-between align-items-center">
            <span>
              <strong>Selected:</strong> {PAYMENT_CONFIG.PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}
            </span>
            <span className="text-success h5 mb-0">
              {PAYMENT_CONFIG.CURRENCY_SYMBOL}{amount?.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector; 