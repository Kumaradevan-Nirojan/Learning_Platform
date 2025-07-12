import React, { useState } from 'react';
import { Form, Button, Image, Spinner } from 'react-bootstrap';
import axios from 'axios';

const AvatarUpload = ({ currentAvatarUrl = '', onUpload }) => {
  const [preview, setPreview] = useState(currentAvatarUrl || '');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const formData = new FormData();
    formData.append('avatar', file);
    setUploading(true);

    try {
      const { data } = await axios.post('http://localhost:5000/api/v1/users/upload-avatar', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setPreview(`http://localhost:5000/${data.avatarUrl}`);
      onUpload(data.avatarUrl); // pass to parent
    } catch (err) {
      console.error('Upload failed', err);
      alert('Avatar upload failed!');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setPreview('');
    onUpload(''); // reset in parent state too
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>Avatar</Form.Label>
      <div className="d-flex align-items-center gap-3">
        {preview ? (
          <Image src={preview} roundedCircle width={80} height={80} />
        ) : (
          <span className="text-muted">No avatar</span>
        )}
        <Form.Control type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
        {uploading && <Spinner animation="border" size="sm" />}
        {preview && (
          <Button variant="outline-danger" size="sm" onClick={handleReset}>
            Remove
          </Button>
        )}
      </div>
    </Form.Group>
  );
};

export default AvatarUpload;
