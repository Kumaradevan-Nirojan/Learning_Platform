// frontend/src/components/educator/ManageQuestionsModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup } from 'react-bootstrap';

const ManageQuestionsModal = ({ show, onClose, onSave, initialQuestions = [] }) => {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState({ text: '', options: ['', '', '', ''], correctIndex: 0 });
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  const handleInputChange = (e, i = null) => {
    const { name, value } = e.target;
    if (name === 'text') {
      setCurrent({ ...current, text: value });
    } else if (name === 'option') {
      const newOptions = [...current.options];
      newOptions[i] = value;
      setCurrent({ ...current, options: newOptions });
    } else if (name === 'correctIndex') {
      setCurrent({ ...current, correctIndex: parseInt(value) });
    }
  };

  const resetForm = () => {
    setCurrent({ text: '', options: ['', '', '', ''], correctIndex: 0 });
    setEditIndex(null);
  };

  const handleAdd = () => {
    if (!current.text.trim()) return;
    const updated = [...questions];
    if (editIndex !== null) {
      updated[editIndex] = { ...current };
    } else {
      updated.push({ ...current });
    }
    setQuestions(updated);
    resetForm();
  };

  const handleEdit = (i) => {
    setCurrent({ ...questions[i] });
    setEditIndex(i);
  };

  const handleDelete = (i) => {
    if (!window.confirm('Are you sure to delete this question?')) return;
    const updated = [...questions];
    updated.splice(i, 1);
    setQuestions(updated);
    resetForm();
  };

  const handleSave = () => {
    onSave(questions);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Manage Questions</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Question Text</Form.Label>
            <Form.Control
              name="text"
              value={current.text}
              onChange={handleInputChange}
              placeholder="Enter question..."
            />
          </Form.Group>

          {current.options.map((opt, i) => (
            <Form.Group key={i} className="mt-2">
              <Form.Label>Option {i + 1}</Form.Label>
              <Form.Control
                name="option"
                value={opt}
                onChange={(e) => handleInputChange(e, i)}
                placeholder={`Option ${i + 1}`}
              />
            </Form.Group>
          ))}

          <Form.Group className="mt-3">
            <Form.Label>Correct Option</Form.Label>
            <Form.Select name="correctIndex" value={current.correctIndex} onChange={handleInputChange}>
              {current.options.map((_, i) => (
                <option key={i} value={i}>
                  Option {i + 1}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <div className="mt-3 d-flex gap-2">
            <Button variant="success" onClick={handleAdd}>
              {editIndex !== null ? 'Update Question' : 'Add Question'}
            </Button>
            {editIndex !== null && (
              <Button variant="secondary" onClick={resetForm}>
                Cancel Edit
              </Button>
            )}
          </div>
        </Form>

        <hr />
        <h6>Current Questions</h6>
        <ListGroup>
          {questions.map((q, i) => (
            <ListGroup.Item key={i}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>Q{i + 1}:</strong> {q.text} <br />
                  <small>
                    Correct Answer: {q.options[q.correctIndex]}
                  </small>
                </div>
                <div className="d-flex gap-2">
                  <Button size="sm" onClick={() => handleEdit(i)} variant="outline-primary">
                    Edit
                  </Button>
                  <Button size="sm" onClick={() => handleDelete(i)} variant="outline-danger">
                    Delete
                  </Button>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Questions
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ManageQuestionsModal;
