import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';

const RoleGuard = ({ allowedRoles = [], children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Memeriksa hak akses...</p>
        </div>
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Redirection berdasarkan role pengguna saat ini
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === 'panitia') {
      return <Navigate to="/panitia/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children ? children : <Outlet />;
};

export default RoleGuard;
