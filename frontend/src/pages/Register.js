// frontend/src/pages/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { Card, Form, Button, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    dob: '',
    sex: '',
    phone: '',
    address: '',
    country: '',
    role: '',   // start empty so placeholder shows
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('http://localhost:5000/api/v1/users/register', formData);
      toast.success('Registered successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <ToastContainer position="top-center" />
      <Card className="auth-card">
        <h5>Create an Account</h5>
        <Form onSubmit={handleSubmit}>
          {[
            { label: 'First Name', name: 'firstName', type: 'text' },
            { label: 'Last Name',  name: 'lastName',  type: 'text' },
            { label: 'Email',      name: 'email',     type: 'email' },
            { label: 'Password',   name: 'password',  type: 'password' },
            { label: 'Date of Birth', name: 'dob',    type: 'date' },
          ].map(({ label, name, type }) => (
            <Form.Group className="mb-3" controlId={name} key={name}>
              <Form.Label>{label}</Form.Label>
              <Form.Control
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required
                disabled={submitting}
              />
            </Form.Group>
          ))}

          <Form.Group className="mb-3" controlId="sex">
            <Form.Label>Sex</Form.Label>
            <Form.Select
              name="sex"
              value={formData.sex}
              onChange={handleChange}
              required
              disabled={submitting}
            >
              <option value="">Select sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="role">
            <Form.Label>Role</Form.Label>
            <Form.Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              disabled={submitting}
            >
              <option value="">Select role</option>
              <option value="learner">Learner</option>
              <option value="educator">Educator</option>
              <option value="coordinator">Coordinator</option>
            </Form.Select>
          </Form.Group>

          {[
            { label: 'Phone',   name: 'phone',   type: 'text'     },
            { label: 'Address', name: 'address', type: 'textarea' },
            { label: 'Country', name: 'country', type: 'text'     },
          ].map(({ label, name, type }) => (
            <Form.Group className="mb-3" controlId={name} key={name}>
              <Form.Label>{label}</Form.Label>
              {type === 'textarea' ? (
                <Form.Control
                  as="textarea"
                  rows={2}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  disabled={submitting}
                />
              ) : (
                <Form.Control
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  disabled={submitting}
                />
              )}
            </Form.Group>
          ))}

          <Button
            type="submit"
            variant="primary"
            className="w-100"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner size="sm" animation="border" /> Registering...
              </>
            ) : (
              'Register'
            )}
          </Button>
        </Form>

        <div className="auth-footer">
          <span>Already have an account?</span>{' '}
          <Link to="/login">Login here</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
