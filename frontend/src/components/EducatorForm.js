// frontend/src/components/EducatorForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Card, Image, Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EducatorForm = ({ onSuccess }) => {
  const token = localStorage.getItem('token');
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
    role: 'educator',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState('/uploads/avatars/default-avatar.png');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith('image/')) {
      toast.warn('Only image files are allowed.');
      return;
    }
    setAvatarFile(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        fd.append(key, val);
      });
      if (avatarFile) {
        fd.append('avatar', avatarFile);
      }

      await axios.post(
        'http://localhost:5000/api/v1/users/register',
        fd,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Educator registered successfully!');
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        dob: '',
        sex: '',
        phone: '',
        address: '',
        country: '',
        role: 'educator',
      });
      setAvatarFile(null);
      setPreview('/uploads/avatars/default-avatar.png');
      onSuccess && onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-4">
      <ToastContainer position="top-center" />
      <h5 className="mb-4 text-center">Register New Educator</h5>
      <Form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="text-center mb-3">
          <Image src={preview} roundedCircle width={100} height={100} className="border" />
          <Form.Control
            type="file"
            accept="image/*"
            className="mt-2"
            onChange={handleAvatarChange}
            disabled={submitting}
          />
        </div>

        {[
          { label: 'First Name', name: 'firstName' },
          { label: 'Last Name', name: 'lastName' },
          { label: 'Email', name: 'email', type: 'email' },
          { label: 'Password', name: 'password', type: 'password' },
          { label: 'Date of Birth', name: 'dob', type: 'date' },
        ].map(({ label, name, type = 'text' }) => (
          <Form.Group key={name} className="mb-3">
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

        <Form.Group className="mb-3">
          <Form.Label>Sex</Form.Label>
          <Form.Select
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            disabled={submitting}
            required
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </Form.Select>
        </Form.Group>

        {[
          { label: 'Phone', name: 'phone' },
          { label: 'Address', name: 'address' },
          { label: 'Country', name: 'country' },
        ].map(({ label, name }) => (
          <Form.Group key={name} className="mb-3">
            <Form.Label>{label}</Form.Label>
            <Form.Control
              name={name}
              value={formData[name]}
              onChange={handleChange}
              disabled={submitting}
              required
            />
          </Form.Group>
        ))}

        <Button type="submit" variant="success" className="w-100" disabled={submitting}>
          {submitting ? <Spinner size="sm" animation="border" /> : 'Register Educator'}
        </Button>
      </Form>
    </Card>
  );
};

export default EducatorForm;
