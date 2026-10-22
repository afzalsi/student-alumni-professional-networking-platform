import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

const DashboardDispatcher = () => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <Loader fullScreen text="Redirecting to dashboard..." />;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'alumni') return <Navigate to="/alumni/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export default DashboardDispatcher;
