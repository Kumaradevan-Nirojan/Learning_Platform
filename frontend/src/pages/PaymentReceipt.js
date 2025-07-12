// frontend/src/pages/PaymentReceipt.js
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Container, Card, Spinner, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';

const PaymentReceipt = () => {
  const { enrollmentId } = useParams();
  const token = localStorage.getItem('token');
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const componentRef = useRef();

  useEffect(() => {
    const fetchEnrollment = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/v1/enrollments/${enrollmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEnrollment(data);
      } catch (err) {
        toast.error('Failed to load receipt');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEnrollment();
  }, [enrollmentId, token]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  return (
    <Container className="my-5">
      {loading ? (
        <Spinner animation="border" />
      ) : enrollment ? (
        <>
          <div ref={componentRef}>
            <Card className="p-4">
              <h4 className="text-center">Payment Receipt</h4>
              <hr />
              <p><strong>Receipt ID:</strong> {enrollment._id}</p>
              <p><strong>Course:</strong> {enrollment.course?.title}</p>
              <p><strong>Category:</strong> {enrollment.course?.category}</p>
              <p><strong>Learner:</strong> {enrollment.learner?.firstName} {enrollment.learner?.lastName}</p>
              <p><strong>Payment Status:</strong> {enrollment.paymentStatus}</p>
              <p><strong>Status:</strong> {enrollment.status}</p>
              <p><strong>Fee:</strong> Rs. {enrollment.course?.fee}</p>
              <p><strong>Date:</strong> {new Date(enrollment.enrollmentDate).toLocaleDateString()}</p>
            </Card>
          </div>
          <div className="text-center mt-3">
            <Button onClick={handlePrint}>🖨️ Print Receipt</Button>
          </div>
        </>
      ) : (
        <p className="text-muted">Enrollment not found</p>
      )}
    </Container>
  );
};

export default PaymentReceipt;
