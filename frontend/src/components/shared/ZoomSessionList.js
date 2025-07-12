// frontend/src/components/shared/ZoomSessionList.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Table, Spinner, Badge } from 'react-bootstrap';
import { FaVideo, FaClock, FaCheck } from 'react-icons/fa';

const LiveZoomSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paidCourseIds, setPaidCourseIds] = useState([]);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const [sessionRes, enrollRes] = await Promise.all([
          axios.get('http://localhost:5000/api/v1/doubts', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/v1/enrollments', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const paidIds = enrollRes.data
          .filter((e) => e.paymentStatus === 'success')
          .map((e) => e.course._id);

        setPaidCourseIds(paidIds);

        const filtered = sessionRes.data.filter((session) => {
          // If educator, show all sessions they created
          if (user.role === 'educator') {
            return session.educator && session.educator._id === user._id;
          }
          // Otherwise, show only sessions for paid courses
          return session.course && paidIds.includes(session.course._id);
        });

        setSessions(filtered);
      } catch (err) {
        console.error('Error fetching Zoom sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [token, user._id]);

  const isUpcoming = (date) => new Date(date) > new Date();

  return (
    <Container className="my-4">
      <h4>📺 Live Zoom Sessions</h4>
      {loading ? (
        <div className="text-center"><Spinner animation="border" /></div>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Course</th>
              <th>Topic</th>
              <th>Educator</th>
              <th>Scheduled</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Join</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <tr key={session._id}>
                  <td>{session.course?.title || '-'}</td>
                  <td>{session.topic}</td>
                  <td>{session.educator?.firstName} {session.educator?.lastName}</td>
                  <td>{new Date(session.scheduledDate).toLocaleString()}</td>
                  <td>{session.durationMinutes} min</td>
                  <td>
                    {isUpcoming(session.scheduledDate) ? (
                      <Badge bg="info"><FaClock /> Upcoming</Badge>
                    ) : (
                      <Badge bg="secondary"><FaCheck /> Past</Badge>
                    )}
                  </td>
                  <td>
                    {session.link ? (
                      <a
                        href={session.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        <FaVideo /> Join
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" className="text-center text-muted">No Zoom sessions available or payment pending.</td></tr>
            )}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default LiveZoomSessions;
