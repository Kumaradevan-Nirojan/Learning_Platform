import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Context providers
import { ThemeProvider } from './context/ThemeContext';
import { SidebarProvider } from './context/SidebarContext';

// --- Layouts ---
import PublicLayout from './components/PublicLayout'; // Import the new Public Layout
import DashboardLayout from './components/DashboardLayout'; // Import the renamed Dashboard Layout
import ProtectedRoute from './components/ProtectedRoute';

// --- Pages ---
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Courses from './pages/Courses';
import CoursePage from './pages/CoursePage';
import NotFound from './pages/NotFound';
import QuizPage from './pages/QuizPage';

import Login from './pages/Login';
import Register from './pages/Register';
import AccessDenied from './pages/AccessDenied';
import InactivePage from './pages/InactivePage';

// Coordinator Pages
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import CoordinatorCoursePage from './pages/CoordinatorCoursePage';
import CourseForm from './components/CourseForm';
import StudentPage from './pages/StudentPage';
import EducatorList from './components/EducatorList';
import EditEducatorPage from './pages/EditEducator';
import SubmissionPage from './pages/SubmissionPage';
import CoordinatorSubmissions from './pages/CoordinatorSubmissions';
import CoordinatorQuizzes from './pages/CoordinatorQuizzes';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ContactAdmin from './pages/ContactAdmin';

// Profile Page
import Profile from './pages/Profile';



// Educator Pages
import EducatorDashboard from './pages/EducatorDashboard';
import EMyCourses from './components/educator/EMyCourses';
import CreateQuizForm from './components/educator/CreateQuizForm';
import CreateZoomSession from './components/educator/CreateZoomSession';
import AssignmentForm from './components/AssignmentForm';
import LiveSessions from './pages/LiveSessions';
import EMyAssignments from './components/educator/EMyAssignments';
import EMySubmissions from './components/educator/EMySubmissions';
import EStudyPlanPage from './components/educator/EStudyPlanPage';
import EducatorEvaluation from './components/educator/EducatorEvaluation';
import MyQuizzes from './pages/MyQuizzes';

// Learner Pages
import LearnerDashboard from './pages/LearnerDashboard';
import MyCourses from './pages/MyCourses';
import LearnerQuizList from './components/learner/LearnerQuizList';
import AttemptQuizPage from './pages/AttemptQuizPage';
import LearnerQuizHistory from './pages/LearnerQuizHistory';
import StudyPlanList from './components/StudyPlanList';
import SubmissionHistory from './components/learner/SubmissionHistory';
import SubmissionDetails from './components/SubmissionDetails';

// Payment Pages
import PaymentPage from './pages/PaymentPage';
import PaymentReceipt from './pages/PaymentReceipt';

