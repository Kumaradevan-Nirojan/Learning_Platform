// frontend/src/pages/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/v1/users/login', formData);

      // ✅ Store all essential user data for the profile system
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('role', data.role);
      localStorage.setItem('firstName', data.firstName || '');
      localStorage.setItem('lastName', data.lastName || '');
      localStorage.setItem('email', data.email || '');
      localStorage.setItem('userId', data._id || '');
      
      // Store avatar URL if available
      if (data.avatarUrl) {
        localStorage.setItem('avatarUrl', data.avatarUrl);
      }
      
      // Store approval and active status
      if (typeof data.isActive !== 'undefined') {
        localStorage.setItem('isActive', data.isActive);
      }
      if (typeof data.isApproved !== 'undefined') {
        localStorage.setItem('isApproved', data.isApproved);
      }

      toast.success('Logged in successfully!');

      // Redirect based on role
      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.role === 'coordinator') {
        navigate('/coordinator/dashboard');
      } else if (data.role === 'educator') {
        if (data.isActive === false) {
          navigate('/inactive'); // Redirect to a dedicated inactive page
          return;
        }
        navigate('/educator/dashboard');
      } else if (data.role === 'learner') {
        navigate('/learner/dashboard');
      } else {
        toast.error('Unrecognized role.');
        navigate('/');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      
      // Check if the error is related to admin approval
      if (errorMessage.includes('pending admin approval')) {
        // Store the user's role temporarily for the contact admin page
        localStorage.setItem('pendingRole', err.response?.data?.role || 'user');
        navigate('/contact-admin');
        return;
      }
      
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <ToastContainer position="top-center" />
      <Card className="auth-card">
        <h5>Login to Dashboard</h5>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              disabled={submitting}
            />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              disabled={submitting}
            />
          </Form.Group>
          <Button type="submit" variant="primary" className="w-100" disabled={submitting}>
            {submitting ? <><Spinner size="sm" animation="border" /> Logging in...</> : 'Login'}
          </Button>
        </Form>
        <div className="auth-footer">
          <span>Don’t have an account?</span>{' '}
          <Link to="/register">Register now</Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;