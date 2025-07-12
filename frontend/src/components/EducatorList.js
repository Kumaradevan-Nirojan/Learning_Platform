// frontend/components/EducatorList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Spinner, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

const EducatorList = () => {
  const [educators, setEducators] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchEducators = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('http://localhost:5000/api/v1/educators', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEducators(data);
    } catch (error) {
      toast.error('Failed to load educators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducators();
  }, []);

  // ✅ ENHANCED: Calls the new backend endpoint to toggle status
  const toggleStatus = async (id) => {
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/v1/educators/toggle-status/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(data.message);
      fetchEducators(); // Refresh the list to show the new status
    } catch (err) {
      toast.error('Failed to update educator status');
    }
  };

  const filtered = educators.filter(
    (user) =>
      user.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h4 className="mb-3">Manage Educators</h4>
      <Form.Control
        type="text"
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3"
      />
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((educator) => (
              <tr key={educator._id}>
                <td>{educator.firstName} {educator.lastName}</td>
                <td>{educator.email}</td>
                <td>{educator.phone || '-'}</td>
                <td>
                  <span className={`badge ${educator.isActive ? 'bg-success' : 'bg-secondary'}`}>
                    {educator.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <Button
                    size="sm"
                    variant={educator.isActive ? 'outline-danger' : 'outline-success'}
                    onClick={() => toggleStatus(educator._id)}
                  >
                    {educator.isActive ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default EducatorList;