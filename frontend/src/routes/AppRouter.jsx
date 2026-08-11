import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import PanitiaDashboard from '../pages/panitia/PanitiaDashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleGuard from '../components/auth/RoleGuard';
import { useAuth } from '../providers/AuthProvider';

// Helper component untuk mengarahkan pengguna ke dashboard yang sesuai dengan role-nya
const RoleDashboardRedirect = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (user?.role === 'panitia') {
    return <Navigate to="/panitia/dashboard" replace />;
  }
  return <Dashboard />;
};

const AppRouter = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors duration-200">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Memuat sistem autentikasi...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!token ? <Register /> : <Navigate to="/dashboard" replace />} />

        {/* Public & Main Routes inside MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          
          {/* Protected Routes for All Authenticated Users */}
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<RoleDashboardRedirect />} />
            
            {/* Admin-only Routes */}
            <Route element={<RoleGuard allowedRoles={['admin']} />}>
              <Route path="admin/dashboard" element={<AdminDashboard />} />
            </Route>

            {/* Panitia-only Routes */}
            <Route element={<RoleGuard allowedRoles={['panitia']} />}>
              <Route path="panitia/dashboard" element={<PanitiaDashboard />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
