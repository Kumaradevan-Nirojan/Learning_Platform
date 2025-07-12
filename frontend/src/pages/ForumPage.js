// ForumPage.js (Enhanced with sorting, search, and better UX)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Form, Button, Spinner, Card, Row, Col,
} from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ForumPostCard from '../components/shared/ForumPostCard';


const ForumPage = () => {
  const token = localStorage.getItem('token');
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [course, setCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cRes, pRes, uRes] = await Promise.all([
          axios.get('http://localhost:5000/api/v1/courses', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/v1/forum', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/users/me', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setCourses(cRes.data.courses || cRes.data);
        setPosts(pRes.data);
        setUser(uRes.data);
      } catch (err) {
        toast.error('Failed to load forum data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !course) {
      toast.warn('Please select a course and enter content');
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(
        'http://localhost:5000/api/v1/forum',
        { content, course },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Post created');
      setContent('');
      refreshPosts();
    } catch (err) {
      toast.error('Failed to create post');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const refreshPosts = async () => {
    try {
      const pRes = await axios.get('http://localhost:5000/api/v1/forum', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(pRes.data);
    } catch (err) {
      toast.error('Failed to reload forum posts');
    }
  };

  const buildThreadedPosts = () => {
    const map = {};
    const roots = [];

    posts.forEach((post) => {
      map[post._id] = { ...post, replies: [] };
    });

    posts.forEach((post) => {
      if (post.parentPost) {
        map[post.parentPost]?.replies.push(map[post._id]);
      } else {
        roots.push(map[post._id]);
      }
    });

    const filtered = roots.filter((p) =>
      p.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortOrder === 'latest') {
      return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
  };

  if (loading) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" /> Loading forum...
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <ToastContainer position="top-center" />
      <h4 className="mb-4">📚 Course Forum</h4>

      <Card className="p-3 mb-4">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Select Course</Form.Label>
            <Form.Select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              disabled={submitting}
              required
            >
              <option value="">-- Choose a course --</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Your Post</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={submitting}
              required
              placeholder="Write your post here..."
            />
          </Form.Group>

          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? <Spinner size="sm" animation="border" /> : 'Post'}
          </Button>
        </Form>
      </Card>

      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="🔍 Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col md={6} className="text-md-end mt-2 mt-md-0">
          <Form.Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="latest">Sort: Latest</option>
            <option value="oldest">Sort: Oldest</option>
          </Form.Select>
        </Col>
      </Row>

      {buildThreadedPosts().map((post) => (
        <ForumPostCard
          key={post._id}
          post={post}
          replies={post.replies}
          currentUser={user}
          onUpdate={refreshPosts}
        />
      ))}
    </Container>
  );
};

export default ForumPage;
