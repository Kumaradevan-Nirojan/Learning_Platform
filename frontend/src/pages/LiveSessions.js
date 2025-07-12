// frontend/src/pages/LiveSessions.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Card, ListGroup, Spinner, Button } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LiveSessions = () => {
  const token = localStorage.getItem('token');
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch upcoming doubt/live sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/doubts', {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Filter to future or active sessions
        const now = new Date();
        setSessions(
          data.filter((s) => new Date(s.scheduledDate) >= now && s.isActive)
        );
      } catch (err) {
        toast.error('Failed to load live sessions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [token]);

  

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" /> Loading live sessions...
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <ToastContainer position="top-center" />
      <h4 className="mb-4 text-center">Upcoming Live Sessions</h4>
      {sessions.length > 0 ? (
        <ListGroup>
          {sessions.map((session) => (
            <ListGroup.Item key={session._id} className="d-flex justify-content-between align-items-center">
              <div>
                <h5>{session.topic}</h5>
                <p className="mb-1">{session.description}</p>
                <small>
                  {new Date(session.scheduledDate).toLocaleString()} ({session.durationMinutes} mins)
                </small>
              </div>
              {session.link ? (
                <Button
                  variant="primary"
                  onClick={() => window.open(session.link, '_blank')}
                >
                  Join
                </Button>
              ) : (
                <Button variant="secondary" disabled>
                  No Link
                </Button>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      ) : (
        <p className="text-center text-muted">No upcoming sessions.</p>
      )}
    </Container>
  );
};

export default LiveSessions;
