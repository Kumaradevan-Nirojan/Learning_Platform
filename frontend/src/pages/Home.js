import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { FaChalkboardTeacher, FaLaptopCode, FaUsers, FaStar } from 'react-icons/fa';
import axios from 'axios';
import '../styles/Home.css'; // Make sure this file exists with your base styles

const Home = () => {
    const [courses, setCourses] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                // ✅ MODIFIED: Changed the URL to the full, correct backend endpoint.
                const { data } = await axios.get('http://localhost:5000/api/v1/courses?limit=3');
                setCourses(data.courses); // Access the 'courses' array from the response
            } catch (err) {
                setError('Could not fetch popular courses. Please try again later.');
                console.error(err);
            }
        };
        fetchCourses();
    }, []);

    const features = [
        {
            icon: <FaChalkboardTeacher size={50} style={{ color: '#007bff' }} />,
            title: 'Expert Instructors',
            description: 'Learn from industry experts who are passionate about teaching.',
        },
        {
            icon: <FaLaptopCode size={50} style={{ color: '#28a745' }} />,
            title: 'Interactive Courses',
            description: 'Engage with hands-on projects, quizzes, and live sessions.',
        },
        {
            icon: <FaUsers size={50} style={{ color: '#ffc107' }} />,
            title: 'Vibrant Community',
            description: 'Connect with fellow learners and educators in our forums.',
        },
    ];

    const testimonials = [
        {
            quote: "This platform transformed my career. The courses are practical and the instructors are top-notch!",
            author: "Alex Johnson",
            role: "Software Engineer"
        },
        {
            quote: "I love the flexibility. I can learn at my own pace from anywhere in the world. Truly outstanding!",
            author: "Maria Garcia",
            role: "Freelance Designer"
        },
        {
            quote: "The community forum is a game-changer. Getting help from peers and mentors has been invaluable.",
            author: "Sam Lee",
            role: "Data Science Student"
        }
    ];

    return (
        <div className="home-page">
            {/* Hero Section */}
            <header className="hero-section" style={heroSectionStyle}>
                <Container className="text-center text-white py-5">
                    <h1 className="hero-title" style={heroTitleStyle}>Unlock Your Potential</h1>
                    <p className="hero-subtitle lead" style={heroSubtitleStyle}>
                        Explore a world of knowledge with expert-led courses, interactive content, and a supportive community.
                    </p>
                    <div className="mt-4">
                        <Button as={Link} to="/courses" variant="primary" size="lg" className="me-3" style={heroButtonStyle}>
                            Browse Courses
                        </Button>
                        <Button as={Link} to="/register" variant="outline-light" size="lg" style={heroButtonStyle}>
                            Get Started
                        </Button>
                    </div>
                </Container>
            </header>

            {/* Features Section */}
            <section className="features-section py-5" style={sectionPadding}>
                <Container>
                    <h2 className="text-center mb-5 section-title" style={sectionTitleStyle}>Why Choose Us?</h2>
                    <Row className="justify-content-center">
                        {features.map((feature, index) => (
                            <Col md={4} key={index} className="text-center mb-4">
                                <div className="feature-card" style={featureCardStyle}>
                                    <div style={iconContainerStyle}>{feature.icon}</div>
                                    <h3 className="mt-3" style={featureTitleStyle}>{feature.title}</h3>
                                    <p style={featureDescriptionStyle}>{feature.description}</p>
                                </div>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Popular Courses Section */}
            <section className="courses-section py-5 bg-light" style={sectionPadding}>
                <Container>
                    <h2 className="text-center mb-5 section-title" style={sectionTitleStyle}>Popular Courses</h2>
                    {error && <p className="text-danger text-center">{error}</p>}
                    <Row className="justify-content-center">
                        {courses && courses.map((course) => (
                            <Col md={4} key={course._id} className="mb-4">
                                <Card className="h-100 course-card shadow-sm" style={courseCardStyle}>
                                    <Card.Img
                                        variant="top"
                                        src={course.imageUrl || 'https://placehold.co/600x400/007bff/white?text=Course'}
                                        onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/cccccc/ffffff?text=Error'; }}
                                        style={courseImageStyle}
                                    />
                                    <Card.Body style={courseBodyStyle}>
                                        <Card.Title style={courseTitleStyle}>{course.title}</Card.Title>
                                        <Card.Text style={courseTextStyle}>{course.description.substring(0, 100)}...</Card.Text>
                                        <Button as={Link} to={`/courses/${course._id}`} variant="primary" style={courseButtonStyle}>
                                            Learn More
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                    <div className="text-center mt-4">
                        <Button as={Link} to="/courses" variant="outline-primary" size="lg" style={viewAllButtonStyle}>View All Courses</Button>
                    </div>
                </Container>
            </section>

             {/* Testimonials Section */}
             <section className="testimonials-section py-5" style={{ ...sectionPadding, backgroundColor: '#f8f9fa' }}>
                <Container>
                    <h2 className="text-center mb-5 section-title" style={sectionTitleStyle}>What Our Students Say</h2>
                    <Row className="justify-content-center">
                        {testimonials.map((testimonial, index) => (
                            <Col md={4} key={index} className="mb-4">
                                <Card className="h-100 testimonial-card shadow-sm" style={testimonialCardStyle}>
                                    <Card.Body style={testimonialBodyStyle}>
                                        <div className="testimonial-quote" style={testimonialQuoteStyle}>
                                            <FaStar className="text-warning me-1" />
                                            <FaStar className="text-warning me-1" />
                                            <FaStar className="text-warning me-1" />
                                            <FaStar className="text-warning me-1" />
                                            <FaStar className="text-warning" />
                                        </div>
                                        <Card.Text className="mt-2" style={testimonialTextStyle}>"{testimonial.quote}"</Card.Text>
                                        <footer className="blockquote-footer mt-3" style={testimonialFooterStyle}>
                                            {testimonial.author} <cite title="Source Title">({testimonial.role})</cite>
                                        </footer>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Final CTA Section */}
            <section className="cta-section py-5 text-center" style={{ ...sectionPadding, backgroundImage: 'linear-gradient(to right, #007bff, #6610f2)', color: 'white' }}>
                <Container>
                    <h2 className="section-title" style={ctaTitleStyle}>Ready to Start Your Learning Journey?</h2>
                    <p className="lead my-3" style={ctaSubtitleStyle}>
                        Join thousands of learners and take the next step in your personal and professional growth.
                    </p>
                    <Button as={Link} to="/register" variant="light" size="lg" style={ctaButtonStyle}>
                        Register Now
                    </Button>
                </Container>
            </section>
        </div>
    );
};

// --- Inline Styles (Consider using CSS modules or Styled Components) ---
const heroSectionStyle = {
    backgroundImage: 'linear-gradient(to right, #007bff, #6610f2)',
    padding: '100px 0',
};

const heroTitleStyle = {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    marginBottom: '20px',
};

const heroSubtitleStyle = {
    fontSize: '1.5rem',
    marginBottom: '30px',
};

const heroButtonStyle = {
    padding: '15px 30px',
    fontSize: '1.2rem',
    borderRadius: '5px',
};

const sectionPadding = {
    padding: '60px 0',
};

const sectionTitleStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '40px',
    color: '#333',
};

const featureCardStyle = {
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 0 15px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
};

const iconContainerStyle = {
    marginBottom: '20px',
    borderRadius: '50%',
    padding: '20px',
    backgroundColor: '#e9ecef',
};

const featureTitleStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#333',
};

const featureDescriptionStyle = {
    color: '#666',
    fontSize: '1rem',
};

const courseCardStyle = {
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #ddd',
};

const courseImageStyle = {
    height: '200px',
    objectFit: 'cover',
};

const courseBodyStyle = {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexGrow: 1,
};

const courseTitleStyle = {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
};

const courseTextStyle = {
    fontSize: '1rem',
    color: '#555',
    marginBottom: '15px',
};

const courseButtonStyle = {
    width: '100%',
};

const viewAllButtonStyle = {
    padding: '12px 25px',
    fontSize: '1.1rem',
    borderRadius: '5px',
};

const testimonialCardStyle = {
    borderRadius: '8px',
    border: '1px solid #eee',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.05)',
};

const testimonialBodyStyle = {
    padding: '30px',
};

const testimonialQuoteStyle = {
    color: '#6c757d',
    marginBottom: '15px',
};

const testimonialTextStyle = {
    fontSize: '1.1rem',
    fontStyle: 'italic',
    color: '#495057',
    marginBottom: '20px',
};

const testimonialFooterStyle = {
    fontSize: '0.9rem',
    color: '#6c757d',
};

const ctaTitleStyle = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '20px',
};

const ctaSubtitleStyle = {
    fontSize: '1.2rem',
    marginBottom: '30px',
};

const ctaButtonStyle = {
    padding: '15px 40px',
    fontSize: '1.3rem',
    borderRadius: '5px',
    fontWeight: 'bold',
    color: '#007bff',
    backgroundColor: '#fff',
    border: 'none',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
    '&:hover': {
        backgroundColor: '#e9ecef',
    },
};

export default Home;