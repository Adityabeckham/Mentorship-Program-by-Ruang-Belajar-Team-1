import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Home from '../pages/Home';
import Dashboard from '../pages/Dashboard';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminVerify from '../pages/admin/AdminVerify';
import AdminPanitia from '../pages/admin/AdminPanitia';
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid rgba(246,201,69,0.3)', borderTopColor: '#f6c945', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <p style={{ fontFamily: "'Space Mono', monospace", color: '#f4ede0', fontSize: '13px' }}>Memuat sistem autentikasi...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
              <Route path="admin/verify" element={<AdminVerify />} />
              <Route path="admin/panitia" element={<AdminPanitia />} />
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
