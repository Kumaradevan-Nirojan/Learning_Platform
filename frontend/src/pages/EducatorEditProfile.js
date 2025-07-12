// frontend/src/components/EducatorEditProfile.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, Form, Button, Image, Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EducatorEditProfile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    country: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('/uploads/avatars/default-avatar.png');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone || '',
          address: data.address || '',
          country: data.country || '',
        });
        setAvatarPreview(`/uploads/avatars/${data.avatarUrl || 'default-avatar.png'}`);
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith('image/')) {
      toast.warn('Only image files are allowed.');
      return;
    }
    setAvatarFile(file);
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    const fd = new FormData();
    fd.append('avatar', avatarFile);
    const { data } = await axios.post(
      'http://localhost:5000/api/v1/avatar/upload',
      fd,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return data.avatarUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let avatarUrl = formData.avatarUrl;
      if (avatarFile) avatarUrl = await uploadAvatar();
      await axios.patch(
        'http://localhost:5000/api/v1/users/profile',
        { ...formData, avatarUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Profile updated successfully');
      setTimeout(() => navigate('/educator'), 1500);
    } catch (err) {
      toast.error('Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center my-5"><Spinner animation="border" /> Loading...</div>;
  }

  return (
    <Card className="p-4">
      <ToastContainer position="top-center" />
      <h5 className="mb-4 text-center">Edit Profile</h5>
      <Form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="text-center mb-3">
          <Image src={avatarPreview} roundedCircle width={100} height={100} className="border" />
          <Form.Control
            type="file"
            accept="image/*"
            className="mt-2"
            onChange={handleAvatarChange}
            disabled={submitting}
          />
        </div>
        {['firstName','lastName','phone','address','country'].map((field) => (
          <Form.Group key={field} className="mb-3">
            <Form.Label>{field.charAt(0).toUpperCase()+field.slice(1)}</Form.Label>
            <Form.Control
              name={field}
              value={formData[field]}
              onChange={handleChange}
              disabled={submitting}
            />
          </Form.Group>
        ))}
        <Button type="submit" variant="primary" className="w-100" disabled={submitting}>
          {submitting ? <Spinner size="sm" animation="border" /> : 'Save Changes'}
        </Button>
      </Form>
    </Card>
  );
};

export default EducatorEditProfile;
