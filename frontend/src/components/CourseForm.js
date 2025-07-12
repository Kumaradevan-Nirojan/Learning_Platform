// CourseForm.js – with full edit support for all course details
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Spinner, Card, Row, Col } from 'react-bootstrap';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


const CourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [formData, setFormData] = useState({
    title: '', description: '', category: '', syllabus: '',
    duration: '', startDate: '', endDate: '', fee: '',
    educator: '', medium: '', venue: '', classDays: [],
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [educators, setEducators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeByDay, setTimeByDay] = useState({});

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const categories = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'Engineering', 'Science and Technology',
    'Programming and Web Development', 'Commerce and Management'
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const educatorsRes = await axios.get('http://localhost:5000/api/v1/users?role=educator&isActive=true&isApproved=true', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('📊 Frontend - Received educators:', educatorsRes.data);
        console.log('📊 Frontend - Educators count:', educatorsRes.data.length);
        
        setEducators(educatorsRes.data);

        if (id) {
          const courseRes = await axios.get(`http://localhost:5000/api/v1/courses/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = courseRes.data;

          // Setup class schedule state
          const timeObj = {};
          const classDays = (data.classTimes || []).map(item => {
            timeObj[item.day] = {
              startTime: item.startTime,
              endTime: item.endTime
            };
            return { day: item.day };
          });

          setFormData({
            title: data.title || '',
            description: data.description || '',
            category: data.category || '',
            syllabus: data.syllabus || '',
            duration: data.duration || '',
            startDate: data.startDate ? data.startDate.substring(0, 10) : '',
            endDate: data.endDate ? data.endDate.substring(0, 10) : '',
            fee: data.fee || '',
            educator: data.educator || '',
            medium: data.medium || '',
            venue: data.venue || '',
            classDays
          });

          setTimeByDay(timeObj);
          if (data.image) setImagePreview(data.image);
        }
      } catch (err) {
        toast.error('Failed to load data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => {
      const exists = prev.classDays.some(d => d.day === day);
      const updated = exists
        ? prev.classDays.filter(d => d.day !== day)
        : [...prev.classDays, { day }];
      return { ...prev, classDays: updated };
    });
  };

  const handleTimeChange = (day, field, value) => {
    setTimeByDay(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let finalPayload = { ...formData };

      // Convert classDays + timeByDay → classTimes
      const classTimesParsed = formData.classDays.map(({ day }) => ({
        day,
        startTime: timeByDay[day]?.startTime || '',
        endTime: timeByDay[day]?.endTime || ''
      }));
      finalPayload.classTimes = classTimesParsed;
      delete finalPayload.classDays;

      if (image) {
        const formDataImage = new FormData();
        formDataImage.append('image', image);
        const res = await axios.post('http://localhost:5000/api/v1/courses/upload-course-image', formDataImage, {
          headers: { Authorization: `Bearer ${token}` }
        });
        finalPayload.image = res.data.imageUrl;
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      };

      if (id) {
        await axios.patch(`http://localhost:5000/api/v1/courses/${id}`, finalPayload, config);
        toast.success('Course updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/v1/courses', finalPayload, config);
        toast.success('Course created successfully!');
      }

      setTimeout(() => navigate('/coordinator/course'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center my-4"><Spinner animation="border" /> Loading...</div>;

  return (
    <Card className="p-4">
      <ToastContainer />
      <h5 className="mb-4 text-center">{id ? 'Edit Course' : 'Create New Course'}</h5>
      <Form onSubmit={handleSubmit} encType="multipart/form-data">
        <Form.Group className="mb-3"><Form.Label>Title</Form.Label>
          <Form.Control name="title" value={formData.title} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3"><Form.Label>Description</Form.Label>
          <Form.Control as="textarea" name="description" value={formData.description} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3"><Form.Label>Category</Form.Label>
          <Form.Select name="category" value={formData.category} onChange={handleChange} required>
            <option value="">Select category</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3"><Form.Label>Syllabus</Form.Label>
          <Form.Control as="textarea" name="syllabus" value={formData.syllabus} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3"><Form.Label>Duration (weeks)</Form.Label>
          <Form.Control name="duration" value={formData.duration} onChange={handleChange} required />
        </Form.Group>

        <Row>
          <Col><Form.Group className="mb-3"><Form.Label>Start Date</Form.Label>
            <Form.Control type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
          </Form.Group></Col>
          <Col><Form.Group className="mb-3"><Form.Label>End Date</Form.Label>
            <Form.Control type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
          </Form.Group></Col>
        </Row>

        <Form.Group className="mb-3"><Form.Label>Fee</Form.Label>
          <Form.Control name="fee" type="number" value={formData.fee} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mb-3"><Form.Label>Medium</Form.Label>
          <Form.Select name="medium" value={formData.medium} onChange={handleChange} required>
            <option value="">Select Medium</option>
            <option value="English">English</option>
            <option value="Tamil">Tamil</option>
            <option value="Sinhala">Sinhala</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3"><Form.Label>Venue</Form.Label>
          <Form.Select name="venue" value={formData.venue} onChange={handleChange} required>
            <option value="">Select Venue</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3"><Form.Label>Educator</Form.Label>
          <Form.Select name="educator" value={formData.educator} onChange={handleChange} required>
            <option value="">Select educator</option>
            {educators.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3"><Form.Label>Upload Course Image (Optional)</Form.Label>
          <Form.Control type="file" onChange={handleImageChange} accept="image/*" />
          {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2" style={{ maxWidth: '200px' }} />}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Class Schedule</Form.Label>
          {daysOfWeek.map(day => {
            const isChecked = formData.classDays.some(d => d.day === day);
            return (
              <div key={day} className="mb-2">
                <Form.Check
                  type="checkbox"
                  label={day}
                  checked={isChecked}
                  onChange={() => handleDayToggle(day)}
                />
                {isChecked && (
                  <Row className="mt-1">
                    <Col><Form.Label>Start</Form.Label>
                      <Form.Control type="time" value={timeByDay[day]?.startTime || ''} onChange={(e) => handleTimeChange(day, 'startTime', e.target.value)} />
                    </Col>
                    <Col><Form.Label>End</Form.Label>
                      <Form.Control type="time" value={timeByDay[day]?.endTime || ''} onChange={(e) => handleTimeChange(day, 'endTime', e.target.value)} />
                    </Col>
                  </Row>
                )}
              </div>
            );
          })}
        </Form.Group>

        <Button type="submit" disabled={submitting} className="w-100">
          {submitting ? <Spinner size="sm" animation="border" /> : id ? 'Update Course' : 'Create Course'}
        </Button>
      </Form>
    </Card>
  );
};

export default CourseForm;
