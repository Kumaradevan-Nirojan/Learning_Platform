// frontend/src/pages/About.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Spinner, Container } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const About = () => {
  const token = localStorage.getItem('token');
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Optional: fetch about info from backend if you have an endpoint
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/v1/about', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInfo(data);
      } catch (err) {
        // Fallback to static info if endpoint missing
        console.warn('Could not load about info, using static content.', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAbout();
  }, [token]);

  return (
    <Container className="my-5">
      <ToastContainer position="top-center" />
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" /> Loading...
        </div>
      ) : (
        <Card className="shadow-sm p-4">
          <Card.Title as="h2" className="mb-3 text-center">
            About Learning Dashboard
          </Card.Title>
          <Card.Text>
            {info?.description ? (
              info.description
            ) : (
              <>
                <p>
                  Welcome to the Learning Dashboard—a comprehensive platform designed to empower 
                  course coordinators, educators, and learners. Our mission is to streamline 
                  course management, foster interactive learning experiences, and provide 
                  real-time insights into progress and performance.
                </p>
                <h5>Key Features</h5>
                <ul>
                  <li>
                    <strong>Role-Based Dashboards:</strong> Tailored interfaces for 
                    coordinators, educators, and learners.
                  </li>
                  <li>
                    <strong>Course & User Management:</strong> Easily create, update, and 
                    manage courses, educators, and student profiles.
                  </li>
                  <li>
                    <strong>Study Plans & Assignments:</strong> Educators can craft 
                    detailed study plans, quizzes, and assignments.
                  </li>
                  <li>
                    <strong>Interactive Learning:</strong> Learners can view study plans, 
                    take quizzes, and submit assignments seamlessly.
                  </li>
                  <li>
                    <strong>Analytics & Feedback:</strong> Real-time feedback, grades, and 
                    progress tracking for continuous improvement.
                  </li>
                </ul>
                <h5>Contact Us</h5>
                <p>
                  Have questions or feedback? Reach out to our support team at{' '}
                  <a href="mailto:support@learningdashboard.com">support@learningdashboard.com</a>.
                </p>
              </>
            )}
          </Card.Text>
        </Card>
      )}
    </Container>
  );
};

export default About;
