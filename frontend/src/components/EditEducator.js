// frontend/src/components/EditEducator.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditEducator = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    sex: '',
    address: '',
    country: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEducator = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/v1/educators/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData(data);
      } catch (error) {
        toast.error('Failed to fetch educator details.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEducator();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.patch(`http://localhost:5000/api/v1/educators/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Educator updated successfully!');
      setTimeout(() => navigate('/coordinator/educators'), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update educator.');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center my-4"><Spinner animation="border" /> Loading educator...</div>;

  return (
    <Card className="p-4">
      <ToastContainer />
      <h5 className="mb-4 text-center">Edit Educator</h5>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email (readonly)</Form.Label>
          <Form.Control type="email" value={formData.email} disabled readOnly />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Phone</Form.Label>
          <Form.Control
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Date of Birth</Form.Label>
          <Form.Control
            type="date"
            name="dob"
            value={formData.dob?.substring(0, 10) || ''}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Sex</Form.Label>
          <Form.Select name="sex" value={formData.sex} onChange={handleChange}>
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Address</Form.Label>
          <Form.Control
            as="textarea"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Label>Country</Form.Label>
          <Form.Control
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
          />
        </Form.Group>

        <Button type="submit" disabled={submitting} className="w-100">
          {submitting ? <Spinner size="sm" animation="border" /> : 'Update Educator'}
        </Button>
      </Form>
    </Card>
  );
};

export default EditEducator;
