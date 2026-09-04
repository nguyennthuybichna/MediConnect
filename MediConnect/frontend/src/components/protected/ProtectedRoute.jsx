import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf6f4] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-brand-200 border-t-brand-500 animate-spin"></div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider animate-pulse">Loading system...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but does not have the allowed role -> redirect to their correct dashboard
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (user.role === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />;
    }
    return <Navigate to="/patient/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
