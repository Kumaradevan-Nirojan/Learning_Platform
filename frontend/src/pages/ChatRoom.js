// frontend/src/pages/ChatRoom.js
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Container, Card, Form, Button, ListGroup, Spinner } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SOCKET_SERVER_URL = 'http://localhost:5000'; // adjust if needed

const ChatRoom = ({ roomId }) => {
  const token = localStorage.getItem('token');
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connecting, setConnecting] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    // Initialize socket
    const newSocket = io(SOCKET_SERVER_URL, {
      auth: { token: `Bearer ${token}` }
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnecting(false);
      newSocket.emit('joinRoom', roomId);
    });

    newSocket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on('connect_error', (err) => {
      toast.error('Connection error: ' + err.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, token]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const msg = { roomId, text: input.trim(), timestamp: Date.now() };
    socket.emit('sendMessage', msg);
    setMessages((prev) => [...prev, { ...msg, self: true }]);
    setInput('');
  };

  if (connecting) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" /> Connecting to chat...
      </Container>
    );
  }

  return (
    <Container className="my-4">
      <ToastContainer position="top-center" />
      <Card>
        <Card.Header>Chat Room: {roomId}</Card.Header>
        <Card.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <ListGroup variant="flush">
            {messages.map((msg, idx) => (
              <ListGroup.Item
                key={idx}
                className={msg.self ? 'text-end bg-light' : 'text-start'}
              >
                <small className="text-muted">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </small>
                <div>{msg.text}</div>
              </ListGroup.Item>
            ))}
            <div ref={messagesEndRef} />
          </ListGroup>
        </Card.Body>
        <Card.Footer>
          <Form onSubmit={handleSend} className="d-flex">
            <Form.Control
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!socket.connected}
            />
            <Button type="submit" variant="primary" className="ms-2">
              Send
            </Button>
          </Form>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default ChatRoom;
