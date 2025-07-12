import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EducatorQuizList = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get('/api/quizzes/educator', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQuizzes(res.data || []);
      } catch (err) {
        console.error('Failed to fetch quizzes:', err);
        setErrorMsg('Failed to load your quizzes');
        toast.error('Failed to load quizzes');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, [token]);

  const handleEdit = (id) => navigate(`/quizzes/edit/${id}`);

  const handlePublish = async (id) => {
    try {
      await axios.patch(`/api/quizzes/publish/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Quiz published successfully');
      setQuizzes((prev) =>
        prev.map((q) => (q._id === id ? { ...q, published: true } : q))
      );
    } catch (err) {
      console.error('Failed to publish quiz:', err);
      toast.error('Failed to publish quiz');
    }
  };

  return (
    <div className="container mt-4">
      <h3>📚 My Quizzes</h3>
      <ToastContainer />
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : errorMsg ? (
        <Alert variant="danger">{errorMsg}</Alert>
      ) : quizzes.length === 0 ? (
        <Alert variant="info">You haven't created any quizzes yet.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Title</th>
              <th>Course</th>
              <th>Scheduled Date/Time</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz) => (
              <tr key={quiz._id}>
                <td>{quiz.title}</td>
                <td>{quiz.course?.title || 'N/A'}</td>
                <td>
                  {quiz.scheduledDateTime
                    ? new Date(quiz.scheduledDateTime).toLocaleString()
                    : 'Not Scheduled'}
                </td>
                <td>{quiz.durationMinutes} mins</td>
                <td>{quiz.published ? '✅ Published' : '📝 Draft'}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEdit(quiz._id)}
                    className="me-2"
                  >
                    ✏️ Edit
                  </Button>
                  {!quiz.published && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => handlePublish(quiz._id)}
                    >
                      🚀 Publish
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default EducatorQuizList;
