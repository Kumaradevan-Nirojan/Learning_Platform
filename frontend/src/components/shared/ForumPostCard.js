// ForumPostCard.js
import React, { useState } from 'react';
import { Button, Card, Form, Badge } from 'react-bootstrap';
import { FaEdit, FaReply, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const ForumPostCard = ({ post, replies, currentUser, onUpdate, depth = 0 }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [replyContent, setReplyContent] = useState('');
  const token = localStorage.getItem('token');

  const handleEdit = async () => {
    try {
      await axios.patch(`http://localhost:5000/api/v1/forum/${post._id}`, {
        content: editedContent,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Post updated');
      setIsEditing(false);
      onUpdate();
    } catch (err) {
      toast.error('Failed to update post');
    }
  };

  const handleReply = async () => {
    try {
      await axios.post('http://localhost:5000/api/v1/forum', {
        content: replyContent,
        parentPost: post._id,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Reply added');
      setReplyContent('');
      setIsReplying(false);
      onUpdate();
    } catch (err) {
      toast.error('Failed to post reply');
    }
  };

  const isEdited = post.updatedAt && new Date(post.updatedAt).getTime() !== new Date(post.createdAt).getTime();

  return (
    <Card className="mb-2" style={{ marginLeft: `${depth * 20}px` }}>
      <Card.Body>
        <Card.Title>
          {post.user?.firstName} {post.user?.lastName} {' '}
          <small className="text-muted">@{post.user?.role}</small>
        </Card.Title>
        {!isEditing ? (
          <Card.Text>
            {post.content}
            {isEdited && (
              <div>
                <Badge bg="light" text="dark" className="ms-2">
                  (edited on {new Date(post.updatedAt).toLocaleString()})
                </Badge>
              </div>
            )}
          </Card.Text>
        ) : (
          <Form.Control
            as="textarea"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={3}
          />
        )}

        <div className="d-flex gap-2">
          {currentUser?._id === post.user?._id && (
            <>
              <Button
                variant={isEditing ? 'success' : 'outline-primary'}
                size="sm"
                onClick={isEditing ? handleEdit : () => setIsEditing(true)}
              >
                <FaEdit /> {isEditing ? 'Save' : 'Edit'}
              </Button>
            </>
          )}

          <Button
            variant={isReplying ? 'success' : 'outline-secondary'}
            size="sm"
            onClick={isReplying ? handleReply : () => setIsReplying(true)}
          >
            <FaReply /> {isReplying ? 'Post Reply' : 'Reply'}
          </Button>
        </div>

        {isReplying && (
          <Form.Control
            as="textarea"
            className="mt-2"
            placeholder="Write your reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
          />
        )}
      </Card.Body>

      {/* Nested replies */}
      {replies && replies.length > 0 && replies.map((r) => (
        <ForumPostCard
          key={r._id}
          post={r}
          replies={r.replies || []}
          currentUser={currentUser}
          onUpdate={onUpdate}
          depth={depth + 1}
        />
      ))}
    </Card>
  );
};

export default ForumPostCard;
