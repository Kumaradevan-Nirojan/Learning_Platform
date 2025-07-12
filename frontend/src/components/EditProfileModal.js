// frontend/src/components/EditProfileModal.js
import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Image, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';

const EditProfileModal = ({ show, onClose, userData, onUpdate }) => {
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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || '',
        address: userData.address || '',
        country: userData.country || '',
      });
      setAvatarPreview(`/uploads/avatars/${userData.avatarUrl || 'default-avatar.png'}`);
    }
  }, [userData]);

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
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

  const handleSave = async () => {
    setSaving(true);
    try {
      let avatarUrl = userData.avatarUrl;
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }
      const payload = { ...formData, avatarUrl };
      const { data } = await axios.patch(
        'http://localhost:5000/api/v1/users/profile',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Profile updated successfully!');
      onUpdate?.(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-3">
          <Image
            src={avatarPreview}
            alt="avatar"
            roundedCircle
            width={100}
            height={100}
            className="border"
          />
          <Form.Control
            type="file"
            accept="image/*"
            className="mt-2"
            onChange={handleAvatarChange}
            disabled={saving}
          />
        </div>
        <Form>
          {['firstName', 'lastName', 'phone', 'address', 'country'].map((field) => (
            <Form.Group key={field} className="mb-2">
              <Form.Label>
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </Form.Label>
              <Form.Control
                name={field}
                value={formData[field]}
                onChange={handleChange}
                disabled={saving}
              />
            </Form.Group>
          ))}
          <Form.Group className="mb-2">
            <Form.Label>Email (read only)</Form.Label>
            <Form.Control
              type="email"
              value={userData.email}
              disabled
              readOnly
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Spinner size="sm" animation="border" role="status" aria-hidden="true" /> Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditProfileModal;
