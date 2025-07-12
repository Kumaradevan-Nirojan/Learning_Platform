// frontend/src/pages/SubmissionPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Table, Spinner, Badge, Tab, Tabs } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AssignmentList from '../components/learner/AssignmentList';

const SubmissionPage = () => {
  const token = localStorage.getItem('token');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch submissions
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data } = await axios.get('/api/v1/submissions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubmissions(data);
      } catch (err) {
        toast.error('Failed to load submissions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [token]);

  return (
    <Container className="my-4">
      <ToastContainer position="top-center" />
      <h4 className="mb-4">📘 Assignments & Submissions</h4>
      
      <Tabs defaultActiveKey="assignments" id="assignment-tabs" className="mb-3">
        <Tab eventKey="assignments" title="📝 Available Assignments">
          <AssignmentList />
        </Tab>
        
        <Tab eventKey="submissions" title="📤 My Submissions">
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" /> Loading submissions...
            </div>
          ) : (
            <>
              {submissions.length > 0 ? (
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>Assignment</th>
                      <th>Course</th>
                      <th>Status</th>
                      <th>Grade</th>
                      <th>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => (
                      <tr key={sub._id}>
                        <td>{sub.assignment?.name || 'N/A'}</td>
                        <td>{sub.assignment?.course?.title || 'N/A'}</td>
                        <td>
                          <Badge bg={
                            sub.status === 'graded' ? 'success' :
                            sub.status === 'late' ? 'warning' :
                            sub.status === 'resubmitted' ? 'info' : 'secondary'
                          }>
                            {sub.status}
                          </Badge>
                        </td>
                        <td>{sub.grade ?? '—'}</td>
                        <td>{new Date(sub.submittedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-center text-muted">No submissions yet.</p>
              )}
            </>
          )}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default SubmissionPage;
