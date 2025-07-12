// frontend/src/components/StudentForm.js
import React, { useState } from 'react';
import axios from 'axios';
import { Card, Form, Button, Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StudentForm = ({ existingData = {}, onSuccess }) => {
  const token = localStorage.getItem('token');
  const isEdit = Boolean(existingData._id);

  const [formData, setFormData] = useState({
    firstName: existingData.firstName || '',
    lastName: existingData.lastName || '',
    email: existingData.email || '',
    phone: existingData.phone || '',
    address: existingData.address || '',
    dob: existingData.dob ? existingData.dob.slice(0, 10) : '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = isEdit
        ? `http://localhost:5000/api/v1/enrollments/${existingData._id}`
        : 'http://localhost:5000/api/v1/users/register';
      const method = isEdit ? 'patch' : 'post';

      await axios[method](
        url,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(isEdit ? 'Student updated!' : 'Student registered!');
      onSuccess && onSuccess();
      if (!isEdit) {
        setFormData({ firstName: '', lastName: '', email: '', phone: '', address: '', dob: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-4">
      <ToastContainer position="top-center" />
      <h5 className="mb-4 text-center">{isEdit ? 'Edit Student' : 'Register Student'}</h5>
      <Form onSubmit={handleSubmit}>
        {[
          { label: 'First Name', name: 'firstName', type: 'text' },
          { label: 'Last Name', name: 'lastName', type: 'text' },
          { label: 'Email', name: 'email', type: 'email' },
          { label: 'Phone', name: 'phone', type: 'text' },
          { label: 'Address', name: 'address', type: 'textarea' },
          { label: 'Date of Birth', name: 'dob', type: 'date' },
        ].map(({ label, name, type }) => (
          <Form.Group className="mb-3" key={name}>
            <Form.Label>{label}</Form.Label>
            {type === 'textarea' ? (
              <Form.Control
                as="textarea"
                name={name}
                value={formData[name]}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            ) : (
              <Form.Control
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            )}
          </Form.Group>
        ))}

        <Button type="submit" variant="success" className="w-100" disabled={submitting}>
          {submitting ? <Spinner size="sm" animation="border" /> : (isEdit ? 'Update Student' : 'Register Student')}
        </Button>
      </Form>
    </Card>
  );
};

export default StudentForm;
