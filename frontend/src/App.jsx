import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MentorsPage from './pages/MentorsPage';
import MentorProfilePage from './pages/MentorProfilePage';
import JobsPage from './pages/JobsPage';
import EventsPage from './pages/EventsPage';
import ResourcesPage from './pages/ResourcesPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import NotFound from './pages/NotFound';
import DashboardDispatcher from './pages/DashboardDispatcher';

// Networking Pages
import FeedPage from './pages/FeedPage';
import NetworkPage from './pages/NetworkPage';
import SearchPage from './pages/SearchPage';
import UserProfilePage from './pages/UserProfilePage';
import { useAuth } from './context/AuthContext';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import StudentMentorshipsPage from './pages/StudentMentorshipsPage';
import StudentSessionsPage from './pages/StudentSessionsPage';
import ApplicationTrackerPage from './pages/ApplicationTrackerPage';
import SavedJobsPage from './pages/SavedJobsPage';

// Alumni Pages
import AlumniDashboard from './pages/AlumniDashboard';
import AlumniRequestsPage from './pages/AlumniRequestsPage';
import AlumniMenteesPage from './pages/AlumniMenteesPage';
import AlumniJobsPage from './pages/AlumniJobsPage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminJobsPage from './pages/AdminJobsPage';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminAuditLogsPage from './pages/AdminAuditLogsPage';

const HomeOrFeed = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return isAuthenticated ? <FeedPage /> : <Home />;
};

function App() {
  return (
    <Routes>
      {/* Public & Networking Pages with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomeOrFeed />} />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <FeedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/network"
          element={
            <ProtectedRoute>
              <NetworkPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />
        <Route path="/users/:id" element={<UserProfilePage />} />
        <Route path="/mentors" element={<MentorsPage />} />
        <Route path="/mentors/:id" element={<MentorProfilePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
      </Route>

      {/* Auth Pages without sidebar */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Unified Dashboard Dispatcher */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardDispatcher />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes inside DashboardLayout */}
      <Route element={<DashboardLayout />}>
        {/* Common Protected Features */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        {/* Student Specific Routes */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/mentorships"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <StudentMentorshipsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/sessions"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <StudentSessionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/applications"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <ApplicationTrackerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/saved-jobs"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <SavedJobsPage />
            </ProtectedRoute>
          }
        />

        {/* Alumni Specific Routes */}
        <Route
          path="/alumni/dashboard"
          element={
            <ProtectedRoute allowedRoles={['alumni', 'admin']}>
              <AlumniDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumni/requests"
          element={
            <ProtectedRoute allowedRoles={['alumni', 'admin']}>
              <AlumniRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumni/mentees"
          element={
            <ProtectedRoute allowedRoles={['alumni', 'admin']}>
              <AlumniMenteesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumni/sessions"
          element={
            <ProtectedRoute allowedRoles={['alumni', 'admin']}>
              <StudentSessionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alumni/jobs"
          element={
            <ProtectedRoute allowedRoles={['alumni', 'admin']}>
              <AlumniJobsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Specific Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminJobsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAuditLogsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
