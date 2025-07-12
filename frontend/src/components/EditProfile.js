import React, { useEffect, useState } from 'react';
import { Form, Button, Card, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AvatarUpload from './common/AvatarUpload';

const EditProfile = () => {
  const token = localStorage.getItem('token');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    sex: '',
    phone: '',
    address: '',
    country: '',
    avatarUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          dob: data.dob ? data.dob.slice(0, 10) : '',
          sex: data.sex || '',
          phone: data.phone || '',
          address: data.address || '',
          country: data.country || '',
          avatarUrl: data.avatarUrl || '',
        });
      } catch (err) {
        toast.error('Failed to load profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await axios.patch(
        'http://localhost:5000/api/v1/users/profile',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" /> Loading profile...
      </div>
    );
  }

  return (
    <Card className="p-4 shadow-sm">
      <ToastContainer position="top-center" />
      <h4 className="text-center mb-4">Edit Profile</h4>
      <Form onSubmit={handleSubmit}>
        <AvatarUpload
          currentAvatarUrl={`http://localhost:5000/${formData.avatarUrl}`}
          onUpload={(url) => setFormData((prev) => ({ ...prev, avatarUrl: url }))}
        />

        {[
          { name: 'firstName', label: 'First Name', type: 'text' },
          { name: 'lastName', label: 'Last Name', type: 'text' },
          { name: 'dob', label: 'Date of Birth', type: 'date' },
          { name: 'sex', label: 'Sex', type: 'select', options: ['', 'male', 'female', 'other'] },
          { name: 'phone', label: 'Phone', type: 'text' },
          { name: 'address', label: 'Address', type: 'text' },
          { name: 'country', label: 'Country', type: 'text' },
        ].map(({ name, label, type, options }) => (
          <Form.Group className="mb-3" controlId={name} key={name}>
            <Form.Label>{label}</Form.Label>
            {type === 'select' ? (
              <Form.Select
                name={name}
                value={formData[name]}
                onChange={handleChange}
                disabled={updating}
              >
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt || '-- Select --'}
                  </option>
                ))}
              </Form.Select>
            ) : (
              <Form.Control
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                disabled={updating}
                required={name === 'firstName'}
              />
            )}
          </Form.Group>
        ))}

        <Button type="submit" variant="success" className="w-100" disabled={updating}>
          {updating ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
        </Button>
      </Form>
    </Card>
  );
};

export default EditProfile;