function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <BrowserRouter>
          <Routes>
            {/* --- Routes with Public Layout --- */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CoursePage />} />
              <Route path="/quizzes" element={<QuizPage />} />

            </Route>

            {/* --- Standalone Auth Routes (No Layout) --- */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="/inactive" element={<InactivePage />} />
            <Route path="/contact-admin" element={<ContactAdmin />} />
            <Route path="/payment/:enrollmentId" element={<PaymentPage />} />
            <Route path="/receipt/:enrollmentId" element={<PaymentReceipt />} />

            {/* --- Protected Routes with Dashboard Layout --- */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              {/* Profile - Available to all authenticated users */}
              <Route path="/profile" element={<ProtectedRoute allowedRoles={['admin', 'coordinator', 'educator', 'learner']}><Profile /></ProtectedRoute>} />
              
              {/* Admin */}
              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              
              {/* Coordinator */}
              <Route path="/coordinator/dashboard" element={<ProtectedRoute allowedRoles={['coordinator']}><CoordinatorDashboard /></ProtectedRoute>} />
              <Route path="/coordinator/course" element={<ProtectedRoute allowedRoles={['coordinator']}><CoordinatorCoursePage /></ProtectedRoute>} />
              <Route path="/coordinator/course/create" element={<ProtectedRoute allowedRoles={['coordinator']}><CourseForm /></ProtectedRoute>} />
              <Route path="/coordinator/course/edit/:id" element={<ProtectedRoute allowedRoles={['coordinator']}><CourseForm /></ProtectedRoute>} />
              <Route path="/coordinator/students" element={<ProtectedRoute allowedRoles={['coordinator']}><StudentPage /></ProtectedRoute>} />
              <Route path="/coordinator/educators" element={<ProtectedRoute allowedRoles={['coordinator']}><EducatorList /></ProtectedRoute>} />
              <Route path="/coordinator/educators/edit/:id" element={<ProtectedRoute allowedRoles={['coordinator']}><EditEducatorPage /></ProtectedRoute>} />
              <Route path="/coordinator/submissions" element={<ProtectedRoute allowedRoles={['coordinator']}><CoordinatorSubmissions /></ProtectedRoute>} />
              <Route path="/coordinator/quizzes" element={<ProtectedRoute allowedRoles={['coordinator']}><CoordinatorQuizzes /></ProtectedRoute>} />
              <Route path="/submissions" element={<SubmissionPage />} />
              <Route path="/submissions/:id" element={<ProtectedRoute allowedRoles={['learner']}><SubmissionDetails /></ProtectedRoute>} />


              {/* Educator */}
              <Route path="/educator/dashboard" element={<ProtectedRoute allowedRoles={['educator']}><EducatorDashboard /></ProtectedRoute>} />
              <Route path="/educator/my-courses" element={<ProtectedRoute allowedRoles={['educator']}><EMyCourses /></ProtectedRoute>} />
              <Route path="/assignments/create" element={<AssignmentForm />} />
              <Route path="/zoom-sessions" element={<LiveSessions />} />
              <Route path="/educator/my-assignments" element={<ProtectedRoute allowedRoles={['educator']}><EMyAssignments /></ProtectedRoute>} />
              <Route path="/educator/my-submissions" element={<ProtectedRoute allowedRoles={['educator']}><EMySubmissions /></ProtectedRoute>} />
              <Route path="/educator/evaluation" element={<ProtectedRoute allowedRoles={['educator']}><EducatorEvaluation /></ProtectedRoute>} />
              <Route path="/educator/my-studyplans" element={<ProtectedRoute allowedRoles={['educator']}><EStudyPlanPage /></ProtectedRoute>} />
              <Route path="/educator/my-quizzes" element={<ProtectedRoute allowedRoles={['educator']}><MyQuizzes /></ProtectedRoute>} />
              <Route path="/educator/create-zoom-session" element={<ProtectedRoute allowedRoles={['educator']}><CreateZoomSession /></ProtectedRoute>} />
              <Route path="/quizzes/create" element={<ProtectedRoute allowedRoles={['educator', 'coordinator']}><CreateQuizForm /></ProtectedRoute>} />
              <Route path="/quizzes/edit/:id" element={<ProtectedRoute allowedRoles={['educator', 'coordinator']}><CreateQuizForm /></ProtectedRoute>} />

              {/* Learner */}
              <Route path="/learner/dashboard" element={<ProtectedRoute allowedRoles={['learner']}><LearnerDashboard /></ProtectedRoute>} />
              <Route path="/my-courses" element={<ProtectedRoute allowedRoles={['learner']}><MyCourses /></ProtectedRoute>} />
              <Route path="/learner/quizzes" element={<ProtectedRoute allowedRoles={['learner']}><LearnerQuizList /></ProtectedRoute>} />
              <Route path="/learner/quiz/attempt/:id" element={<ProtectedRoute allowedRoles={['learner']}><AttemptQuizPage /></ProtectedRoute>} />
              <Route path="/learner/quiz-history" element={<ProtectedRoute allowedRoles={['learner']}><LearnerQuizHistory /></ProtectedRoute>} />
              <Route path="/learner/my-submissions" element={<ProtectedRoute allowedRoles={['learner']}><SubmissionHistory /></ProtectedRoute>} />
              <Route path="/learner/studyplans" element={<ProtectedRoute allowedRoles={['learner']}><StudyPlanList /></ProtectedRoute>} />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </ThemeProvider>
  );
}

export default App;