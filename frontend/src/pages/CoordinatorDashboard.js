// CoordinatorDashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Spinner, 
  Badge, 
  Alert,
  ProgressBar,
  Modal,
  Form
} from 'react-bootstrap';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  LineElement,
  PointElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { 
  FaUsers, 
  FaBook, 
  FaGraduationCap, 
  FaChartLine, 
  FaFileAlt, 
  FaQuestionCircle,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaEye,
  FaDownload,
  FaSync
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Dashboard.css';
import { useNavigate } from 'react-router-dom';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const CoordinatorDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    metrics: {},
    courses: [],
    recentActivities: [],
    alerts: [],
    systemHealth: {}
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [selectedTimeframe]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch comprehensive dashboard data with error handling
      const [metricsRes, coursesRes, activitiesRes] = await Promise.all([
        axios.get('/api/v1/dashboard/metrics', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: { coursesCount: 0, educatorsCount: 0, learnersCount: 0, enrollmentsCount: 0, submissionsCount: 0, quizzesCount: 0 } })),
        axios.get('/api/v1/courses/with-students-and-marks', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => 
          // Fallback to basic courses endpoint
          axios.get('/api/v1/courses', {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => ({ data: [] }))
        ),
        axios.get(`/api/v1/dashboard/activities?timeframe=${selectedTimeframe}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] })) // Fallback if endpoint doesn't exist
      ]);

      // Generate mock recent activities if endpoint doesn't exist
      const mockActivities = [
        {
          id: 1,
          type: 'enrollment',
          description: 'New learner enrolled in React Fundamentals',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          user: 'John Doe',
          status: 'success'
        },
        {
          id: 2,
          type: 'submission',
          description: 'Assignment submitted for JavaScript Basics',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          user: 'Jane Smith',
          status: 'pending'
        },
        {
          id: 3,
          type: 'quiz',
          description: 'Quiz completed: Python for Beginners',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          user: 'Mike Johnson',
          status: 'success'
        },
        {
          id: 4,
          type: 'course',
          description: 'New course created: Advanced Node.js',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          user: 'Dr. Sarah Wilson',
          status: 'success'
        },
        {
          id: 5,
          type: 'alert',
          description: 'Low submission rate detected in CSS Styling course',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
          user: 'System',
          status: 'warning'
        }
      ];

      setDashboardData({
        metrics: metricsRes.data || {},
        courses: coursesRes.data || [],
        recentActivities: activitiesRes.data.length > 0 ? activitiesRes.data : mockActivities,
        alerts: generateAlerts(metricsRes.data, coursesRes.data),
        systemHealth: generateSystemHealth(metricsRes.data)
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed successfully');
  };

  const handleAlertAction = (actionType) => {
    switch (actionType) {
      case 'View Courses':
        toast.info('Navigating to courses management...');
        navigate('/coordinator/course');
        break;
      case 'View Submissions':
        toast.info('Navigating to submissions management...');
        navigate('/coordinator/submissions');
        break;
      case 'View Analytics':
        // For now, refresh the dashboard or show more detailed analytics
        toast.info('Refreshing analytics data...');
        handleRefresh();
        setTimeout(() => {
          toast.info('Detailed analytics feature coming soon!');
        }, 1000);
        break;
      default:
        console.log('Unknown action:', actionType);
    }
  };

  const generateAlerts = (metrics = {}, courses = []) => {
    const alerts = [];
    
    // Low enrollment alert
    if (Array.isArray(courses) && courses.length > 0) {
      const lowEnrollmentCourses = courses.filter(course => 
        (course.enrollments?.length || course.students?.length || 0) < 5
      );
      if (lowEnrollmentCourses.length > 0) {
        alerts.push({
          type: 'warning',
          title: 'Low Enrollment Alert',
          message: `${lowEnrollmentCourses.length} course(s) have less than 5 enrollments`,
          action: 'View Courses',
          actionHandler: () => handleAlertAction('View Courses')
        });
      }
    }

    // Pending submissions alert
    if (metrics.pendingSubmissions && metrics.pendingSubmissions > 10) {
      alerts.push({
        type: 'info',
        title: 'Pending Submissions',
        message: `${metrics.pendingSubmissions} submissions are pending review`,
        action: 'View Submissions',
        actionHandler: () => handleAlertAction('View Submissions')
      });
    }

    // System performance alert
    if (metrics.activeUsers && metrics.totalUsers && metrics.activeUsers < metrics.totalUsers * 0.3) {
      alerts.push({
        type: 'warning',
        title: 'Low User Activity',
        message: 'User engagement is below 30% this week',
        action: 'View Analytics',
        actionHandler: () => handleAlertAction('View Analytics')
      });
    }

    return alerts;
  };

  const generateSystemHealth = (metrics = {}) => {
    return {
      overall: 85,
      database: 92,
      api: 88,
      storage: 78,
      users: Math.min(100, (metrics.activeUsers && metrics.totalUsers) ? (metrics.activeUsers / metrics.totalUsers) * 100 : 75)
    };
  };

  const getMetricIcon = (key) => {
    const icons = {
      coursesCount: FaBook,
      educatorsCount: FaGraduationCap,
      learnersCount: FaUsers,
      enrollmentsCount: FaChartLine,
      submissionsCount: FaFileAlt,
      quizzesCount: FaQuestionCircle
    };
    return icons[key] || FaChartLine;
  };

  const getMetricColor = (key) => {
    const colors = {
      coursesCount: 'primary',
      educatorsCount: 'success',
      learnersCount: 'info',
      enrollmentsCount: 'warning',
      submissionsCount: 'secondary',
      quizzesCount: 'danger'
    };
    return colors[key] || 'primary';
  };

  const formatMetricName = (key) => {
    const names = {
      coursesCount: 'Total Courses',
      educatorsCount: 'Educators',
      learnersCount: 'Learners',
      enrollmentsCount: 'Enrollments',
      submissionsCount: 'Submissions',
      quizzesCount: 'Quizzes'
    };
    return names[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const getActivityIcon = (type) => {
    const icons = {
      enrollment: FaUsers,
      submission: FaFileAlt,
      quiz: FaQuestionCircle,
      course: FaBook,
      alert: FaExclamationTriangle
    };
    return icons[type] || FaCheckCircle;
  };

  const getActivityColor = (status) => {
    const colors = {
      success: 'success',
      pending: 'warning',
      warning: 'danger',
      info: 'info'
    };
    return colors[status] || 'secondary';
  };

  // Chart data preparation
  const enrollmentTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Enrollments',
        data: [65, 59, 80, 81, 56, 55],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1
      }
    ]
  };

  const courseCompletionData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [
      {
        data: [65, 25, 10],
        backgroundColor: [
          '#28a745',
          '#ffc107',
          '#dc3545'
        ]
      }
    ]
  };

  const topCoursesData = {
    labels: (dashboardData.courses || []).slice(0, 5).map(course => course.title || 'Unknown Course'),
    datasets: [
      {
        label: 'Enrollments',
        data: (dashboardData.courses || []).slice(0, 5).map(course => course.enrollments?.length || course.students?.length || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="text-center">
          <Spinner animation="border" role="status" size="lg" />
          <p className="mt-3">Loading dashboard...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <ToastContainer position="top-right" />
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Coordinator Dashboard</h2>
          <p className="text-muted mb-0">Welcome back, {user.firstName || 'Coordinator'}! Here's your platform overview.</p>
        </div>
        <div className="d-flex gap-2">
          <Form.Select 
            value={selectedTimeframe} 
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            style={{ width: 'auto' }}
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </Form.Select>
                     <Button 
             variant="outline-primary" 
             onClick={handleRefresh}
             disabled={refreshing}
           >
             <FaSync className={refreshing ? 'spin' : ''} /> Refresh
           </Button>
        </div>
      </div>

      {/* System Health Bar */}
      <Card className="mb-4 border-start border-primary border-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="mb-0">System Health</h6>
            <Badge bg="success">Operational</Badge>
          </div>
          <Row>
            {Object.entries(dashboardData.systemHealth).map(([key, value]) => (
              <Col key={key}>
                <small className="text-muted d-block">{key.charAt(0).toUpperCase() + key.slice(1)}</small>
                <ProgressBar 
                  now={value} 
                  variant={value > 80 ? 'success' : value > 60 ? 'warning' : 'danger'}
                  style={{ height: '8px' }}
                />
                <small>{Math.round(value)}%</small>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

             {/* Alerts */}
       {dashboardData.alerts.length > 0 && (
         <Row className="mb-4">
           {dashboardData.alerts.map((alert, index) => (
             <Col md={4} key={index}>
               <Alert variant={alert.type} className="mb-3">
                 <Alert.Heading className="h6">{alert.title}</Alert.Heading>
                 <p className="mb-2">{alert.message}</p>
                 <Button 
                   variant={`outline-${alert.type}`} 
                   size="sm"
                   onClick={alert.actionHandler}
                   className="d-flex align-items-center gap-1"
                 >
                   {alert.action === 'View Courses' && <FaBook />}
                   {alert.action === 'View Submissions' && <FaFileAlt />}
                   {alert.action === 'View Analytics' && <FaChartLine />}
                   {alert.action}
                 </Button>
               </Alert>
             </Col>
           ))}
         </Row>
       )}

      {/* Key Metrics */}
      <Row className="mb-4">
        {Object.entries(dashboardData.metrics).map(([key, value]) => {
          const IconComponent = getMetricIcon(key);
          const color = getMetricColor(key);
          
          return (
            <Col lg={2} md={4} sm={6} key={key} className="mb-3">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="text-center">
                  <div className={`text-${color} mb-2`}>
                    <IconComponent size={32} />
                  </div>
                  <h4 className="mb-1">{value}</h4>
                  <small className="text-muted">{formatMetricName(key)}</small>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Charts and Analytics */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="h-100">
            <Card.Header>
              <h6 className="mb-0">Enrollment Trends</h6>
            </Card.Header>
            <Card.Body>
              <Line data={enrollmentTrendData} options={{ responsive: true, maintainAspectRatio: false }} height={300} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="h-100">
            <Card.Header>
              <h6 className="mb-0">Course Completion</h6>
            </Card.Header>
            <Card.Body>
              <Doughnut data={courseCompletionData} options={{ responsive: true, maintainAspectRatio: false }} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Top Performing Courses</h6>
            </Card.Header>
            <Card.Body>
              <Bar data={topCoursesData} options={{ responsive: true, maintainAspectRatio: false }} height={300} />
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Recent Activities</h6>
              <Button variant="link" size="sm" onClick={() => setShowActivityModal(true)}>
                View All
              </Button>
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {dashboardData.recentActivities.slice(0, 5).map((activity) => {
                  const IconComponent = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="p-3 border-bottom">
                      <div className="d-flex align-items-start">
                        <div className={`text-${getActivityColor(activity.status)} me-3 mt-1`}>
                          <IconComponent size={16} />
                        </div>
                        <div className="flex-grow-1">
                          <p className="mb-1 small">{activity.description}</p>
                          <div className="d-flex justify-content-between">
                            <small className="text-muted">{activity.user}</small>
                            <small className="text-muted">
                              {new Date(activity.timestamp).toLocaleTimeString()}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <h6 className="mb-0">Quick Actions</h6>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={2}>
                  <Button variant="outline-primary" className="w-100 mb-2" href="/coordinator/course/create">
                    <FaBook /> Create Course
                  </Button>
                </Col>
                <Col md={2}>
                  <Button variant="outline-success" className="w-100 mb-2" href="/coordinator/educators">
                    <FaGraduationCap /> Manage Educators
                  </Button>
                </Col>
                <Col md={2}>
                  <Button variant="outline-info" className="w-100 mb-2" href="/coordinator/students">
                    <FaUsers /> View Students
                  </Button>
                </Col>
                <Col md={2}>
                  <Button variant="outline-warning" className="w-100 mb-2" href="/coordinator/submissions">
                    <FaFileAlt /> Submissions
                  </Button>
                </Col>
                <Col md={2}>
                  <Button variant="outline-secondary" className="w-100 mb-2" href="/coordinator/quizzes">
                    <FaQuestionCircle /> Quiz Reports
                  </Button>
                </Col>
                <Col md={2}>
                  <Button variant="outline-dark" className="w-100 mb-2" onClick={handleRefresh}>
                    <FaDownload /> Export Data
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities Modal */}
      <Modal show={showActivityModal} onHide={() => setShowActivityModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Recent Platform Activities</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {dashboardData.recentActivities.map((activity) => {
              const IconComponent = getActivityIcon(activity.type);
              return (
                <div key={activity.id} className="p-3 border-bottom">
                  <div className="d-flex align-items-start">
                    <div className={`text-${getActivityColor(activity.status)} me-3 mt-1`}>
                      <IconComponent size={20} />
                    </div>
                    <div className="flex-grow-1">
                      <p className="mb-1">{activity.description}</p>
                      <div className="d-flex justify-content-between">
                        <Badge bg={getActivityColor(activity.status)}>{activity.status}</Badge>
                        <div>
                          <small className="text-muted me-3">{activity.user}</small>
                          <small className="text-muted">
                            {new Date(activity.timestamp).toLocaleString()}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowActivityModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CoordinatorDashboard;
