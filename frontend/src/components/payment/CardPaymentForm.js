import React, { useState, useEffect } from 'react';
import { Form, Row, Col, InputGroup, Alert } from 'react-bootstrap';
import { FaCreditCard, FaLock, FaCalendarAlt, FaShieldAlt } from 'react-icons/fa';
import { CardValidator, PaymentUtils } from '../../utils/paymentConfig';

const CardPaymentForm = ({ onCardDataChange, isProcessing }) => {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  const [validation, setValidation] = useState({
    cardNumber: { isValid: false, message: '' },
    expiryDate: { isValid: false, message: '' },
    cvv: { isValid: false, message: '' },
    cardholderName: { isValid: false, message: '' }
  });

  const [cardType, setCardType] = useState('unknown');
  const [focusedField, setFocusedField] = useState('');

  useEffect(() => {
    // Notify parent component of card data changes
    const isFormValid = Object.values(validation).every(field => field.isValid);
    onCardDataChange({ ...cardData, isValid: isFormValid });
  }, [cardData, validation, onCardDataChange]);

  const handleCardNumberChange = (e) => {
    const value = PaymentUtils.formatCardNumber(e.target.value);
    const type = CardValidator.getCardType(value);
    
    setCardData(prev => ({ ...prev, cardNumber: value }));
    setCardType(type);
    
    const isValid = CardValidator.validateCardNumber(value);
    setValidation(prev => ({
      ...prev,
      cardNumber: {
        isValid,
        message: isValid ? '' : value.length > 0 ? 'Invalid card number' : ''
      }
    }));
  };

  const handleExpiryChange = (e) => {
    const value = PaymentUtils.formatExpiryDate(e.target.value);
    setCardData(prev => ({ ...prev, expiryDate: value }));
    
    const isValid = CardValidator.validateExpiryDate(value);
    setValidation(prev => ({
      ...prev,
      expiryDate: {
        isValid,
        message: isValid ? '' : value.length > 0 ? 'Invalid expiry date' : ''
      }
    }));
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').substr(0, 4);
    setCardData(prev => ({ ...prev, cvv: value }));
    
    const isValid = CardValidator.validateCVV(value);
    setValidation(prev => ({
      ...prev,
      cvv: {
        isValid,
        message: isValid ? '' : value.length > 0 ? 'Invalid CVV' : ''
      }
    }));
  };

  const handleNameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '').substr(0, 50);
    setCardData(prev => ({ ...prev, cardholderName: value }));
    
    const isValid = value.trim().length >= 2;
    setValidation(prev => ({
      ...prev,
      cardholderName: {
        isValid,
        message: isValid ? '' : value.length > 0 ? 'Name too short' : ''
      }
    }));
  };

  const getCardIcon = () => {
    switch (cardType) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'amex': return '💳';
      case 'discover': return '💳';
      default: return '💳';
    }
  };

  const getCardTypeDisplay = () => {
    switch (cardType) {
      case 'visa': return 'Visa';
      case 'mastercard': return 'MasterCard';
      case 'amex': return 'American Express';
      case 'discover': return 'Discover';
      default: return '';
    }
  };

  return (
    <div className="card-payment-form">
      <div className="d-flex align-items-center mb-3">
        <FaCreditCard className="text-primary me-2" />
        <h5 className="mb-0">Card Details</h5>
        <div className="ms-auto d-flex align-items-center text-muted">
          <FaShieldAlt className="me-1" />
          <small>Secured by SSL</small>
        </div>
      </div>

      <Alert variant="info" className="d-flex align-items-center">
        <FaLock className="me-2" />
        <small>Your payment information is encrypted and secure</small>
      </Alert>

      <Form>
        {/* Card Number */}
        <Form.Group className="mb-3">
          <Form.Label>Card Number</Form.Label>
          <InputGroup>
            <InputGroup.Text>
              <span style={{ fontSize: '1.2rem' }}>{getCardIcon()}</span>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="1234 5678 9012 3456"
              value={cardData.cardNumber}
              onChange={handleCardNumberChange}
              onFocus={() => setFocusedField('cardNumber')}
              onBlur={() => setFocusedField('')}
              isInvalid={validation.cardNumber.message !== ''}
              disabled={isProcessing}
              className={focusedField === 'cardNumber' ? 'focused' : ''}
              maxLength={19}
            />
            {cardType !== 'unknown' && (
              <InputGroup.Text className="card-type-display">
                {getCardTypeDisplay()}
              </InputGroup.Text>
            )}
          </InputGroup>
          {validation.cardNumber.message && (
            <Form.Control.Feedback type="invalid">
              {validation.cardNumber.message}
            </Form.Control.Feedback>
          )}
        </Form.Group>

        <Row>
          {/* Expiry Date */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Expiry Date</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FaCalendarAlt />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="MM/YY"
                  value={cardData.expiryDate}
                  onChange={handleExpiryChange}
                  onFocus={() => setFocusedField('expiryDate')}
                  onBlur={() => setFocusedField('')}
                  isInvalid={validation.expiryDate.message !== ''}
                  disabled={isProcessing}
                  className={focusedField === 'expiryDate' ? 'focused' : ''}
                  maxLength={5}
                />
              </InputGroup>
              {validation.expiryDate.message && (
                <Form.Control.Feedback type="invalid">
                  {validation.expiryDate.message}
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>

          {/* CVV */}
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>CVV</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FaLock />
                </InputGroup.Text>
                <Form.Control
                  type="password"
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={handleCvvChange}
                  onFocus={() => setFocusedField('cvv')}
                  onBlur={() => setFocusedField('')}
                  isInvalid={validation.cvv.message !== ''}
                  disabled={isProcessing}
                  className={focusedField === 'cvv' ? 'focused' : ''}
                  maxLength={4}
                />
              </InputGroup>
              {validation.cvv.message && (
                <Form.Control.Feedback type="invalid">
                  {validation.cvv.message}
                </Form.Control.Feedback>
              )}
              <Form.Text className="text-muted">
                <small>3-digit code on the back of your card</small>
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        {/* Cardholder Name */}
        <Form.Group className="mb-3">
          <Form.Label>Cardholder Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="John Doe"
            value={cardData.cardholderName}
            onChange={handleNameChange}
            onFocus={() => setFocusedField('cardholderName')}
            onBlur={() => setFocusedField('')}
            isInvalid={validation.cardholderName.message !== ''}
            disabled={isProcessing}
            className={focusedField === 'cardholderName' ? 'focused' : ''}
          />
          {validation.cardholderName.message && (
            <Form.Control.Feedback type="invalid">
              {validation.cardholderName.message}
            </Form.Control.Feedback>
          )}
          <Form.Text className="text-muted">
            <small>Name as it appears on your card</small>
          </Form.Text>
        </Form.Group>
      </Form>

      <div className="payment-security-info mt-3 p-3 bg-light rounded">
        <div className="d-flex align-items-center justify-content-center text-muted">
          <FaShieldAlt className="me-2" />
          <small>
            <strong>Secure Payment:</strong> Your card details are encrypted with 256-bit SSL security
          </small>
        </div>
      </div>
    </div>
  );
};

export default CardPaymentForm; 